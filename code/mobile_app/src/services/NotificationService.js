import { api } from "./apihost";
import { DRIVER_ID } from "../config/constants";

/**
 * Service to handle notifications for the driver app
 */
export const fetchNotifications = async () => {
  try {
    // We'll get notifications from local state instead of an API call
    // until the backend implements notification storage
    return [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - ID of the notification to mark as read
 */
export const markNotificationAsRead = async (notificationId) => {
  // This would store the read status in the future when backend supports it
  return { success: true };
};

/**
 * Create a notification from task event for real-time notifications
 */
export const createNotificationFromTask = (task, action) => {
  const now = new Date();

  let title = "";
  let message = "";

  switch (action) {
    case "assign":
      title = "New Task Assigned";
      message = `You have been assigned a new delivery task (${task.taskNumber}) to ${task.delivery}.`;
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

  return {
    id: `notif_${Date.now()}`,
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
  };
};

export default {
  fetchNotifications,
  markNotificationAsRead,
  createNotificationFromTask,
};
