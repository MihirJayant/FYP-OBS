import { axiosClient } from "@/lib/axiosClient";

// Dashboard - overall counts and revenue cards
export const getAdminDashboard = () => axiosClient.get("/admin/dashboard");

// Analytics charts data
export const getAdminAnalyticsOverview = () =>
  axiosClient.get("/admin/analytics");

// Users
export const getAdminUsers = () => axiosClient.get("/admin/users");

export const getAdminUserById = (id: string) =>
  axiosClient.get(`/admin/users/${id}`);

// Update user role (used for block/unblock)
export const updateAdminUserRole = (id: string, payload: { role: string }) =>
  axiosClient.put(`/admin/users/${id}/role`, payload);

export const deleteAdminUser = (id: string) =>
  axiosClient.delete(`/admin/users/${id}`);

// Jobs
export const getAdminJobs = () => axiosClient.get("/admin/jobs");

// Fixed: was incorrectly using POST, should be GET for fetching a single job
export const getAdminJobById = (id: string) =>
  axiosClient.get(`/admin/jobs/${id}`);

export const updateAdminJobStatus = (id: string, payload: { status: string }) =>
  axiosClient.put(`/admin/jobs/${id}/status`, payload);

export const deleteAdminJob = (id: string) =>
  axiosClient.delete(`/admin/jobs/${id}`);

// Bids
export const getAdminBids = () => axiosClient.get("/admin/bids");

// Payments
export const getAdminPayments = () => axiosClient.get("/admin/payments");

// Wallet and diamond transactions
export const getAdminWalletLedger = () =>
  axiosClient.get("/admin/wallet-ledger");

// Ratings and reviews
export const getAdminRatings = () => axiosClient.get("/admin/ratings");
