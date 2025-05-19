import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Alert } from "react-native";
import DashboardScreen from "./screens/DashboardScreen";
import LoginScreen from "./screens/LoginScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import { TaskScreen, TaskDetailsScreen } from "./screens/TaskScreen";
import Icon from "./screens/Icon";
import { fetchTasks } from "./services/api";
import { io } from "socket.io-client";
import AppContext from "./context/AppContext";

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
      name="Tasks"
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
  const [vehicleNumber, setVehicleNumber] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [driverId, setDriverId] = useState("682b34a386b8b6354fd1da0b"); // Use state for driverId

  const socket = io("http://10.0.2.2:5000");

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
    <AppContext.Provider
      value={{
        driverId, // Add driverId to context
        vehicleNumber,
        setVehicleNumber,
        completedTasks,
        setCompletedTasks,
        removeVehicle,
        tasks,
        loading,
        notifications,
        activeTaskId,
        setActiveTaskId,
        darkMode,
        setDarkMode,
        pushNotifications,
        setPushNotifications,
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
