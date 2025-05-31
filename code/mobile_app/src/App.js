import React, { useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar, LogBox, View, Text } from "react-native";

import { AppProvider, useAppContext } from "./context/AppContext";
import { SocketProvider } from "./context/SocketContext";
import DashboardScreen from "./screens/DashboardScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen"; // Import the new SignupScreen
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
    // Remove these handlers since we're handling notifications directly in AppContext
    // handleTaskAssigned,
    // handleTaskUpdated,
    // handleTaskDeleted,
    // handleTaskReminder,
  } = useAppContext();

  // Track if handlers have been set up
  const handlersSetUp = useRef(false);

  useEffect(() => {
    // Just connect to ensure socket is connected (handlers are set in AppContext)
    socketService.connect();

    // Clean up on component unmount
    return () => {
      // No need to disconnect - AppContext handles that
      console.log("MainApp unmounting, handlers remain active");
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
        name="Signup"
        component={SignupScreen}
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
