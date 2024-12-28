const { SlashCommandBuilder } = require('discord.js');
const { BikesTable } = require('../../dbObjects.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('get_bike_by_name')
		.setDescription('Get a bike by it\'s name!')
    .addStringOption(option => 
      option.setName('name')
          .setDescription('The name of the bike')
          .setRequired(true)),
    async execute(interaction) {
      const userId = interaction.user.id;
      const bikeName = interaction.options.getString('name')
      try {
        // Query the BikesTable to get the bike by name for the user
        const bike = await BikesTable.findOne({ where: { userId, name: bikeName } });

        if (!bike) {
            return await interaction.reply('No bike found with that name.');
        }
        const miles = Math.round(bike.lastWaxedDistance * 0.000621371); // equivilant meters to miles
        const bikeInfo = `Bike information:\nName: ${bike.name}\nBrand: ${bike.brand}\nModel: ${bike.model}.\nCurrent Mileage: ${Math.round(bike.distance * 0.000621371)}\nThis chain was last waxed on ${bike.lastWaxedDate} at ${miles} miles.`;

        return await interaction.reply(bikeInfo);
    } catch (error) {
        console.error('Error fetching bike:', error);
        return await interaction.reply('There was an error fetching your bike.');
    }
  }
};