import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';

let azureClient;

export async function getAzureSecretsClient() {
  if (!azureClient) {
    // Use the Azure Key Vault URL from the environment variable
    const keyVaultName = process.env.KEY_VAULT_NAME;
    
    if (!keyVaultName) {
      throw new Error('KEY_VAULT_NAME environment variable is not set. Please set it to your Azure Key Vault name.');
    }
    
    const keyVaultUrl = `https://${keyVaultName}.vault.azure.net`;
    console.log(`Connecting to Key Vault: ${keyVaultUrl}`);
    
    // DefaultAzureCredential tries multiple authentication methods in order:
    // 1. ManagedIdentityCredential (when running in Azure with Managed Identity enabled)
    // 2. EnvironmentCredential (AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET)
    // 3. AzureCliCredential (for local development with 'az login')
    const credential = new DefaultAzureCredential();
    
    azureClient = new SecretClient(keyVaultUrl, credential);
  }
  return azureClient;
}

