import { create } from 'zustand';

// Define the store
export const useAuthStore = create((set) => ({
  user: null, 
  setUser: (user) => set({ user }), 
}));
