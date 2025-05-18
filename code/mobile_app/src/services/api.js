import axios from "axios";

export const fetchTasks = async (driverId) => {
  return axios.get(`http://localhost:5000/api/drivers/${driverId}/tasks`);
};

export const startTask = async (driverId, taskId) => {
  return axios.put(
    `http://localhost:5000/api/drivers/${driverId}/tasks/${taskId}/start`
  );
};

export const completeTask = async (driverId, taskId) => {
  return axios.put(
    `http://localhost:5000/api/drivers/${driverId}/tasks/${taskId}/complete`
  );
};

export const cancelTask = async (driverId, taskId) => {
  return axios.put(
    `http://localhost:5000/api/drivers/${driverId}/tasks/${taskId}/cancel`
  );
};
