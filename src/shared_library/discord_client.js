import { Client, GatewayIntentBits } from 'discord.js';
import { getAzureSecretsClient } from './azure_secrets.js';

let discordClient;

export async function getDiscordClient() {
    if (!discordClient) {
        const azureClient = await getAzureSecretsClient();
        const discordToken = (await azureClient.getSecret('discordToken')).value;
        
        discordClient = new Client({ intents: [GatewayIntentBits.Guilds] });
        await discordClient.login(discordToken);
        console.log('Discord client initialized and logged in');
    }
    return discordClient;
}