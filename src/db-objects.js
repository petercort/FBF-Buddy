
import { Sequelize } from 'sequelize';
import { getAzureSecretsClient } from './shared-library/azure-secrets.js';

import usersModel from './models/users.js';
import bikesModel from './models/bikes.js';

let sequelizeInstance;

const azureClient = await getAzureSecretsClient();
const DATABASE_URL = (await azureClient.getSecret('databaseUrl')).value;
const DB_CONFIG = {
  dialect: 'postgres',
  ssl: {
	rejectUnauthorized: false,
	require: true,
  }
};
sequelizeInstance = new Sequelize(DATABASE_URL, DB_CONFIG);

// Test the connection
sequelizeInstance.authenticate()
  .then(() => {
	console.log('Connection has been established successfully.');
  })
  .catch(error => {
	console.error('Unable to connect to the database:', error);
  });

const UsersTable = usersModel(sequelizeInstance, Sequelize.DataTypes);
const BikesTable = bikesModel(sequelizeInstance, Sequelize.DataTypes);
export { UsersTable, BikesTable };
