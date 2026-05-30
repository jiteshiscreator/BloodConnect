import { create } from 'zustand';
import { notificationsApi } from '../api/notifications.api';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isPanelOpen: false,

  // ── Actions ──

  fetchNotifications: async (params = {}) => {
    set({ isLoading: true });
    try {
      const { data } = await notificationsApi.getAll(params);
      set({ notifications: data.data, unreadCount: data.unreadCount, isLoading: false });
    } catch { set({ isLoading: false }); }
  },

  markAsRead: async (id) => {
    try {
      await notificationsApi.markRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch { /* silent */ }
  },

  markAllAsRead: async () => {
    try {
      await notificationsApi.markAllRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch { /* silent */ }
  },

  deleteNotification: async (id) => {
    const wasUnread = get().notifications.find((n) => n._id === id)?.isRead === false;
    set((state) => ({ notifications: state.notifications.filter((n) => n._id !== id) }));
    if (wasUnread) set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) }));
    try { await notificationsApi.delete(id); } catch { /* silent */ }
  },

  // Real-time: add incoming notification from Socket.IO.
  // Uses crypto.randomUUID() for the temporary _id so it cannot collide
  // with MongoDB ObjectId strings (which would break mark-as-read / delete).
  addNotification: (notification) => {
    set((state) => ({
      notifications: [
        {
          ...notification,
          _id: crypto.randomUUID(),  // collision-safe UUID string
          isRead: false,
          createdAt: new Date(),
        },
        ...state.notifications,
      ],
      unreadCount: state.unreadCount + 1,
    }));
  },

  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
  closePanel: () => set({ isPanelOpen: false }),
  openPanel: () => set({ isPanelOpen: true }),
}));
