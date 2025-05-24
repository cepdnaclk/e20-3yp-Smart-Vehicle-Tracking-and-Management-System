const socketIo = require("socket.io");

// Map to track connected drivers by their ID
const connectedDrivers = new Map();
let io;

// Socket.io setup function
const setupSocketServer = (server) => {
  // Initialize socket.io
  io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Socket connection handling
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Handle driver connection
    socket.on("driver-connect", (driverId) => {
      console.log(`Driver ${driverId} connected with socket ${socket.id}`);
      connectedDrivers.set(driverId, socket.id);
      socket.join(`driver-${driverId}`);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      // Remove from connected drivers map
      for (const [driverId, socketId] of connectedDrivers.entries()) {
        if (socketId === socket.id) {
          connectedDrivers.delete(driverId);
          console.log(`Driver ${driverId} disconnected`);
          break;
        }
      }
    });

    // Handle test events
    socket.on("test", () => {
      console.log("Test event received from:", socket.id);
      socket.emit("test-response", { message: "Test successful" });
    });
  });

  // Utility method to emit task events
  const emitTaskEvent = (eventType, taskData) => {
    console.log(
      `Emitting ${eventType} event for task:`,
      taskData.taskNumber || "unknown task"
    );

    if (taskData && taskData.driverId) {
      // Emit to specific driver's room
      io.to(`driver-${taskData.driverId}`).emit(eventType, taskData);
      console.log(`Event sent to driver-${taskData.driverId} room`);

      // Also try by socket ID if available
      const socketId = connectedDrivers.get(taskData.driverId);
      if (socketId) {
        io.to(socketId).emit(eventType, taskData);
        console.log(`Event also sent directly to socket ${socketId}`);
      }

      // Also broadcast to all sockets to ensure delivery
      io.emit(eventType, taskData);
      console.log("Event broadcast to all clients as failsafe");
    } else {
      // Fallback: broadcast to all
      io.emit(eventType, taskData);
      console.log("Event broadcast to all clients (no specific driver)");
    }
  };

  // API for emitting events from elsewhere in the application
  return {
    io,
    emitTaskAssigned: (taskData) => emitTaskEvent("task:assigned", taskData),
    emitTaskUpdated: (taskData) => emitTaskEvent("task:updated", taskData),
    emitTaskDeleted: (taskData) => emitTaskEvent("task:deleted", taskData),
    emitTaskReminder: (taskData) => emitTaskEvent("task:reminder", taskData),
    getConnectedDrivers: () => Array.from(connectedDrivers.keys()),
  };
};

module.exports = setupSocketServer;
