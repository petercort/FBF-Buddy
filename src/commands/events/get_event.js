const { SlashCommandBuilder } = require('discord.js');
const { EventsTable } = require('../../dbObjects.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('get_event')
		.setDescription('Get event details!')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Event name')
                .setRequired(true)),
    async execute(interaction) {
        // capitalize the discipline
        const name = interaction.options.getString('name').charAt(0).toUpperCase() + interaction.options.getString('name').slice(1);
        const events = await EventsTable.findAll({ where: { active: true, name: interaction.options.getString('name') } });
        if (events.length === 0) {
            return await interaction.reply(`${name} not found. Use the command /create_event to add it!`);
        }
        // return all the data from the db. Nicely format it please :)
        return await interaction.reply(`
Event name: ${events[0].name}
Description: ${events[0].description}
Location: ${events[0].location}
Link: ${events[0].link ?? 'N/A'}
Event guide: ${events[0].event_guide ?? 'N/A'}
Registration URL: ${events[0].registration_url ?? 'N/A'}
Discipline: ${events[0].discipline}
Date: ${events[0].date}
Distances: ${events[0].distances ?? 'N/A'}  
        `);
        
    },
};