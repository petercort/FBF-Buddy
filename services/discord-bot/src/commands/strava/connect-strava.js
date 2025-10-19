import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { getStravaAuthUrl, createOrUpdateUser } from '../../shared-library/backend-api-client.js';

export const data = new SlashCommandBuilder()
    .setName('connect_strava')
    .setDescription('Connect your Strava account to collect ride data.');

export async function execute(interaction) {
    const userId = interaction.user.id;
    
    try {
        // Get the Strava auth URL from backend
        const stravaAuthUrl = await getStravaAuthUrl(userId);

        const embed = new EmbedBuilder()
            .setTitle('Connect Strava')
            .setDescription(`[Click here to connect your Strava account](${stravaAuthUrl})`)
            .setColor('#FC4C02');

        await interaction.reply({ embeds: [embed], ephemeral: true });

        // Save the user ID to the database to track the connection process
        await createOrUpdateUser({ userId, strava_connected: false });
    } catch (error) {
        console.error('Error in connect_strava command:', error);
        await interaction.reply({ 
            content: 'There was an error connecting to Strava. Please try again later.', 
            ephemeral: true 
        });
    }
}