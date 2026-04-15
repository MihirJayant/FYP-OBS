// @ts-nocheck
import axios from "axios";
import { toast } from "react-toastify";

// @ts-ignore
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const api = axios.create({
  baseURL: SERVER_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Unified response + toast handling
api.interceptors.response.use(
  (response) => {
    if (response.data?.error) {
      toast.error(response.data.error);
      return {
        success: false,
        error: response.data.error,
        status: response.status,
      };
    }

    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  },
  async (err) => {
    // Handle 401 Unauthorized
    if (err.response?.status === 401) {
      const message = "Unauthorized";
      toast.error(message);
      return {
        success: false,
        error: message,
        status: 401,
      };
    }

    // Refresh token auto handle (if 498 token expired)
    if (err.response?.status === 498) {
      const refresh = localStorage.getItem("refresh_token");
      if (!refresh) return { success: false, error: "Session expired" };

      try {
        const { data } = await axios.post(`${SERVER_URL}/auth/token/refresh`, {
          refresh,
        });

        localStorage.setItem("access_token", data.access);
        err.config.headers.Authorization = `Bearer ${data.access}`;
        return api(err.config);
      } catch {
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    // Extract error message
    const message =
      err.response?.data?.message || err.message || "Something went wrong";
    toast.error(message);

    return {
      success: false,
      error: message,
      status: err.response?.status || 500,
    };
  }
);

export default api;
