import io from "socket.io-client";

class SocketClient {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    const BACKEND_URL = "http://localhost:5000"; // Update as needed

    if (this.socket && this.isConnected) {
      return; // Already connected
    }

    console.log("[SocketClient] Connecting to socket server...");

    this.socket = io(BACKEND_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    this.socket.on("connect", () => {
      console.log("[SocketClient] Connected to socket server");
      this.isConnected = true;
    });

    this.socket.on("disconnect", () => {
      console.log("[SocketClient] Disconnected from socket server");
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("[SocketClient] Connection error:", error);
    });

    // Add listeners for testing and debugging
    this.socket.onAny((event, ...args) => {
      console.log(`[SocketClient] Event received: ${event}`, args);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log("[SocketClient] Manually disconnected");
    }
  }

  // Method to manually broadcast task assignment
  emitTaskAssigned(taskData) {
    if (this.isConnected) {
      console.log(
        "[SocketClient] Emitting task:assigned event",
        taskData.taskNumber
      );
      this.socket.emit("task:assigned", taskData);
      return true;
    } else {
      console.warn("[SocketClient] Cannot emit event - socket not connected");
      return false;
    }
  }
}

const socketClient = new SocketClient();

export default socketClient;
