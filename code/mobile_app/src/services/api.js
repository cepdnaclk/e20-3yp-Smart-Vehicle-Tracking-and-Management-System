import { api } from "./apihost";

export const fetchTasks = async (driverId) => {
  return api.get(`/api/drivers/${driverId}/tasks`);
};

export const startTask = async (driverId, taskNumber) => {
  return api.put(`/api/drivers/${driverId}/tasks/${taskNumber}`, {
    status: "In Progress",
  });
};

export const completeTask = async (driverId, taskNumber) => {
  return api.put(`/api/drivers/${driverId}/tasks/${taskNumber}`, {
    status: "Completed",
  });
};

export const cancelTask = async (driverId, taskNumber) => {
  return api.put(`/api/drivers/${driverId}/tasks/${taskNumber}`, {
    status: "Cancelled",
  });
};
