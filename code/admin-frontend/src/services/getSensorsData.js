// Mock function to get sensor data
export const getSensorsData = async () => {
  // Mock data matching Firebase structure
  return {
    gps: {
      latitude: 6.9271,
      longitude: 79.8612,
      speed_kmh: 45
    },
    sensor: {
      temperature_C: 29,
      humidity: 90
    }
  };
};
