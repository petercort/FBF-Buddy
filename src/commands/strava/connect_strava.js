import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { UsersTable } from '../../dbObjects.js'; // Assuming you have a UsersTable to store user data
import { getAzureSecretsClient } from '../../shared_library/azure_secrets.js';

let stravaClientId;

// call the azure_secrets.js to get the secrets
const azureClient = await getAzureSecretsClient();
stravaClientId = (await azureClient.getSecret('stravaClientId')).value;
stravaClientSecret = (await azureClient.getSecret('stravaClientSecret')).value;

export const data = new SlashCommandBuilder()
    .setName('connect_strava')
    .setDescription('Connect your Strava account to collect ride data.');
export async function execute(interaction) {
    const userId = interaction.user.id;
    const stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${stravaClientId}&response_type=code&redirect_uri=${stravaRedirectUri}/${userId}&scope=read,activity:read_all,profile:read_all`;

    const embed = new EmbedBuilder()
        .setTitle('Connect Strava')
        .setDescription(`[Click here to connect your Strava account](${stravaAuthUrl})`)
        .setColor('#FC4C02');

    await interaction.reply({ embeds: [embed], ephemeral: true });

    // Save the user ID to the database to track the connection process
    await UsersTable.upsert({ userId, strava_connected: false });
}