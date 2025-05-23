const socketIo = require("socket.io");

// Map to keep track of connected drivers and their socket IDs
const connectedDrivers = new Map();

// Socket.io setup function
const setupSocketServer = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: "*", // In production, replace with specific origins
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  // Connection handler
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Get driverId from query params
    const { driverId } = socket.handshake.query;

    if (driverId) {
      console.log(`Driver ${driverId} connected with socket ${socket.id}`);

      // Store socket ID for this driver
      connectedDrivers.set(driverId, socket.id);

      // Join driver to a specific room for targeted notifications
      socket.join(`driver-${driverId}`);
    }

    // Handle explicit room joining
    socket.on("joinDriverRoom", (driverId) => {
      if (driverId) {
        console.log(
          `Driver ${driverId} explicitly joining room driver-${driverId}`
        );
        socket.join(`driver-${driverId}`);
      }
    });

    // Test ping handler
    socket.on("test:ping", (data) => {
      console.log("Received test ping:", data);
      socket.emit("test", {
        message: "Test response from server",
        timestamp: new Date().toISOString(),
      });
    });

    // Disconnect handler
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);

      // Remove from connected drivers map
      for (const [driverId, socketId] of connectedDrivers.entries()) {
        if (socketId === socket.id) {
          console.log(`Driver ${driverId} disconnected`);
          connectedDrivers.delete(driverId);
          break;
        }
      }
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
