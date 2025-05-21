import { api } from "./apihost";

// Driver authentication
export const loginDriver = async (credentials) => {
  return await api.post("/api/drivers/login", credentials);
};

// Task-related functions
export const fetchTasks = async (driverId) => {
  return await api.get(`/api/tasks/driver/${driverId}`);
};

export const startTask = async (taskId) => {
  return await api.put(`/api/tasks/${taskId}/start`);
};

export const completeTask = async (taskId, data) => {
  return await api.put(`/api/tasks/${taskId}/complete`, data);
};

export const updateTaskStatus = async (taskId, status, location) => {
  return await api.put(`/api/tasks/${taskId}/status`, { status, location });
};

// Vehicle tracking
export const updateVehicleLocation = async (driverId, location) => {
  return await api.post(`/api/drivers/${driverId}/location`, { location });
};

export const associateVehicle = async (driverId, licensePlate) => {
  return await api.put(`/api/drivers/${driverId}/vehicle`, { licensePlate });
};

// Profile management
export const getDriverProfile = async (driverId) => {
  return await api.get(`/api/drivers/${driverId}`);
};

export const updateDriverProfile = async (driverId, data) => {
  return await api.put(`/api/drivers/${driverId}`, data);
};
