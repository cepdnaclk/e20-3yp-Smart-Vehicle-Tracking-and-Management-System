import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar, LogBox, View, Text } from "react-native";

import { AppProvider, useAppContext } from "./context/AppContext";
import { SocketProvider } from "./context/SocketContext";
import DashboardScreen from "./screens/DashboardScreen";
import LoginScreen from "./screens/LoginScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import { TaskScreen } from "./screens/TaskScreen";
import TaskDetailsScreen from "./screens/TaskDetailsScreen";
import socketService from "./services/SocketService";
import Icon from "./screens/Icon";

// Ignore specific harmless warnings
LogBox.ignoreLogs([
  "VirtualizedLists should never be nested",
  "Non-serializable values were found in the navigation state",
]);

// Use proper React Native components for TabIcon
const TabIcon = ({ name, color }) => {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: color,
          fontSize: 24,
        }}
      >
        {name}
      </Text>
    </View>
  );
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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

const MainApp = () => {
  const {
    tasks,
    setTasks,
    handleTaskAssigned,
    handleTaskUpdated,
    handleTaskDeleted,
    handleTaskReminder,
  } = useAppContext();

  useEffect(() => {
    console.log("Setting up socket handlers for real-time updates");

    // Set up socket handlers
    socketService.setHandlers({
      onTaskAssigned: (taskData) => {
        console.log("Task assigned event handler triggered:", taskData);

        // Create notification
        handleTaskAssigned(taskData);

        // Update tasks list with new task at the top
        setTasks((prev) => {
          const exists = prev.some((t) => t._id === taskData._id);
          if (!exists) {
            console.log("Adding new real-time task:", taskData.taskNumber);
            return [taskData, ...prev];
          }
          return prev;
        });
      },

      onTaskUpdated: (taskData) => {
        console.log("Task updated event handler triggered:", taskData);

        // Create notification
        handleTaskUpdated(taskData);

        // Update task in the list
        setTasks((prev) =>
          prev.map((task) => (task._id === taskData._id ? taskData : task))
        );
      },

      onTaskDeleted: (taskData) => {
        console.log("Task deleted event handler triggered:", taskData);

        // Create notification
        handleTaskDeleted(taskData);

        // Remove task from list
        setTasks((prev) => prev.filter((task) => task._id !== taskData._id));
      },

      onTaskReminder: (taskData) => {
        console.log("Task reminder event handler triggered:", taskData);

        // Create notification only
        handleTaskReminder(taskData);
      },

      onConnect: () => {
        console.log(
          "Socket connected successfully - ready for real-time updates"
        );
      },

      onDisconnect: () => {
        console.log("Socket disconnected - real-time updates paused");
      },

      onError: (error) => {
        console.error("Socket error:", error);
      },
    });

    // Connect to socket server
    socketService.connect();

    // Clean up on component unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
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
  );
};

const App = () => {
  return (
    <AppProvider>
      <SocketProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <NavigationContainer>
          <MainApp />
        </NavigationContainer>
      </SocketProvider>
    </AppProvider>
  );
};

export default App;
