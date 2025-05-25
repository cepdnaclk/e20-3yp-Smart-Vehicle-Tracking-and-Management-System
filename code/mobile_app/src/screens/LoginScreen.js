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
import {
  DRIVER_ID,
  DRIVER_NAME,
  DEFAULT_CREDENTIALS,
} from "../config/constants";

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setDriverId, setDriverName } = useAppContext();

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
      Alert.alert("Login Error", "Please enter username and password.");
      return;
    }

    setIsLoading(true);
    try {
      // Modify the login API call to remove companyId
      const response = await api.post("/api/mobile/login", {
        username,
        password,
      });

      if (response.data.success) {
        // Save user data to AsyncStorage
        await AsyncStorage.setItem(
          "driverId",
          response.data.data.user.driverId
        );
        await AsyncStorage.setItem("driverToken", response.data.data.token);
        await AsyncStorage.setItem(
          "driverName",
          response.data.data.user.fullName
        );
        await AsyncStorage.setItem(
          "companyId",
          response.data.data.user.companyId
        );

        // Update context
        setDriverId(response.data.data.user.driverId);
        setDriverName(response.data.data.user.fullName);

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
          Smart Vehicle Tracking System © 2023
        </Text>
      </View>
    </View>
  );
};

export default LoginScreen;
