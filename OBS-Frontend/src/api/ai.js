import api from "./api";

//Enhance a job description using AI
export const enhanceDescription = async (description, title) => {
  try {
    var response = await api.post("/ai/enhance-description", {
      description: description,
      title: title || "",
    });
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || "Failed to enhance description",
    };
  }
};