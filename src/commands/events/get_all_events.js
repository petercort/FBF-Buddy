const { SlashCommandBuilder } = require('discord.js');
const { EventsTable } = require('../../dbObjects.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('get_all_events')
		.setDescription('Get all events!')
        .addStringOption(option =>
            option.setName('discipline')
                .setDescription('Event discipline')),
    async execute(interaction) {
        // find all events that are active
        if (interaction.options.getString('discipline')) {
            // capitalize the discipline
            const discipline = interaction.options.getString('discipline').charAt(0).toUpperCase() + interaction.options.getString('discipline').slice(1);
            const events = await EventsTable.findAll({ where: { active: true, discipline: interaction.options.getString('discipline') } });
            if (events.length === 0) {
                return await interaction.reply(`No ${discipline} events found. Use the command /create_event to add one!`);
            }
            return await interaction.reply(`${discipline} events: ${events.map(event => event.name).join(', ')}. \nUse the command /get_event to get more information about a specific event!`);
        } else {
            const events = await EventsTable.findAll({ where: { active: true } });
            if (events.length === 0) {
                return await interaction.reply('No events found. Use the command /create_event to add one!');
            }
            return await interaction.reply(`Events found: ${events.map(event => event.name).join(', ')}. \nUse the command /get_event to get more information about a specific event!`);
        }
    },
};