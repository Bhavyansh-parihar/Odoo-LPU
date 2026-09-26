import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('stocksense_auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

api.interceptors.response.use(res => res, err => { 
  if (err.response && err.response.status === 401 && !err.config.url.includes('/auth/login')) { 
    localStorage.removeItem('stocksense_is_auth');
    localStorage.removeItem('stocksense_user');
    localStorage.removeItem('stocksense_auth_token');
    window.location.href = '/login'; 
  } 
  return Promise.reject(err); 
});
