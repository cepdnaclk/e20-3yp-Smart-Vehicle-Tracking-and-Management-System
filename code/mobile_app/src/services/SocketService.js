import { io } from "socket.io-client";
import { DRIVER_ID } from "../config/constants";
import { Platform } from "react-native";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 5;
    this.handlers = {
      onTaskAssigned: null,
      onTaskUpdated: null,
      onTaskDeleted: null,
      onTaskReminder: null,
      onConnect: null,
      onDisconnect: null,
      onError: null,
    };

    // Track which events have been processed to prevent duplicates
    this.processedEvents = new Map();
  }

  connect() {
    // Different URL based on platform
    let apiUrl;
    if (Platform.OS === "android") {
      // Android emulator uses 10.0.2.2 to access host machine
      apiUrl = "http://10.0.2.2:5000";
    } else if (Platform.OS === "ios") {
      // iOS simulator can use localhost
      apiUrl = "http://localhost:5000";
    } else {
      // Web fallback
      apiUrl = "http://localhost:5000";
    }

    if (this.socket && this.isConnected) {
      console.log("Socket already connected, not creating new connection");
      return;
    }

    if (this.connectionAttempts >= this.maxConnectionAttempts) {
      console.error(
        `Max connection attempts (${this.maxConnectionAttempts}) reached. Giving up.`
      );
      return;
    }

    console.log(
      `[SocketService] Connecting to ${apiUrl} for driver ${DRIVER_ID} (Attempt ${
        this.connectionAttempts + 1
      })`
    );

    try {
      // More robust socket configuration
      this.socket = io(apiUrl, {
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 10000,
        query: { driverId: DRIVER_ID },
        transports: ["websocket", "polling"],
      });

      // Debug all socket events in development
      this.socket.onAny((event, ...args) => {
        console.log(`[SocketService] Event received: ${event}`, args);
      });

      this.socket.on("connect", () => {
        console.log(`[SocketService] Connected! Socket ID: ${this.socket.id}`);
        this.isConnected = true;
        this.connectionAttempts = 0;

        // Join a driver-specific room
        this.socket.emit("joinDriverRoom", DRIVER_ID);
        console.log(`[SocketService] Joined room driver-${DRIVER_ID}`);

        if (this.handlers.onConnect) {
          this.handlers.onConnect();
        }
      });

      this.socket.on("connect_error", (error) => {
        console.error(`[SocketService] Connection error:`, error.message);
        this.connectionAttempts++;

        if (this.connectionAttempts >= this.maxConnectionAttempts) {
          console.error(
            `[SocketService] Max connection attempts reached. Will not retry.`
          );
        } else {
          console.log(
            `[SocketService] Will retry connection (${this.connectionAttempts}/${this.maxConnectionAttempts})`
          );
        }
      });

      this.socket.on("disconnect", (reason) => {
        console.log(`[SocketService] Disconnected! Reason: ${reason}`);
        this.isConnected = false;

        if (this.handlers.onDisconnect) {
          this.handlers.onDisconnect(reason);
        }
      });

      // Task events with deduplication
      this.socket.on("task:assigned", (taskData) => {
        console.log(`[SocketService] Task assigned event received:`, taskData);

        // Check if we've already processed this event
        const eventId = `assign_${taskData._id}_${Date.now()}`;
        if (this.isDuplicateEvent(eventId)) return;

        // Process the event
        if (
          taskData &&
          taskData.driverId === DRIVER_ID &&
          this.handlers.onTaskAssigned
        ) {
          console.log(
            `[SocketService] Processing task assigned event for ${taskData.taskNumber}`
          );
          this.handlers.onTaskAssigned(taskData);
        }
      });

      this.socket.on("task:updated", (taskData) => {
        console.log(`[SocketService] Task updated event received`);

        // Check if we've already processed this event
        const eventId = `update_${taskData._id}_${Date.now()}`;
        if (this.isDuplicateEvent(eventId)) return;

        if (
          taskData &&
          taskData.driverId === DRIVER_ID &&
          this.handlers.onTaskUpdated
        ) {
          this.handlers.onTaskUpdated(taskData);
        }
      });

      this.socket.on("task:deleted", (taskData) => {
        console.log(`[SocketService] Task deleted event received`);

        // Check if we've already processed this event
        const eventId = `delete_${taskData._id}_${Date.now()}`;
        if (this.isDuplicateEvent(eventId)) return;

        if (
          taskData &&
          taskData.driverId === DRIVER_ID &&
          this.handlers.onTaskDeleted
        ) {
          this.handlers.onTaskDeleted(taskData);
        }
      });

      this.socket.on("task:reminder", (taskData) => {
        console.log(`[SocketService] Task reminder event received`);

        // Check if we've already processed this event
        const eventId = `reminder_${taskData._id}_${Date.now()}`;
        if (this.isDuplicateEvent(eventId)) return;

        if (
          taskData &&
          taskData.driverId === DRIVER_ID &&
          this.handlers.onTaskReminder
        ) {
          this.handlers.onTaskReminder(taskData);
        }
      });

      // Test event
      this.socket.on("test", (data) => {
        console.log(`[SocketService] Test event received:`, data);
      });

      this.socket.on("error", (error) => {
        console.error(`[SocketService] Socket error:`, error);

        if (this.handlers.onError) {
          this.handlers.onError(error);
        }
      });
    } catch (err) {
      console.error(`[SocketService] Error initializing socket:`, err);
    }
  }

  // Method to check for duplicate events
  isDuplicateEvent(eventId) {
    // Check if we've seen this event in the last second
    const now = Date.now();
    const recentEvents = Array.from(this.processedEvents.entries()).filter(
      ([_, timestamp]) => now - timestamp < 1000
    );

    // Clean up old events
    this.processedEvents = new Map(recentEvents);

    // Check if this event is a duplicate
    if (this.processedEvents.has(eventId)) {
      console.log(`[SocketService] Duplicate event detected: ${eventId}`);
      return true;
    }

    // Record this event
    this.processedEvents.set(eventId, now);
    return false;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log(`[SocketService] Socket disconnected manually`);
    }
  }

  setHandlers(handlers) {
    this.handlers = { ...this.handlers, ...handlers };
  }

  // Test ping method to check connection
  emitTest() {
    if (this.socket && this.isConnected) {
      console.log(`[SocketService] Sending test ping...`);
      this.socket.emit("test:ping", {
        driverId: DRIVER_ID,
        timestamp: new Date().toISOString(),
      });
      return true;
    } else {
      console.log(
        `[SocketService] Cannot send test ping - socket not connected`
      );
      return false;
    }
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;
