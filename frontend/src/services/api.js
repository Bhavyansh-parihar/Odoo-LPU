import axios from 'axios';

// Base Axios instance configured for future backend integration
const api = axios.create({
  baseURL: 'https://api.stocksense.internal/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor (attaches token when backend is available)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('stocksense_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper function to simulate realistic network delay in mock mode
export const mockDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export default api;
