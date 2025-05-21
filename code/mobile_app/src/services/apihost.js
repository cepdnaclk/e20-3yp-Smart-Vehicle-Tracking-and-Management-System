import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Update the base URL to match your backend server
// Use your local network IP address when testing with mobile devices
const API_URL = "http://localhost:5000";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to handle authentication
api.interceptors.request.use(
  async (config) => {
    let token;
    try {
      token = await AsyncStorage.getItem("driverToken");
    } catch (e) {
      // Fallback for web
      token = localStorage.getItem("driverToken");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API_URL;
