import { api } from './api';

let pollingInterval = null;
const POLLING_INTERVAL = 10000; // 10 seconds

// Function to fetch tasks from the API
const fetchTasksFromAPI = async () => {
  try {
    const response = await api.get('/api/tasks');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching tasks from API:', error);
    return [];
  }
};

// Function to fetch tasks for a specific driver
const fetchTasksForDriver = async (driverId) => {
  try {
    const response = await api.get(`/api/tasks/driver/${driverId}`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching driver tasks:', error);
    return [];
  }
};

// Function to start polling
export const startTaskPolling = (callback, driverId = null) => {
  // Clear any existing polling interval
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }

  // Initial fetch
  const initialFetch = driverId ? fetchTasksForDriver(driverId) : fetchTasksFromAPI();
  initialFetch.then(callback);

  // Set up polling interval
  pollingInterval = setInterval(async () => {
    try {
      const tasks = driverId ? await fetchTasksForDriver(driverId) : await fetchTasksFromAPI();
      callback(tasks);
    } catch (error) {
      console.error('Error in task polling:', error);
    }
  }, POLLING_INTERVAL);

  // Return cleanup function
  return () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  };
};

// Function to stop polling
export const stopTaskPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

// Function to get tasks (one-time fetch)
export const getTasks = async (driverId = null) => {
  try {
    return driverId ? await fetchTasksForDriver(driverId) : await fetchTasksFromAPI();
  } catch (error) {
    console.error('Error getting tasks:', error);
    return [];
  }
}; 