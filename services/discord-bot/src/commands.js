
import { REST, Routes } from 'discord.js';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const DISCORD_TOKEN = process.env.discordToken;
const APP_ID = process.env.appId;

const commands = [];
// Grab all the command folders from the commands directory you created earlier
const foldersPath = join(__dirname, 'commands');
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
  console.log(`[INFO] Processing commands in folder: ${folder}`);
  // Grab all the command files from the commands directory you created earlier
  const commandsPath = join(foldersPath, folder);
  const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
  for (const file of commandFiles) {
	const filePath = join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
	  commands.push(command.data.toJSON());
	} else {
	  console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(DISCORD_TOKEN);

// and deploy your commands!
(async () => {
  try {
	console.log(`Started refreshing ${commands.length} application (/) commands.`);
	// The put method is used to fully refresh all commands in the guild with the current set
	const data = await rest.put(
	  Routes.applicationCommands(APP_ID),
	  { body: commands },
	);
	console.log(`Successfully reloaded ${data.length} application (/) commands.`); 
  } catch (error) {
	// And of course, make sure you catch and log any errors!
	console.error(error);
  }
})();