
import { Sequelize } from 'sequelize';
import { getAzureSecretsClient } from './shared-library/azure-secrets.js';

import usersModel from './models/users.js';
import bikesModel from './models/bikes.js';

let sequelizeInstance;
let UsersTable;
let BikesTable;
let isDbInitialized = false;

// Initialize database connection (called from app.js after server starts)
async function initializeDatabase() {
  try {
    console.log('Initializing database connection...');
    const azureClient = await getAzureSecretsClient();
    const DATABASE_URL = (await azureClient.getSecret('databaseUrl')).value;
    
    const DB_CONFIG = {
      dialect: 'postgres',
      ssl: {
        rejectUnauthorized: false,
        require: true,
      },
      logging: false, // Disable SQL query logging
    };
    
    sequelizeInstance = new Sequelize(DATABASE_URL, DB_CONFIG);

    // Test the connection
    await sequelizeInstance.authenticate();
    console.log('Database connection has been established successfully.');

    // Initialize models
    UsersTable = usersModel(sequelizeInstance, Sequelize.DataTypes);
    BikesTable = bikesModel(sequelizeInstance, Sequelize.DataTypes);
    
    isDbInitialized = true;
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error.message);
    isDbInitialized = false;
    throw error;
  }
}

// Test database connection (for health checks)
async function testDatabaseConnection() {
  if (!sequelizeInstance) {
    return false;
  }
  try {
    await sequelizeInstance.authenticate();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error.message);
    return false;
  }
}

export { UsersTable, BikesTable, initializeDatabase, testDatabaseConnection, isDbInitialized };
