import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { useAppContext } from "../context/AppContext";
import { styles } from "../styles/styles";
import {
  startTask,
  completeTask,
  updateTaskStatus,
} from "../services/TaskService";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    // Find the task from the tasks list
    const foundTask = tasks.find((t) => t._id === taskId);
    setTask(foundTask);
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
      // Use the status endpoint for faster updates
      await updateTaskStatus(taskId, "In Progress");

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
    setIsCompleting(true);
    try {
      // Use the status endpoint for faster updates
      await updateTaskStatus(taskId, "Completed");

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

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Vehicle:</Text>
            <Text style={styles.detailValue}>
              {task.licensePlate || "Not assigned"}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {task.additionalNotes && (
          <View style={styles.notesContainer}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <Text style={styles.notesText}>{task.additionalNotes}</Text>
          </View>
        )}

        {/* Delivery Instructions */}
        <View style={styles.notesContainer}>
          <Text style={styles.sectionTitle}>Delivery Instructions</Text>
          <View style={styles.instructionItem}>
            <View style={styles.instructionBullet}>
              <Text style={styles.instructionNumber}>1</Text>
            </View>
            <Text style={styles.notesText}>
              Confirm recipient's identity before delivery
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <View style={styles.instructionBullet}>
              <Text style={styles.instructionNumber}>2</Text>
            </View>
            <Text style={styles.notesText}>
              Handle cargo with care - contains fragile items
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <View style={styles.instructionBullet}>
              <Text style={styles.instructionNumber}>3</Text>
            </View>
            <Text style={styles.notesText}>Take signature upon delivery</Text>
          </View>
        </View>

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
