import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { useAppContext } from "../App";
import { styles } from "../styles/styles";

export const TaskScreen = ({ navigation }) => {
  const { tasks, completedTasks, loading, vehicleNumber } = useAppContext();

  const handleTaskPress = (taskId) => {
    if (!vehicleNumber) {
      Alert.alert(
        "Vehicle Number Required",
        "Please enter a vehicle number in the Dashboard before viewing tasks.",
        [{ text: "OK", onPress: () => navigation.navigate("Dashboard") }]
      );
      return;
    }
    navigation.navigate("TaskDetails", { taskId });
  };

  const renderItem = ({ item }) => {
    const isCompleted = completedTasks.includes(item._id);

    return (
      <TouchableOpacity
        style={[styles.taskItem, isCompleted ? styles.completedTask : null]}
        onPress={() => handleTaskPress(item._id)}
      >
        <View style={styles.taskHeader}>
          <Text style={styles.vehicleText}>Vehicle: {item.vehicle}</Text>
          <Text
            style={[
              styles.statusBadge,
              isCompleted ? styles.completedBadge : styles.pendingBadge,
            ]}
          >
            {isCompleted ? "Completed" : item.status}
          </Text>
        </View>
        <View style={styles.taskDetails}>
          <Text style={styles.destinationText}>To: {item.delivery}</Text>
          <Text style={styles.dateText}>
            Due: {new Date(item.expectedDelivery).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Your Delivery Tasks</Text>
      <Text style={styles.taskInstructions}>
        Select a task to view details. You must enter a vehicle number in the
        Dashboard before starting a task.
      </Text>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#4DA6FF"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

export const TaskDetailsScreen = ({ route, navigation }) => {
  const { taskId } = route.params;
  const {
    vehicleNumber,
    completedTasks,
    setCompletedTasks,
    tasks,
    activeTaskId,
    setActiveTaskId,
  } = useAppContext();
  const task = tasks.find((t) => t._id === taskId);
  const [status, setStatus] = useState(
    completedTasks.includes(task._id) ? "Completed" : task.status
  );
  const [loading, setLoading] = useState(false);

  if (!task) {
    return (
      <View style={styles.container}>
        <Text style={styles.headerText}>Task Not Found</Text>
      </View>
    );
  }

  const hasCorrectVehicle = vehicleNumber === task.vehicle;

  const checkVehicleNumber = (action) => {
    if (!vehicleNumber) {
      Alert.alert(
        "Vehicle Number Required",
        "Please enter the vehicle number in the Dashboard before proceeding.",
        [{ text: "OK", onPress: () => navigation.navigate("Dashboard") }]
      );
      return false;
    }
    if (!hasCorrectVehicle) {
      Alert.alert(
        "Wrong Vehicle",
        `This task requires vehicle ${task.vehicle}, but you have entered ${vehicleNumber}.`,
        [{ text: "OK", onPress: () => navigation.navigate("Dashboard") }]
      );
      return false;
    }
    return true;
  };

  const handleStart = async () => {
    if (!checkVehicleNumber()) return;
    if (activeTaskId && activeTaskId !== task._id) {
      Alert.alert(
        "Active Task",
        "You must complete or cancel the current task before starting a new one."
      );
      return;
    }

    setLoading(true);
    try {
      await axios.put(
        `http://localhost:5000/api/drivers/6823449d5b6c280259c1a5aa/tasks/${task._id}/start`
      );
      setStatus("In Progress");
      setActiveTaskId(task._id);
      Alert.alert("Task Started", "The task has been started successfully.");
    } catch (error) {
      console.error("Error starting task:", error);
      Alert.alert("Error", "Failed to start task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!checkVehicleNumber()) return;

    Alert.alert(
      "Complete Task",
      `Are you sure you have completed the delivery for vehicle ${task.vehicle}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Complete",
          onPress: () => {
            Alert.alert(
              "Double Confirm",
              "Please confirm again to complete the task.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Complete",
                  onPress: async () => {
                    setLoading(true);
                    try {
                      await axios.put(
                        `http://localhost:5000/api/drivers/6823449d5b6c280259c1a5aa/tasks/${task._id}/complete`
                      );
                      setStatus("Completed");
                      setCompletedTasks((prev) => [...prev, task._id]);
                      setActiveTaskId(null);
                      Alert.alert(
                        "Task Completed",
                        "The task has been completed successfully."
                      );
                    } catch (error) {
                      console.error("Error completing task:", error);
                      Alert.alert(
                        "Error",
                        "Failed to complete task. Please try again."
                      );
                    } finally {
                      setLoading(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleCancel = async () => {
    if (!checkVehicleNumber()) return;

    Alert.alert(
      "Cancel Task",
      `Are you sure you want to cancel the task for vehicle ${task.vehicle}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Cancel",
          onPress: () => {
            Alert.alert(
              "Double Confirm",
              "Please confirm again to cancel the task.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Cancel Task",
                  onPress: async () => {
                    setLoading(true);
                    try {
                      await axios.put(
                        `http://localhost:5000/api/drivers/6823449d5b6c280259c1a5aa/tasks/${task._id}/cancel`
                      );
                      setStatus("Cancelled");
                      setActiveTaskId(null);
                      Alert.alert(
                        "Task Cancelled",
                        "The task has been cancelled successfully."
                      );
                    } catch (error) {
                      console.error("Error cancelling task:", error);
                      Alert.alert(
                        "Error",
                        "Failed to cancel task. Please try again."
                      );
                    } finally {
                      setLoading(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  if (!hasCorrectVehicle && vehicleNumber) {
    return (
      <View style={styles.container}>
        <View style={styles.noVehicleContainer}>
          <Text style={styles.noVehicleTitle}>Wrong Vehicle</Text>
          <Text style={styles.noVehicleText}>
            This task requires vehicle:{" "}
            <Text style={{ fontWeight: "bold" }}>{task.vehicle}</Text>
          </Text>
          <Text style={styles.noVehicleText}>
            Currently entered:{" "}
            <Text style={{ fontWeight: "bold" }}>{vehicleNumber}</Text>
          </Text>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => navigation.navigate("Dashboard")}
          >
            <Text style={styles.submitButtonText}>
              Enter Correct Vehicle Number
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.vehicleNumber}>Vehicle: {task.vehicle}</Text>
        <Text style={styles.statusText}>Status: {status}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>Cargo Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Cargo Type:</Text>
          <Text style={styles.detailValue}>{task.cargoType}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Weight:</Text>
          <Text style={styles.detailValue}>{task.weight} kg</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Pickup:</Text>
          <Text style={styles.detailValue}>{task.pickup}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Delivery:</Text>
          <Text style={styles.detailValue}>{task.delivery}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Expected Delivery:</Text>
          <Text style={styles.detailValue}>
            {new Date(task.expectedDelivery).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View style={styles.actionContainer}>
        {status === "Pending" && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#4DA6FF" }]}
            onPress={handleStart}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>Start Task</Text>
            )}
          </TouchableOpacity>
        )}
        {status === "In Progress" && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#FF0000" }]}
              onPress={handleComplete}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.actionButtonText}>Complete Task</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#FFA500" }]}
              onPress={handleCancel}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.actionButtonText}>Cancel Task</Text>
              )}
            </TouchableOpacity>
          </>
        )}
        {status === "Completed" && (
          <View style={styles.completionContainer}>
            <Text style={styles.completionText}>
              Delivery completed successfully!
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#4DA6FF" }]}
              onPress={() => navigation.navigate("Tasks")}
            >
              <Text style={styles.actionButtonText}>Return to Tasks</Text>
            </TouchableOpacity>
          </View>
        )}
        {status === "Cancelled" && (
          <View style={styles.completionContainer}>
            <Text style={styles.completionText}>Task has been cancelled.</Text>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#4DA6FF" }]}
              onPress={() => navigation.navigate("Tasks")}
            >
              <Text style={styles.actionButtonText}>Return to Tasks</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default TaskScreen;
