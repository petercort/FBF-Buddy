# FBF-Buddy Microservices

This directory contains the microservices architecture for FBF-Buddy.

## Architecture

The application is split into two microservices:

```
┌─────────────┐      ┌─────────────────────────┐
│ Discord Bot │ ◀─▶ │   Backend/API/DB        │
└─────────────┘      └─────────────────────────┘
```

### Discord Bot Service (`services/discord-bot/`)

The Discord bot service handles:
- Discord slash commands
- Discord bot interactions
- User command processing
- Message sending API (exposes HTTP endpoint for backend)

**Port:** 3001  
**Main file:** `src/app.js`

### Backend Service (`services/backend/`)

The backend service handles:
- Strava webhook processing
- API endpoints (OAuth callbacks, webhooks)
- Database operations
- Bike tracking and maintenance reminders
- Communication with Discord bot service

**Port:** 3000  
**Main file:** `src/app.js`

## Running the Services

### Using Docker Compose (Recommended)

From the root directory:

```bash
docker-compose up --build
```

This will start both services with proper networking.

### Running Individually

#### Discord Bot Service

```bash
cd services/discord-bot
npm install
npm start
```

#### Backend Service

```bash
cd services/backend
npm install
npm start
```

**Note:** When running individually, ensure the `DISCORD_BOT_API_URL` environment variable is set for the backend service to communicate with the Discord bot.

## Environment Variables

Both services require Azure Key Vault configuration:
- `KEY_VAULT_NAME`
- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_CLIENT_SECRET`

Backend service additionally requires:
- `DISCORD_BOT_API_URL` (default: `http://localhost:3001`)

## Development

### Linting

```bash
npm run lint
```

### Hot Reload

```bash
npm run dev
```

## API Communication

The backend service communicates with the Discord bot service via HTTP:

**POST** `/api/send-message`
```json
{
  "userId": "discord-user-id",
  "message": "Message to send"
}
```

This allows the backend to trigger Discord messages without directly importing Discord.js.
