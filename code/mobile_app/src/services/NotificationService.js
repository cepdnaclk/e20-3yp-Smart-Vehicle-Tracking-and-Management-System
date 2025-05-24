import { api } from "./apihost";
import { DRIVER_ID } from "../config/constants";
import socketService from "./SocketService";

// Track notifications to prevent duplicates
let notificationCache = new Map();
let notificationHandlersSet = false;

/**
 * Service to handle notifications for the driver app
 */
export const fetchNotifications = async () => {
  try {
    // In a future implementation, you'd fetch notifications from the API
    // return await api.get(`/api/notifications/driver/${DRIVER_ID}`);

    // For now, return empty array - the notifications will be stored in the AppContext
    return [];
  } catch (error) {
    console.error("[Notification] Error fetching notifications:", error);
    return [];
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - ID of the notification to mark as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    // In a future implementation:
    // return await api.put(`/api/notifications/${notificationId}/read`);

    // For now, just return success
    console.log(`[Notification] Marked as read: ${notificationId}`);
    return { success: true };
  } catch (error) {
    console.error("[Notification] Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Set up notifications for socket events
 * @param {Function} onNotification - Callback when notification is received
 */
export const setupNotificationListeners = (onNotification) => {
  console.log("Setting up notification listeners for driver:", DRIVER_ID);

  // Use a flag to ensure we only set up handlers once
  if (notificationHandlersSet) {
    console.log("Notification handlers already set, skipping setup");
    // Still return a cleanup function
    return () => {
      console.log("Notification component unmounted");
    };
  }

  const handleTaskEvent = (task, action) => {
    if (!task) return; // Guard against null data

    // Create notification only if this task belongs to the current driver
    if (task.driverId === DRIVER_ID) {
      // Check if we've already processed a very similar notification recently
      const cacheKey = `${action}_${task._id}_${task.taskNumber}`;
      const now = Date.now();

      // Clean up old entries from cache
      notificationCache = new Map(
        Array.from(notificationCache.entries()).filter(
          ([_, timestamp]) => now - timestamp < 2000
        )
      );

      // If we've seen this notification recently, don't create another one
      if (notificationCache.has(cacheKey)) {
        console.log(
          `[NotificationService] Skipping duplicate notification: ${cacheKey}`
        );
        return;
      }

      // Add to cache to prevent duplicates
      notificationCache.set(cacheKey, now);

      // Create and send the notification
      const notification = createNotificationFromTask(task, action);
      if (notification) {
        console.log(
          `[NotificationService] Creating notification for ${action}:`,
          notification
        );
        onNotification(notification);
      }
    }
  };

  // Set up direct socket handlers
  socketService.setHandlers({
    onTaskAssigned: (task) => handleTaskEvent(task, "assign"),
    onTaskUpdated: (task) => handleTaskEvent(task, "update"),
    onTaskDeleted: (task) => handleTaskEvent(task, "delete"),
    onTaskReminder: (task) => handleTaskEvent(task, "reminder"),
    onConnect: () => {
      console.log("Notification service: Socket connected");
      // Join driver-specific room
      socketService.socket?.emit("driver-connect", DRIVER_ID);
    },
    onDisconnect: () =>
      console.log("Notification service: Socket disconnected"),
    onError: (error) =>
      console.error("Notification service: Socket error:", error),
  });

  // Mark that we've set up handlers
  notificationHandlersSet = true;

  // Ensure socket is connected
  socketService.connect();

  return () => {
    // Don't reset the handlers, just log that component unmounted
    console.log("Notification component unmounted, keeping handlers active");
  };
};

/**
 * Create a notification from task event for real-time notifications
 */
export const createNotificationFromTask = (task, action) => {
  if (!task || !task.taskNumber) {
    console.error(
      "[Notification] Cannot create notification: Invalid task data"
    );
    return null;
  }

  const now = new Date();
  const id = `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  // Format time and date
  const timeString = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const dateString = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  let title,
    message,
    type = "info";

  switch (action) {
    case "assign":
      title = "New Task Assigned";
      message = `Task ${task.taskNumber} has been assigned to you`;
      type = "success";
      break;
    case "update":
      title = "Task Updated";
      message = `Task ${task.taskNumber} has been updated`;
      type = "info";
      break;
    case "delete":
      title = "Task Cancelled";
      message = `Task ${task.taskNumber} has been cancelled`;
      type = "warning";
      break;
    case "reminder":
      title = "Task Reminder";
      message = `Don't forget about task ${task.taskNumber}`;
      type = "warning";
      break;
    default:
      title = "Task Notification";
      message = `Task ${task.taskNumber} notification`;
  }

  return {
    id,
    title,
    message,
    type,
    action,
    time: timeString, // Formatted time string
    date: dateString, // Formatted date string
    timestamp: now.toISOString(), // Keep original timestamp for sorting
    taskId: task._id,
    taskNumber: task.taskNumber,
    read: false,
  };
};

export default {
  fetchNotifications,
  markNotificationAsRead,
  createNotificationFromTask,
  setupNotificationListeners,
};
