# Azure Container Apps Deployment Guide

This application is deployed to Azure Container Apps as two separate services:
- **Discord Bot Service** - Handles Discord interactions and commands
- **Backend Service** - Manages Strava webhooks and API endpoints

## Architecture

```
┌─────────────────────────────────────┐
│   Azure Container Apps Environment  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Discord Bot Container App  │   │
│  │  Port: 3001                 │   │
│  └─────────────────────────────┘   │
│              │                      │
│              ▼                      │
│  ┌─────────────────────────────┐   │
│  │  Backend Container App      │   │
│  │  Port: 3000                 │   │
│  └─────────────────────────────┘   │
│              │                      │
└──────────────┼──────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │  Azure PostgreSQL    │
    │  (via Key Vault)     │
    └──────────────────────┘
```

## Prerequisites

- Azure subscription
- Azure CLI installed
- GitHub repository with secrets configured
- Docker images built and pushed to GitHub Container Registry (GHCR)

## Initial Setup

### 1. Create Resource Group

```bash
az group create \
  --name peter-corp-rg \
  --location eastus
```

### 2. Create Container Apps Environment

```bash
az containerapp env create \
  --name fbf-buddy-env \
  --resource-group peter-corp-rg \
  --location eastus
```

### 3. Create Container App for Discord Bot

```bash
az containerapp create \
  --name fbf-buddy-discord-bot \
  --resource-group peter-corp-rg \
  --environment fbf-buddy-env \
  --image ghcr.io/petercort/fbf-buddy-discord-bot:latest \
  --target-port 3001 \
  --ingress internal \
  --min-replicas 1 \
  --max-replicas 1 \
  --cpu 0.5 \
  --memory 1Gi \
  --registry-server ghcr.io \
  --registry-username <your-github-username> \
  --registry-password <your-github-pat> \
  --env-vars \
    KEY_VAULT_NAME=${{ secrets.KEY_VAULT_NAME }} \
    AZURE_CLIENT_ID=${{ secrets.AZURE_CLIENT_ID }} \
    AZURE_TENANT_ID=${{ secrets.AZURE_TENANT_ID }} \
  --secrets azure-client-secret=${{ secrets.AZURE_CLIENT_SECRET }}
```

### 4. Create Container App for Backend

```bash
az containerapp create \
  --name fbf-buddy-backend \
  --resource-group peter-corp-rg \
  --environment fbf-buddy-env \
  --image ghcr.io/petercort/fbf-buddy-backend:latest \
  --target-port 3000 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 2 \
  --cpu 0.5 \
  --memory 1Gi \
  --registry-server ghcr.io \
  --registry-username <your-github-username> \
  --registry-password <your-github-pat> \
  --env-vars \
    KEY_VAULT_NAME=${{ secrets.KEY_VAULT_NAME }} \
    AZURE_CLIENT_ID=${{ secrets.AZURE_CLIENT_ID }} \
    AZURE_TENANT_ID=${{ secrets.AZURE_TENANT_ID }} \
    DISCORD_BOT_API_URL=http://fbf-buddy-discord-bot:3001 \
  --secrets azure-client-secret=${{ secrets.AZURE_CLIENT_SECRET }}
```

## Environment Variables

Both services require the following environment variables:

### Required for Azure Key Vault Access (Managed Identity - Recommended)

**With Managed Identity (No credentials needed in production!):**
- `KEY_VAULT_NAME` - Name of your Azure Key Vault

The application uses Azure Managed Identity to authenticate to Key Vault when running in Azure Container Apps. This eliminates the need to store credentials as environment variables or secrets.

### For Local Development

When running locally, `DefaultAzureCredential` falls back to:
1. **Azure CLI** - Run `az login` before starting the app
2. **Environment Variables** (if Azure CLI not available):
   - `AZURE_CLIENT_ID` - Service Principal Client ID
   - `AZURE_TENANT_ID` - Azure Tenant ID
   - `AZURE_CLIENT_SECRET` - Service Principal Secret

### Backend-Specific
- `DISCORD_BOT_API_URL` - Internal URL to Discord Bot service (http://fbf-buddy-discord-bot:3001)

## Managed Identity Setup

### Initial Setup (One-Time)

Run the provided script to enable Managed Identity and grant Key Vault access:

```bash
export KEY_VAULT_NAME=peter-corp-dev
./enable-managed-identity.sh
```

Or manually:

```bash
# Enable Managed Identity on Discord Bot
az containerapp identity assign \
  --name fbf-buddy-discord-bot \
  --resource-group peter-corp-rg \
  --system-assigned

# Get the principal ID
DISCORD_BOT_PRINCIPAL_ID=$(az containerapp identity show \
  --name fbf-buddy-discord-bot \
  --resource-group peter-corp-rg \
  --query principalId -o tsv)

# Grant Key Vault access
az keyvault set-policy \
  --name peter-corp-dev \
  --object-id $DISCORD_BOT_PRINCIPAL_ID \
  --secret-permissions get list

# Repeat for Backend
az containerapp identity assign \
  --name fbf-buddy-backend \
  --resource-group peter-corp-rg \
  --system-assigned

BACKEND_PRINCIPAL_ID=$(az containerapp identity show \
  --name fbf-buddy-backend \
  --resource-group peter-corp-rg \
  --query principalId -o tsv)

az keyvault set-policy \
  --name peter-corp-dev \
  --object-id $BACKEND_PRINCIPAL_ID \
  --secret-permissions get list
```

### Benefits of Managed Identity

✅ **No secrets to manage** - Azure handles authentication automatically  
✅ **Automatic rotation** - Credentials are managed by Azure  
✅ **More secure** - No credentials in environment variables or secrets  
✅ **Simpler deployment** - Only need `KEY_VAULT_NAME` environment variable  


## GitHub Secrets Required

Configure these secrets in your GitHub repository:

1. **AZURE_CREDENTIALS** - Azure service principal credentials for GitHub Actions (JSON format):
   ```json
   {
     "clientId": "your-client-id",
     "clientSecret": "your-client-secret",
     "subscriptionId": "your-subscription-id",
     "tenantId": "your-tenant-id"
   }
   ```
   
   **Note**: This is only used by GitHub Actions to deploy to Azure. The deployed Container Apps use Managed Identity instead.

2. **KEY_VAULT_NAME** - Your Azure Key Vault name (e.g., `peter-corp-dev`)

### Optional (Only for local development without Azure CLI)

These are NOT needed for production deployments with Managed Identity:

3. **AZURE_CLIENT_ID** - Service Principal Client ID (for local dev only)
4. **AZURE_TENANT_ID** - Azure Tenant ID (for local dev only)
5. **AZURE_CLIENT_SECRET** - Service Principal Secret (for local dev only)

## Continuous Deployment

The GitHub Actions workflow (`.github/workflows/release-event-buddy.yml`) automatically:

1. Builds both Docker images on push to `main` branch
2. Pushes images to GitHub Container Registry
3. Creates a GitHub release
4. **Enables Managed Identity and grants Key Vault access** (if not already enabled)
5. Deploys both services to Azure Container Apps

## Monitoring and Logs

### View Container App Logs

```bash
# Discord Bot logs
az containerapp logs show \
  --name fbf-buddy-discord-bot \
  --resource-group peter-corp-rg \
  --follow

# Backend logs
az containerapp logs show \
  --name fbf-buddy-backend \
  --resource-group peter-corp-rg \
  --follow
```

### Check Container App Status

```bash
az containerapp show \
  --name fbf-buddy-discord-bot \
  --resource-group peter-corp-rg \
  --query "properties.runningStatus"
```

## Scaling

### Manual Scaling

```bash
az containerapp update \
  --name fbf-buddy-backend \
  --resource-group peter-corp-rg \
  --min-replicas 1 \
  --max-replicas 5
```

### Auto-scaling Rules

```bash
az containerapp update \
  --name fbf-buddy-backend \
  --resource-group peter-corp-rg \
  --scale-rule-name http-scale \
  --scale-rule-type http \
  --scale-rule-http-concurrency 50
```

## Troubleshooting

### Container Won't Start

1. Check logs for errors:
   ```bash
   az containerapp logs show --name <app-name> --resource-group peter-corp-rg --tail 100
   ```

2. Verify environment variables are set:
   ```bash
   az containerapp show --name <app-name> --resource-group peter-corp-rg --query "properties.template.containers[0].env"
   ```

3. Check Managed Identity and Key Vault access:
   ```bash
   # Verify Managed Identity is enabled
   az containerapp identity show --name <app-name> --resource-group peter-corp-rg
   
   # Check Key Vault access policies
   az keyvault show --name peter-corp-dev --query "properties.accessPolicies"
   ```

### Authentication Issues

If you see `ManagedIdentityCredential` authentication errors:

**Solution 1: Ensure Managed Identity is enabled and has Key Vault access**

```bash
# Run the setup script
export KEY_VAULT_NAME=peter-corp-dev
./enable-managed-identity.sh
```

**Solution 2: Check if Managed Identity has correct permissions**

```bash
# Get the Managed Identity principal ID
PRINCIPAL_ID=$(az containerapp identity show \
  --name fbf-buddy-backend \
  --resource-group peter-corp-rg \
  --query principalId -o tsv)

# Grant Key Vault access
az keyvault set-policy \
  --name peter-corp-dev \
  --object-id $PRINCIPAL_ID \
  --secret-permissions get list
```

### For Local Development

If authentication fails locally:

1. **Use Azure CLI** (easiest):
   ```bash
   az login
   ```

2. **Or set environment variables**:
   ```bash
   export KEY_VAULT_NAME=peter-corp-dev
   export AZURE_TENANT_ID=your-tenant-id
   export AZURE_CLIENT_ID=your-client-id
   export AZURE_CLIENT_SECRET=your-client-secret
   ```

```bash
# Grant Key Vault access to service principal
az keyvault set-policy \
  --name peter-corp-dev \
  --spn <AZURE_CLIENT_ID> \
  --secret-permissions get list

# Verify environment variables are set correctly
az containerapp show \
  --name fbf-buddy-backend \
  --resource-group peter-corp-rg \
  --query "properties.template.containers[0].env" \
  --output table
```

### Image Pull Issues

Ensure GitHub Container Registry credentials are correct:

```bash
az containerapp registry set \
  --name <app-name> \
  --resource-group peter-corp-rg \
  --server ghcr.io \
  --username <github-username> \
  --password <github-pat>
```

## Cost Optimization

- **Development**: Use 0.25 CPU / 0.5 Gi memory with min replicas = 0 (serverless)
- **Production**: Use 0.5 CPU / 1 Gi memory with min replicas = 1

### Enable Serverless Mode (Scale to Zero)

```bash
az containerapp update \
  --name fbf-buddy-discord-bot \
  --resource-group peter-corp-rg \
  --min-replicas 0
```

## Useful Commands

```bash
# List all container apps
az containerapp list --resource-group peter-corp-rg --output table

# Restart a container app
az containerapp restart --name <app-name> --resource-group peter-corp-rg

# Delete a container app
az containerapp delete --name <app-name> --resource-group peter-corp-rg

# Get ingress URL
az containerapp show \
  --name fbf-buddy-backend \
  --resource-group peter-corp-rg \
  --query "properties.configuration.ingress.fqdn" \
  --output tsv
```

## References

- [Azure Container Apps Documentation](https://learn.microsoft.com/en-us/azure/container-apps/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Azure Key Vault](https://learn.microsoft.com/en-us/azure/key-vault/)
