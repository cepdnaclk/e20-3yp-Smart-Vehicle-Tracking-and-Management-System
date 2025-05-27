import { api } from './api';  // Import the configured API instance
import { getDatabase, ref, onValue } from 'firebase/database';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { app } from '../lib/firebase';  // Import the existing Firebase app instance

// Initialize Firebase services using the existing app instance
const database = getDatabase(app);
const auth = getAuth(app);

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

export const getAlerts = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      // Authenticate first
      await authenticateFirebase();
      
      const alerts = [];
      const deviceRef = ref(database, 'companies/TANGALLEB001/devices/1');

      onValue(deviceRef, async (snapshot) => {
        try {
          const deviceData = snapshot.val();
          if (!deviceData) {
            console.log("No data available");
            resolve([]);
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
              if (deviceData.sensor?.temperature_C > (vehicle.temperatureLimit)) {
                alerts.push({
                  id: `temp_1`,
                  type: "temperature",
                  severity: "medium",
                  message: "High temperature detected",
                  vehicle: {
                    id: '1',
                    name: vehicle.vehicleName,
                    licensePlate: vehicle.licensePlate
                  },
                  location: {
                    lat: deviceData.gps?.latitude,
                    lng: deviceData.gps?.longitude,
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
                });
              }

              // Humidity Alert (Medium Severity)
              if (deviceData.sensor?.humidity > (vehicle.humidityLimit)) {
                alerts.push({
                  id: `hum_1`,
                  type: "humidity",
                  severity: "medium",
                  message: "High humidity detected",
                  vehicle: {
                    id: '1',
                    name: vehicle.vehicleName,
                    licensePlate: vehicle.licensePlate
                  },
                  location: {
                    lat: deviceData.gps?.latitude,
                    lng: deviceData.gps?.longitude,
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
                });
              }

              // Speed Alert (Low Severity)
              if (deviceData.gps?.speed_kmh > (vehicle.speedLimit)) {
                alerts.push({
                  id: `speed_1`,
                  type: "speed",
                  severity: "low",
                  message: "Speed limit exceeded",
                  vehicle: {
                    id: '1',
                    name: vehicle.vehicleName,
                    licensePlate: vehicle.licensePlate
                  },
                  location: {
                    lat: deviceData.gps?.latitude,
                    lng: deviceData.gps?.longitude,
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
                });
              }

              // Accident Alert (Critical Severity)
              if (deviceData.accidentAlerts?.accident_detected) {
                alerts.push({
                  id: `acc_1`,
                  type: "accident",
                  severity: "critical",
                  message: "Accident detected!",
                  vehicle: {
                    id: '1',
                    name: vehicle.vehicleName,
                    licensePlate: vehicle.licensePlate
                  },
                  location: {
                    lat: deviceData.gps?.latitude,
                    lng: deviceData.gps?.longitude,
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
                });
              }

              // Tamper Alert (High Severity)
              if (deviceData.tamperingAlerts?.tampering_detected) {
                alerts.push({
                  id: `tamp_1`,
                  type: "tampering",
                  severity: "high",
                  message: "Vehicle tampering detected",
                  vehicle: {
                    id: '1',
                    name: vehicle.vehicleName,
                    licensePlate: vehicle.licensePlate
                  },
                  location: {
                    lat: deviceData.gps?.latitude,
                    lng: deviceData.gps?.longitude,
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
                });
              }
            }
          } catch (error) {
            console.error(`Error checking registration for device 1:`, error);
          }

          resolve(alerts);
        } catch (error) {
          console.error("Error processing Firebase data:", error);
          reject(error);
        }
      }, (error) => {
        console.error("Error reading from Firebase:", error);
        reject(error);
      });
    } catch (error) {
      console.error("Error in getAlerts:", error);
      reject(error);
    }
  });
};

