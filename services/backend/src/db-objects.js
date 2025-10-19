
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
    console.log('[DB] Initializing database connection...');
    console.log('[DB] Fetching database URL from Azure Key Vault...');
    const azureClient = await getAzureSecretsClient();
    const DATABASE_URL = (await azureClient.getSecret('databaseUrl')).value;
    
    // Log connection details (without exposing credentials)
    const dbUrlParts = DATABASE_URL.match(/postgres:\/\/([^:]+):.*@([^:]+):(\d+)\/(.+)/);
    if (dbUrlParts) {
      console.log('[DB] Database connection details:');
      console.log(`[DB]   - User: ${dbUrlParts[1]}`);
      console.log(`[DB]   - Host: ${dbUrlParts[2]}`);
      console.log(`[DB]   - Port: ${dbUrlParts[3]}`);
      console.log(`[DB]   - Database: ${dbUrlParts[4].split('?')[0]}`);
    }
    
    const DB_CONFIG = {
      dialect: 'postgres',
      ssl: {
        rejectUnauthorized: false,
        require: true,
      },
      logging: false, // Disable SQL query logging
    };
    
    console.log('[DB] Creating Sequelize instance...');
    sequelizeInstance = new Sequelize(DATABASE_URL, DB_CONFIG);

    // Test the connection
    console.log('[DB] Testing database connection...');
    const startTime = Date.now();
    await sequelizeInstance.authenticate();
    const connectionTime = Date.now() - startTime;
    console.log(`[DB] Database connection established successfully (${connectionTime}ms)`);

    // Initialize models
    console.log('[DB] Initializing database models...');
    UsersTable = usersModel(sequelizeInstance, Sequelize.DataTypes);
    console.log('[DB]   - UsersTable model initialized');
    BikesTable = bikesModel(sequelizeInstance, Sequelize.DataTypes);
    console.log('[DB]   - BikesTable model initialized');
    
    isDbInitialized = true;
    console.log('[DB] Database initialization complete');
    return true;
  } catch (error) {
    console.error('[DB] Failed to initialize database:', error.message);
    console.error('[DB] Error stack:', error.stack);
    if (error.original) {
      console.error('[DB] Original error:', error.original.message);
    }
    isDbInitialized = false;
    throw error;
  }
}

// Test database connection (for health checks)
async function testDatabaseConnection() {
  if (!sequelizeInstance) {
    console.log('[DB] Connection test failed: Sequelize instance not initialized');
    return false;
  }
  try {
    console.log('[DB] Testing database connection...');
    const startTime = Date.now();
    await sequelizeInstance.authenticate();
    const testTime = Date.now() - startTime;
    console.log(`[DB] Connection test successful (${testTime}ms)`);
    return true;
  } catch (error) {
    console.error('[DB] Connection test failed:', error.message);
    if (error.original) {
      console.error('[DB] Original error:', error.original.message);
    }
    return false;
  }
}

export { UsersTable, BikesTable, initializeDatabase, testDatabaseConnection, isDbInitialized, sequelizeInstance as sequelize };
