# Local Development Guide

This guide will help you set up and run FBF-Buddy on your local machine for development and testing.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 24.x ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Docker** and **Docker Compose** (for containerized development)
- **Git** for version control
- **Azure account** (for accessing Azure Key Vault secrets)

## Architecture Overview

FBF-Buddy uses a microservices architecture with two main services:

```
┌─────────────┐      ┌─────────────────────────┐
│ Discord Bot │ ◀─▶ │   Backend/API/DB        │
│  Port: 3001 │      │     Port: 3000          │
└─────────────┘      └─────────────────────────┘
```

- **Discord Bot Service** (`services/discord-bot/`): Handles Discord interactions and slash commands
- **Backend Service** (`services/backend/`): Manages Strava webhooks, API endpoints, and database operations

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/petercort/FBF-Buddy.git
cd FBF-Buddy
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

Edit the `.env` file and add your Azure credentials:

```bash
# Azure Key Vault Configuration
KEY_VAULT_NAME=your-key-vault-name

# Azure Service Principal Credentials
AZURE_CLIENT_ID=your-client-id
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_SECRET=your-client-secret
```

**Note:** These credentials are required to access secrets stored in Azure Key Vault, including:
- Discord Bot Token
- Discord Application ID
- Strava API credentials
- Database connection strings

### 3. Install Dependencies

Install dependencies for all services (root, discord-bot, and backend):

```bash
npm run install:all
```

This command will:
1. Install root-level dependencies
2. Install Discord bot service dependencies
3. Install backend service dependencies

## Running the Application

You have two options for running the application: using Docker Compose (recommended) or running services individually.

### Option 1: Using Docker Compose (Recommended)

This is the easiest way to run both services together with proper networking:

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The services will be available at:
- Backend API: http://localhost:3000
- Discord Bot API: http://localhost:3001

### Option 2: Running Services Individually

This is useful for debugging or working on a single service.

#### Start the Backend Service

```bash
npm run start:backend
# Or with hot reload for development
npm run dev:backend
```

#### Start the Discord Bot Service

```bash
npm run start:bot
# Or with hot reload for development
npm run dev:bot
```

**Important:** When running services individually, ensure they can communicate:
- Backend expects Discord Bot at `http://localhost:3001` (set via `DISCORD_BOT_API_URL`)
- Discord Bot expects Backend at `http://localhost:3000` (set via `BACKEND_API_URL`)

## Development Workflow

### Registering Discord Commands

Before the Discord bot can respond to slash commands, you need to register them with Discord:

```bash
npm run register
```

This command registers all slash commands defined in `services/discord-bot/src/commands.js` with Discord's API.

**When to run this:**
- After cloning the repository for the first time
- After adding or modifying Discord slash commands
- When deploying to a new Discord server

### Hot Reload / Development Mode

For active development with automatic reloading on file changes:

```bash
# Run backend in dev mode
npm run dev:backend

# Run bot in dev mode
npm run dev:bot
```

Both services use `nodemon` to automatically restart when you make code changes.

### Linting

Check code quality and style:

```bash
# Lint all services
npm run lint

# Lint individual services
npm run lint:bot
npm run lint:backend
```

Fix linting issues automatically (when possible):

```bash
# In the service directory
cd services/discord-bot
npx eslint src/**/*.js --fix

cd services/backend
npx eslint src/**/*.js --fix
```

### Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

**Note:** Tests are located in the `__tests__/` directory at the root level.

## Database Setup

The backend service uses PostgreSQL for data storage. The database connection string is retrieved from Azure Key Vault.

### Local Database (Optional)

If you want to run a local PostgreSQL instance for development:

1. Install PostgreSQL locally or use Docker:

```bash
docker run --name fbf-postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=fbf_buddy \
  -p 5432:5432 \
  -d postgres:14
```

2. Update your Azure Key Vault with the local database connection string, or modify the backend service to use a local `.env` variable for the database URL.

### Database Models

The application uses Sequelize ORM. Models are defined in `services/backend/src/models/`.

## Service Communication

The two services communicate via HTTP:

### Backend → Discord Bot

The backend sends messages to Discord users via the bot's API:

```
POST http://localhost:3001/api/send-message
Content-Type: application/json

{
  "userId": "discord-user-id",
  "message": "Your message here"
}
```

### Discord Bot → Backend

The Discord bot makes requests to backend endpoints (e.g., for Strava OAuth callbacks and data retrieval).

## Available Scripts

From the root directory:

| Script | Description |
|--------|-------------|
| `npm start` | Start all services using Docker Compose |
| `npm run start:bot` | Start Discord bot service only |
| `npm run start:backend` | Start backend service only |
| `npm run dev:bot` | Start bot with hot reload |
| `npm run dev:backend` | Start backend with hot reload |
| `npm run register` | Register Discord slash commands |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Lint all services |
| `npm run lint:bot` | Lint Discord bot code |
| `npm run lint:backend` | Lint backend code |
| `npm run install:all` | Install dependencies for all services |

## Health Check Endpoints

Both services expose health check endpoints for monitoring:

### Backend Service (Port 3000)

- `GET /` - Basic availability check
- `GET /health` - Liveness probe (checks if service is alive)
- `GET /ready` - Readiness probe (checks Key Vault and database connections)

### Discord Bot Service (Port 3001)

- `GET /` - Basic availability check  
- `GET /health` - Liveness probe (checks if service is alive)
- `GET /ready` - Readiness probe (checks Key Vault and Discord API connections)

Test health endpoints:

```bash
# Backend health
curl http://localhost:3000/health
curl http://localhost:3000/ready

# Discord bot health
curl http://localhost:3001/health
curl http://localhost:3001/ready
```

## Troubleshooting

### Common Issues

#### 1. "jest: not found" or "eslint: not found"

**Solution:** Install dependencies first:
```bash
npm run install:all
```

#### 2. Azure Key Vault authentication errors

**Solution:** Verify your `.env` file contains valid Azure credentials:
- `KEY_VAULT_NAME`
- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_CLIENT_SECRET`

Test Azure credentials:
```bash
az login
az keyvault secret list --vault-name your-key-vault-name
```

#### 3. Discord bot not responding to commands

**Solution:**
1. Ensure you've registered commands: `npm run register`
2. Check that the bot token in Key Vault is valid
3. Verify the bot has proper permissions in your Discord server
4. Check the Discord bot service logs for errors

#### 4. Services can't communicate with each other

**Solution:**
- When using Docker Compose: Services use internal DNS (e.g., `http://backend:3000`)
- When running individually: Use `localhost` (e.g., `http://localhost:3000`)
- Check `DISCORD_BOT_API_URL` and `BACKEND_API_URL` environment variables

#### 5. Database connection errors

**Solution:**
1. Verify database credentials in Azure Key Vault
2. Check that the database is accessible from your network
3. Review the readiness probe: `curl http://localhost:3000/ready`

#### 6. Port already in use

**Solution:**
```bash
# Find process using the port
lsof -i :3000  # or :3001

# Kill the process
kill -9 <PID>
```

#### 7. Docker build fails

**Solution:**
```bash
# Clean up Docker resources
docker-compose down
docker system prune -a

# Rebuild from scratch
docker-compose up --build
```

## Development Tips

### Debugging

1. **Enable verbose logging**: Check service logs for detailed information
2. **Use the readiness probes**: They show the status of dependencies
3. **Test endpoints individually**: Use `curl` or Postman to test API endpoints

### Making Changes

1. Make code changes in the appropriate service directory
2. If running with hot reload (`npm run dev:*`), changes will auto-restart the service
3. Run linter before committing: `npm run lint`
4. Run tests before committing: `npm test`
5. Register commands if you modified Discord commands: `npm run register`

### Working with Discord Commands

Discord slash commands are defined in `services/discord-bot/src/commands/`:
1. Create or modify command files
2. Run `npm run register` to update Discord
3. Test in your Discord server

### Working with Strava Webhooks

The backend service handles Strava webhooks at `POST /strava-webhook`:
1. Configure webhook URL in Strava API settings
2. For local testing, use a tool like [ngrok](https://ngrok.com/) to expose your local server
3. Set up webhook verification and event handling

## Next Steps

- Review the [Architecture Documentation](services/README.md) for more details on service structure
- Check out [AZURE-DEPLOYMENT.md](AZURE-DEPLOYMENT.md) for production deployment information
- Read [HEALTH-CHECKS.md](HEALTH-CHECKS.md) for detailed health check documentation
- See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines

## Getting Help

If you encounter issues not covered in this guide:
1. Check the [GitHub Issues](https://github.com/petercort/FBF-Buddy/issues)
2. Review service logs for error messages
3. Open a new issue with details about your problem

---

**Happy coding! 🚴‍♂️**
