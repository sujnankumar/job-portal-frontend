import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // Change to your API base URL
  headers: {
    "Content-Type": "application/json",
  },
  // You can add more default config here (e.g., withCredentials, timeout, interceptors)
});

export default api;
