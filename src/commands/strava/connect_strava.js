import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { UsersTable } from '../../dbObjects.js'; // Assuming you have a UsersTable to store user data
import { readFileSync } from 'node:fs';
import dotenv from 'dotenv';
dotenv.config();

let stravaClientId;
let stravaRedirectUri;

if (process.env.NODE_ENV === 'production') {
    stravaClientId = readFileSync("/mnt/secrets-store/stravaClientId", 'utf8');
    stravaRedirectUri = readFileSync("/mnt/secrets-store/stravaRedirectUri", 'utf8');
} else {
    stravaClientId = process.env.stravaClientId;
    stravaRedirectUri = process.env.stravaRedirectUri;
}

export const data = new SlashCommandBuilder()
    .setName('connect_strava')
    .setDescription('Connect your Strava account to collect ride data.');
export async function execute(interaction) {
    const userId = interaction.user.id;
    const stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${stravaClientId}&response_type=code&redirect_uri=${stravaRedirectUri}/${userId}&scope=read,activity:read_all,profile:read_all`;

    const embed = new EmbedBuilder()
        .setTitle('Connect Strava')
        .setDescription(`[Click here to connect your Strava account](${stravaAuthUrl})`)
        .setColor('#FC4C02');

    await interaction.reply({ embeds: [embed], ephemeral: true });

    // Save the user ID to the database to track the connection process
    await UsersTable.upsert({ userId, strava_connected: false });
}