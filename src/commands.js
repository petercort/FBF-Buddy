import { REST, Routes } from 'discord.js';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

require('dotenv').config()
let discordToken;
let appId;
if (process.env.NODE_ENV === 'production') {
	discordToken = readFileSync("/mnt/secrets-store/discordToken", 'utf8');
	appId = readFileSync("/mnt/secrets-store/appId", 'utf8');
} else {
	discordToken = process.env.discordToken;
	appId = process.env.appId;
}

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
const rest = new REST().setToken(discordToken);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);
		// The put method is used to fully refresh all commands in the guild with the current set
 		const data = await rest.put(
			Routes.applicationCommands(appId),
			{ body: commands },
		);
		console.log(`Successfully reloaded ${data.length} application (/) commands.`); 
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();