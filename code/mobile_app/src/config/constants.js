/**
 * Application-wide constants
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define dynamic constants with default empty values
export let DRIVER_ID = "";
export let DRIVER_NAME = "";
export let COMPANY_ID = "";

// API configuration
export const API_TIMEOUT = 10000; // 10 seconds

// Function to update constants at runtime
export const updateConstants = (driverId, driverName, companyId) => {
  if (driverId) DRIVER_ID = driverId;
  if (driverName) DRIVER_NAME = driverName;
  if (companyId) COMPANY_ID = companyId;

  console.log(
    `Constants updated: DRIVER_ID=${DRIVER_ID}, DRIVER_NAME=${DRIVER_NAME}, COMPANY_ID=${COMPANY_ID}`
  );
};

// Function to initialize constants from storage
export const initializeFromStorage = async () => {
  try {
    const storedDriverId = await AsyncStorage.getItem("driverId");
    const storedDriverName = await AsyncStorage.getItem("driverName");
    const storedCompanyId = await AsyncStorage.getItem("companyId");

    updateConstants(
      storedDriverId || DRIVER_ID,
      storedDriverName || DRIVER_NAME,
      storedCompanyId || COMPANY_ID
    );

    return {
      driverId: DRIVER_ID,
      driverName: DRIVER_NAME,
      companyId: COMPANY_ID,
    };
  } catch (error) {
    console.error("Error initializing constants from storage:", error);
    return {
      driverId: DRIVER_ID,
      driverName: DRIVER_NAME,
      companyId: COMPANY_ID,
    };
  }
};

// Log helper function to track task ownership
export const logTaskOwnership = (task) => {
  if (!task) {
    console.log("Cannot log ownership for undefined task");
    return;
  }

  console.log(
    `Task ${task.taskNumber || task._id} belongs to: DRIVER_ID=${
      task.driverId
    }, COMPANY_ID=${task.companyId}`
  );

  // Compare with current user's information
  if (task.driverId === DRIVER_ID && task.companyId === COMPANY_ID) {
    console.log(
      `✅ Task belongs to current user (DRIVER_ID=${DRIVER_ID}, COMPANY_ID=${COMPANY_ID})`
    );
  } else {
    console.log(
      `❌ Task does NOT belong to current user (DRIVER_ID=${DRIVER_ID}, COMPANY_ID=${COMPANY_ID})`
    );
  }
};

// Initialize constants right away
initializeFromStorage().catch((err) => {
  console.error("Failed to initialize constants:", err);
});
