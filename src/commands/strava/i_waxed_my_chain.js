import { SlashCommandBuilder } from '@discordjs/builders';
import { BikesTable, UsersTable } from '../../dbObjects.js';
import { Op, Sequelize } from 'sequelize';

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
    const bikeName = interaction.options.getString('bike_name');
    // if date is null use today
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
    var mileage = "";
    if (interaction.options.getString('mileage')) {
        // convert to miles from meters
        // 1 mile = 1609.344 meters
        mileage = interaction.options.getString('mileage') * 1609.344;
    } else {
        mileage = bike.distance;
    }

    try {
        const activeChain = bike.chains.find((c) => c.isActive);
        if (!activeChain) {
            return await interaction.reply({ content: `No active chain found for bike ${bikeName}. Please set an active chain first.`, ephemeral: true });
        }

        activeChain.lastWaxedMileage = bike.distance;
        await bike.save();

        await BikesTable.update(
            { lastWaxedDate: date, lastWaxedDistance: Math.round(mileage) },
            { where: { userId: userId, bikeId: bike.bikeId } }
        );
        const distanceMiles = Math.round(mileage * 0.000621371192);
        await interaction.reply({ content: `Successfully updated the last waxed date for ${bike.name} to ${date}, at ${distanceMiles} miles.`, ephemeral: true });
    } catch (error) {
        console.error('Error updating waxed chain date:', error);
        await interaction.reply({ content: 'There was an error updating the waxed chain date.', ephemeral: true });
    }
}

import bikes from '../../models/bikes.js';

export default {
  name: 'i_waxed_my_chain',
  description: 'Updates the last waxed mileage for the active chain of a bike.',
  execute: async (bikeName) => {
    try {
      const bike = await bikes.findOne({ where: { name: bikeName } });
      if (!bike) {
        return `Bike with name ${bikeName} not found.`;
      }

      const activeChain = bike.chains.find((c) => c.isActive);
      if (!activeChain) {
        return `No active chain found for bike ${bikeName}. Please set an active chain first.`;
      }

      activeChain.lastWaxedMileage = bike.distance;
      await bike.save();

      return `Active chain for bike ${bikeName} has been updated with the last waxed mileage.`;
    } catch (error) {
      console.error(error);
      return 'An error occurred while updating the active chain.';
    }
  },
};