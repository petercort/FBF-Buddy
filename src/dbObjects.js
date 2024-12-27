const { Sequelize } = require('sequelize');
const fs = require('node:fs');

require('dotenv').config();
let sequelize;


if (process.env.NODE_ENV === 'production') {
	const databaseUrl = fs.readFileSync("/mnt/secrets-store/databaseUrl", 'utf8')
	const config = {
		dialect: 'postgres',
		ssl: {
			rejectUnauthorized: false,
			require: true,
		}
	}
	sequelize = new Sequelize(databaseUrl, config)
} else {
	const database = process.env.database
	const username = process.env.username
	const password = process.env.password
	const config = {
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
