require("dotenv").config();
var app = require("./app");
var http = require("http");
var { Server } = require("socket.io");
var { logger } = require("./utils/logger");
var { connectMongoDB } = require("./config/mongodb");

var PORT = process.env.PORT || 4000;

// Create HTTP server and attach Socket.io
var server = http.createServer(app);

var io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Store connected users: { userId: socketId }
var connectedUsers = {};

io.on("connection", function (socket) {
  console.log("Socket connected:", socket.id);

  // When a user logs in, they register their user ID
  socket.on("register", function (userId) {
    if (userId) {
      connectedUsers[userId] = socket.id;
      console.log("User registered:", userId, "-> Socket:", socket.id);
    }
  });

  socket.on("disconnect", function () {
    // Remove user from connected list
    for (var userId in connectedUsers) {
      if (connectedUsers[userId] === socket.id) {
        delete connectedUsers[userId];
        console.log("User disconnected:", userId);
        break;
      }
    }
  });
});

// Make io accessible to routes via app
app.set("io", io);
app.set("connectedUsers", connectedUsers);

async function startServer() {
  await connectMongoDB();

  server.listen(PORT, function () {
    logger.info(
      "Server started on " + PORT + " - env=" + (process.env.NODE_ENV || "development")
    );
  });
}

startServer();