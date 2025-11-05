import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Earthquake data fetching
export const fetchRecentEarthquakes = async (days = 7, minMagnitude = 4.0) => {
  try {
    const response = await api.get('/api/earthquakes', {
      params: { days, min_magnitude: minMagnitude },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching earthquakes:', error);
    throw error;
  }
};

// Aftershock prediction
export const predictAftershocks = async (magnitude, latitude, longitude, tectonicSetting = null) => {
  try {
    const response = await api.post('/api/predict', {
      magnitude,
      latitude,
      longitude,
      tectonic_setting: tectonicSetting,
    });
    return response.data;
  } catch (error) {
    console.error('Error predicting aftershocks:', error);
    throw error;
  }
};

// Model coverage data
export const fetchModelCoverage = async () => {
  try {
    const response = await api.get('/api/models/coverage');
    return response.data;
  } catch (error) {
    console.error('Error fetching model coverage:', error);
    throw error;
  }
};

// Specific model details
export const fetchModelDetails = async (regionId) => {
  try {
    const response = await api.get(`/api/models/${regionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching model details:', error);
    throw error;
  }
};

// Health check
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/api/health');
    return response.data;
  } catch (error) {
    console.error('Error checking API health:', error);
    throw error;
  }
};

export default api;