import { create } from 'zustand';

import { User, UserRole } from '../types';

interface AuthStore {
  user: User | null;
  role: UserRole | null;
  setUser: (user: User | null, role: UserRole) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  role: null,

  setUser: (user, role) => set({ user, role }),

  logout: () => set({ user: null, role: null }),
}));
