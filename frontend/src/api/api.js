import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true, // enable if you later use httpOnly cookies
});

// 🔹 Request interceptor (attach token if exists)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken"); // or from AuthContext
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Response interceptor (optional refresh token handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ Unauthorized - refresh token logic can be added here");
    }
    return Promise.reject(error);
  }
);

export default api;
