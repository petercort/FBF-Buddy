const { SlashCommandBuilder } = require('@discordjs/builders');
const { BikesTable } = require('../../dbObjects.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('i_waxed_my_chain')
        .setDescription('Update the date of when you last waxed your chain for a specific bike.')
        .addStringOption(option => 
            option.setName('bike_name')
                .setDescription('The name of the bike')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('date')
                .setDescription('The date you last waxed your chain (YYYY-MM-DD). If nothing is entered, assuming today.')
                .setRequired(false))
        .addStringOption(option => 
            option.setName('mileage')
                .setDescription('The mileage you waxed your chain at. If nothing is entered, assuming current mileage.')
                .setRequired(false)),
    async execute(interaction) {
        const userId = interaction.user.id;
        const bikeName = interaction.options.getString('bike_name');
        // if date is null use today
        let date = interaction.options.getString('date')
        if (!interaction.options.getString('date')) {
            const currentDate = new Date();
            const month = currentDate.getMonth() + 1; // Months are zero-based, so add 1
            const day = currentDate.getDate();
            const year = currentDate.getFullYear();
            date = `${month}/${day}/${year}`;
        }
        const bike = await BikesTable.findOne({ where: { userId: userId, name: bikeName } });  
        var mileage = ""
        if (interaction.options.getString('mileage')) {
            mileage = interaction.options.getString('mileage') * 1609.344;
        } else {
            mileage = bike.distance;
        }
        
        try {
            const output = await BikesTable.update(
                { lastWaxedDate: date, lastWaxedDistance: mileage},
                { where: { userId: userId, bikeId: bike.bikeId } }
            );
            const distanceMiles = Math.round(mileage * 0.000621371192);
            await interaction.reply({ content: `Successfully updated the last waxed date for bike ID ${bike.bikeId} to ${date}, at ${distanceMiles} miles.`});
        } catch (error) {
            console.error('Error updating waxed chain date:', error);
            await interaction.reply({ content: 'There was an error updating the waxed chain date.', ephemeral: true });
        }
    },
};