import { create } from 'zustand';
import { requestsApi } from '../api/requests.api';

export const useRequestStore = create((set, get) => ({
  requests: [],
  nearbyRequests: [],
  currentRequest: null,
  stats: null,
  isLoading: false,
  error: null,
  pagination: { total: 0, page: 1, pages: 1 },

  // ── Actions ──

  fetchRequests: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await requestsApi.getAll(params);
      set({ requests: data.data, pagination: data.pagination, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch requests', isLoading: false });
    }
  },

  fetchNearbyRequests: async (params = {}) => {
    set({ isLoading: true });
    try {
      const { data } = await requestsApi.getNearby(params);
      set({ nearbyRequests: data.data, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  fetchRequestById: async (id) => {
    set({ isLoading: true });
    try {
      const { data } = await requestsApi.getById(id);
      set({ currentRequest: data.data, isLoading: false });
      return data.data;
    } catch (err) {
      set({ isLoading: false });
      return null;
    }
  },

  createRequest: async (requestData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await requestsApi.create(requestData);
      set((state) => ({
        requests: [data.data, ...state.requests],
        isLoading: false,
      }));
      return { success: true, data: data.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create request';
      set({ error: message, isLoading: false });
      return { success: false, error: message, errors: err.response?.data?.errors };
    }
  },

  updateRequestStatus: async (id, status, donorId) => {
    try {
      const { data } = await requestsApi.updateStatus(id, { status, donorId });
      set((state) => ({
        requests: state.requests.map((r) => (r._id === id ? data.data : r)),
        nearbyRequests: state.nearbyRequests.filter((r) => r._id !== id),
        currentRequest: state.currentRequest?._id === id ? data.data : state.currentRequest,
      }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  },

  cancelRequest: async (id) => {
    try {
      await requestsApi.cancel(id);
      set((state) => ({
        requests: state.requests.filter((r) => r._id !== id),
      }));
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  },

  fetchStats: async () => {
    try {
      const { data } = await requestsApi.getStats();
      set({ stats: data.data });
    } catch { /* silent */ }
  },

  // Real-time: add incoming request from Socket.IO
  addIncomingRequest: (request) => {
    set((state) => ({
      nearbyRequests: [request, ...state.nearbyRequests].slice(0, 50),
      // Also inject into general requests so Hospital staff see it in real-time
      requests: [request, ...state.requests].slice(0, 50)
    }));
  },

  clearError: () => set({ error: null }),
}));
