import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../services/apihost";
import { DRIVER_ID, DRIVER_NAME } from "../config/constants";
import { createNotificationFromTask } from "../services/NotificationService";
import socketService from "../services/SocketService";

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

  // Initialize socket connection early
  useEffect(() => {
    console.log("[AppContext] Setting up global socket connection");

    // Configure socket event handlers
    socketService.setHandlers({
      onTaskAssigned: (taskData) => {
        console.log(
          "[AppContext] Task assigned event received:",
          taskData.taskNumber
        );

        // Only process if task belongs to current driver
        if (taskData.driverId === DRIVER_ID) {
          // Create the notification first
          const notification = createNotificationFromTask(taskData, "assign");
          if (notification) {
            setNotifications((prev) => [notification, ...prev]);
            console.log("[AppContext] Created notification for assigned task");
          }

          // Then update the tasks list
          setTasks((prev) => {
            if (!prev.some((t) => t._id === taskData._id)) {
              console.log("[AppContext] Adding new task to global context");
              return [taskData, ...prev];
            }
            console.log("[AppContext] Task already exists in context");
            return prev;
          });
        }
      },

      onTaskUpdated: (taskData) => {
        console.log(
          "[AppContext] Task updated event received:",
          taskData.taskNumber
        );

        // Only process if task belongs to current driver
        if (taskData.driverId === DRIVER_ID) {
          // Create the notification first
          const notification = createNotificationFromTask(taskData, "update");
          if (notification) {
            setNotifications((prev) => [notification, ...prev]);
            console.log("[AppContext] Created notification for updated task");
          }

          // Then update the task in the list
          setTasks((prev) =>
            prev.map((t) => (t._id === taskData._id ? taskData : t))
          );
        }
      },

      onTaskDeleted: (taskData) => {
        console.log(
          "[AppContext] Task deleted event received:",
          taskData.taskNumber
        );

        // Only process if task belongs to current driver
        if (taskData.driverId === DRIVER_ID) {
          // Create the notification first
          const notification = createNotificationFromTask(taskData, "delete");
          if (notification) {
            setNotifications((prev) => [notification, ...prev]);
            console.log("[AppContext] Created notification for deleted task");
          }

          // Then remove the task from the list
          setTasks((prev) => prev.filter((t) => t._id !== taskData._id));
        }
      },

      onTaskReminder: (taskData) => {
        console.log(
          "[AppContext] Task reminder event received:",
          taskData.taskNumber
        );
        if (taskData.driverId === DRIVER_ID) {
          const notification = createNotificationFromTask(taskData, "reminder");
          if (notification) {
            setNotifications((prev) => [notification, ...prev]);
          }
        }
      },
      onConnect: () => {
        console.log("[AppContext] Socket connected, joining driver room");
        // Join driver-specific room
        socketService.socket?.emit("driver-connect", DRIVER_ID);
      },
      onDisconnect: () => {
        console.log("[AppContext] Socket disconnected");
      },
      onError: (error) => {
        console.error("[AppContext] Socket error:", error);
      },
    });

    // Connect to socket
    socketService.connect();

    // Test socket connection after a short delay
    setTimeout(() => {
      socketService.emitTest();
    }, 2000);

    // Cleanup on app unmount
    return () => {
      console.log("[AppContext] Cleaning up global socket connection");
      socketService.disconnect();
    };
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

export default AppContext;
