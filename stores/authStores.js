import { create } from 'zustand';

// Define the store
export const useAuthStore = create((set) => ({
  user: null, // Default state for the user is null
  setUser: (user) => set({ user }), // Action to update the user
}));
