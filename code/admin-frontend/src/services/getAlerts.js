import { api } from './api';  // Import the configured API instance
import { getDatabase, ref, onValue, off, update } from 'firebase/database';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { app } from '../lib/firebase';  // Import the existing Firebase app instance

// Initialize Firebase services using the existing app instance
const database = getDatabase(app);
const auth = getAuth(app);

// Keep track of active listeners and polling interval
let activeListener = null;
let pollingInterval = null;
const POLLING_INTERVAL = 10000; // 10 seconds

// Debounce related variables
let debounceTimer = null;
const DEBOUNCE_DELAY = 500; // Milliseconds

// Function to authenticate with Firebase
const authenticateFirebase = async () => {
  try {
    await signInAnonymously(auth);
    console.log("Firebase authentication successful");
    return true;
  } catch (error) {
    console.error("Firebase authentication error:", error);
    throw error;
  }
};

// Function to store alert in history
const storeAlertInHistory = async (alert) => {
  try {
    console.log("Attempting to store alert:", alert);
    const response = await api.post('/api/alerts', alert);
    console.log("Alert stored successfully:", response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error storing alert in history:', error);
    // If it's a duplicate key error (from unique index), it's expected, don't log as a critical error
    if (error.response && error.response.status === 500 && error.response.data?.message?.includes('duplicate key error')){
       console.log('Attempted to store duplicate active alert (blocked by DB unique index).');
    } else {
       console.error('Failed to store alert:', error);
    }
    return null;
  }
};

// Function to check if an alert of the same type exists within the last 5 minutes
const hasRecentAlert = (alerts, newAlert) => {
  // Check if there's any unresolved alert of the same type from the same company and device
  return alerts.some(alert => 
    alert.type === newAlert.type && 
    alert.vehicle.id === newAlert.vehicle.id &&
    alert.status !== 'resolved'  // Only consider unresolved alerts
  );
};

// Function to fetch alerts from the API (exported for manual refresh)
export const fetchAlertsFromAPI = async () => {
  try {
    const response = await api.get('/api/alerts');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching alerts from API:', error);
    return [];
  }
};

// Function to start polling
export const startPolling = (callback) => {
  // Clear any existing polling interval
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }

  // Initial fetch
  fetchAlertsFromAPI().then(callback);

  // Set up polling interval
  pollingInterval = setInterval(async () => {
    try {
      const alerts = await fetchAlertsFromAPI();
      callback(alerts);
    } catch (error) {
      console.error('Error in polling:', error);
    }
  }, POLLING_INTERVAL);

  return () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    // Also clear debounce timer on cleanup
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
  };
};

// Function to stop polling
export const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  // Also clear debounce timer
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
};

export const getAlerts = async (onAlertsUpdate) => {
  // getAlerts is now responsible for setting up the Firebase listener
  // The initial fetch and subsequent updates to the UI state are handled by startPolling
  // onAlertsUpdate callback is not directly used by the listener for state updates anymore

  try {
    if (activeListener) {
      off(activeListener);
      activeListener = null;
    }

    const authSuccess = await authenticateFirebase();
    if (!authSuccess) {
      console.error("Failed to authenticate with Firebase");
      return [];
    }
      
    try {
      const deviceRef = ref(database, 'companies/TANGALLEB001/devices/1');
      console.log("Setting up Firebase listener for device data");

      activeListener = onValue(deviceRef, async (snapshot) => {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(async () => {
          try {
            const deviceData = snapshot.val();
            console.log("Received device data from Firebase:", deviceData);
            
            if (!deviceData) {
              console.log("No data available from Firebase");
              return;
            }

            // Fetch the *latest* alerts from the API to check for active ones
            const latestAlerts = await fetchAlertsFromAPI();
            console.log("Latest alerts from API:", latestAlerts);

            // Check if device is registered
            try {
              const response = await api.post('/api/vehicles/check-registration', {
                companyId: 'TANGALLEB001',
                deviceId: '1'
              });

              const { isRegistered, vehicle } = response.data;
              console.log("Vehicle registration check:", { isRegistered, vehicle });

              if (isRegistered && vehicle) {
                const potentialAlerts = [];

                // Temperature Alert
                if (deviceData.sensor && 
                    typeof deviceData.sensor.temperature_C === 'number' && 
                    !isNaN(deviceData.sensor.temperature_C) &&
                    deviceData.sensor.temperature_C > (vehicle.temperatureLimit || 0)) {
                  console.log("Temperature alert condition met:", {
                    current: deviceData.sensor.temperature_C,
                    limit: vehicle.temperatureLimit,
                    sensorData: deviceData.sensor
                  });
                  potentialAlerts.push({
                    type: "temperature",
                    severity: "medium",
                    message: "High temperature detected",
                    vehicle: { id: '1', name: vehicle.vehicleName, licensePlate: vehicle.licensePlate },
                    location: { lat: deviceData.gps?.latitude || 0, lng: deviceData.gps?.longitude || 0, address: "Colombo, Sri Lanka" },
                    timestamp: new Date().toISOString(),
                    status: "active",
                    details: `Temperature exceeded threshold of ${vehicle.temperatureLimit}°C. Current temperature: ${deviceData.sensor.temperature_C}°C`,
                    triggerCondition: { threshold: vehicle.temperatureLimit, currentValue: deviceData.sensor.temperature_C, unit: "°C" }
                  });
                } else {
                  console.log("Temperature alert condition not met:", {
                    hasSensor: !!deviceData.sensor,
                    temperature: deviceData.sensor?.temperature_C,
                    limit: vehicle.temperatureLimit,
                    sensorData: deviceData.sensor
                  });
                }

                // Humidity Alert
                if (deviceData.sensor && 
                    typeof deviceData.sensor.humidity === 'number' && 
                    !isNaN(deviceData.sensor.humidity) &&
                    deviceData.sensor.humidity > (vehicle.humidityLimit || 0)) {
                  console.log("Humidity alert condition met:", {
                    current: deviceData.sensor.humidity,
                    limit: vehicle.humidityLimit,
                    sensorData: deviceData.sensor
                  });
                  potentialAlerts.push({
                    type: "humidity",
                    severity: "medium",
                    message: "High humidity detected",
                    vehicle: { id: '1', name: vehicle.vehicleName, licensePlate: vehicle.licensePlate },
                    location: { lat: deviceData.gps?.latitude || 0, lng: deviceData.gps?.longitude || 0, address: "Colombo, Sri Lanka" },
                    timestamp: new Date().toISOString(),
                    status: "active",
                    details: `Humidity exceeded threshold of ${vehicle.humidityLimit}%. Current humidity: ${deviceData.sensor.humidity}%`,
                    triggerCondition: { threshold: vehicle.humidityLimit, currentValue: deviceData.sensor.humidity, unit: "%" }
                  });
                } else {
                  console.log("Humidity alert condition not met:", {
                    hasSensor: !!deviceData.sensor,
                    humidity: deviceData.sensor?.humidity,
                    limit: vehicle.humidityLimit,
                    sensorData: deviceData.sensor
                  });
                }

                // Speed Alert
                if (deviceData.gps && 
                    typeof deviceData.gps.speed_kmh === 'number' && 
                    !isNaN(deviceData.gps.speed_kmh) &&
                    deviceData.gps.speed_kmh > (vehicle.speedLimit || 0)) {
                  console.log("Speed alert condition met:", {
                    current: deviceData.gps.speed_kmh,
                    limit: vehicle.speedLimit,
                    gpsData: deviceData.gps
                  });
                  potentialAlerts.push({
                    type: "speed",
                    severity: "low",
                    message: "Speed limit exceeded",
                    vehicle: { id: '1', name: vehicle.vehicleName, licensePlate: vehicle.licensePlate },
                    location: { lat: deviceData.gps.latitude || 0, lng: deviceData.gps.longitude || 0, address: "Colombo, Sri Lanka" },
                    timestamp: new Date().toISOString(),
                    status: "active",
                    details: `Speed exceeded limit of ${vehicle.speedLimit} km/h. Current speed: ${deviceData.gps.speed_kmh} km/h`,
                    triggerCondition: { threshold: vehicle.speedLimit, currentValue: deviceData.gps.speed_kmh, unit: "km/h" }
                  });
                } else {
                  console.log("Speed alert condition not met:", {
                    hasGps: !!deviceData.gps,
                    speed: deviceData.gps?.speed_kmh,
                    limit: vehicle.speedLimit,
                    gpsData: deviceData.gps
                  });
                }

                // Accident Alert
                if (deviceData.accidentAlerts && 
                    deviceData.accidentAlerts.accident_detected === true) {
                  potentialAlerts.push({
                  type: "accident",
                  severity: "critical",
                  message: "Accident detected!",
                    vehicle: { id: '1', name: vehicle.vehicleName, licensePlate: vehicle.licensePlate },
                    location: { lat: deviceData.gps?.latitude || 0, lng: deviceData.gps?.longitude || 0, address: "Colombo, Sri Lanka" },
                  timestamp: new Date().toISOString(),
                  status: "active",
                  details: "Sudden impact detected. Possible accident. Immediate attention required.",
                    triggerCondition: { impactForce: "high", airbagDeployed: true, gpsSignal: "active" }
                  });

                  // Reset Firebase flag after processing
                  const updates = {};
                  updates['/accidentAlerts/accident_detected'] = false;
                  update(deviceRef, updates);
              }

                // Tamper Alert
                if (deviceData.tamperingAlerts && 
                    deviceData.tamperingAlerts.tampering_detected === true) {
                  potentialAlerts.push({
                  type: "tampering",
                  severity: "high",
                  message: "Vehicle tampering detected",
                    vehicle: { id: '1', name: vehicle.vehicleName, licensePlate: vehicle.licensePlate },
                    location: { lat: deviceData.gps?.latitude || 0, lng: deviceData.gps?.longitude || 0, address: "Colombo, Sri Lanka" },
                  timestamp: new Date().toISOString(),
                  status: "active",
                  details: "Multiple tampering attempts detected. Security breach possible.",
                    triggerCondition: { doorOpened: true, ignitionOff: true, securitySystem: "breached" }
                  });

                  // Reset Firebase flag after processing
                  const updates = {};
                  updates['/tamperingAlerts/tampering_detected'] = false;
                  update(deviceRef, updates);
                }

                // Store new alerts only if no active alert of the same type/vehicle exists in the latest data
                for (const alert of potentialAlerts) {
                  console.log("Processing potential alert:", alert);
                  
                  const existingActiveAlert = latestAlerts.find(latestAlert => {
                    const isMatch = latestAlert.type === alert.type && 
                                  latestAlert.vehicle?.id === alert.vehicle?.id &&
                                  latestAlert.status === 'active';
                    console.log("Checking existing alert:", {
                      latestAlert,
                      isMatch,
                      alertType: alert.type,
                      alertVehicleId: alert.vehicle?.id
                    });
                    return isMatch;
                  });

                  if (!existingActiveAlert) {
                    console.log("No existing active alert found, storing new alert");
                    try {
                      const storedAlert = await storeAlertInHistory(alert);
                      if (storedAlert) {
                        console.log("Alert stored successfully:", storedAlert);
                      } else {
                        console.error("Failed to store alert - no response data");
                      }
                    } catch (error) {
                      console.error("Error storing alert:", error);
                    }
                  } else {
                    console.log("Skipping alert - active alert of same type exists:", existingActiveAlert);
                  }
                }
              }
            } catch (error) {
              console.error(`Error checking registration for device 1:`, error);
            }
          } catch (error) {
            console.error("Error processing Firebase data (debounced):", error);
          }
        }, DEBOUNCE_DELAY);

      }, (error) => {
        console.error("Error reading from Firebase:", error);
      });
    } catch (error) {
      console.error("Error setting up Firebase listener:", error);
    }

    // getAlerts now primarily sets up the listener. The initial data fetch and updates
    // are handled by startPolling in the component.
    // We don't need to return alerts here directly as they are managed by the polling callback.
    return []; // Return empty array or null as initial state is handled by polling

  } catch (error) {
    console.error("Error in getAlerts setup:", error);
    throw error;
  }
};

