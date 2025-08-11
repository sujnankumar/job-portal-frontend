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
  toggleRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  deleteNotifications: (ids: string[]) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    }),
  addNotification: (notification) =>
    set((state) => {
      const isUnread = !notification.read;
      return {
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + (isUnread ? 1 : 0),
      };
    }),
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
      const token =
        typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("auth-storage") || '{}')?.state?.user?.token
          : null;
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
      const token =
        typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("auth-storage") || '{}')?.state?.user?.token
          : null;
      if (token) {
        await api.post("/notifications/mark-all-read", null, { params: { token } });
      }
    } catch (e) { /* ignore */ }
  },
  toggleRead: async (id: string) => {
    const prev = get().notifications.find(n => n.id === id)?.read
    const next = !prev
    set((state) => {
      const notifications = state.notifications.map((n) => n.id === id ? { ...n, read: next } : n)
      return { notifications, unreadCount: notifications.filter(n => !n.read).length }
    })
    try {
      const token = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("auth-storage") || '{}')?.state?.user?.token : null;
      if (token) {
        if (next) {
          await api.post(`/notifications/mark-read/${id}`, null, { params: { token } })
        } else {
          await api.post(`/notifications/mark-unread/${id}`, null, { params: { token } })
        }
      }
    } catch(e) { /* ignore */ }
  },
  deleteNotification: async (id: string) => {
    set((state) => {
      const notifications = state.notifications.filter(n => n.id !== id)
      return { notifications, unreadCount: notifications.filter(n => !n.read).length }
    })
    try {
      const token = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("auth-storage") || '{}')?.state?.user?.token : null;
      if (token) {
        await api.delete(`/notifications/${id}`, { params: { token } })
      }
    } catch(e) { /* ignore */ }
  },
  deleteNotifications: async (ids: string[]) => {
    set((state) => {
      const idsSet = new Set(ids)
      const notifications = state.notifications.filter(n => !idsSet.has(n.id))
      return { notifications, unreadCount: notifications.filter(n => !n.read).length }
    })
    try {
      const token = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("auth-storage") || '{}')?.state?.user?.token : null;
      if (token) {
        await api.delete(`/notifications/`, { params: { token }, data: { ids } })
      }
    } catch(e) { /* ignore */ }
  },
}));
