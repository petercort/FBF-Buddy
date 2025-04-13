import axios from 'axios';
import { UsersTable } from '../dbObjects.js';
import { readFileSync } from 'node:fs';
import dotenv from 'dotenv';
dotenv.config();

let stravaClientId;
let stravaClientSecret;

if (process.env.NODE_ENV === 'production') {
    stravaClientId = readFileSync("/mnt/secrets-store/stravaClientId", 'utf8');
    stravaClientSecret = readFileSync("/mnt/secrets-store/stravaClientSecret", 'utf8');
} else {
    stravaClientId = process.env.stravaClientId;
    stravaClientSecret = process.env.stravaClientSecret;
}
async function firstTimeAuth(userId, code){
    try {
        const response = await axios.post('https://www.strava.com/oauth/token', {
            client_id: stravaClientId,
            client_secret: stravaClientSecret,
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
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds because Strava uses seconds for token expiry
    if (userData.strava_expires_at <= currentTime) {
        // Token is expired, refresh it
        console.log('Token is expired, refreshing...');
        const refreshTokenResponse = await axios.post('https://www.strava.com/oauth/token', {
            client_id: stravaClientId,
            client_secret: stravaClientSecret,
            grant_type: 'refresh_token',
            refresh_token: userData.strava_refresh_token,
        });

        const newAccessToken = refreshTokenResponse.data.access_token;
        const newExpiresAt = refreshTokenResponse.data.expires_at;
        const newRefreshToken = refreshTokenResponse.data.refresh_token;

        // Update the user record with the new tokens
        await UsersTable.update({
            strava_access_token: newAccessToken,
            strava_expires_at: newExpiresAt,
            strava_refresh_token: newRefreshToken,
        }, {
            where: { userId: userData.userId }
        });
        console.log('Token refreshed successfully!');
        return newAccessToken;
    } else {
        console.log('Token is still valid...');
        return userData.strava_access_token;
    }
  }

export {getStravaAuthentication, firstTimeAuth};