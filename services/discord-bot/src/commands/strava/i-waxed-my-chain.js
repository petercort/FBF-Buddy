import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageFlags } from 'discord.js';
import { getUser, getBikeByName, updateChainWax } from '../../shared-library/backend-api-client.js';

const METERS_TO_MILES_CONVERSION = 0.000621371192;

export const data = new SlashCommandBuilder()
  .setName('i_waxed_my_chain')
  .setDescription('Update the date of when you last waxed your chain for a specific bike.')
  .addStringOption(option => option.setName('bike_name')
    .setDescription('The name of the bike')
    .setRequired(true))
  .addStringOption(option => option.setName('date')
    .setDescription('The date you last waxed your chain (YYYY-MM-DD). If nothing is entered, assuming today.')
    .setRequired(false))
  .addStringOption(option => option.setName('mileage')
    .setDescription('The mileage you waxed your chain at. If nothing is entered, assuming current mileage.')
    .setRequired(false));

export async function execute(interaction) {
  const userId = interaction.user.id;
  
  try {
    // Look up if the user is in the database
    const user = await getUser(userId);
    if (!user) {
      return await interaction.editReply({ content: 'Please connect your Strava using the /connect_strava command.' });
    }

    const bikeName = interaction.options.getString('bike_name');
    
    // Find the bike
    const bike = await getBikeByName(userId, bikeName);
    if (!bike) {
      return await interaction.editReply({ content: `Bike "${bikeName}" not found. Use /sync_bikes to sync your bikes first.` });
    }

    // Update chain wax - backend will set lastWaxedDistance to current distance
    const updatedBike = await updateChainWax(userId, bikeName);
    
    const distanceMiles = Math.round(updatedBike.lastWaxedDistance * METERS_TO_MILES_CONVERSION);
    await interaction.editReply({ 
      content: `Successfully updated the last waxed distance for ${updatedBike.name} to ${distanceMiles} miles.`
    });
  } catch (error) {
    console.error('Error updating waxed chain date:', error);
    await interaction.editReply({ content: 'There was an error updating the waxed chain date.' });
  }
}