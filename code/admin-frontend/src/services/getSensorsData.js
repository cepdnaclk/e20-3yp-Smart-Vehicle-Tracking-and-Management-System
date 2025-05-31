import { getDatabase, ref, get } from 'firebase/database';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { app } from '../lib/firebase';  // Import the existing Firebase app instance

// Initialize Firebase services using the existing app instance
const database = getDatabase(app);
const auth = getAuth(app);

// Function to authenticate with Firebase (needed for read access)
const authenticateFirebase = async () => {
  try {
    await signInAnonymously(auth);
    // console.log("Firebase authentication successful for sensor data fetch");
    return true;
  } catch (error) {
    console.error("Firebase authentication error for sensor data fetch:", error);
    throw error;
  }
};

// Async function to fetch sensor data for a specific device by ID
export const getSensorsData = async (deviceId) => {
  try {
    if (!deviceId) {
      console.error("getSensorsData requires a deviceId");
      return null; // Return null for invalid deviceId
    }
    
    await authenticateFirebase();

    const deviceRef = ref(database, `companies/TANGALLEB001/devices/${deviceId}`);
    const snapshot = await get(deviceRef);

    if (snapshot.exists()) {
      const deviceData = snapshot.val();

      // Extract and return the relevant sensor and GPS data
      const sensorAndGpsData = {
        deviceId: deviceId, // Include deviceId in the response
          gps: {
            latitude: deviceData.gps?.latitude || 0,
            longitude: deviceData.gps?.longitude || 0,
          speed_kmh: deviceData.gps?.speed_kmh || 0,
          },
          sensor: {
            temperature_C: deviceData.sensor?.temperature_C || 0,
          humidity: deviceData.sensor?.humidity || 0,
        },
        tampering: deviceData.tampering_detected || false
        };

      return sensorAndGpsData;
    } else {
      console.log(`No data found for device ID: ${deviceId}`);
      return null; // Return null if no data exists
    }
      } catch (error) {
    console.error(`Error fetching sensor data for device ${deviceId}:`, error);
    return null; // Return null on error
      }
};

// Removed unused imports, variables, and functions related to alerts, polling, listeners, etc.

