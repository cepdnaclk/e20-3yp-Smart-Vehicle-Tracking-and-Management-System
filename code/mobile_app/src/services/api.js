import axios from "axios";

export const fetchTasks = async (driverId) => {
  return axios.get(`http://localhost:5000/api/drivers/${driverId}/tasks`);
};
