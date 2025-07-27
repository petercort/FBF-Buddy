
import express, { json } from 'express';
import { UsersTable, BikesTable } from './db-objects.js';
import axios from 'axios';
import { firstTimeAuth, getStravaAuthentication } from './shared-library/strava-authentication.js';
import { getAzureSecretsClient } from './shared-library/azure-secrets.js';
import { getDiscordClient } from './shared-library/discord-client.js';

const STRAVA_WEBHOOK_PORT = 3000;
const app = express();

// Add request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - Headers:`, JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`[${timestamp}] Request Body:`, JSON.stringify(req.body, null, 2));
  }
  next();
});

app.use(json());

// Call the azure_secrets.js to get the secrets
const azureClient = await getAzureSecretsClient();
const stravaVerifyToken = (await azureClient.getSecret('stravaVerifyToken')).value;

// Get the shared Discord client
const discordClient = await getDiscordClient();

app.get('/', (req, res) => {
  // send a 200 response to the root path
  res.sendStatus(200);
});

app.post('/webhook', async (req, res) => {
  console.log('webhook event received!', req.body);
  const event = req.body;

  if (event.object_type === 'activity' && event.aspect_type === 'create') {
    const ownerIdString = event.owner_id.toString();
    const user = await UsersTable.findOne({ where: { strava_user_id: ownerIdString } });
    if (user) {
      const stravaAccessToken = await getStravaAuthentication(user.dataValues);
      try {
        const rideData = await axios.get(`https://www.strava.com/api/v3/activities/${event.object_id}`, {
          headers: { Authorization: `Bearer ${stravaAccessToken}` }
        });
        const gearId = rideData.data.gear.id;
        const currentDistance = rideData.data.gear.distance;
        // update the distance for the gear
        await syncBike(gearId, currentDistance, user.dataValues.userId);
        const bikeDetails = await getBikeDetails(gearId, user.dataValues.userId);
        const lastWaxedDistance = bikeDetails.lastWaxedDistance;
        const bikeName = bikeDetails.name;

        const totalMiles = Math.round(currentDistance * 0.000621371);
        const lastWaxedMiles = Math.round(lastWaxedDistance * 0.000621371);
        const currentDiff = totalMiles - lastWaxedMiles;
        if (currentDiff > 250) {
          const message = bikeName
            ? `Nice ride and it's time to wax your chain! ${bikeName} has ridden ${currentDiff} miles since its last wax.`
            : `Nice ride and it's time to wax your chain! You've ridden ${currentDiff} miles since your last wax.`;
          const id = user.dataValues.userId;
          const discordUser = await discordClient.users.fetch(id);
          discordUser.send(message);
        } else if (currentDiff > 150) {
          const message = bikeName
            ? `Nice ride! You're getting close to needing to wax your chain. ${bikeName} has ${currentDiff} miles since its last wax.`
            : `Nice ride! You're getting close to needing to wax your chain. You've ridden ${currentDiff} miles since your last wax.`;
          const id = user.dataValues.userId;
          const discordUser = await discordClient.users.fetch(id);
          discordUser.send(message);
        }
        console.log(`Updated distance for gear ${gearId} to ${Math.round(currentDistance * 0.000621371)}`);
      } catch (error) {
        console.error('Error fetching ride data:', error);
      }
    } else {
      console.log('No user found for strava user id:', event.owner_id);
    }
  }
  res.sendStatus(200);
});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {
  console.log('GET request received');
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
  if (mode && token) {
    if (mode === 'subscribe' && token === stravaVerifyToken) {
      console.log('WEBHOOK_VERIFIED');
      res.json({ 'hub.challenge': challenge });
    } else {
      res.sendStatus(403);
    }
  } else {
    console.log('No token or mode found in query string');
    res.status(500).send('No token or mode found in query string');
  }
});

app.get('/strava/callback/:userId', async (req, res) => {
  const code = req.query.code;
  const userId = req.params.userId;
  if (!code) {
    return res.status(400).send('Missing authorization code');
  }
  const { athleteId, stravaAccessToken } = await firstTimeAuth(userId, code);
  console.log('added strava athlete : ', athleteId, 'for discord user:', userId);
  await setupBikes(athleteId, userId, stravaAccessToken);
  return res.send('Strava account connected successfully!');
});

app.listen(STRAVA_WEBHOOK_PORT, () => {
  console.log(`Strava webhook server is running on port ${STRAVA_WEBHOOK_PORT}`);
});

async function setupBikes(athleteId, userId, stravaAccessToken) {
  try {
    const athleteResponse = await axios.get(`https://www.strava.com/api/v3/athletes/${athleteId}`, {
      headers: { Authorization: `Bearer ${stravaAccessToken}` }
    });
    for (const bike of athleteResponse.data.bikes) {
      const bikeData = await axios.get(`https://www.strava.com/api/v3/gear/${bike.id}`, {
        headers: { Authorization: `Bearer ${stravaAccessToken}` }
      });
      await BikesTable.upsert({
        bikeId: bike.id,
        userId: userId,
        name: bike.name,
        brand: bikeData.data.brand_name,
        model: bikeData.data.model_name,
        distance: bike.distance
      });
    }
  } catch (error) {
    console.error('Error fetching athlete data:', error.status, error.message);
  }
}

async function syncBike(bikeId, distance, userId) {
  try {
    await BikesTable.update(
      { distance },
      { where: { bikeId, userId }, returning: true, plain: true }
    );
  } catch (error) {
    console.error('Error updating data:', error);
  }
}

async function getBikeDetails(bikeId, userId) {
  try {
    const output = await BikesTable.findOne({ where: { bikeId, userId } });
    return {
      lastWaxedDistance: output.dataValues.lastWaxedDistance,
      name: output.dataValues.name
    };
  } catch (error) {
    console.error('Error finding bike details:', error);
    return { lastWaxedDistance: 0, name: null };
  }
}