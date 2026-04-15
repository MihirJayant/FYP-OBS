var express = require("express");
var router = express.Router();
var { authenticate } = require("../middleware/auth");
var {
  chat,
  getChatHistory,
  deleteChatSession,
  clearAllChatHistory,
} = require("../controllers/chatbot.controller");

// POST /api/chatbot/chat - Send a message
router.post("/chat", authenticate, chat);

// GET /api/chatbot/history - Get all sessions
router.get("/history", authenticate, getChatHistory);

// GET /api/chatbot/history/:session_id - Get specific session
router.get("/history/:session_id", authenticate, getChatHistory);

// DELETE /api/chatbot/history/:session_id - Delete a session
router.delete("/history/:session_id", authenticate, deleteChatSession);

// DELETE /api/chatbot/history - Clear all history
router.delete("/history", authenticate, clearAllChatHistory);

module.exports = router;