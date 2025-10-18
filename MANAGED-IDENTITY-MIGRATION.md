# Managed Identity Migration Summary

## What Changed

Your Azure Container Apps now use **Managed Identity** to authenticate to Azure Key Vault instead of passing credentials as environment variables. This is more secure and simpler to manage.

## Changes Made

### 1. Authentication Code Updated
- **Files Modified**: 
  - `services/backend/src/shared-library/azure-secrets.js`
  - `services/discord-bot/src/shared-library/azure-secrets.js`
  - `src/shared-library/azure-secrets.js`
  
- **Change**: Now uses `DefaultAzureCredential` which tries:
  1. **Managed Identity** (in Azure - no credentials needed!)
  2. **Environment Variables** (fallback for local dev)
  3. **Azure CLI** (local dev with `az login`)

### 2. GitHub Workflow Updated
- **File Modified**: `.github/workflows/release-event-buddy.yml`

- **Changes**:
  - Added steps to enable Managed Identity on both Container Apps
  - Automatically grants Key Vault access during deployment
  - Removed `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_CLIENT_SECRET` from environment variables
  - Only passes `KEY_VAULT_NAME` to containers

### 3. Setup Script Created
- **File**: `enable-managed-identity.sh`
- **Purpose**: One-time setup script to enable Managed Identity and grant Key Vault access

### 4. Documentation Updated
- **File**: `AZURE-DEPLOYMENT.md`
- Updated to explain Managed Identity setup
- Added troubleshooting for authentication issues
- Clarified which secrets are needed for what

## How to Deploy

### Option 1: Automatic (via GitHub Actions)
Just push to the `main` branch. The workflow will:
1. Build and push Docker images
2. Enable Managed Identity (if not already enabled)
3. Grant Key Vault access
4. Deploy the apps

### Option 2: Manual Setup (One-Time)
Run the setup script now to enable Managed Identity immediately:

```bash
export KEY_VAULT_NAME=peter-corp-dev
./enable-managed-identity.sh
```

Then deploy your updated code:
```bash
git add .
git commit -m "Enable Managed Identity for Key Vault authentication"
git push origin main
```

## Benefits

✅ **More Secure** - No credentials stored in environment variables  
✅ **Simpler** - Only need `KEY_VAULT_NAME` environment variable in production  
✅ **Automatic** - Azure manages authentication tokens automatically  
✅ **Rotation-Free** - No need to rotate credentials manually  

## Local Development

For local development, you have two options:

### Option A: Use Azure CLI (Recommended)
```bash
az login
export KEY_VAULT_NAME=peter-corp-dev
npm start
```

### Option B: Use Service Principal
```bash
export KEY_VAULT_NAME=peter-corp-dev
export AZURE_TENANT_ID=your-tenant-id
export AZURE_CLIENT_ID=your-client-id
export AZURE_CLIENT_SECRET=your-client-secret
npm start
```

## Verification

After deployment, verify Managed Identity is working:

```bash
# Check Managed Identity is enabled
az containerapp identity show \
  --name fbf-buddy-backend \
  --resource-group peter-corp-rg

# Check the app logs
az containerapp logs show \
  --name fbf-buddy-backend \
  --resource-group peter-corp-rg \
  --follow
```

You should see successful Key Vault connections without any authentication errors!
