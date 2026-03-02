import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '../api/client';

export interface AuthUser {
  id: number;
  email: string;
  displayName?: string;
  phone?: string;
  profileImage?: string;
}

interface AuthState {
  user: AuthUser | null;
  idToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setUser: (user: AuthUser, idToken: string, refreshToken?: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  idToken: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: async (user, idToken, refreshToken) => {
    await SecureStore.setItemAsync(TOKEN_KEY, idToken);
    if (refreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    }
    set({ user, idToken, isAuthenticated: true, isLoading: false });
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY).catch(() => {});
    set({ user: null, idToken: null, isAuthenticated: false, isLoading: false });
  },

  loadFromStorage: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        // Token exists; mark authenticated. The profile screen or app init
        // can fetch the full user profile from the API.
        set({ idToken: token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
