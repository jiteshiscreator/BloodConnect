import { create } from 'zustand';
import { bloodbankApi } from '../api/bloodbank.api';

export const useInventoryStore = create((set, get) => ({
  bloodBanks: [],
  nearbyBanks: [],
  myBloodBank: null,
  isLoading: false,
  error: null,

  // ── Actions ──

  fetchBloodBanks: async (params = {}) => {
    set({ isLoading: true });
    try {
      const { data } = await bloodbankApi.getAll(params);
      set({ bloodBanks: data.data, isLoading: false });
    } catch { set({ isLoading: false }); }
  },

  fetchNearbyBanks: async (params = {}) => {
    set({ isLoading: true });
    try {
      const { data } = await bloodbankApi.getNearby(params);
      set({ nearbyBanks: data.data, isLoading: false });
    } catch { set({ isLoading: false }); }
  },

  fetchMyBloodBank: async () => {
    set({ isLoading: true });
    try {
      const { data } = await bloodbankApi.getMyBank();
      set({ myBloodBank: data.data, isLoading: false });
      return data.data;
    } catch { set({ isLoading: false }); return null; }
  },

  createBloodBank: async (bankData) => {
    set({ isLoading: true });
    try {
      const { data } = await bloodbankApi.create(bankData);
      set((state) => ({ bloodBanks: [data.data, ...state.bloodBanks], myBloodBank: data.data, isLoading: false }));
      return { success: true, data: data.data };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, error: err.response?.data?.message };
    }
  },

  updateInventory: async (id, updates) => {
    try {
      const { data } = await bloodbankApi.updateInventory(id, updates);
      set((state) => ({
        myBloodBank: state.myBloodBank?._id === id ? data.data : state.myBloodBank,
        bloodBanks: state.bloodBanks.map((b) => (b._id === id ? data.data : b)),
      }));
      return { success: true, data: data.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  },

  // Real-time: handle Socket.IO inventory update event
  handleInventoryUpdate: ({ bankId, inventory }) => {
    set((state) => ({
      bloodBanks: state.bloodBanks.map((b) =>
        b._id === bankId ? { ...b, inventory } : b
      ),
      nearbyBanks: state.nearbyBanks.map((b) =>
        b._id === bankId ? { ...b, inventory } : b
      ),
      myBloodBank: state.myBloodBank?._id === bankId
        ? { ...state.myBloodBank, inventory }
        : state.myBloodBank,
    }));
  },
}));
