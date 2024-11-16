const { Sequelize } = require('sequelize');
const fs = require('node:fs');
const path = require('node:path');

const database = fs.readFileSync("/mnt/secrets-store/database", 'utf8')
const username = fs.readFileSync("/mnt/secrets-store/username", 'utf8')
const password = fs.readFileSync("/mnt/secrets-store/password", 'utf8')
const host = fs.readFileSync("/mnt/secrets-store/host", 'utf8')

const sequelize = new Sequelize(database, username, password, {
	host: host,
	dialect: 'postgres',
	dialectOptions: {
		ssl: {
		require: true,
		rejectUnauthorized: false // This is necessary for Azure
		}
	}
});
  
  // Test the connection
sequelize.authenticate()
.then(() => {
	console.log('Connection has been established successfully.');
})
.catch(err => {
	console.error('Unable to connect to the database:', err);
});

	
const EventsTable = require('./models/events.js')(sequelize, Sequelize.DataTypes);


module.exports = { EventsTable };
