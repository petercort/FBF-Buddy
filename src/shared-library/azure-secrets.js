import { SecretClient } from '@azure/keyvault-secrets';
import { ClientSecretCredential } from '@azure/identity';

let azureClient;

export async function getAzureSecretsClient() {
  if (!azureClient) {
    // Use the Azure Key Vault URL from the environment variable
    const keyVaultName = process.env.KEY_VAULT_NAME;
    const keyVaultUrl = `https://${keyVaultName}.vault.azure.net`;
    
    // Use ClientSecretCredential for service principal authentication
    const credential = new ClientSecretCredential(
      process.env.AZURE_TENANT_ID,
      process.env.AZURE_CLIENT_ID,
      process.env.AZURE_CLIENT_SECRET
    );
    
    azureClient = new SecretClient(keyVaultUrl, credential);
  }
  return azureClient;
}

