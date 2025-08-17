import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const api = axios.create({
  // baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://job-portal-backend-x5oc.onrender.com/api",
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://alluring-bravery-production.up.railway.app/api",
  // baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a response interceptor to handle expired/invalid tokens globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    if (status === 401) {
      const url: string = error?.config?.url || ""
      const detail: string | undefined = error?.response?.data?.detail
      const isAuthEndpoint = /\/auth\/(login|register)/.test(url)
      // Only force logout + hard redirect if it's NOT a direct auth attempt (token truly expired/invalid)
      // and we currently have an authenticated user stored.
      try {
        const store = require("@/store/authStore").useAuthStore.getState()
        const hasToken = !!store.user?.token
        if (!isAuthEndpoint && hasToken) {
          if (typeof window !== "undefined") {
            store.logout()
            window.location.href = "/auth/login?expired=1"
          }
        }
        // If it IS an auth endpoint (wrong credentials), just let the caller catch it (no reload)
      } catch { /* silent */ }
    }
    return Promise.reject(error)
  }
)

export default api;
