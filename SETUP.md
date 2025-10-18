# Environment Setup

## Prerequisites
- Node.js 24.x or higher
- Docker and Docker Compose
- Azure account with Key Vault access

## Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Azure credentials in `.env`:
   ```env
   KEY_VAULT_NAME=your-key-vault-name
   AZURE_CLIENT_ID=your-client-id
   AZURE_TENANT_ID=your-tenant-id
   AZURE_CLIENT_SECRET=your-client-secret
   ```

### How to Get Azure Credentials

#### Key Vault Name
- Go to Azure Portal → Key Vaults
- Copy the name of your Key Vault (not the full URL, just the name)

#### Service Principal Credentials
Run this command in Azure CLI to create a service principal:
```bash
az ad sp create-for-rbac --name "fbf-buddy-dev" --role "Key Vault Secrets User" --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group}/providers/Microsoft.KeyVault/vaults/{key-vault-name}
```

This will output:
- `appId` → Use as `AZURE_CLIENT_ID`
- `tenant` → Use as `AZURE_TENANT_ID`
- `password` → Use as `AZURE_CLIENT_SECRET`

#### Grant Key Vault Access
Make sure your service principal has access to Key Vault secrets:
```bash
az keyvault set-policy --name {key-vault-name} --spn {AZURE_CLIENT_ID} --secret-permissions get list
```

## Running the Application

### With Docker Compose (Recommended)
```bash
npm start
# or
docker-compose up
```

### Development Mode
```bash
# Install all dependencies
npm run install:all

# Run discord bot in dev mode
npm run dev:bot

# Run backend in dev mode (in another terminal)
npm run dev:backend
```

## Troubleshooting

### Missing Environment Variables
If you see warnings about missing environment variables, make sure:
1. You've created the `.env` file in the project root
2. All required variables are filled in (no blank values)
3. You restart Docker Compose after changing `.env`

### Azure Authentication Issues
- Verify your service principal has the correct permissions
- Check that your Key Vault name is correct (no URL, just the name)
- Ensure your subscription is active
