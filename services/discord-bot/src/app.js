
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Collection, Events, GatewayIntentBits } from 'discord.js';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { getDiscordClient } from './shared-library/discord-client.js';

// Define __dirname for ES modules
const FILENAME = fileURLToPath(import.meta.url);
const DIRNAME = join(FILENAME, '..');

// Backend API URL (will be set via environment variable)
export const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3000';

// Get the shared Discord client
const discordClient = await getDiscordClient();

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
	await command.execute(interaction);
  } catch (error) {
	console.error(error);
	if (interaction.replied || interaction.deferred) {
	  try {
		await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
	  } catch (followUpError) {
		console.error('Error sending follow-up message:', followUpError);
	  }
	} else {
	  try {
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	  } catch (replyError) {
		console.error('Error sending reply message:', replyError);
	  }
	}
  }
});

// Start an Express server for receiving message requests from backend
import express, { json } from 'express';

const DISCORD_BOT_API_PORT = 3001;
const app = express();
app.use(json());

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'discord-bot' });
});

app.listen(DISCORD_BOT_API_PORT, () => {
  console.log(`Discord bot API server is running on port ${DISCORD_BOT_API_PORT}`);
});
