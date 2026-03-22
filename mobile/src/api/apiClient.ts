import axios from 'axios';

// Production Cloud URL (Render)
const API_URL = 'https://finflow-tfzk.onrender.com/api';

// For local testing: 'http://192.168.1.5:5000/api'
// For Android Emulator: 'http://10.0.2.2:5000/api'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to log outgoing requests
apiClient.interceptors.request.use((config) => {
  console.log(`\n[Mobile App] Sending ${config.method?.toUpperCase()} to ${config.url}`);
  if (config.data) {
    console.log('[Mobile App] Payload Data:', JSON.stringify(config.data, null, 2));
  }
  return config;
}, (error) => {
  console.error('[Mobile App] Request Error:', error);
  return Promise.reject(error);
});

// Add a response interceptor to log incoming responses
apiClient.interceptors.response.use((response) => {
  console.log(`[Mobile App] Received from ${response.config.url}:`, JSON.stringify(response.data, null, 2));
  return response;
}, (error) => {
  console.error('[Mobile App] API Error:', error?.response?.data || error.message);
  return Promise.reject(error);
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export default apiClient;
