const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const EventsTable = require('./models/events.js')(sequelize, Sequelize.DataTypes);
const UsersTable = require('./models/users.js')(sequelize, Sequelize.DataTypes);
const BikesTable = require('./models/bikes.js')(sequelize, Sequelize.DataTypes);
module.exports = { EventsTable, UsersTable, BikesTable };