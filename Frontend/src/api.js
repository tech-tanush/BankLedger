import axios from "axios";

const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
const baseURL = rawUrl.trim().replace(/\/$/, "");

const API = axios.create({
  baseURL,
  withCredentials: true,
});

// Auto-attach JWT token if present in localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;

