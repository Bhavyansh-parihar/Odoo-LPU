import { create } from 'zustand';
import { initialUserProfile } from '../data/mockData';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('stocksense_user')) || initialUserProfile,
  isAuthenticated: localStorage.getItem('stocksense_is_auth') === 'true' || true, // default true for immediate demo access
  
  login: async (email, password) => {
    // Mock login logic
    const mockUser = {
      ...initialUserProfile,
      email: email || initialUserProfile.email
    };
    localStorage.setItem('stocksense_is_auth', 'true');
    localStorage.setItem('stocksense_user', JSON.stringify(mockUser));
    localStorage.setItem('stocksense_auth_token', 'mock_jwt_token_stocksense_2026');
    set({ user: mockUser, isAuthenticated: true });
    return { success: true, user: mockUser };
  },

  signup: async (fullName, email) => {
    const mockUser = {
      ...initialUserProfile,
      name: fullName,
      email: email
    };
    localStorage.setItem('stocksense_is_auth', 'true');
    localStorage.setItem('stocksense_user', JSON.stringify(mockUser));
    localStorage.setItem('stocksense_auth_token', 'mock_jwt_token_stocksense_2026');
    set({ user: mockUser, isAuthenticated: true });
    return { success: true, user: mockUser };
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
