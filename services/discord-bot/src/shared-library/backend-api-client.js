import axios from 'axios';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3000';

// User endpoints
export async function getUser(userId) {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/api/users/${userId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Error fetching user:', error.message);
    throw error;
  }
}

export async function createOrUpdateUser(userData) {
  try {
    const response = await axios.post(`${BACKEND_API_URL}/api/users`, userData);
    return response.data;
  } catch (error) {
    console.error('Error creating/updating user:', error.message);
    throw error;
  }
}

// Bike endpoints
export async function getUserBikes(userId) {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/api/users/${userId}/bikes`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bikes:', error.message);
    throw error;
  }
}

export async function getBikeByName(userId, bikeName) {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/api/users/${userId}/bikes/by-name/${encodeURIComponent(bikeName)}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Error fetching bike:', error.message);
    throw error;
  }
}

export async function updateChainWax(userId, bikeName) {
  try {
    const response = await axios.post(`${BACKEND_API_URL}/api/users/${userId}/bikes/${encodeURIComponent(bikeName)}/wax`);
    return response.data;
  } catch (error) {
    console.error('Error updating chain wax:', error.message);
    throw error;
  }
}

export async function syncBikesFromStrava(userId) {
  try {
    const response = await axios.post(`${BACKEND_API_URL}/api/users/${userId}/bikes/sync`);
    return response.data;
  } catch (error) {
    console.error('Error syncing bikes:', error.message);
    throw error;
  }
}

// Strava authentication
export async function getStravaAuthUrl(userId) {
  try {
    const response = await axios.post(`${BACKEND_API_URL}/api/strava/auth-url`, { userId });
    return response.data.authUrl;
  } catch (error) {
    console.error('Error getting Strava auth URL:', error.message);
    throw error;
  }
}

// Get latest ride
export async function getLatestRide(userId) {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/api/users/${userId}/latest-ride`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Error fetching latest ride:', error.message);
    throw error;
  }
}
