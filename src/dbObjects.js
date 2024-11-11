const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const EventsTable = require('./models/events.js')(sequelize, Sequelize.DataTypes);

module.exports = { EventsTable };