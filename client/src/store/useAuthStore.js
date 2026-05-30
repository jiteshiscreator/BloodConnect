import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/auth.api';
import { ROLE_DASHBOARD_PATHS } from '../utils/constants';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ── Actions ──

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authApi.login(credentials);
          set({ user: data.data, isAuthenticated: true, isLoading: false });
          return { success: true, user: data.data };
        } catch (err) {
          const message = err.response?.data?.message || 'Login failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authApi.register(userData);
          set({ user: data.data, isAuthenticated: true, isLoading: false });
          return { success: true, user: data.data };
        } catch (err) {
          const message = err.response?.data?.message || 'Registration failed';
          const errors = err.response?.data?.errors || [];
          set({ error: message, isLoading: false });
          return { success: false, error: message, errors };
        }
      },

      logout: async () => {
        try { await authApi.logout(); } catch { /* ignore */ }
        set({ user: null, isAuthenticated: false, error: null });
      },

      fetchMe: async () => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.getMe();
          set({ user: data.data, isAuthenticated: true, isLoading: false });
          return data.data;
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false });
          return null;
        }
      },

      updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),

      clearAuth: () => set({ user: null, isAuthenticated: false, error: null }),

      clearError: () => set({ error: null }),

      // Computed helpers
      get dashboardPath() { return ROLE_DASHBOARD_PATHS[get().user?.role] || '/login'; },
      get isAdmin() { return get().user?.role === 'super_admin'; },
      get isDonor() { return get().user?.role === 'donor'; },
      get isRecipient() { return get().user?.role === 'recipient'; },
      get isHospital() { return get().user?.role === 'hospital'; },
      get isBloodBankAdmin() { return get().user?.role === 'bloodbank_admin'; },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
