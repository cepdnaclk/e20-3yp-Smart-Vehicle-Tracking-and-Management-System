import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  StatusBar,
  StyleSheet,
} from "react-native";
import { useAppContext } from "../context/AppContext";
import { styles } from "../styles/styles";
import { startTask, completeTask, updateTaskStatus } from "../services/api";
import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";

const TaskDetailsScreen = ({ route, navigation }) => {
  const { taskId } = route.params;
  const {
    tasks,
    setTasks,
    vehicleNumber,
    activeTaskId,
    setActiveTaskId,
    completedTasks,
    setCompletedTasks,
  } = useAppContext();

  const [task, setTask] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    // Find the task from the tasks list
    const foundTask = tasks.find((t) => t._id === taskId);
    setTask(foundTask);

    // Get current location
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required for this feature."
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);
    })();
  }, [taskId, tasks]);

  const handleStartTask = async () => {
    if (!vehicleNumber) {
      Alert.alert(
        "Vehicle Required",
        "Please set your vehicle number in the Dashboard before starting a task."
      );
      return;
    }

    if (activeTaskId && activeTaskId !== taskId) {
      Alert.alert(
        "Active Task Exists",
        "You already have an active task. Please complete it before starting a new one."
      );
      return;
    }

    setIsStarting(true);
    try {
      await startTask(taskId);

      // Update local state
      setActiveTaskId(taskId);
      const updatedTasks = tasks.map((t) =>
        t._id === taskId ? { ...t, status: "In Progress" } : t
      );
      setTasks(updatedTasks);
      setTask({ ...task, status: "In Progress" });

      Alert.alert("Success", "Task started successfully.");
    } catch (error) {
      console.error("Error starting task:", error);
      Alert.alert("Error", "Failed to start task. Please try again.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleCompleteTask = async () => {
    if (!currentLocation) {
      Alert.alert(
        "Location Required",
        "We need your current location to complete this task."
      );
      return;
    }

    setIsCompleting(true);
    try {
      await completeTask(taskId, {
        completionLocation: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        },
      });

      // Update local state
      setActiveTaskId(null);
      setCompletedTasks([...completedTasks, taskId]);
      const updatedTasks = tasks.map((t) =>
        t._id === taskId ? { ...t, status: "Completed" } : t
      );
      setTasks(updatedTasks);
      setTask({ ...task, status: "Completed" });

      Alert.alert(
        "Task Completed",
        "Delivery has been marked as completed successfully.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error("Error completing task:", error);
      Alert.alert("Error", "Failed to complete task. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  if (!task) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4DA6FF" />
        <Text>Loading task details...</Text>
      </View>
    );
  }

  const isTaskActive = task.status === "In Progress" || activeTaskId === taskId;
  const isTaskCompleted =
    task.status === "Completed" || completedTasks.includes(taskId);
  const isTaskPending =
    task.status === "Pending" && !isTaskActive && !isTaskCompleted;
  const formattedDeliveryDate = new Date(
    task.expectedDelivery
  ).toLocaleDateString();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={["#4DA6FF", "#2D6AFF"]} style={styles.header}>
        <View>
          <Text style={styles.taskNumber}>{task.taskNumber}</Text>
          <Text style={styles.vehicleNumber}>{task.cargoType}</Text>
          <Text style={styles.statusText}>
            Status:{" "}
            {isTaskCompleted
              ? "Completed"
              : isTaskActive
              ? "In Progress"
              : "Pending"}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollContent}>
        {/* Delivery Information Card */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pickup:</Text>
            <Text style={styles.detailValue}>{task.pickup}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Delivery:</Text>
            <Text style={styles.detailValue}>{task.delivery}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Contact:</Text>
            <Text style={styles.detailValue}>{task.deliveryPhone}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Due Date:</Text>
            <Text style={styles.detailValue}>{formattedDeliveryDate}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Cargo:</Text>
            <Text style={styles.detailValue}>
              {task.cargoType} ({task.weight} kg)
            </Text>
          </View>
        </View>

        {/* Map View */}
        <View style={styles.mapContainer}>
          <Text style={styles.sectionTitle}>Delivery Location</Text>
          <View style={styles.mapWrapper}>
            {currentLocation ? (
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                  }}
                  title="Your Location"
                />
              </MapView>
            ) : (
              <View style={styles.mapPlaceholder}>
                <Feather name="map" size={40} color="#ccc" />
                <Text style={styles.mapPlaceholderText}>Loading map...</Text>
              </View>
            )}
          </View>
        </View>

        {/* Notes */}
        {task.additionalNotes && (
          <View style={styles.notesContainer}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <Text style={styles.notesText}>{task.additionalNotes}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {isTaskPending && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#4DA6FF" }]}
              onPress={handleStartTask}
              disabled={isStarting}
            >
              {isStarting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.actionButtonText}>Start Delivery</Text>
              )}
            </TouchableOpacity>
          )}

          {isTaskActive && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
              onPress={handleCompleteTask}
              disabled={isCompleting}
            >
              {isCompleting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.actionButtonText}>Complete Delivery</Text>
              )}
            </TouchableOpacity>
          )}

          {isTaskCompleted && (
            <View style={styles.completionContainer}>
              <Feather name="check-circle" size={50} color="#4CAF50" />
              <Text style={styles.completionText}>Delivery Completed</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#FF6B6B" }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.actionButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default TaskDetailsScreen;
