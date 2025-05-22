import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../services/apihost";
import { DRIVER_ID, DRIVER_NAME } from "../config/constants";
import { createNotificationFromTask } from "../services/NotificationService";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [driverId, setDriverId] = useState(null);
  const [driverName, setDriverName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  // Simplified storage for web compatibility
  const getStorageItem = async (key) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      // Fallback for web
      return localStorage.getItem(key);
    }
  };

  const setStorageItem = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      // Fallback for web
      localStorage.setItem(key, value);
    }
  };

  // Load stored data on startup
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        // Set the centralized driver ID
        setDriverId(DRIVER_ID);

        // Try to get driver name from storage or set the default
        const storedDriverName =
          (await getStorageItem("driverName")) || DRIVER_NAME;
        setDriverName(storedDriverName);

        // Try to get vehicle number from storage
        const storedVehicleNumber = await getStorageItem("vehicleNumber");
        if (storedVehicleNumber) {
          setVehicleNumber(storedVehicleNumber);
        } else {
          // Try to get vehicle from the backend
          try {
            const response = await api.get(`/api/drivers/${DRIVER_ID}`);
            if (response.data && response.data.assignedVehicle) {
              setVehicleNumber(response.data.assignedVehicle);
              await setStorageItem(
                "vehicleNumber",
                response.data.assignedVehicle
              );
            }
          } catch (error) {
            console.error("Error fetching driver data:", error);
          }
        }

        // Fetch tasks for this driver
        try {
          const tasksResponse = await api.get(`/api/tasks/driver/${DRIVER_ID}`);
          if (tasksResponse.data && Array.isArray(tasksResponse.data)) {
            console.log(`Loaded ${tasksResponse.data.length} tasks from API`);
            setTasks(tasksResponse.data);

            // Find any active task and set activeTaskId
            const activeTask = tasksResponse.data.find(
              (t) => t.status === "In Progress"
            );
            if (activeTask) {
              setActiveTaskId(activeTask._id);
              console.log("Found active task:", activeTask.taskNumber);
            }

            // Find completed tasks
            const completed = tasksResponse.data
              .filter((t) => t.status === "Completed")
              .map((t) => t._id);
            if (completed.length > 0) {
              setCompletedTasks(completed);
              console.log(`Found ${completed.length} completed tasks`);
            }
          }
        } catch (error) {
          console.error("Error fetching tasks:", error);
          // Set dummy task for testing if needed
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading stored data:", error);
        setLoading(false);
      }
    };

    loadStoredData();
  }, []);

  const removeVehicle = async () => {
    setVehicleNumber(null);
    try {
      await AsyncStorage.removeItem("vehicleNumber");
    } catch (e) {
      localStorage.removeItem("vehicleNumber");
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("driverId");
      await AsyncStorage.removeItem("driverToken");
      await AsyncStorage.removeItem("driverName");
      await AsyncStorage.removeItem("vehicleNumber");
    } catch (e) {
      localStorage.removeItem("driverId");
      localStorage.removeItem("driverToken");
      localStorage.removeItem("driverName");
      localStorage.removeItem("vehicleNumber");
    }

    // Reset state
    setDriverId(null);
    setDriverName("");
    setVehicleNumber(null);
    setTasks([]);
    setActiveTaskId(null);
  };

  // Updated task notification handlers with better sorting and integration
  const handleTaskAssigned = (task) => {
    console.log("Task assigned notification for:", task.taskNumber);
    const notification = createNotificationFromTask(task, "assign");

    // Add to notifications
    setNotifications((prev) => [notification, ...prev]);

    // Also add to tasks list if not already present
    setTasks((prev) => {
      // Check if the task already exists
      const exists = prev.some((t) => t._id === task._id);
      if (!exists) {
        console.log("Adding new task to list:", task.taskNumber);
        return [task, ...prev];
      }
      return prev;
    });
  };

  const handleTaskUpdated = (task) => {
    console.log("Task updated notification for:", task.taskNumber);
    const notification = createNotificationFromTask(task, "update");
    setNotifications((prev) => [notification, ...prev]);
  };

  const handleTaskDeleted = (task) => {
    console.log("Task deleted notification for:", task.taskNumber);
    const notification = createNotificationFromTask(task, "delete");
    setNotifications((prev) => [notification, ...prev]);
  };

  const handleTaskReminder = (task) => {
    console.log("Task reminder notification for:", task.taskNumber);
    const notification = createNotificationFromTask(task, "reminder");
    setNotifications((prev) => [notification, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        driverId,
        setDriverId,
        driverName,
        setDriverName,
        vehicleNumber,
        setVehicleNumber,
        removeVehicle,
        tasks,
        setTasks,
        completedTasks,
        setCompletedTasks,
        loading,
        setLoading,
        notifications,
        setNotifications,
        activeTaskId,
        setActiveTaskId,
        darkMode,
        setDarkMode,
        pushNotifications,
        setPushNotifications,
        logout,
        // Add task notification handlers
        handleTaskAssigned,
        handleTaskUpdated,
        handleTaskDeleted,
        handleTaskReminder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

export default AppContext;
