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

        console.log("Dashboard: Synchronization completed successfully");
      }
    } catch (error) {
      console.error("Dashboard: Error refreshing tasks:", error);
      Alert.alert(
        "Sync Error",
        "Failed to synchronize tasks. Please check your connection and try again."
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmitVehicle = async () => {
    if (!inputVehicle.trim()) {
      Alert.alert("Invalid Input", "Please enter a valid vehicle number.");
      return;
    }

    setLoading(true);
    try {
      // Check if vehicle exists using your backend API
      const vehicleCheckResponse = await api.get(
        `/api/vehicles/license/${inputVehicle.trim()}`
      );

      if (!vehicleCheckResponse.data) {
        Alert.alert("Error", "The vehicle is not registered in the system.");
        setLoading(false);
        return;
      }

      // Update the driver with the new vehicle assignment
      const updateData = {
        assignedVehicle: inputVehicle.trim(),
      };

      await api.put(`/api/drivers/${DRIVER_ID}`, updateData);

      setVehicleNumber(inputVehicle.trim());
      await AsyncStorage.setItem("vehicleNumber", inputVehicle.trim());
      setInputVehicle("");
      Alert.alert("Vehicle Set", `Vehicle Number: ${inputVehicle.trim()}`);
    } catch (error) {
      console.error("Error setting vehicle:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to set vehicle. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVehicle = async () => {
    try {
      // Clear vehicle assignment in backend
      const updateData = {
        assignedVehicle: "",
      };

      await api.put(`/api/drivers/${DRIVER_ID}`, updateData);

      setVehicleNumber(null);
      await AsyncStorage.removeItem("vehicleNumber");
      Alert.alert(
        "Vehicle Removed",
        "Vehicle number has been removed successfully."
      );
    } catch (error) {
      console.error("Error removing vehicle:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to remove vehicle. Please try again."
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
            placeholder="Enter Vehicle Number"
            value={inputVehicle}
            onChangeText={setInputVehicle}
            autoCapitalize="characters"
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
                <View style={styles.activeTaskRow}>
                  <Text style={styles.activeTaskText}>
                    {activeTask.pickup} → {activeTask.delivery}
                  </Text>
                </View>
                <View style={styles.viewDetailsButton}>
                  <Text style={styles.viewDetailsText}>View Details</Text>
                </View>
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
            • Always confirm your vehicle details before starting your shift
            {"\n"}• Update delivery status as soon as completed{"\n"}• Check
            notifications regularly for updates
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;
