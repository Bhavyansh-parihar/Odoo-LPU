import { create } from 'zustand';
import { initialUserProfile } from '../data/mockData';
import api from '../utils/api';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('stocksense_user')) || null,
  isAuthenticated: localStorage.getItem('stocksense_is_auth') === 'true',
  
  login: async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, accessToken } = res.data.data;
      localStorage.setItem('stocksense_is_auth', 'true');
      localStorage.setItem('stocksense_user', JSON.stringify(user));
      localStorage.setItem('stocksense_auth_token', accessToken);
      set({ user, isAuthenticated: true });
      return { success: true, user };
    } catch (error) {
      console.error('Login Error:', error);
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  },

  signup: async (fullName, email, password = 'password123', role = 'manager') => {
    try {
      const res = await api.post('/auth/signup', { name: fullName, email, password, role });
      const { user, accessToken } = res.data.data;
      localStorage.setItem('stocksense_is_auth', 'true');
      localStorage.setItem('stocksense_user', JSON.stringify(user));
      localStorage.setItem('stocksense_auth_token', accessToken);
      set({ user, isAuthenticated: true });
      return { success: true, user };
    } catch (error) {
      console.error('Signup Error:', error);
      return { success: false, error: error.response?.data?.message || 'Signup failed' };
    }
  },

  logout: () => {
    localStorage.removeItem('stocksense_is_auth');
    localStorage.removeItem('stocksense_user');
    localStorage.removeItem('stocksense_auth_token');
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: (updatedData) => {
    set((state) => {
      const newUser = { ...state.user, ...updatedData };
      localStorage.setItem('stocksense_user', JSON.stringify(newUser));
      return { user: newUser };
    });
  }
}));
