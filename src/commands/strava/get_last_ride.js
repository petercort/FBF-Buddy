import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import axios from 'axios';
import { getStravaAuthentication } from '../../shared_library/strava_authentication.js';

export const data = new SlashCommandBuilder()
    .setName('get_latest_ride')
    .setDescription('Get your latest ride from Strava.');
export async function execute(interaction) {
    const userId = interaction.user.id;

    // do some logic here to determine if hte access token is expired if so refresh it and then use it
    const strava_access_token = await getStravaAuthentication(userId);
    if (!strava_access_token) {
        return interaction.reply({ content: 'You need to connect your Strava account first.', ephemeral: true });
    }
    try {
        const response = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
            headers: { Authorization: `Bearer ${strava_access_token}` },
            params: { per_page: 1 }
        });

        const latestRide = response.data[0];

        if (!latestRide) {
            return interaction.reply({ content: 'No rides found.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('Latest Ride')
            .setDescription(`**Distance:** ${latestRide.distance} meters\n**Date:** ${new Date(latestRide.start_date).toLocaleString()}`)
            .setColor('#FC4C02');

        return interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
        console.error('Error fetching latest ride:', error);
        return interaction.reply({ content: 'There was an error fetching your latest ride.', ephemeral: true });
    }
}