import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "../styles/styles";
import { api } from "../services/apihost";
import { useAppContext } from "../context/AppContext";

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setDriverId } = useAppContext();

  useEffect(() => {
    // Check if user is already logged in
    checkExistingLogin();
  }, []);

  const checkExistingLogin = async () => {
    try {
      const driverId = await AsyncStorage.getItem("driverId");
      const token = await AsyncStorage.getItem("driverToken");

      if (driverId && token) {
        // Auto-login if credentials exist
        setDriverId(driverId);
        navigation.replace("MainTabs");
      }
    } catch (error) {
      console.error("Error checking existing login:", error);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Login Error", "Please enter both username and password.");
      return;
    }

    setIsLoading(true);
    try {
      // Mock authentication for development
      // In production, you'd use a real API call to authenticate
      // const response = await api.post('/api/drivers/login', { username, password });

      if (username === "driver" && password === "password") {
        // Use hardcoded driver ID that matches the one created in admin frontend
        const mockDriverId = "DR001";
        await AsyncStorage.setItem("driverId", mockDriverId);
        await AsyncStorage.setItem("driverToken", "mock-token-123");
        await AsyncStorage.setItem("driverName", "sachin dulaj");

        // Update context with the hardcoded driver ID
        setDriverId(mockDriverId);

        // Navigate to main app
        navigation.replace("MainTabs");
      } else {
        Alert.alert("Login Failed", "Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Login Error",
        error.response?.data?.message ||
          "Failed to connect to server. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={[styles.logoContainer, { backgroundColor: "#4DA6FF" }]}>
        <Text style={styles.logoText}>Track Master</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Driver Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.loginButton, isLoading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Smart Vehicle Tracking System © 2023
        </Text>
      </View>
    </View>
  );
};

export default LoginScreen;
