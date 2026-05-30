import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { dispatchForceLogout } from '../utils/authEvents';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ── Response interceptor: handle token refresh ──
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried, attempt token refresh.
    // IMPORTANT: Exclude /auth/refresh itself to prevent an infinite retry loop
    // when the refresh token has also expired.
    const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh');
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshEndpoint) {
      originalRequest._retry = true;
      try {
        await api.post('/auth/refresh');
        return api(originalRequest);
      } catch {
        // Refresh token also expired → clear auth state and signal a soft redirect
        useAuthStore.getState().clearAuth();
        dispatchForceLogout(); // caught by App.jsx → navigate('/login') without page reload
      }
    }

    return Promise.reject(error);
  }
);

export default api;
