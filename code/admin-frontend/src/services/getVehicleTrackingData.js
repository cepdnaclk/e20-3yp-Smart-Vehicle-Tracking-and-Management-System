import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from '../lib/firebase';


const database = getDatabase(app);

// This function will now listen for changes to ALL devices
export const getVehicleTrackingData = (callback) => {
  const devicesRef = ref(database, 'companies/TANGALLEB001/devices');

  const unsubscribe = onValue(devicesRef, (snapshot) => {
    try {
      const devicesData = snapshot.val();
      const devicesArray = [];

      if (devicesData) {
        // Iterate through each device ID in the snapshot
        for (const deviceId in devicesData) {
          const deviceData = devicesData[deviceId];
          
          // Extract the tracking data in the format expected by LeafletMap
          const trackingData = {
            deviceId: deviceId, // Include the device ID
            latitude: deviceData.gps?.latitude || 6.9271, // Default latitude
            longitude: deviceData.gps?.longitude || 79.8612, // Default longitude
            speed: deviceData.gps?.speed_kmh || 0,
            tampering: deviceData.tampering_detected || false, // Include tampering status
            temperature_C: deviceData.sensor?.temperature_C || 0, // Include temperature
            humidity: deviceData.sensor?.humidity || 0, // Include humidity
            timestamp: new Date().toISOString()
          };
          devicesArray.push(trackingData);
        }
      }

      // Call the callback function with the array of all devices' data
      callback(devicesArray);

    } catch (error) {
      console.error("Error processing tracking data:", error);
      // Optionally, call callback with an error indicator or empty array
      // callback([]); 
    }
  }, (error) => {
    console.error("Error reading from Firebase:", error);
    // Optionally, handle the error via the callback as well
    // callback([]);
  });

  // Return the unsubscribe function to stop listening later
  return unsubscribe;
};




