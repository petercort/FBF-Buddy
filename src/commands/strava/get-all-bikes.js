import { SlashCommandBuilder } from 'discord.js';
import { BikesTable, UsersTable } from '../../db-objects.js';

const METERS_TO_MILES_CONVERSION = 0.000621371;

export const data = new SlashCommandBuilder()
  .setName('get_all_bikes')
  .setDescription('Get all your bikes!');

export async function execute(interaction) {
  const userId = interaction.user.id;
  // Look up if the user is in the database
  try {
    const user = await UsersTable.findOne({ where: { userId } });
    if (!user) {
      return await interaction.reply({ content: 'Please connect your Strava using the /connect_strava command.', ephemeral: true });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return await interaction.reply({ content: 'There was an error querying data, please check back in a bit.', ephemeral: true });
  }
  try {
    // Query the BikesTable to get all bikes for the user
    const bikes = await BikesTable.findAll({ where: { userId } });
    if (bikes.length === 0) {
      return await interaction.reply({ content: 'No bikes found! Add a bike by going to https://www.strava.com/settings/gear and adding a bike. Then run /sync_bikes to sync your bikes.', ephemeral: true });
    }
    const bikeList = bikes.map(bike => `${bike.name}: ${bike.brand} ${bike.model}. ${Math.round(bike.distance * METERS_TO_MILES_CONVERSION)} miles. Last waxed on ${bike.lastWaxedDate} at ${Math.round(bike.lastWaxedDistance * METERS_TO_MILES_CONVERSION)} miles.`).join('\n');
    return await interaction.reply({ content: `Your bikes:\n${bikeList}`, ephemeral: true });
  } catch (error) {
    console.error('Error fetching bikes:', error);
    return await interaction.reply({ content: 'There was an error fetching your bikes.', ephemeral: true });
  }
}