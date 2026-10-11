# Health Check and Readiness Probe Endpoints

## Overview

Both services (Backend and Discord Bot) now have comprehensive health check and readiness probe endpoints for use with Azure Container Apps or any orchestration platform.

## Endpoints

### Backend Service (Port 3000)

#### `GET /` - Root
- **Purpose**: Basic availability check
- **Response**: `200 OK`

#### `GET /health` - Liveness Probe
- **Purpose**: Checks if the service is alive and should not be restarted
- **Success Response** (200):
  ```json
  {
    "status": "healthy",
    "service": "backend",
    "timestamp": "2025-10-19T20:00:00.000Z"
  }
  ```
- **Failure Response** (503):
  ```json
  {
    "status": "unhealthy",
    "service": "backend",
    "timestamp": "2025-10-19T20:00:00.000Z"
  }
  ```

#### `GET /ready` - Readiness Probe
- **Purpose**: Checks if the service is ready to accept traffic
- **Checks Performed**:
  - ✅ Azure Key Vault connection
  - ✅ Database connection (PostgreSQL via Sequelize)
- **Success Response** (200):
  ```json
  {
    "status": "ready",
    "service": "backend",
    "checks": {
      "keyVault": true,
      "database": true
    },
    "timestamp": "2025-10-19T20:00:00.000Z"
  }
  ```
- **Failure Response** (503):
  ```json
  {
    "status": "not ready",
    "service": "backend",
    "checks": {
      "keyVault": true,
      "database": false
    },
    "error": "Connection timeout",
    "timestamp": "2025-10-19T20:00:00.000Z"
  }
  ```

### Discord Bot Service (Port 3001)

#### `GET /` - Root
- **Purpose**: Basic availability check
- **Response**: `200 OK`

#### `GET /health` - Liveness Probe
- **Purpose**: Checks if the service is alive and should not be restarted
- **Success Response** (200):
  ```json
  {
    "status": "healthy",
    "service": "discord-bot",
    "timestamp": "2025-10-19T20:00:00.000Z"
  }
  ```
- **Failure Response** (503):
  ```json
  {
    "status": "unhealthy",
    "service": "discord-bot",
    "timestamp": "2025-10-19T20:00:00.000Z"
  }
  ```

#### `GET /ready` - Readiness Probe
- **Purpose**: Checks if the service is ready to accept traffic
- **Checks Performed**:
  - ✅ Discord client connection status
  - ✅ Backend API availability (5 second timeout)
- **Success Response** (200):
  ```json
  {
    "status": "ready",
    "service": "discord-bot",
    "checks": {
      "discordClient": true,
      "backendApi": true
    },
    "timestamp": "2025-10-19T20:00:00.000Z"
  }
  ```
- **Failure Response** (503):
  ```json
  {
    "status": "not ready",
    "service": "discord-bot",
    "checks": {
      "discordClient": true,
      "backendApi": false
    },
    "error": "Backend API unreachable",
    "timestamp": "2025-10-19T20:00:00.000Z"
  }
  ```

## Usage

### Testing Locally

```bash
# Backend health check
curl http://localhost:3000/health

# Backend readiness check
curl http://localhost:3000/ready

# Discord bot health check
curl http://localhost:3001/health

# Discord bot readiness check
curl http://localhost:3001/ready
```

### Azure Container Apps Configuration

Add health probes to your Container App configuration:

#### Backend Container App:
```bash
az containerapp update \
  --name fbf-buddy-backend \
  --resource-group peter-corp-rg \
  --set-health-probes liveness=/health,readiness=/ready
```

Or in the Azure Portal:
- **Liveness Probe**: HTTP GET `/health` on port 3000
- **Readiness Probe**: HTTP GET `/ready` on port 3000

#### Discord Bot Container App:
```bash
az containerapp update \
  --name fbf-buddy-discord-bot \
  --resource-group peter-corp-rg \
  --set-health-probes liveness=/health,readiness=/ready
```

Or in the Azure Portal:
- **Liveness Probe**: HTTP GET `/health` on port 3001
- **Readiness Probe**: HTTP GET `/ready` on port 3001

## Probe Types Explained

### Liveness Probe (`/health`)
- Determines if the container is running properly
- If it fails, the container will be restarted
- Should be a lightweight check that only fails if the app is completely broken
- **Use case**: Detect deadlocks, infinite loops, or crashed processes

### Readiness Probe (`/ready`)
- Determines if the container is ready to serve traffic
- If it fails, traffic won't be routed to the container (but it won't be restarted)
- Can perform more extensive checks (database, dependencies, etc.)
- **Use case**: Prevent traffic during startup, database migrations, or dependency failures

## Best Practices

1. **Liveness probes should be simple** - Only check if the process is alive
2. **Readiness probes can be complex** - Check all dependencies
3. **Set appropriate timeouts** - Give services time to start up
4. **Use different intervals** - Liveness can be less frequent than readiness

## Recommended Settings

### For Backend:
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /ready
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 5
  failureThreshold: 3
```

### For Discord Bot:
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3001
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /ready
    port: 3001
  initialDelaySeconds: 15
  periodSeconds: 5
  timeoutSeconds: 5
  failureThreshold: 3
```

## Benefits

✅ **Automatic Recovery** - Containers restart if they become unhealthy
✅ **Zero Downtime** - Traffic only routes to ready instances
✅ **Faster Debugging** - Detailed status of dependencies
✅ **Better Monitoring** - Clear visibility into service health
✅ **Production Ready** - Industry standard health check patterns
