const { Sequelize } = require('sequelize');
const fs = require('node:fs');

require('dotenv').config();
let usePostgres = true;
let database;
let username;
let password;
let host;
let sequelize;
let config;

if (process.env.NODE_ENV === 'production') {
	database = fs.readFileSync("/mnt/secrets-store/database", 'utf8')
	username = fs.readFileSync("/mnt/secrets-store/username", 'utf8')
	password = fs.readFileSync("/mnt/secrets-store/password", 'utf8')
	host = fs.readFileSync("/mnt/secrets-store/host", 'utf8')
	config = {
		host: process.env.host,
		dialect: 'sqlite',
		logging: false,
		storage: 'database.sqlite',
	}
	sequelize = new Sequelize(database, username, password, config);
} else if (usePostgres) {
	const databaseUrl = process.env.databaseUrl
	const config = {
		dialect: 'postgres',
		ssl: {
			rejectUnauthorized: false,
			require: true,
		}
	}
	sequelize = new Sequelize(databaseUrl, config)
} else {
	database = process.env.database
	username = process.env.username
	password = process.env.password
	config = {
		host: process.env.host,
		dialect: 'sqlite',
		logging: false,
		storage: 'database.sqlite',
	}
	sequelize = new Sequelize(database, username, password, config);
}

 
  // Test the connection
sequelize.authenticate()
.then(() => {
	console.log('Connection has been established successfully.');
})
.catch(err => {
	console.error('Unable to connect to the database:', err);
});


const EventsTable = require('./models/events.js')(sequelize, Sequelize.DataTypes);
const UsersTable = require('./models/users.js')(sequelize, Sequelize.DataTypes);
const BikesTable = require('./models/bikes.js')(sequelize, Sequelize.DataTypes);
module.exports = { EventsTable, UsersTable, BikesTable };
