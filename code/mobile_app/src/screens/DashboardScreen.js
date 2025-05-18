import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useAppContext } from "../App";
import { styles } from "../styles/styles";
import axios from "axios";

const DashboardScreen = () => {
  const {
    vehicleNumber,
    setVehicleNumber,
    removeVehicle,
    tasks,
    completedTasks,
  } = useAppContext();
  const [inputVehicle, setInputVehicle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmitVehicle = async () => {
    if (!inputVehicle.trim()) {
      Alert.alert("Invalid Input", "Please enter a valid vehicle number.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/vehicles?licensePlate=${inputVehicle.trim()}`
      );
      if (response.data.length === 0) {
        Alert.alert("Error", "The vehicle is not registered.");
        setLoading(false);
        return;
      }

      const vehicle = response.data[0];
      const driverResponse = await axios.get(
        `http://localhost:5000/api/drivers?vehicleNumber=${inputVehicle.trim()}`
      );
      if (
        driverResponse.data.length > 0 &&
        driverResponse.data[0]._id !== "6823449d5b6c280259c1a5aa"
      ) {
        Alert.alert(
          "Error",
          "The vehicle is already occupied by another driver."
        );
        setLoading(false);
        return;
      }

      await axios.put(
        `http://localhost:5000/api/drivers/6823449d5b6c280259c1a5aa`,
        { vehicleNumber: inputVehicle.trim() }
      );
      setVehicleNumber(inputVehicle.trim());
      setInputVehicle("");
      Alert.alert("Vehicle Set", `Vehicle Number: ${inputVehicle.trim()}`);
    } catch (error) {
      console.error("Error setting vehicle:", error);
      Alert.alert("Error", "Failed to set vehicle. Please try again.");
    } finally {
      setLoading(false);
    }
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
        <TouchableOpacity style={styles.removeButton} onPress={removeVehicle}>
          <Text style={styles.removeButtonText}>Remove Current Vehicle</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default DashboardScreen;
