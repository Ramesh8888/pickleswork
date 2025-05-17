import axios from 'axios';

// Add console logs to debug
console.log('apiService.js loaded');

// Create a more resilient axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  timeout: 15000, // Increased timeout
  // Add retry logic
  retry: 3,
  retryDelay: (retryCount) => {
    return retryCount * 1000; // time interval between retries
  }
});

// Request queue and throttling
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // Minimum time between requests (1 second)

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    console.log('API request:', config.method.toUpperCase(), config.url);
    
    // Throttle requests
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
    }
    lastRequestTime = Date.now();

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('Response error:', error.response?.status, error.config?.url, error.message);
    
    // Handle rate limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 5;
      console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return api(error.config);
    }
    
    // Handle CORS errors
    if (error.message === 'Network Error') {
      console.error('CORS Error: Check if the server is running and CORS is properly configured');
      
      // Try to reconnect
      if (error.config && !error.config.__retryCount) {
        error.config.__retryCount = 0;
      }
      
      if (error.config && error.config.__retryCount < error.config.retry) {
        error.config.__retryCount++;
        console.log(`Retrying request (${error.config.__retryCount}/${error.config.retry})...`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, error.config.retryDelay(error.config.__retryCount)));
        
        // Retry the request
        return api(error.config);
      }
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 