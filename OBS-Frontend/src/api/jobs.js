import api from "./api";

export const getJobs = (params) => api.get("/jobs/", { params });

export const getJobById = (id) => api.get(`/jobs/${id}`);

export const getJobWithBids = (id) => api.get(`/jobs/job-bids/${id}`);

export const createJob = (formData) =>
  api.post("/jobs/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateJob = (id, formData) =>
  api.put(`/jobs/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteJob = (id) => api.delete(`/jobs/${id}`);

export const completeJob = (id, paymentMethod) => api.put(`/jobs/${id}/complete`, { payment_method: paymentMethod });