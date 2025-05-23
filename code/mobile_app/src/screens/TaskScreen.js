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
import { useAppContext } from "../App";
import { styles } from "../styles/styles";

export const TaskScreen = ({ navigation }) => {
  const { tasks, completedTasks, loading } = useAppContext();

  const renderItem = ({ item }) => {
    const isCompleted = completedTasks.includes(item._id);

    return (
      <TouchableOpacity
        style={[styles.taskItem, isCompleted ? styles.completedTask : null]}
        onPress={() => navigation.navigate("TaskDetails", { taskId: item._id })}
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
        Select a task to view details. You must scan the correct vehicle QR code
        before starting each task.
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
  const { scannedVehicle, completedTasks, setCompletedTasks, tasks } =
    useAppContext();
  const task = tasks.find((t) => t._id === taskId);
  const [status, setStatus] = useState(
    completedTasks.includes(task._id) ? "finished" : task.status
  );

  if (!task) {
    return (
      <View style={styles.container}>
        <Text style={styles.headerText}>Task Not Found</Text>
      </View>
    );
  }

  const hasCorrectVehicle = scannedVehicle === task.vehicle;

  const handleStart = () => {
    Alert.alert(
      "Start Task",
      `Are you sure you are in vehicle ${task.vehicle} and want to start this task?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Start",
          onPress: () => {
            Alert.alert(
              "Double Confirm",
              "Please confirm again to start the task.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Start", onPress: () => setStatus("started") },
              ]
            );
          },
        },
      ]
    );
  };

  const handleFinish = () => {
    Alert.alert(
      "Finish Task",
      `Are you sure you have completed the delivery for vehicle ${task.vehicle}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Finish",
          onPress: () => {
            Alert.alert(
              "Double Confirm",
              "Please confirm again to finish the task.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Finish",
                  onPress: () => {
                    setStatus("finished");
                    setCompletedTasks((prev) => [...prev, task._id]);
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  if (!hasCorrectVehicle) {
    return (
      <View style={styles.container}>
        <View style={styles.wrongVehicleContainer}>
          <Text style={styles.wrongVehicleTitle}>Wrong Vehicle</Text>
          <Text style={styles.wrongVehicleText}>
            This task requires vehicle:{" "}
            <Text style={styles.requiredVehicleNumber}>{task.vehicle}</Text>
          </Text>
          {scannedVehicle && (
            <Text style={styles.currentVehicleText}>
              Currently scanned:{" "}
              <Text style={{ fontWeight: "bold" }}>{scannedVehicle}</Text>
            </Text>
          )}
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() =>
              navigation.navigate("Scan QR", { requiredVehicle: task.vehicle })
            }
          >
            <Text style={styles.scanButtonText}>
              Scan {task.vehicle} QR Code
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
        <Text style={styles.statusText}>
          Status:{" "}
          {status === "pending"
            ? "Ready to Start"
            : status === "started"
            ? "In Progress"
            : "Completed"}
        </Text>
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
        {status === "pending" && (
          <TouchableOpacity style={styles.actionButton} onPress={handleStart}>
            <Text style={styles.actionButtonText}>Start Delivery</Text>
          </TouchableOpacity>
        )}
        {status === "started" && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
            onPress={handleFinish}
          >
            <Text style={styles.actionButtonText}>Finish Delivery</Text>
          </TouchableOpacity>
        )}
        {status === "finished" && (
          <View style={styles.completionContainer}>
            <Text style={styles.completionText}>
              Delivery completed successfully!
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#4DA6FF" }]}
              onPress={() => navigation.navigate("To-Do")}
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
