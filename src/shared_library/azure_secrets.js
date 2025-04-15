import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';

let azureClient;

export async function getAzureSecretsClient() {
  if (!azureClient) {
    // Use the Azure Key Vault URL from the environment variable
    const keyVaultName = process.env.KEY_VAULT_NAME;
    const keyVaultUrl = `https://${keyVaultName}.vault.azure.net`;
    const credential = new DefaultAzureCredential();
    azureClient = new SecretClient(keyVaultUrl, credential);
  }
  return azureClient;
}

