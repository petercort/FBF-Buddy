import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { UsersTable, BikesTable } from './dbObjects.js';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

const keyVaultName = process.env.KEY_VAULT_NAME;
const keyVaultUrl = `https://${keyVaultName}.vault.azure.net`;
const credential = new DefaultAzureCredential();
const azureClient = new SecretClient(keyVaultUrl, credential);
const discordToken = (await azureClient.getSecret('discordToken')).value;

// Create the discord client and instantiate the commands collection
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
const foldersPath = join(__dirname, 'commands');
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = join(foldersPath, folder);
	const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = join(commandsPath, file);
		const command = await import(pathToFileURL(filePath).href);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// manage the sequelize connection
client.once(Events.ClientReady, readyClient => {
	console.log('Syncing database...');
	//UsersTable.sync({ alter: true, force: true });
	UsersTable.sync();
	//BikesTable.sync({ alter: true, force: true });
	BikesTable.sync();
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
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
import './strava_webhook.js';

client.login(discordToken);
