#!/bin/bash

# One-time setup script to enable Managed Identity on Azure Container Apps
# This grants the Container Apps direct access to Key Vault without needing credentials

set -e

RESOURCE_GROUP="peter-corp-rg"
DISCORD_BOT_APP="fbf-buddy-discord-bot"
BACKEND_APP="fbf-buddy-backend"

# Check if KEY_VAULT_NAME is set
if [ -z "$KEY_VAULT_NAME" ]; then
    echo "Error: KEY_VAULT_NAME environment variable is not set"
    echo "Please set it with: export KEY_VAULT_NAME='your-keyvault-name'"
    exit 1
fi

echo "=========================================="
echo "Enabling Managed Identity for Azure Container Apps"
echo "=========================================="
echo ""

# Enable Managed Identity on Discord Bot
echo "1. Enabling system-assigned Managed Identity on Discord Bot..."
az containerapp identity assign \
  --name $DISCORD_BOT_APP \
  --resource-group $RESOURCE_GROUP \
  --system-assigned

# Get the principal ID
DISCORD_BOT_PRINCIPAL_ID=$(az containerapp identity show \
  --name $DISCORD_BOT_APP \
  --resource-group $RESOURCE_GROUP \
  --query principalId -o tsv)

echo "   Discord Bot Principal ID: $DISCORD_BOT_PRINCIPAL_ID"

# Grant Key Vault access
echo "2. Granting Key Vault access to Discord Bot..."
az keyvault set-policy \
  --name $KEY_VAULT_NAME \
  --object-id $DISCORD_BOT_PRINCIPAL_ID \
  --secret-permissions get list

echo ""

# Enable Managed Identity on Backend
echo "3. Enabling system-assigned Managed Identity on Backend..."
az containerapp identity assign \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --system-assigned

# Get the principal ID
BACKEND_PRINCIPAL_ID=$(az containerapp identity show \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --query principalId -o tsv)

echo "   Backend Principal ID: $BACKEND_PRINCIPAL_ID"

# Grant Key Vault access
echo "4. Granting Key Vault access to Backend..."
az keyvault set-policy \
  --name $KEY_VAULT_NAME \
  --object-id $BACKEND_PRINCIPAL_ID \
  --secret-permissions get list

echo ""
echo "=========================================="
echo "✅ Managed Identity setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Remove the Azure credential environment variables from your Container Apps"
echo "2. Update Container Apps to only need KEY_VAULT_NAME:"
echo ""
echo "   az containerapp update \\"
echo "     --name $DISCORD_BOT_APP \\"
echo "     --resource-group $RESOURCE_GROUP \\"
echo "     --set-env-vars KEY_VAULT_NAME=$KEY_VAULT_NAME"
echo ""
echo "   az containerapp update \\"
echo "     --name $BACKEND_APP \\"
echo "     --resource-group $RESOURCE_GROUP \\"
echo "     --set-env-vars \\"
echo "       KEY_VAULT_NAME=$KEY_VAULT_NAME \\"
echo "       DISCORD_BOT_API_URL=http://fbf-buddy-discord-bot:3001"
echo ""
echo "3. Restart both Container Apps:"
echo "   az containerapp restart --name $DISCORD_BOT_APP --resource-group $RESOURCE_GROUP"
echo "   az containerapp restart --name $BACKEND_APP --resource-group $RESOURCE_GROUP"
