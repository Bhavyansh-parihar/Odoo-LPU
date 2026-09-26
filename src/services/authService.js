import api, { mockDelay } from './api';

export const authService = {
  login: async (email, password) => {
    await mockDelay(400);
    // In future backend integration, this will be: return api.post('/auth/login', { email, password });
    return { data: { token: 'mock_jwt_token_2026', email } };
  },

  signup: async (fullName, email, password) => {
    await mockDelay(400);
    // return api.post('/auth/signup', { fullName, email, password });
    return { data: { token: 'mock_jwt_token_2026', fullName, email } };
  },

  forgotPassword: async (email) => {
    await mockDelay(350);
    // return api.post('/auth/forgot-password', { email });
    return { data: { message: 'Password reset link and OTP sent to your registered email' } };
  },

  verifyOtp: async (otp) => {
    await mockDelay(300);
    // return api.post('/auth/verify-otp', { otp });
    return { data: { verified: true, message: 'OTP verified successfully' } };
  }
};
