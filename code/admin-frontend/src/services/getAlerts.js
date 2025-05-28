import { api } from './api';  // Import the configured API instance
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { app } from '../lib/firebase';  // Import the existing Firebase app instance

// Initialize Firebase services using the existing app instance
const database = getDatabase(app);
const auth = getAuth(app);

// Keep track of active listeners and polling interval
let activeListener = null;
let pollingInterval = null;
const POLLING_INTERVAL = 10000; // 10 seconds

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
    // Return the stored alert with its MongoDB _id
    return response.data.data;
  } catch (error) {
    console.error('Error storing alert in history:', error);
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

// Function to fetch alerts from the API
const fetchAlertsFromAPI = async () => {
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
  };
};

// Function to stop polling
export const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

export const getAlerts = async () => {
  try {
    // Clean up any existing listener
    if (activeListener) {
      off(activeListener);
      activeListener = null;
    }

    // First, get all alerts from the database
    const alerts = await fetchAlertsFromAPI();
    
    // Then authenticate with Firebase to get real-time updates
    await authenticateFirebase();
    
    // Use a Set to track unique alerts by their type and vehicle ID
    const uniqueAlerts = new Set();
    
    // Add existing alerts to the Set
    alerts.forEach(alert => {
      uniqueAlerts.add(`${alert.type}-${alert.vehicle.id}`);
    });
    
    try {
      const deviceRef = ref(database, 'companies/TANGALLEB001/devices/1');

      // Store the listener reference
      activeListener = onValue(deviceRef, async (snapshot) => {
        try {
          const deviceData = snapshot.val();
          if (!deviceData) {
            console.log("No data available from Firebase");
            return;
          }

          // Check if device is registered
          try {
            const response = await api.post('/api/vehicles/check-registration', {
              companyId: 'TANGALLEB001',
              deviceId: '1'
            });

            const { isRegistered, vehicle } = response.data;

            // Only generate alerts if the device is registered
            if (isRegistered && vehicle) {
              // Temperature Alert (Medium Severity)
              if (deviceData.sensor && 
                  typeof deviceData.sensor.temperature_C === 'number' && 
                  deviceData.sensor.temperature_C > (vehicle.temperatureLimit)) {
                const alert = {
                  type: "temperature",
                  severity: "medium",
                  message: "High temperature detected",
                  vehicle: {
                    id: '1',
                    name: vehicle.vehicleName,
                    licensePlate: vehicle.licensePlate
                  },
                  location: {
                    lat: deviceData.gps?.latitude || 0,
                    lng: deviceData.gps?.longitude || 0,
                    address: "Colombo, Sri Lanka"
                  },
                  timestamp: new Date().toISOString(),
                  status: "active",
                  details: `Temperature exceeded threshold of ${vehicle.temperatureLimit}°C. Current temperature: ${deviceData.sensor.temperature_C}°C`,
                  triggerCondition: {
                    threshold: vehicle.temperatureLimit,
                    currentValue: deviceData.sensor.temperature_C,
                    unit: "°C"
                  }
                };

                // Check if this alert type is already in the Set
                const alertKey = `${alert.type}-${alert.vehicle.id}`;
                if (!uniqueAlerts.has(alertKey)) {
                  const storedAlert = await storeAlertInHistory(alert);
                  if (storedAlert) {
                    alerts.push(storedAlert);
                    uniqueAlerts.add(alertKey);
                  }
                }
              }

              // Humidity Alert (Medium Severity)
              if (deviceData.sensor && 
                  typeof deviceData.sensor.humidity === 'number' && 
                  deviceData.sensor.humidity > (vehicle.humidityLimit)) {
                const alert = {
                  type: "humidity",
                  severity: "medium",
                  message: "High humidity detected",
                  vehicle: {
                    id: '1',
                    name: vehicle.vehicleName,
                    licensePlate: vehicle.licensePlate
                  },
                  location: {
                    lat: deviceData.gps?.latitude || 0,
                    lng: deviceData.gps?.longitude || 0,
                    address: "Colombo, Sri Lanka"
                  },
                  timestamp: new Date().toISOString(),
                  status: "active",
                  details: `Humidity exceeded threshold of ${vehicle.humidityLimit}%. Current humidity: ${deviceData.sensor.humidity}%`,
                  triggerCondition: {
                    threshold: vehicle.humidityLimit,
                    currentValue: deviceData.sensor.humidity,
                    unit: "%"
                  }
                };

                // Check if this alert type is already in the Set
                const alertKey = `${alert.type}-${alert.vehicle.id}`;
                if (!uniqueAlerts.has(alertKey)) {
                  const storedAlert = await storeAlertInHistory(alert);
                  if (storedAlert) {
                    alerts.push(storedAlert);
                    uniqueAlerts.add(alertKey);
                  }
                }
              }

              // Speed Alert (Low Severity)
              if (deviceData.gps && 
                  typeof deviceData.gps.speed_kmh === 'number' && 
                  deviceData.gps.speed_kmh > (vehicle.speedLimit)) {
                const alert = {
                  type: "speed",
                  severity: "low",
                  message: "Speed limit exceeded",
                  vehicle: {
                    id: '1',
                    name: vehicle.vehicleName,
                    licensePlate: vehicle.licensePlate
                  },
                  location: {
                    lat: deviceData.gps.latitude || 0,
                    lng: deviceData.gps.longitude || 0,
                    address: "Colombo, Sri Lanka"
                  },
                  timestamp: new Date().toISOString(),
                  status: "active",
                  details: `Speed exceeded limit of ${vehicle.speedLimit} km/h. Current speed: ${deviceData.gps.speed_kmh} km/h`,
                  triggerCondition: {
                    threshold: vehicle.speedLimit,
                    currentValue: deviceData.gps.speed_kmh,
                    unit: "km/h"
                  }
                };

                // Check if this alert type is already in the Set
                const alertKey = `${alert.type}-${alert.vehicle.id}`;
                if (!uniqueAlerts.has(alertKey)) {
                  const storedAlert = await storeAlertInHistory(alert);
                  if (storedAlert) {
                    alerts.push(storedAlert);
                    uniqueAlerts.add(alertKey);
                  }
                }
              }

              // Accident Alert (Critical Severity)
              if (deviceData.accidentAlerts && 
                  deviceData.accidentAlerts.accident_detected === true) {
                const alert = {
                  type: "accident",
                  severity: "critical",
                  message: "Accident detected!",
                  vehicle: {
                    id: '1',
                    name: vehicle.vehicleName,
                    licensePlate: vehicle.licensePlate
                  },
                  location: {
                    lat: deviceData.gps?.latitude || 0,
                    lng: deviceData.gps?.longitude || 0,
                    address: "Colombo, Sri Lanka"
                  },
                  timestamp: new Date().toISOString(),
                  status: "active",
                  details: "Sudden impact detected. Possible accident. Immediate attention required.",
                  triggerCondition: {
                    impactForce: "high",
                    airbagDeployed: true,
                    gpsSignal: "active"
                  }
                };

                // Check if this alert type is already in the Set
                const alertKey = `${alert.type}-${alert.vehicle.id}`;
                if (!uniqueAlerts.has(alertKey)) {
                  const storedAlert = await storeAlertInHistory(alert);
                  if (storedAlert) {
                    alerts.push(storedAlert);
                    uniqueAlerts.add(alertKey);
                  }
                }
              }

              // Tamper Alert (High Severity)
              if (deviceData.tamperingAlerts && 
                  deviceData.tamperingAlerts.tampering_detected === true) {
                const alert = {
                  type: "tampering",
                  severity: "high",
                  message: "Vehicle tampering detected",
                  vehicle: {
                    id: '1',
                    name: vehicle.vehicleName,
                    licensePlate: vehicle.licensePlate
                  },
                  location: {
                    lat: deviceData.gps?.latitude || 0,
                    lng: deviceData.gps?.longitude || 0,
                    address: "Colombo, Sri Lanka"
                  },
                  timestamp: new Date().toISOString(),
                  status: "active",
                  details: "Multiple tampering attempts detected. Security breach possible.",
                  triggerCondition: {
                    doorOpened: true,
                    ignitionOff: true,
                    securitySystem: "breached"
                  }
                };

                // Check if this alert type is already in the Set
                const alertKey = `${alert.type}-${alert.vehicle.id}`;
                if (!uniqueAlerts.has(alertKey)) {
                  const storedAlert = await storeAlertInHistory(alert);
                  if (storedAlert) {
                    alerts.push(storedAlert);
                    uniqueAlerts.add(alertKey);
                  }
                }
              }
            }
          } catch (error) {
            console.error(`Error checking registration for device 1:`, error);
          }
        } catch (error) {
          console.error("Error processing Firebase data:", error);
        }
      }, (error) => {
        console.error("Error reading from Firebase:", error);
      });
    } catch (error) {
      console.error("Error setting up Firebase listener:", error);
    }

    return alerts;
  } catch (error) {
    console.error("Error in getAlerts:", error);
    throw error;
  }
};

