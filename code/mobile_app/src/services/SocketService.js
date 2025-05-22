import { io } from "socket.io-client";
import { DRIVER_ID } from "../config/constants";
import { Platform } from "react-native";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.handlers = {
      onTaskAssigned: null,
      onTaskUpdated: null,
      onTaskDeleted: null,
      onTaskReminder: null,
      onConnect: null,
      onDisconnect: null,
      onError: null,
    };
  }

  connect() {
    // Use different URLs for Android emulator vs iOS simulator
    let apiUrl;
    if (Platform.OS === "android") {
      // Android emulator sees localhost as the emulator itself, not the host machine
      apiUrl = "http://10.0.2.2:5000";
    } else if (Platform.OS === "ios") {
      // iOS simulator can use localhost which maps to the host
      apiUrl = "http://localhost:5000";
    } else {
      // Web or other platforms
      apiUrl = "http://localhost:5000";
    }

    if (this.socket) {
      // Socket already connected or attempting to connect
      return;
    }

    console.log("Attempting to connect to socket server at:", apiUrl);

    this.socket = io(apiUrl, {
      transports: ["websocket", "polling"], // Allow fallback to polling if websocket fails
      query: { driverId: DRIVER_ID },
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected successfully");
      this.isConnected = true;
      if (this.handlers.onConnect) this.handlers.onConnect();
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
      this.isConnected = false;
      if (this.handlers.onDisconnect) this.handlers.onDisconnect();
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
      if (this.handlers.onError) this.handlers.onError(error);
    });

    // Task event listeners
    this.socket.on("task:assigned", (taskData) => {
      console.log("Task assigned event received:", taskData);
      if (this.handlers.onTaskAssigned && taskData.driverId === DRIVER_ID) {
        this.handlers.onTaskAssigned(taskData);
      }
    });

    this.socket.on("task:updated", (taskData) => {
      console.log("Task updated event received:", taskData);
      if (this.handlers.onTaskUpdated && taskData.driverId === DRIVER_ID) {
        this.handlers.onTaskUpdated(taskData);
      }
    });

    this.socket.on("task:deleted", (taskData) => {
      console.log("Task deleted event received:", taskData);
      if (this.handlers.onTaskDeleted && taskData.driverId === DRIVER_ID) {
        this.handlers.onTaskDeleted(taskData);
      }
    });

    this.socket.on("task:reminder", (taskData) => {
      console.log("Task reminder event received:", taskData);
      if (this.handlers.onTaskReminder && taskData.driverId === DRIVER_ID) {
        this.handlers.onTaskReminder(taskData);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  setHandlers(handlers) {
    this.handlers = { ...this.handlers, ...handlers };
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;
