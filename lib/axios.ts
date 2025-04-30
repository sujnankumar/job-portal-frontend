import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://job-portal-backend-x5oc.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a response interceptor to handle expired/invalid tokens globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optionally check for a specific error message
      if (typeof window !== "undefined") {
        // Clear auth state and redirect to login
        const { logout } = require("@/store/authStore").useAuthStore.getState();
        logout();
        window.location.href = "/auth/login?expired=1";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
