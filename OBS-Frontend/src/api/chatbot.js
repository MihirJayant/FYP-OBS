import api from "./api";

/**
 * Send a message to the AI chatbot
 */
export const sendChatMessage = async (message, conversationHistory) => {
  try {
    var response = await api.post("/chatbot/chat", {
      message: message,
      conversation_history: conversationHistory || [],
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || "Failed to send message",
    };
  }
};