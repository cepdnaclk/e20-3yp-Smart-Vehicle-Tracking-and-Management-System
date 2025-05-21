import { api } from "./apihost";
import { DRIVER_ID } from "../config/constants";

export const fetchDriverTasks = async () => {
  try {
    const response = await api.get(`/api/tasks/driver/${DRIVER_ID}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

export const updateTaskStatus = async (taskId, status) => {
  try {
    const response = await api.put(`/api/tasks/${taskId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error("Error updating task status:", error);
    throw error;
  }
};

export const startTask = async (taskId) => {
  try {
    const response = await api.put(`/api/tasks/${taskId}/status`, {
      status: "In Progress",
    });
    return response.data;
  } catch (error) {
    console.error("Error starting task:", error);
    throw error;
  }
};

export const completeTask = async (taskId) => {
  try {
    const response = await api.put(`/api/tasks/${taskId}/status`, {
      status: "Completed",
    });
    return response.data;
  } catch (error) {
    console.error("Error completing task:", error);
    throw error;
  }
};

export default {
  fetchDriverTasks,
  updateTaskStatus,
  startTask,
  completeTask,
};
