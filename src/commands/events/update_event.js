const { SlashCommandBuilder } = require('discord.js');
const { EventsTable } = require('../../dbObjects.js');
const { Op } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('update_event')
		.setDescription('Update an existing event!')
		.addStringOption(option =>
			option.setName('name')
				.setDescription('The name of the event')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('description')
				.setDescription('Brief description of the event'))
		.addStringOption(option =>
			option.setName('location')
				.setDescription('The location of the event (state, country)'))
		.addStringOption(option =>
			option.setName('discipline')
				.setDescription('The discipline of the event (road, mtb, gravel, etc.)'))
		.addStringOption(option =>
			option.setName('date')
				.setDescription('The date of the event (at least time of year)'))
		.addStringOption(option =>
			option.setName('link')
				.setDescription('The link of the event'))
		.addStringOption(option =>
			option.setName('registration_url')
				.setDescription('The registration url of the event'))
		.addStringOption(option =>
			option.setName('event_guide')
				.setDescription('The event guide of the event'))
		.addStringOption(option =>
			option.setName('distances')
				.setDescription('The distances of the event')),
	async execute(interaction) {
		const eventName = interaction.options.getString('name').toLowerCase();
		
		// lets check to see if there are active events with the same name (case insensitive)
		const eventInfo = await EventsTable.findAll({ where: { active: true, name: { [Op.like]: eventName }} });
        
        // declare the data, and only update the fields that are not null otherwise populate with the existing data
        const eventDescription = interaction.options.getString('description') ?? eventInfo[0].dataValues.description;
		const eventLocation = interaction.options.getString('location') ?? eventInfo[0].dataValues.location;
		const eventDiscipline = interaction.options.getString('discipline') ?? eventInfo[0].dataValues.discipline;
		const eventDate = interaction.options.getString('date') ?? eventInfo[0].dataValues.date;
		const eventLink = interaction.options.getString('link') ?? eventInfo[0].dataValues.link;
		const eventRegistrationUrl = interaction.options.getString('registration_url') ?? eventInfo[0].dataValues.registration_url;
		const eventEventGuide = interaction.options.getString('event_guide') ?? eventInfo[0].dataValues.event_guide;
		const eventDistances = interaction.options.getString('distances') ?? eventInfo[0].dataValues.distances;
        const eventId = eventInfo[0].dataValues.id;
        
		try {
			// equivalent to: INSERT INTO events (name, description, username) values (?, ?, ?);
		  await EventsTable.update({
				description: eventDescription,
				location: eventLocation,
				link: eventLink,
				registration_url: eventRegistrationUrl,
				event_guide: eventEventGuide,
				discipline: eventDiscipline,
				date: eventDate,
				distances: eventDistances,
				active: true,
			}, {
                where: {
                    id: eventId,
                },
            });
			return interaction.reply(`Event ${eventName} has been updated.`);
		} catch (error) {
			console.log(error);
			return interaction.reply('Something went wrong with adding a event.');
		}
	},
};
