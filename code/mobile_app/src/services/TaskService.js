import { api } from "./apihost";
import { DRIVER_ID } from "../config/constants";
import socketService from "./SocketService";

// Track if we've already set up task handlers
let taskHandlersSet = false;

export const fetchDriverTasks = async () => {
  try {
    const response = await api.get(`/api/tasks/driver/${DRIVER_ID}`);
    return response.data;
  } catch (error) {
    console.error("[TaskService] Error fetching tasks:", error);
    throw error;
  }
};

export const updateTaskStatus = async (taskId, status) => {
  try {
    const response = await api.patch(`/api/tasks/${taskId}/status`, { status });
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

          // Call the provided callback with the new task
          if (taskData.driverId === DRIVER_ID) {
            console.log(
              "[TaskService] Task belongs to current driver, updating UI"
            );
            onTaskUpdate("add", taskData);
          } else {
            console.log("[TaskService] Task for different driver, ignoring");
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
          if (taskData.driverId === DRIVER_ID) {
            console.log(
              "[TaskService] Task belongs to current driver, updating UI"
            );
            onTaskUpdate("update", taskData);
          } else {
            console.log("[TaskService] Task for different driver, ignoring");
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
          if (taskData.driverId === DRIVER_ID) {
            console.log(
              "[TaskService] Task belongs to current driver, updating UI"
            );
            onTaskUpdate("delete", taskData);
          } else {
            console.log("[TaskService] Task for different driver, ignoring");
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
