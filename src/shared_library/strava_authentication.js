const axios = require('axios');
const { UsersTable } = require('../dbObjects.js');
const fs = require('node:fs');
require('dotenv').config();

let stravaClientId;
let stravaClentSecret;

if (process.env.NODE_ENV === 'production') {
    stravaClientId = fs.readFileSync("/mnt/secrets-store/stravaClientId", 'utf8');
    stravaClentSecret = fs.readFileSync("/mnt/secrets-store/stravaClentSecret", 'utf8');
} else {
    stravaClientId = process.env.stravaClientId;
    stravaClentSecret = process.env.stravaClentSecret;
}
async function firstTimeAuth(userId, code){
    try {
        const response = await axios.post('https://www.strava.com/oauth/token', {
            client_id: stravaClientId,
            client_secret: stravaClentSecret,
            code: code,
            grant_type: 'authorization_code'
        });

        // Save the access token to the database
        await UsersTable.update({ strava_access_token: response.data.access_token, strava_user_id: response.data.athlete.id, strava_connected: true, strava_refresh_token: response.data.refresh_token, strava_expires_at: response.data.expires_at }, { where: { userId: userId } });
        // setup bikes for the user 
        console.log(response.data.athlete.id)
        console.log('Strava account connected successfully!');
        return {
            athlete_id: response.data.athlete.id,
            strava_access_token: response.data.access_token
        };
    } catch (error) {
        console.error('Error exchanging authorization code for access token:', error);
    }
}
async function getStravaAuthentication(userData) {
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

    if (userData.expiresAt <= currentTime) {
        // Token is expired, refresh it
        console.log('Token is expired, refreshing...');
        const refreshTokenResponse = await axios.post('https://www.strava.com/oauth/token', {
            client_id: stravaClientId,
            client_secret: stravaClentSecret,
            grant_type: 'refresh_token',
            refresh_token: userData.refreshToken,
        });

        const newAccessToken = refreshTokenResponse.data.access_token;
        const newExpiresAt = refreshTokenResponse.data.expires_at;
        const newRefreshToken = refreshTokenResponse.data.refresh_token;

        // Update the user record with the new tokens
        await UsersTable.update({
            stravaAccessToken: newAccessToken,
            expiresAt: newExpiresAt,
            refreshToken: newRefreshToken,
        }, {
            where: { userId: userData.userId }
        });

        return newAccessToken;
    } else {
        console.log('Token is still valid...');
        return userData.strava_access_token;
    }
  }

module.exports = {getStravaAuthentication, firstTimeAuth};