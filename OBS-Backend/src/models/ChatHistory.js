/**
 * Chat History Model
 * Stores conversation history for each user
 */
var mongoose = require("mongoose");

var messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    default: null,
  },
  action_result: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

var chatSessionSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true,
  },
  session_id: {
    type: String,
    required: true,
    index: true,
  },
  messages: [messageSchema],
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    user_role: String,
    user_name: String,
    total_messages: {
      type: Number,
      default: 0,
    },
  },
});

chatSessionSchema.pre("save", function (next) {
  this.updated_at = new Date();
  this.metadata.total_messages = this.messages.length;
  next();
});

chatSessionSchema.index({ user_id: 1, created_at: -1 });

var ChatHistory = mongoose.model("ChatHistory", chatSessionSchema);

module.exports = ChatHistory;
