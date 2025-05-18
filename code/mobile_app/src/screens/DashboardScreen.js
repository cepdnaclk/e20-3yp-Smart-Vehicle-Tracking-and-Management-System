import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useAppContext } from "../App";
import { styles } from "../styles/styles";

const DashboardScreen = () => {
  const {
    vehicleNumber,
    setVehicleNumber,
    removeVehicle,
    tasks,
    completedTasks,
  } = useAppContext();
  const [inputVehicle, setInputVehicle] = useState("");

  const handleSubmitVehicle = () => {
    if (!inputVehicle.trim()) {
      Alert.alert("Invalid Input", "Please enter a valid vehicle number.");
      return;
    }
    setVehicleNumber(inputVehicle.trim());
    setInputVehicle("");
    Alert.alert("Vehicle Set", `Vehicle Number: ${inputVehicle.trim()}`);
  };

  const pendingCount = tasks.filter(
    (task) => !completedTasks.includes(task._id)
  ).length;
  const completedCount = completedTasks.length;

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <View style={styles.dashboardContainer}>
      <View style={styles.dashboardHeader}>
        <Text style={styles.welcomeText}>Welcome, John Driver</Text>
        <Text style={styles.dateText}>{currentDate}</Text>
      </View>
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
      <Text style={styles.sectionTitle}>Current Vehicle</Text>
      <View style={styles.vehicleInfoBox}>
        <Text style={styles.vehicleInfoText}>
          {vehicleNumber || "No vehicle entered"}
        </Text>
      </View>
      <View style={styles.vehicleInputContainer}>
        <TextInput
          style={styles.vehicleInput}
          placeholder="Enter Vehicle Number (e.g., TN-01-AB-1234)"
          value={inputVehicle}
          onChangeText={setInputVehicle}
        />
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitVehicle}
        >
          <Text style={styles.submitButtonText}>Set Vehicle Number</Text>
        </TouchableOpacity>
      </View>
      {vehicleNumber && (
        <TouchableOpacity style={styles.removeButton} onPress={removeVehicle}>
          <Text style={styles.removeButtonText}>Remove Current Vehicle</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default DashboardScreen;
