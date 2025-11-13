
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Collection, Events, GatewayIntentBits, MessageFlags } from 'discord.js';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { getDiscordClient } from './shared-library/discord-client.js';

// Define __dirname for ES modules
const FILENAME = fileURLToPath(import.meta.url);
const DIRNAME = join(FILENAME, '..');

// Backend API URL (will be set via environment variable)
export const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3000';

// Get the shared Discord client
let discordClient;
try {
  console.log('Initializing Discord client...');
  console.log('KEY_VAULT_NAME:', process.env.KEY_VAULT_NAME);
  console.log('BACKEND_API_URL:', BACKEND_API_URL);
  discordClient = await getDiscordClient();
  console.log('Discord client initialized successfully');
} catch (error) {
  console.error('FATAL: Failed to initialize Discord client:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

// Create the commands collection
discordClient.commands = new Collection();
const foldersPath = join(DIRNAME, 'commands');
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = join(foldersPath, folder);
  const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
	const filePath = join(commandsPath, file);
	const command = await import(pathToFileURL(filePath).href);
	if ('data' in command && 'execute' in command) {
	  discordClient.commands.set(command.data.name, command);
	} else {
	  console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
  }
}

// Discord client ready event
discordClient.once(Events.ClientReady, readyClient => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  console.log(`Connected to backend API at: ${BACKEND_API_URL}`);
});

discordClient.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
	console.error(`No command matching ${interaction.commandName} was found.`);
	return;
  }

  try {
	// Defer the reply immediately to prevent timeout (3 second limit)
	await interaction.deferReply();
	
	// Execute the command
	await command.execute(interaction);
  } catch (error) {
	console.error(error);
	if (interaction.replied || interaction.deferred) {
	  try {
		await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
	  } catch (followUpError) {
		console.error('Error sending follow-up message:', followUpError);
	  }
	} else {
	  try {
		await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
	  } catch (replyError) {
		console.error('Error sending reply message:', replyError);
	  }
	} catch (replyError) {
	  console.error('Error sending error message:', replyError);
	}
  }
});

// Start an Express server for receiving message requests from backend
import express, { json } from 'express';

const DISCORD_BOT_API_PORT = 3001;
const app = express();
app.use(json());

// Track service readiness
let isReady = false;
let isHealthy = true;

// Endpoint to send direct messages to users
app.post('/api/send-message', async (req, res) => {
  const { userId, message } = req.body;
  
  if (!userId || !message) {
    return res.status(400).json({ error: 'userId and message are required' });
  }
  
  try {
    const discordUser = await discordClient.users.fetch(userId);
    await discordUser.send(message);
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message', details: error.message });
  }
});

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
      service: 'discord-bot',
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({
    status: 'healthy',
    service: 'discord-bot',
    timestamp: new Date().toISOString()
  });
});

app.get('/ready', async (req, res) => {
  // Readiness probe - checks if the service is ready to accept traffic
  const checks = {
    discordClient: false,
    backendApi: false
  };
  
  try {
    // Check Discord client connection
    if (discordClient && discordClient.isReady()) {
      checks.discordClient = true;
    }
    
    // Check backend API availability
    try {
      const response = await fetch(`${BACKEND_API_URL}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      if (response.ok) {
        checks.backendApi = true;
      }
    } catch (error) {
      console.log('Backend API check failed:', error.message);
    }
    
    const allChecksPass = Object.values(checks).every(check => check === true);
    
    if (!allChecksPass) {
      return res.status(503).json({
        status: 'not ready',
        service: 'discord-bot',
        checks,
        timestamp: new Date().toISOString()
      });
    }
    
    // Mark service as ready
    isReady = true;
    
    res.json({
      status: 'ready',
      service: 'discord-bot',
      checks,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Readiness check failed:', error.message);
    res.status(503).json({
      status: 'not ready',
      service: 'discord-bot',
      checks,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.listen(DISCORD_BOT_API_PORT, () => {
  console.log(`Discord bot API server is running on port ${DISCORD_BOT_API_PORT}`);
});
