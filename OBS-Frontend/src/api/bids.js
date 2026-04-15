import api from "./api";

export const createBid = (payload) => api.post("/bids/", payload);

export const getBidsForJob = (jobId) => api.get(`/bids/job/${jobId}`);

export const cancelBid = (bidId) => api.post(`/bids/cancel/${bidId}`);

export const acceptBid = (bidId) => api.post(`/bids/accept/${bidId}`);
