import api, { mockDelay } from './api';

export const authService = {
  login: async (email, password) => {
    
    return api.post('/auth/login', { email, password });
    
  },

  signup: async (fullName, email, password) => {
    
    return api.post('/auth/signup', { fullName, email, password });
    
  },

  forgotPassword: async (email) => {
    
    return api.post('/auth/forgot-password', { email });
    
  },

  verifyOtp: async (otp) => {
    
    return api.post('/auth/verify-otp', { otp });
    
  }
};
