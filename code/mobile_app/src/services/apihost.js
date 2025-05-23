import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Determine correct base URL based on platform
let baseURL;
if (Platform.OS === "android") {
  // Android emulator needs to use special IP to reach host
  baseURL = "http://10.0.2.2:5000";
} else if (Platform.OS === "ios") {
  // iOS simulator can use localhost
  baseURL = "http://localhost:5000";
} else {
  // Web environment
  if (
    typeof window !== "undefined" &&
    window.location &&
    window.location.port === "5173"
  ) {
    // We're in Vite dev server, use relative URL to leverage the proxy
    baseURL = "";
    console.log("Using relative URL for API requests to work with Vite proxy");
  } else {
    // Regular web environment
    baseURL = "http://localhost:5000";
  }
}

// Create an axios instance with the platform-specific base URL
export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor for authentication
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("driverToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("Error setting auth token:", e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
