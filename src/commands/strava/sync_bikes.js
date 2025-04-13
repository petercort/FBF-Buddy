import { SlashCommandBuilder } from 'discord.js';
import { BikesTable, UsersTable } from '../../dbObjects.js';
import axios from 'axios';
import { getStravaAuthentication } from '../../shared_library/strava_authentication.js';

export const data = new SlashCommandBuilder()
  .setName('sync_bikes')
  .setDescription('Sync bike data from Strava!');
export async function execute(interaction) {
  const userId = interaction.user.id;
  const user = await UsersTable.findOne({ where: { userId } });
  if (!user) {
    return await interaction.reply({ content: 'Please connect your Strava using the /connect_strava command.', ephemeral: true });
  }
  const strava_access_token = await getStravaAuthentication(user.dataValues);
  if (!strava_access_token) {
    return interaction.reply({ content: 'You need to connect your Strava account first.', ephemeral: true });
  }
  try {
    // Fetch bike data from Strava
    const response = await axios.get('https://www.strava.com/api/v3/athlete', {
      headers: {
        'Authorization': `Bearer ${strava_access_token}`
      }
    });

    const bikes = response.data.bikes;

    if (bikes.length === 0) {
      return await interaction.reply({ content: 'No bikes found on Strava.', ephemeral: true });
    }
    // Take the bike ID and call the gear/{id} endpoint to get the bike's name, brand, and model
    let updatedBikes = [];
    // Upsert bike data into the database
    for (const bike of bikes) {
      try {
        const bikeData = await axios.get(`https://www.strava.com/api/v3/gear/${bike.id}`, {
          headers: {
            'Authorization': `Bearer ${strava_access_token}`
          }
        });
        const updatedData = await BikesTable.upsert({
          userId: userId,
          bikeId: bike.id,
          name: bike.name,
          brand: bikeData.data.brand_name,
          model: bikeData.data.model_name,
          distance: bike.distance
        });
        updatedBikes.push(updatedData[0].dataValues);
      } catch (error) {
        console.error('Error fetching bike data:', error);
        return await interaction.reply({ content: 'There was an error fetching your bike data.', ephemeral: true });
      }
    }
    const bikeList = updatedBikes.map(bike => `${bike.name} (${bike.brand} ${bike.model} ${Math.round(bike.distance * 0.000621371)})`).join('\n');
    return await interaction.reply({ content: `Your bikes have been synced:\n${bikeList}`, ephemeral: true });
  } catch (error) {
    console.error('Error fetching or syncing bikes:', error);
    return await interaction.reply({ content: 'There was an error syncing your bikes.', ephemeral: true });
  }
}