import { SlashCommandBuilder } from 'discord.js';
import { BikesTable, UsersTable } from '../../dbObjects.js';
export const data = new SlashCommandBuilder()
  .setName('get_bike_by_name')
  .setDescription('Get a bike by it\'s name!')
  .addStringOption(option => option.setName('name')
    .setDescription('The name of the bike')
    .setRequired(true));
export async function execute(interaction) {
  const userId = interaction.user.id;
  // look up if the user is in the database
  try {
    const user = await UsersTable.findOne({ where: { userId } });
    if (!user) {
      return await interaction.reply({ content: 'Please connect your Strava using the /connect_strava command.', ephemeral: true });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return await interaction.reply({ content: 'There was an error querying data, please check back in a bit.', ephemeral: true });
  }
  const bikeName = interaction.options.getString('name');
  try {
    // Query the BikesTable to get the bike by name for the user
    const bike = await BikesTable.findOne({ where: { userId, name: bikeName } });

    if (!bike) {
      return await interaction.reply({ content: 'No bike found with that name.', ephemeral: true });
    }
    const bikeInfo = `${bike.name}: ${bike.brand} ${bike.model}. ${Math.round(bike.distance * 0.000621371)} miles. Last waxed on ${bike.lastWaxedDate} at ${Math.round(bike.lastWaxedDistance * 0.000621371)} miles.`;
    return await interaction.reply({ content: bikeInfo, ephemeral: true });
  } catch (error) {
    console.error('Error fetching bike:', error);
    return await interaction.reply({ content: 'There was an error fetching your bike.', ephemeral: true });
  }
}