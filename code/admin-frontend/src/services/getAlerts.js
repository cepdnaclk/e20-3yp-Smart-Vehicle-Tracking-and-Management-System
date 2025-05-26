import { api } from './api';  // Import the configured API instance

export const getAlerts = async () => {
  // Mock data structure
  const mockData = {
    companies: {
      TANGALLEB001: {
        devices: {
          "1": {
            sensor: {
              temperature_C: 95,
              humidity: 90
            },
            gps: {
              latitude: 1.23456,
              longitude: 7.89012,
              speed_kmh: 100
            },
            accidentalerts: {
              accident_detected: true,
              timestamp: "2025-05-26T14:35:00Z"
            },
            tamperingAlerts: {
              tampering_detected: true,
              timestamp: "2025-05-26T14:40:00Z"
            }
          }
        }
      }
    }
  };

  // Generate alerts based on the data
  const alerts = [];

  // Process each company and device
  Object.entries(mockData.companies).forEach(([companyId, company]) => {
    Object.entries(company.devices).forEach(async ([deviceId, device]) => {
      // Check if both companyId and deviceId are registered in the vehicle registration system
      try {
        const response = await api.post('/api/vehicles/check-registration', {
          companyId,
          deviceId
        });

        const { isRegistered, vehicle } = response.data;

        // Only generate alerts if the device is registered
        if (isRegistered && vehicle) {
          // Temperature Alert (Medium Severity)
          if (device.sensor.temperature_C > 90) {
            alerts.push({
              id: `temp_${deviceId}`,
              type: "temperature",
              severity: "medium",
              message: "High temperature detected",
              vehicle: {
                id: deviceId,
                name: vehicle.vehicleName,
                licensePlate: vehicle.licensePlate
              },
              location: {
                lat: device.gps.latitude,
                lng: device.gps.longitude,
                address: "Colombo, Sri Lanka"
              },
              timestamp: new Date().toISOString(),
              status: "active",
              details: `Temperature exceeded threshold of 10°C. Current temperature: ${device.sensor.temperature_C}°C`,
              triggerCondition: {
                threshold: 10,
                currentValue: device.sensor.temperature_C,
                unit: "°C"
              }
            });
          }

          // Humidity Alert (Medium Severity)
          if (device.sensor.humidity > 60) {
            alerts.push({
              id: `hum_${deviceId}`,
              type: "humidity",
              severity: "medium",
              message: "High humidity detected",
              vehicle: {
                id: deviceId,
                name: vehicle.vehicleName,
                licensePlate: vehicle.licensePlate
              },
              location: {
                lat: device.gps.latitude,
                lng: device.gps.longitude,
                address: "Colombo, Sri Lanka"
              },
              timestamp: new Date().toISOString(),
              status: "active",
              details: `Humidity exceeded threshold of 60%. Current humidity: ${device.sensor.humidity}%`,
              triggerCondition: {
                threshold: 60,
                currentValue: device.sensor.humidity,
                unit: "%"
              }
            });
          }

          // Speed Alert (Low Severity)
          if (device.gps.speed_kmh > 80) {
            alerts.push({
              id: `speed_${deviceId}`,
              type: "speed",
              severity: "low",
              message: "Speed limit exceeded",
              vehicle: {
                id: deviceId,
                name: vehicle.vehicleName,
                licensePlate: vehicle.licensePlate
              },
              location: {
                lat: device.gps.latitude,
                lng: device.gps.longitude,
                address: "Colombo, Sri Lanka"
              },
              timestamp: new Date().toISOString(),
              status: "active",
              details: `Speed exceeded limit of 80 km/h. Current speed: ${device.gps.speed_kmh} km/h`,
              triggerCondition: {
                threshold: 80,
                currentValue: device.gps.speed_kmh,
                unit: "km/h"
              }
            });
          }

          // Accident Alert (Critical Severity)
          if (device.accidentalerts.accident_detected) {
            alerts.push({
              id: `acc_${deviceId}`,
              type: "accident",
              severity: "critical",
              message: "Accident detected!",
              vehicle: {
                id: deviceId,
                name: vehicle.vehicleName,
                licensePlate: vehicle.licensePlate
              },
              location: {
                lat: device.gps.latitude,
                lng: device.gps.longitude,
                address: "Colombo, Sri Lanka"
              },
              timestamp: device.accidentalerts.timestamp,
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
          if (device.tamperingAlerts.tampering_detected) {
            alerts.push({
              id: `tamp_${deviceId}`,
              type: "tampering",
              severity: "high",
              message: "Vehicle tampering detected",
              vehicle: {
                id: deviceId,
                name: vehicle.vehicleName,
                licensePlate: vehicle.licensePlate
              },
              location: {
                lat: device.gps.latitude,
                lng: device.gps.longitude,
                address: "Colombo, Sri Lanka"
              },
              timestamp: device.tamperingAlerts.timestamp,
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
        console.error(`Error checking registration for device ${deviceId}:`, error);
      }
    });
  });

  return alerts;
};

