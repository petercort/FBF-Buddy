const { SlashCommandBuilder } = require('discord.js');
const { EventsTable } = require('../../dbObjects.js');
const { Op } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create_event')
		.setDescription('Create a new event!')
		.addStringOption(option =>
			option.setName('name')
				.setDescription('The name of the event')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('description')
				.setDescription('Brief description of the event')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('location')
				.setDescription('The location of the event (state, country)')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('discipline')
				.setDescription('The discipline of the event (road, mtb, gravel, etc.)')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('date')
				.setDescription('The date of the event (at least time of year)')
				.setRequired(true))
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
		const eventDescription = interaction.options.getString('description').toLowerCase();
		const eventLocation = interaction.options.getString('location').toLowerCase();
		const eventDiscipline = interaction.options.getString('discipline').toLowerCase();
		const eventDate = interaction.options.getString('date');
		const eventLink = interaction.options.getString('link');
		const eventRegistrationUrl = interaction.options.getString('registration_url');
		const eventEventGuide = interaction.options.getString('event_guide');
		const eventDistances = interaction.options.getString('distances');
		
		// lets check to see if there are active events with the same name (case insensitive)
		const existingEvents = await EventsTable.findAll({ where: { active: true, name: { [Op.like]: eventName }} });
		if (existingEvents.length > 0) {
			return interaction.reply('An active event with that name already exists.\nIf you would like to update the event, use the /update_event command.\nIf you would like to create a new event, archive the old event using the /archive_event command, and then create the new one.');
		}
		try {
			// equivalent to: INSERT INTO events (name, description, username) values (?, ?, ?);
			const event = await EventsTable.create({
				name: eventName,
				description: eventDescription,
				location: eventLocation,
				link: eventLink,
				registration_url: eventRegistrationUrl,
				event_guide: eventEventGuide,
				discipline: eventDiscipline,
				date: eventDate,
				distances: eventDistances,
				active: true,
			});
	
			return interaction.reply(`event ${event.name} added.`);
		} catch (error) {
			if (error.name === 'SequelizeUniqueConstraintError') {
				console.log(error);
				return interaction.reply('That event already exists.');
			}
			console.log(error);
			return interaction.reply('Something went wrong with adding a event.');
		}
	},
};
