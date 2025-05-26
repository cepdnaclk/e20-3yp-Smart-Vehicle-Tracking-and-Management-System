import { api } from "./apihost";
import {
  DRIVER_ID,
  COMPANY_ID,
  initializeFromStorage,
  logTaskOwnership,
} from "../config/constants";
import socketService from "./SocketService";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Track if we've already set up task handlers
let taskHandlersSet = false;

export const fetchDriverTasks = async () => {
  try {
    // Ensure constants are up to date
    await initializeFromStorage();

    // Verify we have a valid token
    const token = await AsyncStorage.getItem("driverToken");
    if (!token) {
      console.error("[TaskService] No authentication token found");
      throw new Error("Authentication token not found. Please log in again.");
    }

    console.log(
      `[TaskService] Fetching tasks for driver=${DRIVER_ID}, company=${COMPANY_ID}`
    );

    // Include companyId in the query parameters
    const response = await api.get(`/api/tasks/driver/${DRIVER_ID}`, {
      params: { companyId: COMPANY_ID },
    });

    if (response.data && Array.isArray(response.data)) {
      console.log(
        `[TaskService] Successfully fetched ${response.data.length} tasks for driver=${DRIVER_ID}, company=${COMPANY_ID}`
      );

      // Log ownership for each task
      response.data.forEach((task) => {
        logTaskOwnership(task);
      });

      return response.data;
    } else {
      console.warn(
        "[TaskService] Invalid response format, returning empty array"
      );
      return [];
    }
  } catch (error) {
    console.error("[TaskService] Error fetching tasks:", error);

    // Handle specific error cases
    if (error.response) {
      if (error.response.status === 401) {
        console.error("[TaskService] Authentication error - token may be invalid or expired");
        // Clear invalid token
        await AsyncStorage.removeItem("driverToken");
        throw new Error("Session expired. Please log in again.");
      }
      console.error(
        "[TaskService] Server responded with:",
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      console.error("[TaskService] Network error - no response received");
    } else {
      console.error("[TaskService] Request setup error:", error.message);
    }

    throw error;
  }
};

export const updateTaskStatus = async (taskId, status) => {
  try {
    // Ensure constants are up to date
    await initializeFromStorage();

    console.log(
      `[TaskService] Updating task ${taskId} status to ${status} for driver=${DRIVER_ID}, company=${COMPANY_ID}`
    );

    // Include companyId in the request body
    const response = await api.patch(`/api/tasks/${taskId}/status`, {
      status,
      companyId: COMPANY_ID, // Add companyId to all task updates
    });

    // Log ownership of the updated task
    if (response.data) {
      logTaskOwnership(response.data);
    }

    return response.data;
  } catch (error) {
    console.error("[TaskService] Error updating task status:", error);
    throw error;
  }
};

export const startTask = async (taskId) => {
  try {
    return await updateTaskStatus(taskId, "In Progress");
  } catch (error) {
    console.error("[TaskService] Error starting task:", error);
    throw error;
  }
};

export const completeTask = async (taskId) => {
  try {
    return await updateTaskStatus(taskId, "Completed");
  } catch (error) {
    console.error("[TaskService] Error completing task:", error);
    throw error;
  }
};

// Register a task listener for real-time updates with better error handling
export const subscribeToTaskUpdates = (onTaskUpdate) => {
  console.log(
    "[TaskService] Setting up task update subscription for driver:",
    DRIVER_ID
  );

  // Only set handlers if not already set
  if (!taskHandlersSet) {
    console.log("[TaskService] First subscription, setting handlers");

    // Configure socket handlers to update tasks in real-time
    socketService.setHandlers({
      onTaskAssigned: (taskData) => {
        try {
          console.log("[TaskService] New task assigned:", taskData.taskNumber);

          // Log ownership information
          logTaskOwnership(taskData);

          // Check both driverId and companyId match for compound key filtering
          if (
            taskData.driverId === DRIVER_ID &&
            taskData.companyId === COMPANY_ID
          ) {
            console.log(
              "[TaskService] Task belongs to current driver and company, updating UI"
            );
            onTaskUpdate("add", taskData);
          } else {
            console.log(
              "[TaskService] Task NOT for current driver or company, ignoring"
            );
          }
        } catch (err) {
          console.error(
            "[TaskService] Error handling task assigned event:",
            err
          );
        }
      },

      onTaskUpdated: (taskData) => {
        try {
          console.log("[TaskService] Task updated:", taskData.taskNumber);

          // Log ownership information
          logTaskOwnership(taskData);

          // Check both driverId and companyId match for compound key filtering
          if (
            taskData.driverId === DRIVER_ID &&
            taskData.companyId === COMPANY_ID
          ) {
            console.log(
              "[TaskService] Task belongs to current driver and company, updating UI"
            );
            onTaskUpdate("update", taskData);
          } else {
            console.log(
              "[TaskService] Task NOT for current driver or company, ignoring"
            );
          }
        } catch (err) {
          console.error(
            "[TaskService] Error handling task updated event:",
            err
          );
        }
      },

      onTaskDeleted: (taskData) => {
        try {
          console.log("[TaskService] Task deleted:", taskData.taskNumber);

          // Log ownership information
          logTaskOwnership(taskData);

          // Check both driverId and companyId match for compound key filtering
          if (
            taskData.driverId === DRIVER_ID &&
            taskData.companyId === COMPANY_ID
          ) {
            console.log(
              "[TaskService] Task belongs to current driver and company, updating UI"
            );
            onTaskUpdate("delete", taskData);
          } else {
            console.log(
              "[TaskService] Task NOT for current driver or company, ignoring"
            );
          }
        } catch (err) {
          console.error(
            "[TaskService] Error handling task deleted event:",
            err
          );
        }
      },

      onConnect: () => {
        console.log("[TaskService] Socket connected, joining driver room");
        // Join driver-specific room
        socketService.socket?.emit("driver-connect", DRIVER_ID);
      },
      onDisconnect: () => {
        console.log("[TaskService] Socket disconnected");
      },
      onError: (error) => {
        console.error("[TaskService] Socket error:", error);
      },
    });

    taskHandlersSet = true;
  } else {
    console.log(
      "[TaskService] Handlers already set, using existing subscription"
    );
  }

  // Ensure socket is connected
  socketService.connect();

  return () => {
    console.log(
      "[TaskService] Component unmounted, but keeping subscription active"
    );
    // We don't clear handlers to keep socket events working
  };
};

export default {
  fetchDriverTasks,
  updateTaskStatus,
  startTask,
  completeTask,
  subscribeToTaskUpdates,
};
