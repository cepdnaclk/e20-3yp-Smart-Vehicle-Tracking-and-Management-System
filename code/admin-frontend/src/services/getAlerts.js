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
  } catch (error) {
    console.error("Firebase authentication error:", error);
    throw error;
  }
};

// Function to store alert in history
const storeAlertInHistory = async (alert) => {
  try {
    const response = await api.post('/api/alerts', alert);
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

      await authenticateFirebase();
      
    try {
      const deviceRef = ref(database, 'companies/TANGALLEB001/devices/1');

      activeListener = onValue(deviceRef, async (snapshot) => {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(async () => {
        try {
          const deviceData = snapshot.val();
          if (!deviceData) {
              console.log("No data available from Firebase");
            return;
          }

            // Fetch the *latest* alerts from the API to check for active ones
            const latestAlerts = await fetchAlertsFromAPI();

          // Check if device is registered
          try {
            const response = await api.post('/api/vehicles/check-registration', {
              companyId: 'TANGALLEB001',
              deviceId: '1'
            });

            const { isRegistered, vehicle } = response.data;

            if (isRegistered && vehicle) {
                const potentialAlerts = [];

                // Temperature Alert
                if (deviceData.sensor && 
                    typeof deviceData.sensor.temperature_C === 'number' && 
                    deviceData.sensor.temperature_C > (vehicle.temperatureLimit)) {
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
              }

                // Humidity Alert
                if (deviceData.sensor && 
                    typeof deviceData.sensor.humidity === 'number' && 
                    deviceData.sensor.humidity > (vehicle.humidityLimit)) {
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
              }

                // Speed Alert
                if (deviceData.gps && 
                    typeof deviceData.gps.speed_kmh === 'number' && 
                    deviceData.gps.speed_kmh > (vehicle.speedLimit)) {
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
                   const existingActiveAlert = latestAlerts.find(latestAlert => 
                     latestAlert.type === alert.type && 
                     latestAlert.vehicle.id === alert.vehicle.id &&
                     latestAlert.status === 'active'
                   );

                   if (!existingActiveAlert) {
                await storeAlertInHistory(alert);
                     // The polling mechanism will fetch this new alert and update the UI.
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

