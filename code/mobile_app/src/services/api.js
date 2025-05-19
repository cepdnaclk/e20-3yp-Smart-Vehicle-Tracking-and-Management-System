import axios from "axios";
import { api } from "./apihost";

export const fetchTasks = async (driverId) => {
  return api.get(`/api/drivers/${driverId}/tasks`);
};

export const startTask = async (driverId, taskId) => {
  return api.put(`/api/drivers/${driverId}/tasks/${taskId}/start`);
};

export const completeTask = async (driverId, taskId) => {
  return api.put(`/api/drivers/${driverId}/tasks/${taskId}/complete`);
};

export const cancelTask = async (driverId, taskId) => {
  return api.put(`/api/drivers/${driverId}/tasks/${taskId}/cancel`);
};
