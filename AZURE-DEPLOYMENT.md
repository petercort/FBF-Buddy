# Azure App Service Deployment Guide

FBF Buddy runs as two Linux containers on one shared Azure App Service B1 plan:

- `discord-buddy` runs the Discord gateway client and its internal messaging API on port 3001.
- `fbf-events` runs the public backend API and Strava webhook listener on port 3000.

Both apps use Always On to avoid cold starts. They share the plan's compute allocation but have independent container images, settings, identities, health checks, and deployments.

## Architecture

```text
                     Azure App Service B1 plan
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  discord-buddy                  fbf-events               │
│  Discord gateway                Backend/API/webhooks     │
│  Port 3001                      Port 3000                │
│       │                              │                   │
│       └──────── HTTPS ───────────────┘                   │
│                                                         │
└───────────────────────┬─────────────────────────────────┘
                        │
              Managed identity: key-master
                        │
             ┌──────────┴──────────┐
             │                     │
      Azure Key Vault       Azure PostgreSQL
```

Container images are stored in `fbfregistry.azurecr.io`. The `key-master` user-assigned identity has:

- `AcrPull` on the registry.
- `get` and `list` permissions on the `peter-corp-kv` production Key Vault.

Do not add client secrets to App Service settings. `AZURE_CLIENT_ID` selects the user-assigned identity used by `DefaultAzureCredential`.

## Live Resources

| Resource | Name |
|---|---|
| Resource group | `peter-corp-rg` |
| App Service plan | `ASP-petercorprg-b7eb` |
| Discord app | `discord-buddy` |
| Backend app | `fbf-events` |
| Container registry | `fbfregistry` |
| Managed identity | `key-master` |
| Key Vault | `peter-corp-kv` |

## Runtime Settings

### Discord bot

```text
KEY_VAULT_NAME=peter-corp-kv
AZURE_CLIENT_ID=<key-master client ID>
BACKEND_API_URL=https://fbf-events-b8ezdbc6g3gwc4dz.eastus2-01.azurewebsites.net
WEBSITES_ENABLE_APP_SERVICE_STORAGE=false
WEBSITE_HEALTHCHECK_MAXPINGFAILURES=5
```

### Backend

```text
KEY_VAULT_NAME=peter-corp-kv
AZURE_CLIENT_ID=<key-master client ID>
DISCORD_BOT_API_URL=https://discord-buddy-hscvd9c6efa4e0ff.eastus2-01.azurewebsites.net
WEBSITES_ENABLE_APP_SERVICE_STORAGE=false
WEBSITE_HEALTHCHECK_MAXPINGFAILURES=5
```

Both apps must have:

- Always On enabled.
- HTTPS Only enabled.
- `/health` configured as the App Service health check.
- HTTP/2 enabled.

## Continuous Deployment

The service-specific workflows build only when their service changes:

- `.github/workflows/fbf-buddy-backend-AutoDeployTrigger-e938c376-4df7-4a17-bbc1-3e691ba0dfcc.yml`
- `.github/workflows/fbf-buddy-discord-bot-AutoDeployTrigger-3b850ea5-2d6e-4982-9ba7-62c6858f209e.yml`

Each workflow:

1. Authenticates to Azure through GitHub OIDC.
2. Builds the service image from its Dockerfile.
3. Pushes the commit-tagged image to Azure Container Registry.
4. Updates the App Service site-container definition through the App Service REST API.

The manually triggered `.github/workflows/release-event-buddy.yml` publishes versioned and `latest` images to the same registry, creates the GitHub release, and deploys both apps.

## Validation

Check liveness:

```bash
curl --fail \
  https://discord-buddy-hscvd9c6efa4e0ff.eastus2-01.azurewebsites.net/health

curl --fail \
  https://fbf-events-b8ezdbc6g3gwc4dz.eastus2-01.azurewebsites.net/health
```

Check dependencies:

```bash
curl --fail \
  https://discord-buddy-hscvd9c6efa4e0ff.eastus2-01.azurewebsites.net/ready

curl --fail \
  https://fbf-events-b8ezdbc6g3gwc4dz.eastus2-01.azurewebsites.net/ready
```

The bot readiness response must report both `discordClient` and `backendApi` as `true`. The backend readiness response must report both `keyVault` and `database` as `true`.

## Strava Webhook Cutover

The Strava webhook callback must point to:

```text
https://fbf-events-b8ezdbc6g3gwc4dz.eastus2-01.azurewebsites.net/webhook
```

Before retiring the old Container Apps backend:

1. Confirm that the Strava application is active.
2. Query the current push subscription.
3. Delete the old subscription if it targets the Container Apps hostname.
4. Create a subscription with the App Service callback and the `stravaVerifyToken` value from Key Vault.
5. Trigger a test cycling activity and verify backend processing and Discord delivery.
6. Deactivate the old backend Container Apps revision.

The old backend must remain available until this callback is verified. Its `DISCORD_BOT_API_URL` should target the App Service bot so only one Discord gateway client is active.

## Rollback

The App Service migration can be rolled back without rebuilding an image.

Reactivate the previous Discord Container Apps revision:

```bash
az containerapp revision activate \
  --resource-group peter-corp-rg \
  --name fbf-buddy-discord-bot \
  --revision <revision-name>
```

Restore the old backend bot URL if needed:

```bash
az containerapp update \
  --resource-group peter-corp-rg \
  --name fbf-buddy-backend \
  --set-env-vars \
    DISCORD_BOT_API_URL=https://fbf-buddy-discord-bot.happyplant-c6ea055c.westus2.azurecontainerapps.io
```

Do not delete the Container Apps resources until the App Service endpoints, Discord commands, and Strava webhook have been stable for an agreed observation period.

## Cost Follow-up

After the migration is stable:

1. Delete the retired Container Apps and their environment if no other apps use it.
2. Downgrade `fbfregistry` from Premium to Basic after confirming no Premium-only features are required.
3. Retain only the necessary recent image tags.
4. Remove unused Log Analytics workspaces and identities after checking their references.
