import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from '../lib/firebase';

const database = getDatabase(app);

export const getSensorsData = async () => {
  return new Promise((resolve, reject) => {
    const deviceRef = ref(database, 'companies/TANGALLEB001/devices/1');

    onValue(deviceRef, (snapshot) => {
      try {
        const deviceData = snapshot.val();
        if (!deviceData) {
          console.log("No sensor data available");
          resolve({
            gps: {
              latitude: 0,
              longitude: 0,
              speed_kmh: 0
            },
            sensor: {
              temperature_C: 0,
              humidity: 0
            }
          });
          return;
        }

        // Extract the relevant sensor data
        const sensorData = {
          gps: {
            latitude: deviceData.gps?.latitude || 0,
            longitude: deviceData.gps?.longitude || 0,
            speed_kmh: deviceData.gps?.speed_kmh || 0
          },
          sensor: {
            temperature_C: deviceData.sensor?.temperature_C || 0,
            humidity: deviceData.sensor?.humidity || 0
          }
        };

        resolve(sensorData);
      } catch (error) {
        console.error("Error processing sensor data:", error);
        reject(error);
      }
    }, (error) => {
      console.error("Error reading from Firebase:", error);
      reject(error);
    });
  });
};
