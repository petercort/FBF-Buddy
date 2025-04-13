import { Sequelize } from 'sequelize';
import { readFileSync } from 'node:fs';
import dotenv from 'dotenv';
dotenv.config();

import EventsModel from './models/events.js';
import UsersModel from './models/users.js';
import BikesModel from './models/bikes.js';

let sequelize;

if (process.env.NODE_ENV === 'production') {
	const databaseUrl = readFileSync("/mnt/secrets-store/databaseUrl", 'utf8')
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

const EventsTable = EventsModel(sequelize, Sequelize.DataTypes);
const UsersTable = UsersModel(sequelize, Sequelize.DataTypes);
const BikesTable = BikesModel(sequelize, Sequelize.DataTypes);
export { UsersTable, BikesTable };
