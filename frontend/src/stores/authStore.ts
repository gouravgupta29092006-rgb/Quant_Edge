/**
 * Auth Zustand store.
 * Manages: user session, JWT tokens, login, logout, registration.
 * Persisted to localStorage via zustand/middleware.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiPost } from '@/lib/api';
import { tokenStore } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  role: 'USER' | 'ADMIN';
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
  verifyEmail: (token: string) => Promise<void>;
}

interface LoginResult {
  requiresTwoFactor: boolean;
  interimToken?: string;
}

interface RegisterData {
  email: string;
  password: string;
  username: string;
  displayName: string;
}

// ─── Store ────────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await apiPost<{
            accessToken?: string;
            refreshToken?: string;
            requiresTwoFactor?: boolean;
            interimToken?: string;
            user?: User;
          }>('/auth/login', { email, password });

          if (data.requiresTwoFactor) {
            set({ isLoading: false });
            return { requiresTwoFactor: true, interimToken: data.interimToken };
          }

          tokenStore.setAccess(data.accessToken!);
          tokenStore.setRefresh(data.refreshToken!);
          set({ user: data.user!, isAuthenticated: true, isLoading: false });
          return { requiresTwoFactor: false };
        } catch (err: any) {
          const msg = err?.response?.data?.message || 'Login failed. Please try again.';
          set({ error: msg, isLoading: false });
          throw err;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await apiPost('/auth/register', data);
          set({ isLoading: false });
        } catch (err: any) {
          const msg = err?.response?.data?.message || 'Registration failed.';
          set({ error: msg, isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        try {
          const refreshToken = tokenStore.getRefresh();
          if (refreshToken) await apiPost('/auth/logout', { refreshToken });
        } catch { /* ignore logout errors */ }
        tokenStore.clear();
        set({ user: null, isAuthenticated: false, error: null });
      },

      verifyEmail: async (token) => {
        set({ isLoading: true, error: null });
        try {
          await apiPost('/auth/verify-email', { token });
          set({ isLoading: false });
        } catch (err: any) {
          set({ error: 'Email verification failed.', isLoading: false });
          throw err;
        }
      },

      setUser: (user) => set({ user, isAuthenticated: true }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'qe-auth-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist non-sensitive data (tokens are in localStorage separately)
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
