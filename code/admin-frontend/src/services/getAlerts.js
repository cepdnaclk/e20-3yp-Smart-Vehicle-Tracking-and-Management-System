
export const getAlerts = async () => {
  // Mock data for alerts
  const mockAlerts = [
    // Temperature Alerts (Severity: Medium)
    {
      id: "temp_1",
      type: "temperature",
      severity: "medium",
      message: "High temperature detected",
      vehicle: {
        id: "v1",
        name: "Refrigerated Truck 1",
        licensePlate: "CAT-1234"
      },
      location: {
        lat: 6.9271,
        lng: 79.8612,
        address: "Colombo, Sri Lanka"
      },
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      status: "active",
      details: "Temperature exceeded threshold of 10°C. Current temperature: 14.5°C",
      triggerCondition: {
        threshold: 10,
        currentValue: 14.5,
        unit: "°C"
      }
    },
    {
      id: "temp_2",
      type: "temperature",
      severity: "medium",
      message: "Low temperature alert",
      vehicle: {
        id: "v2",
        name: "Refrigerated Truck 2",
        licensePlate: "CAT-5678"
      },
      location: {
        lat: 6.9723,
        lng: 79.8885,
        address: "Kirulapone, Colombo"
      },
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      status: "active",
      details: "Temperature below threshold of -5°C. Current temperature: -7.2°C",
      triggerCondition: {
        threshold: -5,
        currentValue: -7.2,
        unit: "°C"
      }
    },

    // Humidity Alerts (Severity: Medium)
    {
      id: "hum_1",
      type: "humidity",
      severity: "medium",
      message: "High humidity detected",
      vehicle: {
        id: "v1",
        name: "Refrigerated Truck 1",
        licensePlate: "CAT-1234"
      },
      location: {
        lat: 6.9271,
        lng: 79.8612,
        address: "Colombo, Sri Lanka"
      },
      timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
      status: "active",
      details: "Humidity exceeded threshold of 60%. Current humidity: 72%",
      triggerCondition: {
        threshold: 60,
        currentValue: 72,
        unit: "%"
      }
    },
    {
      id: "hum_2",
      type: "humidity",
      severity: "medium",
      message: "Low humidity alert",
      vehicle: {
        id: "v2",
        name: "Refrigerated Truck 2",
        licensePlate: "CAT-5678"
      },
      location: {
        lat: 6.9723,
        lng: 79.8885,
        address: "Kirulapone, Colombo"
      },
      timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
      status: "active",
      details: "Humidity below threshold of 30%. Current humidity: 25%",
      triggerCondition: {
        threshold: 30,
        currentValue: 25,
        unit: "%"
      }
    },

    // Speed Alerts (Severity: Low)
    {
      id: "speed_1",
      type: "speed",
      severity: "low",
      message: "Speed limit exceeded",
      vehicle: {
        id: "v3",
        name: "Delivery Van 1",
        licensePlate: "CAM-8086"
      },
      location: {
        lat: 6.0535,
        lng: 80.2210,
        address: "Galle, Sri Lanka"
      },
      timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
      status: "active",
      details: "Speed exceeded limit of 80 km/h. Current speed: 95 km/h",
      triggerCondition: {
        threshold: 80,
        currentValue: 95,
        unit: "km/h"
      }
    },

    // Accident Alerts (Severity: Critical)
    {
      id: "acc_1",
      type: "accident",
      severity: "critical",
      message: "Accident detected!",
      vehicle: {
        id: "v4",
        name: "Cargo Truck 1",
        licensePlate: "CBB-7890"
      },
      location: {
        lat: 7.2906,
        lng: 80.6337,
        address: "Kandy, Sri Lanka"
      },
      timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
      status: "active",
      details: "Sudden impact detected. Possible accident. Immediate attention required.",
      triggerCondition: {
        impactForce: "high",
        airbagDeployed: true,
        gpsSignal: "active"
      }
    },

    // Tamper Alerts (Severity: High)
    {
      id: "tamp_1",
      type: "tampering",
      severity: "high",
      message: "Vehicle tampering detected",
      vehicle: {
        id: "v5",
        name: "Cargo Truck 2",
        licensePlate: "CBB-7891"
      },
      location: {
        lat: 7.4818,
        lng: 80.3609,
        address: "Kurunegala, Sri Lanka"
      },
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      status: "active",
      details: "Multiple tampering attempts detected. Security breach possible.",
      triggerCondition: {
        doorOpened: true,
        ignitionOff: true,
        securitySystem: "breached"
      }
    }
  ];

  // Return the mock alerts
  return mockAlerts;
};

// Helper function to check if an alert should be triggered based on sensor data
export const checkAlertTriggers = (sensorData) => {
  const alerts = [];

  // Temperature trigger conditions
  if (sensorData.temperature > 10) {
    alerts.push({
      type: "temperature",
      severity: "medium",
      message: "High temperature detected",
      details: `Temperature exceeded threshold of 10°C. Current temperature: ${sensorData.temperature}°C`
    });
  } else if (sensorData.temperature < -5) {
    alerts.push({
      type: "temperature",
      severity: "medium",
      message: "Low temperature detected",
      details: `Temperature below threshold of -5°C. Current temperature: ${sensorData.temperature}°C`
    });
  }

  // Humidity trigger conditions
  if (sensorData.humidity > 60) {
    alerts.push({
      type: "humidity",
      severity: "medium",
      message: "High humidity detected",
      details: `Humidity exceeded threshold of 60%. Current humidity: ${sensorData.humidity}%`
    });
  } else if (sensorData.humidity < 30) {
    alerts.push({
      type: "humidity",
      severity: "medium",
      message: "Low humidity detected",
      details: `Humidity below threshold of 30%. Current humidity: ${sensorData.humidity}%`
    });
  }

  // Speed trigger conditions
  if (sensorData.speed > 80) {
    alerts.push({
      type: "speed",
      severity: "low",
      message: "Speed limit exceeded",
      details: `Speed exceeded limit of 80 km/h. Current speed: ${sensorData.speed} km/h`
    });
  }

  // Accident trigger conditions (example: sudden deceleration)
  if (sensorData.acceleration < -20) {
    alerts.push({
      type: "accident",
      severity: "critical",
      message: "Accident detected!",
      details: "Sudden impact detected. Possible accident. Immediate attention required."
    });
  }

  // Tamper trigger conditions
  if (sensorData.tampering) {
    alerts.push({
      type: "tampering",
      severity: "high",
      message: "Vehicle tampering detected",
      details: "Multiple tampering attempts detected. Security breach possible."
    });
  }

  return alerts;
};
