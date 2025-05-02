import { Sequelize } from 'sequelize';
import { getAzureSecretsClient } from './shared_library/azure_secrets.js';

import UsersModel from './models/users.js';
import BikesModel from './models/bikes.js';

let sequelize;

const azureClient = await getAzureSecretsClient();
const databaseUrl = (await azureClient.getSecret('databaseUrl')).value;
const config = {
	dialect: 'postgres',
	ssl: {
		rejectUnauthorized: false,
		require: true,
	}
}
sequelize = new Sequelize(databaseUrl, config)

  // Test the connection
sequelize.authenticate()
.then(() => {
	console.log('Connection has been established successfully.');
})
.catch(err => {
	console.error('Unable to connect to the database:', err);
});

const UsersTable = UsersModel(sequelize, Sequelize.DataTypes);
const BikesTable = BikesModel(sequelize, Sequelize.DataTypes);
export { UsersTable, BikesTable };
