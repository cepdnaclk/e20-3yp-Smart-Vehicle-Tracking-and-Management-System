import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from '../lib/firebase';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const database = getDatabase(app);

export const getVehicleTrackingData = async () => {
  return new Promise((resolve, reject) => {
    const deviceRef = ref(database, 'companies/TANGALLEB001/devices/1');

    onValue(deviceRef, (snapshot) => {
      try {
        const deviceData = snapshot.val();
        if (!deviceData) {
          console.log("No tracking data available");
          resolve({
            latitude: 6.9271,  // Default latitude
            longitude: 79.8612, // Default longitude
            vehicleId: '1',
            speed: 0,
            timestamp: new Date().toISOString()
          });
          return;
        }

        // Extract the tracking data in the format expected by LeafletMap
        const trackingData = {
          latitude: deviceData.gps?.latitude || 6.9271,
          longitude: deviceData.gps?.longitude || 79.8612,
          vehicleId: '1',
          speed: deviceData.gps?.speed_kmh || 0,
          timestamp: new Date().toISOString()
        };

        resolve(trackingData);
      } catch (error) {
        console.error("Error processing tracking data:", error);
        reject(error);
      }
    }, (error) => {
      console.error("Error reading from Firebase:", error);
      reject(error);
    });
  });
};




