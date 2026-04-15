/**
 * Chat History Service
 * Handles saving and retrieving chat conversations from MongoDB
 */
var ChatHistory = require("../models/ChatHistory");
var { getConnectionStatus } = require("../config/mongodb");
var crypto = require("crypto");

/**
 * Generate a unique session ID
 */
function generateSessionId() {
  return crypto.randomUUID();
}

/**
 * Create a new chat session for a user
 */
async function createSession(userId, userMetadata) {
  if (!getConnectionStatus()) {
    return { success: false, error: "MongoDB not connected" };
  }

  try {
    var session = new ChatHistory({
      user_id: userId,
      session_id: generateSessionId(),
      messages: [],
      metadata: {
        user_role: userMetadata.role || null,
        user_name: userMetadata.name || null,
      },
    });

    await session.save();

    return {
      success: true,
      session_id: session.session_id,
    };
  } catch (error) {
    console.error("Error creating chat session:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get or create active session for user
 */
async function getOrCreateSession(userId, userMetadata) {
  if (!getConnectionStatus()) {
    return { success: false, session_id: null };
  }

  try {
    // Find the most recent session for this user within last 24 hours
    var recentSession = await ChatHistory.findOne({
      user_id: userId,
      updated_at: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }).sort({ updated_at: -1 });

    if (recentSession) {
      return {
        success: true,
        session_id: recentSession.session_id,
        is_new: false,
      };
    }

    var result = await createSession(userId, userMetadata || {});
    return {
      success: result.success,
      session_id: result.session_id,
      is_new: true,
    };
  } catch (error) {
    console.error("Error getting/creating session:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Add a message to a session
 */
async function addMessage(sessionId, role, content, actionData) {
  if (!getConnectionStatus()) {
    return { success: false };
  }

  try {
    var message = {
      role: role,
      content: content,
      action: actionData ? actionData.action : null,
      action_result: actionData ? actionData.action_result : null,
      timestamp: new Date(),
    };

    await ChatHistory.findOneAndUpdate(
      { session_id: sessionId },
      {
        $push: { messages: message },
        $set: { updated_at: new Date() },
      }
    );

    return { success: true };
  } catch (error) {
    console.error("Error adding message:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get conversation history for a session
 */
async function getSessionHistory(sessionId, limit) {
  if (!getConnectionStatus()) {
    return { success: false, messages: [] };
  }

  var messageLimit = limit || 20;

  try {
    var session = await ChatHistory.findOne({ session_id: sessionId });

    if (!session) {
      return { success: false, messages: [] };
    }

    var messages = session.messages.slice(-messageLimit);

    return {
      success: true,
      messages: messages.map(function (msg) {
        return {
          role: msg.role,
          content: msg.content,
        };
      }),
    };
  } catch (error) {
    console.error("Error getting session history:", error);
    return { success: false, messages: [] };
  }
}

/**
 * Get all sessions for a user
 */
async function getUserSessions(userId, limit) {
  if (!getConnectionStatus()) {
    return { success: false, sessions: [] };
  }

  var sessionLimit = limit || 10;

  try {
    var sessions = await ChatHistory.find({ user_id: userId })
      .sort({ updated_at: -1 })
      .limit(sessionLimit)
      .select("session_id created_at updated_at metadata");

    return {
      success: true,
      sessions: sessions,
    };
  } catch (error) {
    console.error("Error getting user sessions:", error);
    return { success: false, sessions: [] };
  }
}

/**
 * Delete a session
 */
async function deleteSession(sessionId, userId) {
  if (!getConnectionStatus()) {
    return { success: false };
  }

  try {
    await ChatHistory.deleteOne({
      session_id: sessionId,
      user_id: userId,
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting session:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Clear all chat history for a user
 */
async function clearUserHistory(userId) {
  if (!getConnectionStatus()) {
    return { success: false };
  }

  try {
    await ChatHistory.deleteMany({ user_id: userId });
    return { success: true };
  } catch (error) {
    console.error("Error clearing user history:", error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  generateSessionId,
  createSession,
  getOrCreateSession,
  addMessage,
  getSessionHistory,
  getUserSessions,
  deleteSession,
  clearUserHistory,
};