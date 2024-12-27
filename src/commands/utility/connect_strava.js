const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { UsersTable } = require('../../dbObjects.js'); // Assuming you have a UsersTable to store user data
const fs = require('node:fs');
const path = require('node:path');
// load strava configuration
const STRAVA_CLIENT_ID = fs.readFileSync("/mnt/secrets-store/STRAVA_CLIENT_ID", 'utf8');
const STRAVA_REDIRECT_URI = fs.readFileSync("/mnt/secrets-store/STRAVA_REDIRECT_URI", 'utf8');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('connect_strava')
        .setDescription('Connect your Strava account to collect ride data.'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${STRAVA_REDIRECT_URI}/${userId}&scope=read,activity:read_all,profile:read_all`;

        const embed = new EmbedBuilder()
            .setTitle('Connect Strava')
            .setDescription(`[Click here to connect your Strava account](${stravaAuthUrl})`)
            .setColor('#FC4C02');

        await interaction.reply({ embeds: [embed], ephemeral: true });

        // Save the user ID to the database to track the connection process
        await UsersTable.upsert({ userId, strava_connected: false });
    },
};