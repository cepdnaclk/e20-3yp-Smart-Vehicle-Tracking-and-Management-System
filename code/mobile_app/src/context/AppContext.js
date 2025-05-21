import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../services/apihost";

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

  // Hardcoded driver ID to match the specific driver created in admin frontend
  const hardcodedDriverId = "DR001";

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
        // Set the hardcoded driver ID
        setDriverId(hardcodedDriverId);

        // Try to get driver name from storage or set a default
        const storedDriverName =
          (await getStorageItem("driverName")) || "sachin dulaj";
        setDriverName(storedDriverName);

        // Try to get vehicle number from storage
        const storedVehicleNumber = await getStorageItem("vehicleNumber");
        if (storedVehicleNumber) {
          setVehicleNumber(storedVehicleNumber);
        } else {
          // Try to get vehicle from the backend
          try {
            const response = await api.get(`/api/drivers/${hardcodedDriverId}`);
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
          const tasksResponse = await api.get(
            `/api/tasks/driver/${hardcodedDriverId}`
          );
          if (tasksResponse.data && Array.isArray(tasksResponse.data)) {
            setTasks(tasksResponse.data);
          }
        } catch (error) {
          console.error("Error fetching tasks:", error);
          // Set mock tasks if API call fails
          setTasks([
            {
              _id: "mockTask1",
              taskNumber: "TSK0001",
              cargoType: "Electronics",
              weight: 150,
              pickup: "Warehouse A",
              delivery: "Colombo City Center",
              deliveryPhone: "0712345678",
              expectedDelivery: new Date().toISOString(),
              status: "Pending",
              driverId: hardcodedDriverId,
            },
          ]);
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
