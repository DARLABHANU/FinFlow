import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  isBiometricEnabled?: boolean;
  createdAt?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isPrivacyMode: boolean;
  currency: 'USD' | 'INR';
  rememberedEmail: string | null;
  rememberedPassword: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  toggleBiometric: (val: boolean) => void;
  togglePrivacyMode: (val: boolean) => void;
  setCurrency: (c: 'USD' | 'INR') => void;
  setRememberedCredentials: (email: string, pass: string) => void;
  updateUserProfile: (name: string, avatar?: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isPrivacyMode: false,
  currency: 'USD',
  rememberedEmail: null,
  rememberedPassword: null,
  login: (user, token) => set({ user, token, isAuthenticated: true }),
  logout: () => set({ user: null, token: null, isAuthenticated: false, isPrivacyMode: false }),
  toggleBiometric: (val) => set((state) => ({ user: state.user ? { ...state.user, isBiometricEnabled: val } : null })),
  togglePrivacyMode: (val) => set({ isPrivacyMode: val }),
  setCurrency: (c) => set({ currency: c }),
  setRememberedCredentials: (email, pass) => set({ rememberedEmail: email, rememberedPassword: pass }),
  updateUserProfile: async (name: string, avatar?: string) => {
    try {
      const response = await apiClient.put('/auth/profile', { name, avatar });
      const updatedUser = response.data;
      set((state) => ({
        user: state.user ? { 
          ...state.user, 
          name: updatedUser.name, 
          avatar: updatedUser.avatar 
        } : null
      }));
    } catch (error) {
       console.log('Update profile error', error);
       throw error;
    }
  }
}));
