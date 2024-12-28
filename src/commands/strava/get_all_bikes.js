const { SlashCommandBuilder } = require('discord.js');
const { BikesTable } = require('../../dbObjects.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('get_all_bikes')
		.setDescription('Get all your bikes!'),
    async execute(interaction) {
      const userId = interaction.user.id;

      try {
          // Query the BikesTable to get all bikes for the user
          const bikes = await BikesTable.findAll({ where: { userId } });

          if (bikes.length === 0) {
              return await interaction.reply('No bikes found.');
          }
          const bikeList = bikes.map(bike => `${bike.name} (${bike.brand} ${bike.model})`).join('\n');
          return await interaction.reply(`Your bikes:\n${bikeList}`);
      } catch (error) {
          console.error('Error fetching bikes:', error);
          return await interaction.reply('There was an error fetching your bikes.');
      }
  },
};