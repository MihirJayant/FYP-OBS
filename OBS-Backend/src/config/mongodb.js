/**
 * MongoDB Connection Configuration
 * Used for chat history storage
 */
var mongoose = require("mongoose");

var isConnected = false;

async function connectMongoDB() {
  if (isConnected) {
    return;
  }

  var uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn(
      "MongoDB URI not configured. Chat history will not be persisted."
    );
    return;
  }

  try {
    await mongoose.connect(uri, {
      dbName: "obs_chatbot",
    });
    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
  }
}

function getConnectionStatus() {
  return isConnected;
}

module.exports = {
  connectMongoDB,
  getConnectionStatus,
};