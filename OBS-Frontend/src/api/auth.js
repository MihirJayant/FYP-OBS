import api from "./api";

export const register = async (payload) => {
  const res = await api.post("/auth/register", payload);

  // @ts-ignore
  if (res.success) {
    localStorage.setItem("access_token", res.data.access);
    localStorage.setItem("refresh_token", res.data.refresh);
    localStorage.setItem("user", JSON.stringify(res.data.user));
  }

  return res;
};

export const login = async (payload) => {
  const res = await api.post("/auth/login", payload);

  // @ts-ignore
  if (res.success) {
    localStorage.setItem("access_token", res.data.access);
    localStorage.setItem("refresh_token", res.data.refresh);
    localStorage.setItem("user", JSON.stringify(res.data.user));
  }

  return res;
};

export const logout = async () => {
  const refresh = localStorage.getItem("refresh_token");
  const res = await api.post("/auth/logout", { refresh });

  // @ts-ignore
  if (res.success) {
    localStorage.clear();
  }
  return res;
};

export const getOtp = (email) => api.post("/auth/forgot", { email });

export const resetPassword = (payload) => api.post("/auth/reset", payload);

export const refreshToken = (refresh) =>
  api.post("/auth/token/refresh", { refresh });
