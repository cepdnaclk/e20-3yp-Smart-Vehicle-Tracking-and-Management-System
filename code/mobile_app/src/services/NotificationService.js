import { api } from "./apihost";
import { DRIVER_ID } from "../config/constants";
import socketService from "./SocketService";

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

  const handleTaskEvent = (task, action) => {
    if (!task) return; // Guard against null data

    // Create notification only if this task belongs to the current driver
    if (task.driverId === DRIVER_ID) {
      const notification = createNotificationFromTask(task, action);
      onNotification(notification);
    }
  };

  // Set up direct socket handlers
  socketService.setHandlers({
    onTaskAssigned: (task) => handleTaskEvent(task, "assign"),
    onTaskUpdated: (task) => handleTaskEvent(task, "update"),
    onTaskDeleted: (task) => handleTaskEvent(task, "delete"),
    onTaskReminder: (task) => handleTaskEvent(task, "reminder"),
    onConnect: () => console.log("Notification service: Socket connected"),
    onDisconnect: () =>
      console.log("Notification service: Socket disconnected"),
    onError: (error) =>
      console.error("Notification service: Socket error:", error),
  });

  // Ensure socket is connected
  socketService.connect();

  return () => {
    // Cleanup handlers
    socketService.setHandlers({
      onTaskAssigned: null,
      onTaskUpdated: null,
      onTaskDeleted: null,
      onTaskReminder: null,
    });
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

  let title = "";
  let message = "";

  switch (action) {
    case "assign":
      title = "New Task Assigned";
      message = `You have been assigned a new delivery task (${
        task.taskNumber
      }) to ${task.delivery || "destination"}.`;
      break;
    case "update":
      title = "Task Updated";
      message = `Task ${task.taskNumber} has been updated. Please check the details.`;
      break;
    case "delete":
      title = "Task Deleted";
      message = `Task ${task.taskNumber} has been removed from your assignments.`;
      break;
    case "reminder":
      title = "Task Reminder";
      message = `Reminder: Task ${task.taskNumber} delivery is due soon.`;
      break;
    default:
      title = "Task Notification";
      message = `Notification regarding task ${task.taskNumber}.`;
  }

  console.log(
    `[Notification] Created: ${title} - ${action} for task ${task.taskNumber}`
  );

  return {
    id,
    title,
    message,
    time: now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    date: now.toLocaleDateString(),
    read: false,
    taskId: task._id,
    taskNumber: task.taskNumber,
    createdAt: now,
    action,
  };
};

export default {
  fetchNotifications,
  markNotificationAsRead,
  createNotificationFromTask,
  setupNotificationListeners,
};
