import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar, LogBox, Alert, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppProvider } from "./context/AppContext";
import DashboardScreen from "./screens/DashboardScreen";
import LoginScreen from "./screens/LoginScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import { TaskScreen } from "./screens/TaskScreen";
import { TaskDetailsScreen } from "./screens/TaskScreen";
import Icon from "./screens/Icon";
import { fetchTasks } from "./services/api";
import { io } from "socket.io-client";

// Ignore specific harmless warnings
LogBox.ignoreLogs([
  "VirtualizedLists should never be nested",
  "Non-serializable values were found in the navigation state",
]);

// Use simple icon implementation for web compatibility
const TabIcon = ({ name, color }) => {
  return (
    <div
      style={{
        color: color,
        fontSize: "18px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {name}
    </div>
  );
};

const Tab = createBottomTabNavigator();
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: "#4DA6FF",
      tabBarInactiveTintColor: "#999",
      headerStyle: { backgroundColor: "#4DA6FF" },
      headerTintColor: "white",
      tabBarStyle: {
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
      },
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        tabBarIcon: ({ color }) => <TabIcon name="📊" color={color} />,
      }}
    />
    <Tab.Screen
      name="Tasks"
      component={TaskScreen}
      options={{
        tabBarIcon: ({ color }) => <TabIcon name="📋" color={color} />,
      }}
    />
    <Tab.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{
        tabBarIcon: ({ color }) => <TabIcon name="🔔" color={color} />,
      }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        tabBarIcon: ({ color }) => <TabIcon name="⚙️" color={color} />,
      }}
    />
  </Tab.Navigator>
);

const Stack = createStackNavigator();

const App = () => {
  const [vehicleNumber, setVehicleNumber] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [driverId, setDriverId] = useState("DR001"); // Use state for driverId

  const socket = io("http://localhost:5000");

  const getTasks = async () => {
    try {
      const response = await fetchTasks(driverId);
      setTasks(response.data);
      const activeTask = response.data.find(
        (task) => task.status === "In Progress"
      );
      setActiveTaskId(activeTask ? activeTask._id : null);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      Alert.alert("Error", "Failed to fetch tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTasks();
    const interval = setInterval(getTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    socket.on("taskNotification", (notification) => {
      if (notification.driverId === driverId) {
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            title: notification.title,
            message: notification.message,
            time: new Date().toLocaleTimeString(),
          },
        ]);
        getTasks();
      }
    });

    return () => socket.off("taskNotification");
  }, []);

  const removeVehicle = () => {
    setVehicleNumber(null);
    Alert.alert(
      "Vehicle Removed",
      "Vehicle number removed. Please enter a new vehicle number."
    );
  };

  return (
    <AppProvider>
      {Platform.OS !== "web" && (
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      )}
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
              headerBackTitle: "Back",
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
};

export default App;
