import { SlashCommandBuilder } from 'discord.js';
import { getUser, syncBikesFromStrava } from '../../shared-library/backend-api-client.js';

const METERS_TO_MILES_CONVERSION = 0.000621371;

export const data = new SlashCommandBuilder()
  .setName('sync_bikes')
  .setDescription('Sync bike data from Strava!');

export async function execute(interaction) {
  const userId = interaction.user.id;
  
  try {
    const user = await getUser(userId);
    if (!user) {
      return await interaction.reply({ content: 'Please connect your Strava using the /connect_strava command.', ephemeral: true });
    }
    
    if (!user.strava_connected) {
      return interaction.reply({ content: 'You need to connect your Strava account first.', ephemeral: true });
    }
    
    // Call backend API to sync bikes from Strava
    const bikes = await syncBikesFromStrava(userId);

    if (bikes.length === 0) {
      return await interaction.reply({ content: 'No bikes found on Strava.', ephemeral: true });
    }
    
    const bikeList = bikes.map(bike => `${bike.name} (${bike.brand} ${bike.model} ${Math.round(bike.distance * METERS_TO_MILES_CONVERSION)} miles)`).join('\n');
    return await interaction.reply({ content: `Your bikes have been synced:\n${bikeList}`, ephemeral: true });
  } catch (error) {
    console.error('Error fetching or syncing bikes:', error);
    return await interaction.reply({ content: 'There was an error syncing your bikes.', ephemeral: true });
  }
}