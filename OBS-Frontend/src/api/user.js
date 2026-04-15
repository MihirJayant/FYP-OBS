import api from "./api";

export const getProfile = () => api.get("/users/me");

export const updateProfile = (formData) =>
  api.put("/users/me", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateRole = (role) => api.put("/users/role", { role });

export const checkRole = () => api.get("/users/check");

export const getPublicProfile = (userId) => api.get("/users/profile/" + userId);

export const getUserRatings = (userId) => api.get("/ratings/user/" + userId);

export const deleteAccount = (password) => api.delete("/users/me", { data: { password: password } });