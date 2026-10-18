
import express, { json } from 'express';
import { Op } from 'sequelize';
import { initializeDatabase, testDatabaseConnection } from './db-objects.js';
import axios from 'axios';
import { firstTimeAuth, getStravaAuthentication } from './shared-library/strava-authentication.js';
import { getAzureSecretsClient } from './shared-library/azure-secrets.js';
import { retireInactiveBikes } from './shared-library/bike-reconciliation.js';
import {
  buildRideReminderMessage,
  buildWeeklyReminderMessage,
  getMilesSinceWax,
  getOverdueBikes,
  getWaxReminderLevel,
  isSupportedRideType
} from './shared-library/chain-reminders.js';

const STRAVA_WEBHOOK_PORT = 3000;
const DISCORD_BOT_API_URL = process.env.DISCORD_BOT_API_URL || 'http://localhost:3001';
const WAX_REMINDER_CHECK_INTERVAL_MS = 60 * 60 * 1000;
const WAX_REMINDER_REPEAT_MS = 7 * 24 * 60 * 60 * 1000;
const app = express();

// Track service readiness
let isReady = false;
let isHealthy = true;
let dbInitialized = false;

// Add request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
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
    await axios.post(
      `${DISCORD_BOT_API_URL}/api/send-message`,
      { userId, message },
      { timeout: 10000 }
    );
    console.log(`Message sent to Discord user ${userId}`);
  } catch (error) {
    console.error('Error sending Discord message:', {
      userId,
      message: error.message,
      status: error.response?.status,
      response: error.response?.data
    });
    throw error;
  }
}

async function runWeeklyWaxReminders() {
  const { UsersTable, BikesTable } = await getTables();
  const cutoff = new Date(Date.now() - WAX_REMINDER_REPEAT_MS);
  const users = await UsersTable.findAll({
    where: {
      strava_connected: true,
      [Op.or]: [
        { lastWaxReminderAt: null },
        { lastWaxReminderAt: { [Op.lte]: cutoff } }
      ]
    }
  });

  for (const user of users) {
    try {
      const stravaAccessToken = await getStravaAuthentication(user.dataValues);
      await setupBikes(user.strava_user_id, user.userId, stravaAccessToken);
    } catch (error) {
      console.error(`Bike reconciliation failed for Discord user ${user.userId}:`, error.message);
      continue;
    }

    const bikes = await BikesTable.findAll({
      where: { userId: user.userId, retired: false }
    });
    const overdueBikes = getOverdueBikes(bikes);

    if (overdueBikes.length === 0) {
      continue;
    }

    const claimedAt = new Date();
    const previousReminderAt = user.lastWaxReminderAt;
    const [claimed] = await UsersTable.update(
      { lastWaxReminderAt: claimedAt },
      {
        where: {
          userId: user.userId,
          [Op.or]: [
            { lastWaxReminderAt: null },
            { lastWaxReminderAt: { [Op.lte]: cutoff } }
          ]
        }
      }
    );

    if (claimed === 0) {
      continue;
    }

    try {
      await sendDiscordMessage(
        user.userId,
        buildWeeklyReminderMessage(overdueBikes)
      );
    } catch (error) {
      await UsersTable.update(
        { lastWaxReminderAt: previousReminderAt },
        { where: { userId: user.userId, lastWaxReminderAt: claimedAt } }
      );
      console.error(`Weekly wax reminder failed for Discord user ${user.userId}:`, error.message);
    }
  }
}

function startWaxReminderScheduler() {
  const run = () => {
    runWeeklyWaxReminders().catch((error) => {
      console.error('Weekly wax reminder check failed:', error);
    });
  };

  run();
  setInterval(run, WAX_REMINDER_CHECK_INTERVAL_MS);
}

// Health check endpoints
app.get('/', (req, res) => {
  // Basic root path response
  res.sendStatus(200);
});

app.get('/health', (req, res) => {
  // Liveness probe - checks if the service is alive
  if (!isHealthy) {
    return res.status(503).json({
      status: 'unhealthy',
      service: 'backend',
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({
    status: 'healthy',
    service: 'backend',
    timestamp: new Date().toISOString()
  });
});

app.get('/ready', async (req, res) => {
  // Readiness probe - checks if the service is ready to accept traffic
  const checks = {
    keyVault: false,
    database: false
  };
  
  try {
    // Check Key Vault connection
    console.log('[Ready Check] Checking Key Vault connection...');
    if (azureClient) {
      checks.keyVault = true;
      console.log('[Ready Check] Key Vault: OK');
    } else {
      console.log('[Ready Check] Key Vault: NOT INITIALIZED');
    }
    
    // Check database connection
    console.log('[Ready Check] Checking database connection...');
    const { sequelize } = await import('./db-objects.js');
    await sequelize.authenticate();
    checks.database = true;
    console.log('[Ready Check] Database: OK');
    
    const allChecksPass = Object.values(checks).every(check => check === true);
    
    if (!allChecksPass) {
      console.log('[Ready Check] FAILED - Not all checks passed:', checks);
      return res.status(503).json({
        status: 'not ready',
        service: 'backend',
        checks,
        timestamp: new Date().toISOString()
      });
    }
    
    // Mark service as ready
    isReady = true;
    console.log('[Ready Check] SUCCESS - Service is ready');
    
    res.json({
      status: 'ready',
      service: 'backend',
      checks,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Ready Check] FAILED - Exception occurred:', error.message);
    console.error('[Ready Check] Error stack:', error.stack);
    res.status(503).json({
      status: 'not ready',
      service: 'backend',
      checks,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Middleware to check if database is ready for API endpoints
function requireDatabase(req, res, next) {
  if (!dbInitialized) {
    return res.status(503).json({
      error: 'Service temporarily unavailable',
      message: 'Database is still initializing. Please try again in a moment.',
      timestamp: new Date().toISOString()
    });
  }
  next();
}

// Helper to get database tables (lazy load)
async function getTables() {
  const { UsersTable, BikesTable } = await import('./db-objects.js');
  return { UsersTable, BikesTable };
}

app.post('/webhook', async (req, res) => {
  if (!dbInitialized) {
    console.log('Webhook received but database not initialized yet');
    return res.sendStatus(503);
  }
  
  console.log('webhook event received!', req.body);
  const event = req.body;
  const { UsersTable } = await getTables();

  if (event.object_type === 'activity' && event.aspect_type === 'create') {
    const ownerIdString = event.owner_id.toString();
    const user = await UsersTable.findOne({ where: { strava_user_id: ownerIdString } });
    if (user) {
      const stravaAccessToken = await getStravaAuthentication(user.dataValues);
      try {
        const activityData = await axios.get(`https://www.strava.com/api/v3/activities/${event.object_id}`, {
          headers: { Authorization: `Bearer ${stravaAccessToken}` }
        });
        
        if (!isSupportedRideType(activityData.data.type) || !activityData.data.gear) {
          console.log(`Skipping activity ${event.object_id}: type=${activityData.data.type}, has_gear=${!!activityData.data.gear}`);
          return res.sendStatus(200);
        }
        console.log(`Processing activity ${event.object_id}: type=${activityData.data.type}, has_gear=${!!activityData.data.gear}`);
        
        const gearId = activityData.data.gear.id;
        const currentDistance = activityData.data.gear.distance;
        await syncBike(gearId, currentDistance, user.dataValues.userId);
        const bikeDetails = await getBikeDetails(gearId, user.dataValues.userId);
        const milesSinceWax = getMilesSinceWax(currentDistance, bikeDetails.lastWaxedDistance);
        if (getWaxReminderLevel(milesSinceWax)) {
          await sendDiscordMessage(
            user.dataValues.userId,
            buildRideReminderMessage(bikeDetails.name, milesSinceWax)
          );
        }
        console.log(`Updated distance for gear ${gearId} to ${Math.round(currentDistance * 0.000621371)}`);
      } catch (error) {
        console.error(`Error processing Strava activity ${event.object_id}:`, error);
        return res.sendStatus(500);
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
app.get('/api/users/:userId', requireDatabase, async (req, res) => {
  try {
    const { userId } = req.params;
    const { UsersTable } = await getTables();
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
app.post('/api/users', requireDatabase, async (req, res) => {
  try {
    const { userId, strava_connected, strava_user_id, strava_access_token, strava_refresh_token, strava_expires_at } = req.body;
    const { UsersTable } = await getTables();
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

app.get('/api/users/:userId/bikes', requireDatabase, async (req, res) => {
  try {
    const { userId } = req.params;
    const { BikesTable } = await getTables();
    const bikes = await BikesTable.findAll({ where: { userId, retired: false } });
    res.json(bikes);
  } catch (error) {
    console.error('Error fetching bikes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific bike by name for a user
app.get('/api/users/:userId/bikes/by-name/:bikeName', requireDatabase, async (req, res) => {
  try {
    const { userId, bikeName } = req.params;
    const { BikesTable } = await getTables();
    const bike = await BikesTable.findOne({ 
      where: { userId, name: bikeName, retired: false }
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
app.post('/api/users/:userId/bikes/:bikeName/wax', requireDatabase, async (req, res) => {
  try {
    const { userId, bikeName } = req.params;
    const { BikesTable } = await getTables();
    
    const bike = await BikesTable.findOne({ 
      where: { userId, name: bikeName, retired: false }
    });
    
    if (!bike) {
      return res.status(404).json({ error: 'Bike not found' });
    }
    
    await BikesTable.update(
      { lastWaxedDistance: bike.distance },
      { where: { bikeId: bike.bikeId, userId, retired: false } }
    );
    
    const updatedBike = await BikesTable.findOne({ 
      where: { userId, name: bikeName, retired: false }
    });
    
    res.json(updatedBike);
  } catch (error) {
    console.error('Error updating wax distance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sync bikes from Strava
app.post('/api/users/:userId/bikes/sync', requireDatabase, async (req, res) => {
  try {
    const { userId } = req.params;
    const { UsersTable, BikesTable } = await getTables();
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
    
    const bikes = await BikesTable.findAll({ where: { userId, retired: false } });
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
app.get('/api/users/:userId/latest-ride', requireDatabase, async (req, res) => {
  try {
    const { userId } = req.params;
    const { UsersTable } = await getTables();
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

// Start the HTTP server first (so health checks can respond)
app.listen(STRAVA_WEBHOOK_PORT, async () => {
  console.log(`Strava webhook server is running on port ${STRAVA_WEBHOOK_PORT}`);
  console.log(`Backend API ready on port ${STRAVA_WEBHOOK_PORT}`);
  
  // Initialize database after server starts
  try {
    const dbStartTime = Date.now();
    console.log('='.repeat(60));
    console.log('Starting database initialization...');
    console.log('='.repeat(60));
    await initializeDatabase();
    const dbInitTime = Date.now() - dbStartTime;
    console.log('='.repeat(60));
    console.log(`Database initialized successfully (total time: ${dbInitTime}ms)`);
    console.log('='.repeat(60));
    dbInitialized = true;
    isReady = true;
    startWaxReminderScheduler();
  } catch (error) {
    console.error('='.repeat(60));
    console.error('FATAL: Failed to initialize database');
    console.error('='.repeat(60));
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('Service will continue running but /ready endpoint will fail');
    console.error('='.repeat(60));
    isHealthy = false;
    // Don't exit - let the container keep running for debugging
  }
});

async function setupBikes(athleteId, userId, stravaAccessToken) {
  try {
    const { BikesTable } = await getTables();
    const athleteResponse = await axios.get(`https://www.strava.com/api/v3/athletes/${athleteId}`, {
      headers: { Authorization: `Bearer ${stravaAccessToken}` }
    });
    const activeBikeIds = [];
    for (const bike of athleteResponse.data.bikes) {
      const bikeData = await axios.get(`https://www.strava.com/api/v3/gear/${bike.id}`, {
        headers: { Authorization: `Bearer ${stravaAccessToken}` }
      });
      if (bikeData.data.retired) {
        continue;
      }
      activeBikeIds.push(bike.id);
      const existingBike = await BikesTable.findOne({
        where: { bikeId: bike.id, userId, retired: true }
      });
      if (existingBike) {
        continue;
      }
      await BikesTable.upsert({
        bikeId: bike.id,
        userId: userId,
        name: bike.name,
        brand: bikeData.data.brand_name,
        model: bikeData.data.model_name,
        distance: bike.distance,
        retired: false
      });
    }
    await retireInactiveBikes(BikesTable, userId, activeBikeIds);
  } catch (error) {
    console.error('Error fetching athlete data:', error.status, error.message);
    throw error;
  }
}

async function syncBike(bikeId, distance, userId) {
  const { BikesTable } = await getTables();
  const [updatedRows] = await BikesTable.update(
    { distance },
    { where: { bikeId, userId, retired: false } }
  );
  if (updatedRows === 0) {
    throw new Error(`Active bike ${bikeId} was not found for Discord user ${userId}`);
  }
}

async function getBikeDetails(bikeId, userId) {
  const { BikesTable } = await getTables();
  const output = await BikesTable.findOne({ where: { bikeId, userId, retired: false } });
  if (!output) {
    throw new Error(`Active bike ${bikeId} was not found for Discord user ${userId}`);
  }
  return {
    lastWaxedDistance: output.dataValues.lastWaxedDistance,
    name: output.dataValues.name
  };
}