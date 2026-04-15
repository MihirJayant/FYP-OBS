import api from "./api";

export const addRating = async (ratingData) => {
    try {
        const res = await api.post("/ratings", ratingData);
        if (res.success) return res;
        throw new Error(res.error);
    } catch (error) {
        return {
            success: false,
            error: error.message || "Failed to submit rating",
        };
    }
};

export const getJobRatings = async (jobId) => {
    try {
        const res = await api.get(`/ratings/job/${jobId}`);
        if (res.success) return res;
        throw new Error(res.error);
    } catch (error) {
        return {
            success: false,
            error: error.message || "Failed to fetch ratings",
        };
    }
};

export const getMyRating = async (jobId) => {
    try {
        const res = await api.get(`/ratings/job/${jobId}/my-rating`);
        if (res.success) return res;
        throw new Error(res.error);
    } catch (error) {
        return {
            success: false,
            error: error.message || "Failed to fetch my rating",
        };
    }
};

export const getUserRatings = async (userId) => {
    try {
        const res = await api.get(`/ratings/user/${userId}`);
        if (res.success) return res;
        throw new Error(res.error);
    } catch (error) {
        return {
            success: false,
            error: error.message || "Failed to fetch user ratings",
        };
    }
};


