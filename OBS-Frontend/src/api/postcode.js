import api from "./api";

export const lookupPostcode = async (postcode) => {
  try {
    const response = await api.get(
      `/postcode/lookup/${encodeURIComponent(postcode)}`
    );
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || "Failed to lookup postcode",
    };
  }
};

export const validatePostcode = async (postcode) => {
  try {
    const response = await api.get(
      `/postcode/validate/${encodeURIComponent(postcode)}`
    );
    return { success: true, valid: response.data.valid };
  } catch (error) {
    return { success: false, valid: false };
  }
};

export const reversePostcodeLookup = async (lat, lng) => {
  try {
    const response = await api.get(
      `/postcode/reverse?lat=${lat}&lng=${lng}`
    );
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || "Failed to find postcode",
    };
  }
};

export const autocompletePostcode = async (partial) => {
  try {
    const response = await api.get(
      `/postcode/autocomplete/${encodeURIComponent(partial)}`
    );
    return { success: true, suggestions: response.data.suggestions || [] };
  } catch (error) {
    return { success: false, suggestions: [] };
  }
};