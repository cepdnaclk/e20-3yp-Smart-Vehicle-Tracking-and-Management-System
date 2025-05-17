import React, { useState, createContext, useContext, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Alert } from "react-native";
import DashboardScreen from "./screens/DashboardScreen";
import LoginScreen from "./screens/LoginScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import QRScannerScreen from "./screens/QRScannerScreen";
import SettingsScreen from "./screens/SettingsScreen";
import { TaskScreen, TaskDetailsScreen } from "./screens/TaskScreen";
import Icon from "./screens/Icon";
import { fetchTasks } from "./services/api";

// --- CONTEXT FOR GLOBAL STATE ---
const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

// --- NAVIGATION ---
const Tab = createBottomTabNavigator();
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: "#4DA6FF",
      headerStyle: { backgroundColor: "#4DA6FF" },
      headerTintColor: "white",
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="view-dashboard" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="Scan QR"
      component={QRScannerScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="qrcode-scan" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="To-Do"
      component={TaskScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="format-list-checks" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="bell" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="account-settings" color={color} size={size} />
        ),
      }}
    />
  </Tab.Navigator>
);

const Stack = createStackNavigator();

const App = () => {
  const [scannedVehicle, setScannedVehicle] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Driver ID and API URL
  const driverId = "6823449d5b6c280259c1a5aa";
  const API_URL = "http://localhost:5000/api/drivers";

  const getTasks = async () => {
    try {
      const response = await fetchTasks(driverId);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTasks();
    const interval = setInterval(getTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  const removeVehicle = () => {
    setScannedVehicle(null);
    Alert.alert(
      "Vehicle Removed",
      "Previous scanned vehicle removed. Please scan a new vehicle QR code."
    );
  };

  return (
    <AppContext.Provider
      value={{
        scannedVehicle,
        setScannedVehicle,
        completedTasks,
        setCompletedTasks,
        removeVehicle,
        tasks,
        loading,
      }}
    >
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="TaskDetails"
            component={TaskDetailsScreen}
            options={{
              title: "Delivery Task",
              headerStyle: { backgroundColor: "#4DA6FF" },
              headerTintColor: "white",
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
};

export default App;
