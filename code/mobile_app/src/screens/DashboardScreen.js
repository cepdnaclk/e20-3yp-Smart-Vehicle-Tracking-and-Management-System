import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppContext } from "../context/AppContext";
import { styles } from "../styles/styles";
import { api } from "../services/apihost";
import { DRIVER_ID } from "../config/constants";
import { fetchDriverTasks } from "../services/TaskService";

const DashboardScreen = ({ navigation }) => {
  const {
    driverId,
    driverName,
    vehicleNumber,
    setVehicleNumber,
    tasks,
    setTasks,
    completedTasks,
    setCompletedTasks,
    activeTaskId,
    setActiveTaskId,
  } = useAppContext();

  const [inputVehicle, setInputVehicle] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Check if the driver already has an assigned vehicle
    const checkVehicle = async () => {
      try {
        const response = await api.get(`/api/drivers/${DRIVER_ID}`);
        if (response.data && response.data.assignedVehicle) {
          setVehicleNumber(response.data.assignedVehicle);
          await AsyncStorage.setItem(
            "vehicleNumber",
            response.data.assignedVehicle
          );
        }
      } catch (error) {
        console.error("Error checking vehicle assignment:", error);
      }
    };

    checkVehicle();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      console.log("Dashboard: Refreshing tasks and synchronizing data...");

      // Fetch fresh tasks from the server
      const freshTasks = await fetchDriverTasks();

      if (freshTasks && Array.isArray(freshTasks)) {
        console.log(
          `Dashboard: Fetched ${freshTasks.length} tasks from server`
        );

        // Update tasks in context
        setTasks(freshTasks);

        // Find and update active task
        const activeTask = freshTasks.find((t) => t.status === "In Progress");
        if (activeTask) {
          setActiveTaskId(activeTask._id);
          console.log("Dashboard: Found active task:", activeTask.taskNumber);
        } else {
          setActiveTaskId(null);
          console.log("Dashboard: No active task found");
        }

        // Update completed tasks
        const completedTaskIds = freshTasks
          .filter((t) => t.status === "Completed")
          .map((t) => t._id);
        setCompletedTasks(completedTaskIds);
        console.log(
          `Dashboard: Found ${completedTaskIds.length} completed tasks`
        );

        // Check if driver has assigned vehicle from server
        try {
          const driverResponse = await api.get(`/api/drivers/${DRIVER_ID}`);
          if (driverResponse.data?.assignedVehicle && !vehicleNumber) {
            setVehicleNumber(driverResponse.data.assignedVehicle);
            await AsyncStorage.setItem(
              "vehicleNumber",
              driverResponse.data.assignedVehicle
            );
            console.log(
              "Dashboard: Updated vehicle from server:",
              driverResponse.data.assignedVehicle
            );
          }
        } catch (vehicleError) {
          console.error(
            "Dashboard: Error fetching vehicle info:",
            vehicleError
          );
        }
      }
    } catch (error) {
      console.error("Dashboard: Error refreshing tasks:", error);
      
      // Handle authentication errors
      if (error.message === "Session expired. Please log in again." || 
          error.message === "Authentication token not found. Please log in again.") {
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please log in again.",
          [
            {
              text: "OK",
              onPress: () => {
                // Clear all stored credentials
                AsyncStorage.multiRemove([
                  "driverId",
                  "driverToken",
                  "driverName",
                  "companyId",
                  "vehicleNumber"
                ]).then(() => {
                  // Navigate to login screen
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "Login" }],
                  });
                });
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Error",
          "Failed to refresh tasks. Please try again."
        );
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmitVehicle = async () => {
    if (!inputVehicle.trim()) {
      Alert.alert(
        "Invalid Input",
        "Please enter a valid vehicle license plate number."
      );
      return;
    }

    setLoading(true);
    try {
      console.log("Validating license plate:", inputVehicle.trim());

      // Check if vehicle exists using license plate validation
      const licensePlate = inputVehicle.trim().toUpperCase();

      // Use try/catch specifically for the license plate check
      try {
        const vehicleCheckResponse = await api.get(
          `/api/vehicles/license/${licensePlate}`
        );

        console.log("Vehicle check response:", vehicleCheckResponse.data);

        // If the vehicle doesn't exist in the system
        if (!vehicleCheckResponse.data || !vehicleCheckResponse.data.exists) {
          console.log("License plate not registered:", licensePlate);
          Alert.alert(
            "Vehicle Not Registered",
            "This license plate is not registered in the vehicle management system. Please contact your administrator to register this vehicle first."
          );
          setLoading(false);
          return;
        }

        const vehicleData = vehicleCheckResponse.data.vehicle;
        console.log("Vehicle found in system:", vehicleData);

        // Check if vehicle is already assigned to another driver
        if (
          vehicleData.assignedDriver &&
          vehicleData.assignedDriver !== driverId
        ) {
          console.log(
            "Vehicle already assigned to another driver:",
            vehicleData.assignedDriver
          );
          Alert.alert(
            "Vehicle Unavailable",
            "This vehicle is already assigned to another driver. Please choose a different vehicle."
          );
          setLoading(false);
          return;
        }

        // Continue with vehicle assignment if all checks pass
        // First, get current driver data to preserve required fields
        const driverResponse = await api.get(`/api/drivers/${driverId}`);
        const driverData = driverResponse.data;

        if (!driverData) {
          throw new Error("Could not retrieve driver data");
        }

        console.log("Retrieved driver data:", driverData);

        // Update the driver with the new vehicle assignment
        // while preserving all other required fields
        const updateData = {
          fullName: driverData.fullName,
          email: driverData.email,
          phone: driverData.phone,
          licenseNumber: driverData.licenseNumber,
          joinDate: driverData.joinDate,
          employmentStatus: driverData.employmentStatus,
          assignedVehicle: vehicleData.licensePlate,
          vehicleId: vehicleData._id,
        };

        console.log("Updating driver with data:", updateData);
        await api.put(`/api/drivers/${driverId}`, updateData);

        // Update the vehicle to assign it to this driver
        // Using PUT instead of PATCH since the backend doesn't support PATCH
        console.log("Updating vehicle with assignedDriver:", driverId);
        await api.put(`/api/vehicles/${vehicleData._id}`, {
          vehicleName: vehicleData.vehicleName,
          licensePlate: vehicleData.licensePlate,
          vehicleType: vehicleData.vehicleType,
          deviceId: vehicleData.deviceId || "unknown",
          trackingEnabled: vehicleData.trackingEnabled,
          status: "active",
          assignedDriver: driverId,
        });

        // Update local state and storage
        setVehicleNumber(vehicleData.licensePlate);
        await AsyncStorage.setItem("vehicleNumber", vehicleData.licensePlate);
        await AsyncStorage.setItem("vehicleId", vehicleData._id);
        setInputVehicle("");

        console.log("Vehicle assignment successful:", vehicleData.licensePlate);
        Alert.alert(
          "Vehicle Assigned Successfully",
          `License Plate: ${vehicleData.licensePlate}\nVehicle Type: ${
            vehicleData.vehicleType || "Unknown"
          }\n\nYou can now start your tasks with this vehicle.`
        );
      } catch (checkError) {
        // Handle the 404 error from license plate check specifically
        if (checkError.response?.status === 404) {
          console.log("License plate not found:", licensePlate);
          Alert.alert(
            "Vehicle Not Found",
            "This license plate is not registered in the system. Please verify the license plate number or contact your administrator."
          );
        } else {
          // For any other errors during the check
          console.error("Error checking license plate:", checkError);
          Alert.alert(
            "Error",
            "Failed to verify license plate. Please check your connection and try again."
          );
        }
      }
    } catch (error) {
      // This catches any other errors in the overall function
      console.error("Unexpected error in handleSubmitVehicle:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVehicle = async () => {
    try {
      setLoading(true);

      // Get stored vehicle ID
      const vehicleId = await AsyncStorage.getItem("vehicleId");
      console.log("Removing vehicle with ID:", vehicleId);

      // First, get the current driver data to preserve required fields
      const driverResponse = await api.get(`/api/drivers/${DRIVER_ID}`);
      const driverData = driverResponse.data;

      if (!driverData) {
        throw new Error("Could not retrieve driver data");
      }

      // Update the driver with all required fields
      const driverUpdateData = {
        fullName: driverData.fullName,
        email: driverData.email,
        phone: driverData.phone,
        licenseNumber: driverData.licenseNumber,
        joinDate: driverData.joinDate,
        employmentStatus: driverData.employmentStatus,
        assignedVehicle: "", // Empty string instead of null
      };

      console.log("Updating driver with data:", driverUpdateData);
      await api.put(`/api/drivers/${DRIVER_ID}`, driverUpdateData);

      // Don't try to update the vehicle if we don't have a valid vehicleId
      if (vehicleId) {
        // Just skip vehicle update - this prevents the 404 error
        console.log("Skipping vehicle update for removed vehicle");
      }

      // Clear local storage and state
      setVehicleNumber(null);
      await AsyncStorage.removeItem("vehicleNumber");
      await AsyncStorage.removeItem("vehicleId");

      setLoading(false);

      Alert.alert(
        "Success",
        "Vehicle assignment has been removed successfully."
      );
    } catch (error) {
      setLoading(false);
      console.error("Error removing vehicle:", error);
      console.error("Error response:", error.response?.data);

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to remove vehicle assignment. Please try again."
      );
    }
  };

  // Calculate counts from synchronized tasks
  const pendingCount = tasks.filter(
    (task) => task.status !== "Completed" && !completedTasks.includes(task._id)
  ).length;
  const completedCount = tasks.filter(
    (task) => task.status === "Completed" || completedTasks.includes(task._id)
  ).length;

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const activeTask = tasks.find((task) => task._id === activeTaskId);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      <ScrollView
        style={styles.dashboardContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.dashboardHeader}>
          <Text style={styles.welcomeText}>
            Welcome, {driverName || "Driver"}
          </Text>
          <Text style={styles.dateText}>{currentDate}</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending Tasks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed Tasks</Text>
          </View>
        </View>

        {/* Current Vehicle Section */}
        <Text style={styles.sectionTitle}>Current Vehicle</Text>
        <View style={styles.vehicleInfoBox}>
          <Text style={styles.vehicleInfoText}>
            {vehicleNumber || "No vehicle entered"}
          </Text>
        </View>

        {/* Vehicle Input */}
        <View style={styles.vehicleInputContainer}>
          <TextInput
            style={styles.vehicleInput}
            placeholder="Enter License Plate (e.g., WB-9999)"
            value={inputVehicle}
            onChangeText={setInputVehicle}
            autoCapitalize="characters"
            maxLength={20}
          />
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitVehicle}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Set Vehicle Number</Text>
            )}
          </TouchableOpacity>
        </View>

        {vehicleNumber && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleRemoveVehicle}
          >
            <Text style={styles.removeButtonText}>Remove Current Vehicle</Text>
          </TouchableOpacity>
        )}

        {/* Active Task Section - if there is one */}
        {activeTask && (
          <View>
            <Text style={styles.sectionTitle}>Current Active Task</Text>
            <TouchableOpacity
              style={styles.activeTaskCard}
              onPress={() =>
                navigation.navigate("TaskDetails", { taskId: activeTask._id })
              }
            >
              <View style={styles.activeTaskHeader}>
                <Text style={styles.activeTaskNumber}>
                  {activeTask.taskNumber}
                </Text>
                <View style={styles.activeTaskBadge}>
                  <Text style={styles.activeTaskBadgeText}>ACTIVE</Text>
                </View>
              </View>
              <View style={styles.activeTaskDetails}>
                <Text style={styles.activeTaskText}>
                  {activeTask.pickup} → {activeTask.delivery}
                </Text>
                <Text style={styles.viewDetailsText}>View Details</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Driver Tip/Help Box */}
        <View
          style={[
            styles.vehicleInfoBox,
            { marginTop: 20, backgroundColor: "#E6F7FF" },
          ]}
        >
          <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
            Driver Tips
          </Text>
          <Text style={{ lineHeight: 20 }}>
            • Confirm your vehicle details before starting your shift
            {"\n"}• Update delivery status as soon as completed
            {"\n"}• Check notifications regularly for updates
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;
