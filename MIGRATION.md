# Migration Guide: Monolith to Microservices

This guide explains the changes made to split FBF-Buddy into microservices and how to use the new architecture.

## What Changed

### Before (Monolithic Architecture)
- Single `src/` directory containing all code
- `src/app.js` ran both Discord bot and Express server
- `src/strava-webhook.js` was imported directly into app.js
- Single Dockerfile and deployment

### After (Microservices Architecture)
- Two separate services in `services/` directory:
  - `services/discord-bot/` - Discord bot service
  - `services/backend/` - Backend/API/Database service
- Each service has its own:
  - `package.json` with appropriate dependencies
  - `Dockerfile` for containerization
  - Source code in `src/` directory
- Services communicate via HTTP API calls
- `docker-compose.yml` orchestrates both services

## Architecture Diagram

```
┌─────────────────────┐                    ┌─────────────────────────┐
│   Discord Bot       │◀──HTTP API Call──▶│   Backend/API/DB        │
│   Service           │                    │   Service               │
│                     │                    │                         │
│  - Discord Commands │                    │  - Strava Webhooks      │
│  - Bot Interactions │                    │  - OAuth Callbacks      │
│  - Message API      │                    │  - Database Operations  │
│  Port: 3001         │                    │  Port: 3000             │
└─────────────────────┘                    └─────────────────────────┘
```

## How to Run

### Using Docker Compose (Recommended)

```bash
# Start both services
docker-compose up --build

# Stop services
docker-compose down
```

### Running Services Individually

#### Install Dependencies
```bash
# Install root dependencies (optional)
npm install

# Install Discord bot dependencies
cd services/discord-bot
npm install

# Install backend dependencies
cd services/backend
npm install
```

#### Start Services
```bash
# Terminal 1 - Start Discord Bot
cd services/discord-bot
npm start

# Terminal 2 - Start Backend
cd services/backend
npm start
```

### Development Mode

```bash
# Start Discord bot in dev mode
npm run dev:bot

# Start backend in dev mode
npm run dev:backend
```

## Environment Variables

### Discord Bot Service
- `KEY_VAULT_NAME` - Azure Key Vault name
- `AZURE_CLIENT_ID` - Azure client ID
- `AZURE_TENANT_ID` - Azure tenant ID
- `AZURE_CLIENT_SECRET` - Azure client secret

### Backend Service
- `KEY_VAULT_NAME` - Azure Key Vault name
- `AZURE_CLIENT_ID` - Azure client ID
- `AZURE_TENANT_ID` - Azure tenant ID
- `AZURE_CLIENT_SECRET` - Azure client secret
- `DISCORD_BOT_API_URL` - URL of Discord bot service (default: `http://localhost:3001`)

## Key Changes to the Code

### Discord Bot Service (`services/discord-bot/`)
- Added Express API endpoint: `POST /api/send-message`
  - Allows backend to send Discord messages
  - Accepts `{ userId, message }` in request body
- Removed direct Strava webhook handling
- Runs on port 3001

### Backend Service (`services/backend/`)
- Removed direct Discord client dependency
- Uses HTTP calls to Discord bot service for sending messages
- Main entry point is `src/app.js` (previously `strava-webhook.js`)
- Runs on port 3000

### Shared Code
Both services have copies of:
- Database models (`models/`)
- Database connection (`db-objects.js`)
- Azure secrets client (`shared-library/azure-secrets.js`)
- Strava authentication (`shared-library/strava-authentication.js`)

Only Discord bot has:
- Discord client (`shared-library/discord-client.js`)

## Deployment Changes

### Infrastructure
- Two separate deployments instead of one
- Services can be scaled independently
- Network communication between services must be configured
- Both services need access to the same database

### CI/CD Considerations
- Build both Docker images separately
- Deploy services independently or together
- Ensure proper service discovery/networking in production
- Update health check endpoints:
  - Discord bot: `GET /health` (port 3001)
  - Backend: `GET /` (port 3000)

## Benefits of This Architecture

1. **Independent Scaling** - Scale bot and backend separately based on load
2. **Easier Development** - Work on bot or backend without affecting the other
3. **Better Separation of Concerns** - Clear boundaries between Discord and API logic
4. **Simplified Testing** - Test services in isolation
5. **Flexible Deployment** - Deploy services to different environments/platforms
6. **Future-Proof** - Easy to add more services or split further

## Backward Compatibility

The original `src/` directory structure is preserved for reference but is no longer used in production. The microservices in `services/` are the active codebase.

## Troubleshooting

### Services Can't Communicate
- Ensure `DISCORD_BOT_API_URL` is set correctly in backend service
- In Docker Compose: Use service name `http://discord-bot:3001`
- In local dev: Use `http://localhost:3001`

### Database Connection Issues
- Both services need the same database connection string
- Ensure Azure Key Vault secrets are accessible from both services

### Port Conflicts
- Discord bot uses port 3001
- Backend uses port 3000
- Ensure these ports are available

## Questions?

For more details, see:
- [services/README.md](services/README.md) - Service-specific documentation
- [README.md](README.md) - Main project README
