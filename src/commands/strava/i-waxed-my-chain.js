import { SlashCommandBuilder } from '@discordjs/builders';
import { BikesTable, UsersTable } from '../../db-objects.js';
import { Op, Sequelize } from 'sequelize';

const MILES_TO_METERS_CONVERSION = 1609.344;
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
  const bikeName = interaction.options.getString('bike_name');
  // If date is null use today
  let date = interaction.options.getString('date');
  if (!interaction.options.getString('date')) {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1; // Months are zero-based, so add 1
    const day = currentDate.getDate();
    const year = currentDate.getFullYear();
    date = `${month}/${day}/${year}`;
  }
  const bike = await BikesTable.findOne({
    where: {
      userId: userId,
      [Op.and]: [
        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), bikeName.toLowerCase())
      ]
    }
  });
  let mileage = "";
  if (interaction.options.getString('mileage')) {
    // Convert to miles from meters
    mileage = interaction.options.getString('mileage') * MILES_TO_METERS_CONVERSION;
  } else {
    mileage = bike.distance;
  }

  try {
    await BikesTable.update(
      { lastWaxedDate: date, lastWaxedDistance: Math.round(mileage) },
      { where: { userId: userId, bikeId: bike.bikeId } }
    );
    const distanceMiles = Math.round(mileage * METERS_TO_MILES_CONVERSION);
    await interaction.reply({ content: `Successfully updated the last waxed date for ${bike.name} to ${date}, at ${distanceMiles} miles.`, ephemeral: true });
  } catch (error) {
    console.error('Error updating waxed chain date:', error);
    await interaction.reply({ content: 'There was an error updating the waxed chain date.', ephemeral: true });
  }
}