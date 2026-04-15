// @ts-nocheck
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

/* ===============================
   REQUEST INTERCEPTOR
================================ */
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_ad_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ===============================
   RESPONSE NORMALIZER
================================ */
const normalizeResponse = (response) => {
  const res = response.data;

  // Case 1: { status, data, msg }
  if (typeof res === "object" && "status" in res) {
    return {
      status: Boolean(res.status),
      data: res.status ? res.data ?? null : null,
      msg: res.msg || "Request failed",
    };
  }

  // Case 2: { success, data, message }
  if (typeof res === "object" && "success" in res) {
    return {
      status: Boolean(res.success),
      data: res.success ? res.data ?? null : null,
      msg: res.message || "Request failed",
    };
  }

  // Case 3: { error }
  if (typeof res === "object" && res.error) {
    return {
      status: false,
      data: null,
      msg: typeof res.error === "string" ? res.error : "Request failed",
    };
  }

  // Case 4: Raw data (array/object/string)
  return {
    status: true,
    data: res,
    msg: "Success",
  };
};

/* ===============================
   RESPONSE INTERCEPTOR
================================ */
axiosClient.interceptors.response.use(
  (response) => normalizeResponse(response),
  async (error) => {
    const res = error?.response?.data;

    // Check for msg, message, or error from server response
    const msg =
      res?.msg ||
      res?.message ||
      res?.error || // ✅ Handles { error: "User not found" }
      error?.message ||
      "Something went wrong";

    return Promise.resolve({
      status: false,
      data: null,
      msg,
    });
  }
);
