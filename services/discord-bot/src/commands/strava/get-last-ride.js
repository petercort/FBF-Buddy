import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder, MessageFlags } from 'discord.js';
import { getLatestRide } from '../../shared-library/backend-api-client.js';

export const data = new SlashCommandBuilder()
  .setName('get_latest_ride')
  .setDescription('Get your latest ride from Strava.');

export async function execute(interaction) {
  const userId = interaction.user.id;

  try {
    const latestRide = await getLatestRide(userId);
    
    if (!latestRide) {
      return interaction.editReply({ content: 'No rides found or you need to connect your Strava account first.' });
    }

    const embed = new EmbedBuilder()
      .setTitle('Latest Ride')
      .setDescription(`**Distance:** ${latestRide.distance} meters\n**Date:** ${new Date(latestRide.start_date).toLocaleString()}`)
      .setColor('#FC4C02');

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error fetching latest ride:', error);
    return interaction.editReply({ content: 'There was an error fetching your latest ride.' });
  }
}