import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "../styles/styles";
import { api } from "../services/apihost";
import { useAppContext } from "../context/AppContext";
import {
  DRIVER_ID,
  DRIVER_NAME,
  DEFAULT_CREDENTIALS,
} from "../config/constants";
import { MaterialCommunityIcons } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setDriverId, setDriverName } = useAppContext();

  useEffect(() => {
    // Check if user is already logged in
    checkExistingLogin();
    
    // Remove truck animation start
    // animateTruck();

    // Cleanup animation on unmount
    return () => {
      // No specific cleanup needed anymore
    };
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
      Alert.alert("Login Error", "Please enter username and password.");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Attempting login for user:", username);
      const response = await api.post("/api/mobile/login", {
        username,
        password,
      });

      if (response.data.success) {
        console.log("Login successful, response data:", response.data);
        
        // Extract data from response
        const { token, user } = response.data.data;
        const { driverId, fullName, companyId } = user;

        // Verify token format
        if (!token || typeof token !== 'string') {
          throw new Error("Invalid token received from server");
        }

        console.log("Storing credentials...");
        // Store credentials in AsyncStorage
        const storagePromises = [
          AsyncStorage.setItem("driverId", driverId),
          AsyncStorage.setItem("driverToken", token),
          AsyncStorage.setItem("driverName", fullName),
          AsyncStorage.setItem("companyId", companyId)
        ];

        await Promise.all(storagePromises);
        console.log("Credentials stored successfully");

        // Verify all stored data
        const [storedDriverId, storedToken, storedName, storedCompanyId] = await Promise.all([
          AsyncStorage.getItem("driverId"),
          AsyncStorage.getItem("driverToken"),
          AsyncStorage.getItem("driverName"),
          AsyncStorage.getItem("companyId")
        ]);

        if (!storedToken || !storedDriverId || !storedName || !storedCompanyId) {
          throw new Error("Failed to store all required credentials");
        }

        console.log("Verification successful:", {
          driverId: storedDriverId,
          hasToken: !!storedToken,
          name: storedName,
          companyId: storedCompanyId
        });

        // Update context
        setDriverId(driverId);
        setDriverName(fullName);

        // Navigate to main app
        navigation.replace("MainTabs");
      } else {
        Alert.alert("Login Failed", "Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      // Clear any partial stored data
      await AsyncStorage.multiRemove(["driverId", "driverToken", "driverName", "companyId"]);
      
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

      {/* Remove Animated Truck View */}
      {/* <Animated.View style={{ ... }}> ... </Animated.View> */}

      <View style={[styles.logoContainer, { backgroundColor: "#4DA6FF", justifyContent: 'center', alignItems: 'center' }]}>
        {/* Static Truck Icon */}
        <MaterialCommunityIcons name="truck" size={90} color="#fff" />
        <Text style={styles.logoText}>TrackMaster Pro</Text>
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

        {/* Add a link to the signup screen */}
        <TouchableOpacity
          style={styles.signupContainer}
          onPress={() => navigation.navigate("Signup")}
        >
          <Text style={styles.signupText}>
            Don't have an account?{" "}
            <Text style={styles.signupLink}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Smart Vehicle Tracking System © 2025
        </Text>
      </View>
    </View>
  );
};

export default LoginScreen;
