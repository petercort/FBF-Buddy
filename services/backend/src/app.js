
import express, { json } from 'express';
import { UsersTable, BikesTable } from './db-objects.js';
import axios from 'axios';
import { firstTimeAuth, getStravaAuthentication } from './shared-library/strava-authentication.js';
import { getAzureSecretsClient } from './shared-library/azure-secrets.js';

const STRAVA_WEBHOOK_PORT = 3000;
const DISCORD_BOT_API_URL = process.env.DISCORD_BOT_API_URL || 'http://localhost:3001';
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
let azureClient;
let stravaVerifyToken;

try {
  console.log('Initializing Azure Key Vault client...');
  console.log('KEY_VAULT_NAME:', process.env.KEY_VAULT_NAME);
  azureClient = await getAzureSecretsClient();
  console.log('Azure Key Vault client initialized successfully');
  
  console.log('Fetching Strava verify token from Key Vault...');
  stravaVerifyToken = (await azureClient.getSecret('stravaVerifyToken')).value;
  console.log('Strava verify token fetched successfully');
} catch (error) {
  console.error('FATAL: Failed to initialize Azure Key Vault:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

// Helper function to send Discord messages via the Discord bot service
async function sendDiscordMessage(userId, message) {
  try {
    await axios.post(`${DISCORD_BOT_API_URL}/api/send-message`, {
      userId,
      message
    });
    console.log(`Message sent to Discord user ${userId}`);
  } catch (error) {
    console.error('Error sending Discord message:', error.message);
  }
}

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
        const activityData = await axios.get(`https://www.strava.com/api/v3/activities/${event.object_id}`, {
          headers: { Authorization: `Bearer ${stravaAccessToken}` }
        });
        
        // Only process if it's a bike ride and has gear information
        if (activityData.data.type !== 'Ride' || !activityData.data.gear) {
          console.log(`Skipping activity ${event.object_id}: type=${activityData.data.type}, has_gear=${!!activityData.data.gear}`);
          res.sendStatus(200);
          return;
        } else {
          // show the activity data type 
          console.log(`Processing activity ${event.object_id}: type=${activityData.data.type}, has_gear=${!!activityData.data.gear}`);
        }
        
        const gearId = activityData.data.gear.id;
        const currentDistance = activityData.data.gear.distance;
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
          await sendDiscordMessage(id, message);
        } else if (currentDiff > 150) {
          const message = bikeName
            ? `Nice ride! You're getting close to needing to wax your chain. ${bikeName} has ${currentDiff} miles since its last wax.`
            : `Nice ride! You're getting close to needing to wax your chain. You've ridden ${currentDiff} miles since your last wax.`;
          const id = user.dataValues.userId;
          await sendDiscordMessage(id, message);
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

// ============================================
// REST API Endpoints for Discord Bot
// ============================================

// Get user by Discord user ID
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await UsersTable.findOne({ where: { userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or update user
app.post('/api/users', async (req, res) => {
  try {
    const { userId, strava_connected, strava_user_id, strava_access_token, strava_refresh_token, strava_expires_at } = req.body;
    const [user, created] = await UsersTable.upsert({
      userId,
      strava_connected,
      strava_user_id,
      strava_access_token,
      strava_refresh_token,
      strava_expires_at
    }, { returning: true });
    res.status(created ? 201 : 200).json(user);
  } catch (error) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all bikes for a user
app.get('/api/users/:userId/bikes', async (req, res) => {
  try {
    const { userId } = req.params;
    const bikes = await BikesTable.findAll({ where: { userId } });
    res.json(bikes);
  } catch (error) {
    console.error('Error fetching bikes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific bike by name for a user
app.get('/api/users/:userId/bikes/by-name/:bikeName', async (req, res) => {
  try {
    const { userId, bikeName } = req.params;
    const bike = await BikesTable.findOne({ 
      where: { userId, name: bikeName } 
    });
    if (!bike) {
      return res.status(404).json({ error: 'Bike not found' });
    }
    res.json(bike);
  } catch (error) {
    console.error('Error fetching bike:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update chain wax for a bike
app.post('/api/users/:userId/bikes/:bikeName/wax', async (req, res) => {
  try {
    const { userId, bikeName } = req.params;
    
    const bike = await BikesTable.findOne({ 
      where: { userId, name: bikeName } 
    });
    
    if (!bike) {
      return res.status(404).json({ error: 'Bike not found' });
    }
    
    await BikesTable.update(
      { lastWaxedDistance: bike.distance },
      { where: { bikeId: bike.bikeId, userId } }
    );
    
    const updatedBike = await BikesTable.findOne({ 
      where: { userId, name: bikeName } 
    });
    
    res.json(updatedBike);
  } catch (error) {
    console.error('Error updating wax distance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sync bikes from Strava
app.post('/api/users/:userId/bikes/sync', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await UsersTable.findOne({ where: { userId } });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.strava_connected) {
      return res.status(400).json({ error: 'Strava account not connected' });
    }
    
    const stravaAccessToken = await getStravaAuthentication(user.dataValues);
    const athleteId = user.strava_user_id;
    
    await setupBikes(athleteId, userId, stravaAccessToken);
    
    const bikes = await BikesTable.findAll({ where: { userId } });
    res.json(bikes);
  } catch (error) {
    console.error('Error syncing bikes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Strava auth URL
app.post('/api/strava/auth-url', async (req, res) => {
  try {
    const { userId } = req.body;
    const stravaClientId = (await azureClient.getSecret('stravaClientId')).value;
    const stravaRedirectUri = (await azureClient.getSecret('stravaRedirectUri')).value;
    
    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${stravaClientId}&response_type=code&redirect_uri=${stravaRedirectUri}/${userId}&approval_prompt=force&scope=activity:read_all`;
    
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get latest ride for a user
app.get('/api/users/:userId/latest-ride', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await UsersTable.findOne({ where: { userId } });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.strava_connected) {
      return res.status(400).json({ error: 'Strava account not connected' });
    }
    
    const stravaAccessToken = await getStravaAuthentication(user.dataValues);
    
    const response = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
      headers: { Authorization: `Bearer ${stravaAccessToken}` },
      params: { per_page: 1 }
    });

    const latestRide = response.data[0];

    if (!latestRide) {
      return res.status(404).json({ error: 'No rides found' });
    }

    res.json(latestRide);
  } catch (error) {
    console.error('Error fetching latest ride:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(STRAVA_WEBHOOK_PORT, () => {
  console.log(`Strava webhook server is running on port ${STRAVA_WEBHOOK_PORT}`);
  console.log(`Backend API ready on port ${STRAVA_WEBHOOK_PORT}`);
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