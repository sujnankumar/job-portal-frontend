import { create } from "zustand";
import api from "@/lib/axios";

export interface Notification {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  link: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  markAsRead: async (id: string) => {
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      };
    });
    try {
      const token = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("auth-storage") || '{}').state?.user?.token : null;
      if (token) {
        await api.post(`/notifications/mark-read/${id}`, null, { params: { token } });
      }
    } catch (e) { /* ignore */ }
  },
  markAllAsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
    try {
      const token = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("auth-storage") || '{}').state?.user?.token : null;
      if (token) {
        await api.post("/notifications/mark-all-read", null, { params: { token } });
      }
    } catch (e) { /* ignore */ }
  },
}));
