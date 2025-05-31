import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppContext } from "../context/AppContext";
import { api } from "../services/apihost";

const SignupScreen = ({ navigation }) => {
  const { setDriverId, setDriverName } = useAppContext();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    phone: "",
    driverId: "",
    companyId: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 4) {
      newErrors.username = "Username must be at least 4 characters";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    // Driver ID validation
    if (!formData.driverId.trim()) {
      newErrors.driverId = "Driver ID is required";
    } else {
      const driverIdRegex = /^DR\d{3}$/;
      if (!driverIdRegex.test(formData.driverId)) {
        newErrors.driverId =
          "Driver ID must be in format DR followed by 3 digits (e.g., DR001)";
      }
    }

    // Company ID validation
    if (!formData.companyId.trim()) {
      newErrors.companyId = "Company ID is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    // Clear error when user types
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      });
    }
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/api/mobile/register", {
        username: formData.username.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        // Removed fullName field
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        driverId: formData.driverId.trim(),
        companyId: formData.companyId.trim(),
      });

      // Handle successful registration
      if (response.data.success) {
        // Store the token and user info
        await AsyncStorage.setItem("driverToken", response.data.data.token);
        await AsyncStorage.setItem(
          "driverId",
          response.data.data.user.driverId
        );
        await AsyncStorage.setItem(
          "driverName",
          response.data.data.user.fullName
        );
        await AsyncStorage.setItem(
          "companyId",
          response.data.data.user.companyId
        );

        // Update app context
        setDriverId(response.data.data.user.driverId);
        setDriverName(response.data.data.user.fullName);

        // Navigate to main app
        Alert.alert(
          "Registration Successful",
          "Your account has been created successfully!",
          [
            {
              text: "OK",
              onPress: () => navigation.replace("MainTabs"),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Signup error:", error);
      let errorMessage = "Registration failed. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (
        error.response?.data?.errors &&
        Array.isArray(error.response.data.errors)
      ) {
        errorMessage = error.response.data.errors.map((e) => e.msg).join(", ");
      }

      Alert.alert("Registration Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Track Master</Text>
            <Text style={styles.tagline}>Driver Registration</Text>
          </View>

          {/* Add an info box explaining the registration requirements */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Registration Requirements</Text>
            <Text style={styles.infoText}>
              • You must be a registered driver in the system
            </Text>
            <Text style={styles.infoText}>
              • Your Driver ID and Company ID must match existing records
            </Text>
            <Text style={styles.infoText}>
              • Contact your administrator if you don't have these details
            </Text>
          </View>

          <View style={styles.formContainer}>
            {/* Username field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username *</Text>
              <TextInput
                style={[styles.input, errors.username && styles.inputError]}
                placeholder="Enter username"
                value={formData.username}
                onChangeText={(text) => handleInputChange("username", text)}
                autoCapitalize="none"
              />
              {errors.username && (
                <Text style={styles.errorText}>{errors.username}</Text>
              )}
            </View>

            {/* Password field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Enter password"
                value={formData.password}
                onChangeText={(text) => handleInputChange("password", text)}
                secureTextEntry
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Confirm Password field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password *</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.confirmPassword && styles.inputError,
                ]}
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChangeText={(text) =>
                  handleInputChange("confirmPassword", text)
                }
                secureTextEntry
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Email field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(text) => handleInputChange("email", text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Phone field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone *</Text>
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                placeholder="Enter your phone number"
                value={formData.phone}
                onChangeText={(text) => handleInputChange("phone", text)}
                keyboardType="phone-pad"
              />
              {errors.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
            </View>

            {/* Driver ID field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Driver ID *</Text>
              <TextInput
                style={[styles.input, errors.driverId && styles.inputError]}
                placeholder="Enter your driver ID (e.g., DR001)"
                value={formData.driverId}
                onChangeText={(text) => handleInputChange("driverId", text)}
                autoCapitalize="characters"
              />
              {errors.driverId && (
                <Text style={styles.errorText}>{errors.driverId}</Text>
              )}
              <Text style={styles.helperText}>
                Your Driver ID must already be registered in the system by your
                administrator
              </Text>
            </View>

            {/* Company ID field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company ID *</Text>
              <TextInput
                style={[styles.input, errors.companyId && styles.inputError]}
                placeholder="Enter your company ID"
                value={formData.companyId}
                onChangeText={(text) => handleInputChange("companyId", text)}
                autoCapitalize="characters"
              />
              {errors.companyId && (
                <Text style={styles.errorText}>{errors.companyId}</Text>
              )}
              <Text style={styles.helperText}>
                Company ID must match the company you are registered with
              </Text>
            </View>

            {/* Signup button */}
            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Login link */}
            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.loginLinkText}>
                Already have an account?{" "}
                <Text style={styles.loginHighlight}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginVertical: 30,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4DA6FF",
  },
  tagline: {
    fontSize: 18,
    color: "#666",
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
    fontWeight: "500",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  inputError: {
    borderColor: "#ff6b6b",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
    marginTop: 5,
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  signupButton: {
    backgroundColor: "#4DA6FF",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  signupButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  loginLink: {
    marginTop: 20,
    alignItems: "center",
  },
  loginLinkText: {
    fontSize: 16,
    color: "#666",
  },
  loginHighlight: {
    color: "#4DA6FF",
    fontWeight: "600",
  },
  // Add new styles for the info container
  infoContainer: {
    backgroundColor: "#e8f4fd",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#4DA6FF",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
    lineHeight: 20,
  },
});

export default SignupScreen;
