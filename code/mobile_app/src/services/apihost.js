import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Determine correct base URL based on platform
let baseURL;
if (Platform.OS === "android") {
  // Android emulator needs to use special IP to reach host
  baseURL =
    "https://trackmasterpro-faethrezd6cvauee.southindia-01.azurewebsites.net/";
} else if (Platform.OS === "ios") {
  // iOS simulator can use localhost
  baseURL =
    "https://trackmasterpro-faethrezd6cvauee.southindia-01.azurewebsites.net/";
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
    baseURL =
      "https://trackmasterpro-faethrezd6cvauee.southindia-01.azurewebsites.net/";
  }
}

console.log("API Base URL:", baseURL);

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
      console.log("Current token:", token ? "Token exists" : "No token found");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("Request headers:", config.headers);
      } else {
        console.warn("No authentication token found for request:", config.url);
      }
    } catch (e) {
      console.error("Error setting auth token:", e);
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response) {
      // Log the full error response for debugging
      console.error("API Error Response:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config.url,
      });

      // Handle 401 errors
      if (error.response.status === 401) {
        console.log("Authentication error detected, clearing token");
        await AsyncStorage.removeItem("driverToken");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
