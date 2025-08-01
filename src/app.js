
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Collection, Events, GatewayIntentBits } from 'discord.js';
import { UsersTable, BikesTable } from './db-objects.js';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { getDiscordClient } from './shared-library/discord-client.js';

// Define __dirname for ES modules
const FILENAME = fileURLToPath(import.meta.url);
const DIRNAME = join(FILENAME, '..');

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

// Manage the sequelize connection
discordClient.once(Events.ClientReady, readyClient => {
  console.log('Syncing database...');
  //UsersTable.sync({ alter: true, force: true });
  UsersTable.sync();
  //BikesTable.sync({ alter: true, force: true });
  BikesTable.sync();
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
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

// Start the Strava webhook server
import './strava-webhook.js';
