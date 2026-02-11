import axios from 'axios';
import { Platform } from 'react-native';

import Constants from 'expo-constants';

// Dynamically determine the URL based on the current Expo host
const getBaseUrl = () => {
  // In development/Expo Go, this gives the IP of the machine running the packager
  const hostUri = Constants.expoConfig?.hostUri;
  
  if (hostUri) {
    const ip ='3.6.224.83' 
    // hostUri.split(':')[0];
    // Assuming your backend is always on port 3000
    return `http://${ip}:3000/api/v1`;
  }
  
  // Fallback IP if not running via Expo dev server (should be your dev machine IP)
  return 'http://10.0.1.33:3000/api/v1';
};

const BASE_URL = "http://3.6.224.83:3000/api/v1";
// "http://3.6.224.83:3000/api/v1"
//  "https://negligently-multisulcated-kazuko.ngrok-free.dev/api/v1";
// "https://negligently-multisulcated-kazuko.ngrok-free.dev/api/v1";

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor for debugging
client.interceptors.request.use(
  config => {
    const headerKeys = Object.keys(config.headers || {});
    console.log(`API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url} (Headers: ${headerKeys.join(', ')})`);
    return config;
  },
  error => Promise.reject(error)
);

// Add a response interceptor for debugging
client.interceptors.response.use(
  response => response,
  error => {
    console.log('API Error:', error.response ? error.response.data : error.message);
    return Promise.reject(error);
  }
);

export default client;
