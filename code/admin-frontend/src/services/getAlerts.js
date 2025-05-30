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

// Shared state for alerts
let currentAlerts = [];
let subscribers = new Set();

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
  return alerts.some(alert => 
    alert.type === newAlert.type && 
    alert.vehicle.id === newAlert.vehicle.id &&
    alert.status !== 'resolved'
  );
};

// Function to notify all subscribers
const notifySubscribers = (alerts) => {
  currentAlerts = alerts;
  subscribers.forEach(callback => callback(alerts));
};

// Function to fetch alerts from the API (exported for manual refresh)
export const fetchAlertsFromAPI = async () => {
  try {
    const response = await api.get('/api/alerts');
    const alerts = response.data.data || [];
    notifySubscribers(alerts);
    return alerts;
  } catch (error) {
    console.error('Error fetching alerts from API:', error);
    return [];
  }
};

// Function to start polling
export const startPolling = (callback) => {
  // Add callback to subscribers
  subscribers.add(callback);
  
  // If this is the first subscriber, start polling and Firebase listener
  if (subscribers.size === 1) {
    // Initial fetch
    fetchAlertsFromAPI();
    
    // Set up polling interval
    pollingInterval = setInterval(async () => {
      try {
        await fetchAlertsFromAPI();
      } catch (error) {
        console.error('Error in polling:', error);
      }
    }, POLLING_INTERVAL);

    // Start Firebase listener for real-time alerts
    startFirebaseListener();
  } else {
    // If polling is already running, send current state to new subscriber
    callback(currentAlerts);
  }

  // Return cleanup function
  return () => {
    subscribers.delete(callback);
    if (subscribers.size === 0) {
      stopPolling();
    }
  };
};

// Function to start Firebase listener
const startFirebaseListener = async () => {
  try {
    if (activeListener) {
      off(activeListener);
      activeListener = null;
    }

    const authSuccess = await authenticateFirebase();
    if (!authSuccess) {
      console.error("Failed to authenticate with Firebase");
      return;
    }

    // Listen to all devices under the company
    const devicesRef = ref(database, 'companies/TANGALLEB001/devices');
    console.log("Setting up Firebase listener for all devices");

    activeListener = onValue(devicesRef, async (snapshot) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      debounceTimer = setTimeout(async () => {
        try {
          const devicesData = snapshot.val();
          if (!devicesData) {
            console.log("No devices data available from Firebase");
            return;
          }

          // Process each device for new alerts
          for (const [deviceId, deviceData] of Object.entries(devicesData)) {
            try {
              if (!deviceData || typeof deviceData !== 'object') {
                continue;
              }

              // Check if device is registered
              const response = await api.post('/api/vehicles/check-registration', {
                companyId: 'TANGALLEB001',
                deviceId: deviceId
              });

              const { isRegistered, vehicle } = response.data;
              if (vehicle && vehicle.status === 'active' && vehicle.trackingEnabled) {
                const potentialAlerts = [];

                // Temperature Alert
                if (deviceData.sensor?.temperature_C > (vehicle.temperatureLimit || 0)) {
                  potentialAlerts.push({
                    type: "temperature",
                    severity: "medium",
                    message: "High temperature detected",
                    vehicle: { 
                      id: deviceId, 
                      name: vehicle.vehicleName, 
                      licensePlate: vehicle.licensePlate,
                      driverId: vehicle.assignedDriver 
                    },
                    location: { lat: deviceData.gps?.latitude || 0, lng: deviceData.gps?.longitude || 0 },
                    timestamp: new Date().toISOString(),
                    status: "active",
                    details: `Temperature exceeded threshold of ${vehicle.temperatureLimit}°C. Current temperature: ${deviceData.sensor.temperature_C}°C`
                  });
                }

                // Humidity Alert
                if (deviceData.sensor && 
                    typeof deviceData.sensor.humidity === 'number' && 
                    !isNaN(deviceData.sensor.humidity) &&
                    deviceData.sensor.humidity > (vehicle.humidityLimit || 0)) {
                  console.log(`Humidity alert condition met for device ${deviceId}:`, {
                    current: deviceData.sensor.humidity,
                    limit: vehicle.humidityLimit,
                    sensorData: deviceData.sensor
                  });
                  potentialAlerts.push({
                    type: "humidity",
                    severity: "medium",
                    message: "High humidity detected",
                    vehicle: { id: deviceId, name: vehicle.vehicleName, licensePlate: vehicle.licensePlate },
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
                    !isNaN(deviceData.gps.speed_kmh) &&
                    deviceData.gps.speed_kmh > (vehicle.speedLimit || 0)) {
                  console.log(`Speed alert condition met for device ${deviceId}:`, {
                    current: deviceData.gps.speed_kmh,
                    limit: vehicle.speedLimit,
                    gpsData: deviceData.gps
                  });
                  potentialAlerts.push({
                    type: "speed",
                    severity: "low",
                    message: "Speed limit exceeded",
                    vehicle: { id: deviceId, name: vehicle.vehicleName, licensePlate: vehicle.licensePlate },
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
                  console.log(`Accident alert condition met for device ${deviceId}`);
                  potentialAlerts.push({
                    type: "accident",
                    severity: "critical",
                    message: "Accident detected!",
                    vehicle: { id: deviceId, name: vehicle.vehicleName, licensePlate: vehicle.licensePlate },
                    location: { lat: deviceData.gps?.latitude || 0, lng: deviceData.gps?.longitude || 0, address: "Colombo, Sri Lanka" },
                    timestamp: new Date().toISOString(),
                    status: "active",
                    details: "Sudden impact detected. Possible accident. Immediate attention required.",
                    triggerCondition: { impactForce: "high", airbagDeployed: true, gpsSignal: "active" }
                  });

                  // Reset Firebase flag after processing
                  const updates = {};
                  updates[`/companies/TANGALLEB001/devices/${deviceId}/accidentAlerts/accident_detected`] = false;
                  update(ref(database), updates);
                }

                // Tamper Alert
                if (deviceData.tamperingAlerts && 
                    deviceData.tamperingAlerts.tampering_detected === true) {
                  console.log(`Tampering alert condition met for device ${deviceId}`);
                  potentialAlerts.push({
                    type: "tampering",
                    severity: "high",
                    message: "Vehicle tampering detected",
                    vehicle: { id: deviceId, name: vehicle.vehicleName, licensePlate: vehicle.licensePlate },
                    location: { lat: deviceData.gps?.latitude || 0, lng: deviceData.gps?.longitude || 0, address: "Colombo, Sri Lanka" },
                    timestamp: new Date().toISOString(),
                    status: "active",
                    details: "Multiple tampering attempts detected. Security breach possible.",
                    triggerCondition: { doorOpened: true, ignitionOff: true, securitySystem: "breached" }
                  });

                  // Reset Firebase flag after processing
                  const updates = {};
                  updates[`/companies/TANGALLEB001/devices/${deviceId}/tamperingAlerts/tampering_detected`] = false;
                  update(ref(database), updates);
                }

                // Store new alerts
                for (const alert of potentialAlerts) {
                  const storedAlert = await storeAlertInHistory(alert);
                  if (storedAlert) {
                    // Fetch updated alerts after storing new one
                    await fetchAlertsFromAPI();
                  }
                }
              }
            } catch (error) {
              console.error(`Error processing device ${deviceId}:`, error);
            }
          }
        } catch (error) {
          console.error("Error processing Firebase data:", error);
        }
      }, DEBOUNCE_DELAY);
    });
  } catch (error) {
    console.error("Error setting up Firebase listener:", error);
  }
};

// Function to stop polling
export const stopPolling = () => {
  // Clear polling interval
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }

  // Clear debounce timer
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }

  // Safely remove Firebase listener
  try {
    if (activeListener) {
      const devicesRef = ref(database, 'companies/TANGALLEB001/devices');
      off(devicesRef, activeListener);
      activeListener = null;
    }
  } catch (error) {
    console.error("Error cleaning up Firebase listener:", error);
  }

  // Clear subscribers and state
  subscribers.clear();
  currentAlerts = [];
};

