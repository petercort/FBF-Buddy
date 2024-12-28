const { SlashCommandBuilder } = require('discord.js');
const { EventsTable } = require('../../dbObjects.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('archive_event')
		.setDescription('Archive an event by name.')
        .addStringOption(option =>
            option.setName('event_name')
                .setDescription('The name of the event')
                .setRequired(true)),
    async execute(interaction) {
        // get the id from the name of the event and set the active column to false
        const eventName = interaction.options.getString('event_name');
        const events = await EventsTable.findAll();
        const event = events.find(e => e.name === eventName);
        if (!event) {
            return await interaction.reply('No event found by that name!');
        }
        event.active = false;
        await event.save();
        return await interaction.reply(`Event ${event.name} has been archived.`);
    },
};