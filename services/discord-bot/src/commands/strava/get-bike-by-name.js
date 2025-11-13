import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { getUser, getBikeByName } from '../../shared-library/backend-api-client.js';

const METERS_TO_MILES_CONVERSION = 0.000621371;

export const data = new SlashCommandBuilder()
  .setName('get_bike_by_name')
  .setDescription('Get a bike by it\'s name!')
  .addStringOption(option => option.setName('name')
    .setDescription('The name of the bike')
    .setRequired(true));

export async function execute(interaction) {
  const userId = interaction.user.id;
  
  try {
    // Look up if the user is in the database
    const user = await getUser(userId);
    if (!user) {
      return await interaction.reply({ content: 'Please connect your Strava using the /connect_strava command.', flags: MessageFlags.Ephemeral });
    }

    const bikeName = interaction.options.getString('name');
    
    // Query the backend API to get the bike by name for the user
    const bike = await getBikeByName(userId, bikeName);

    if (!bike) {
      return await interaction.reply({ content: 'No bike found with that name.', flags: MessageFlags.Ephemeral });
    }
    
    const bikeInfo = `${bike.name}: ${bike.brand} ${bike.model}. ${Math.round(bike.distance * METERS_TO_MILES_CONVERSION)} miles. Last waxed on ${bike.lastWaxedDate} at ${Math.round(bike.lastWaxedDistance * METERS_TO_MILES_CONVERSION)} miles.`;
    return await interaction.reply({ content: bikeInfo, flags: MessageFlags.Ephemeral });
  } catch (error) {
    console.error('Error fetching bike:', error);
    return await interaction.reply({ content: 'There was an error fetching your bike.', flags: MessageFlags.Ephemeral });
  }
}