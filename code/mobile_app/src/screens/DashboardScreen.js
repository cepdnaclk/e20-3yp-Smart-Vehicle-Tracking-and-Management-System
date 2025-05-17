import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useAppContext } from "../App";
import { styles } from "../styles/styles";

const DashboardScreen = ({ navigation }) => {
  const { scannedVehicle, removeVehicle, tasks, completedTasks } =
    useAppContext();

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
          {scannedVehicle || "No vehicle scanned"}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate("Scan QR")}
      >
        <Text style={styles.scanButtonText}>
          {scannedVehicle
            ? "Change Vehicle (Scan New QR)"
            : "Scan Vehicle QR Code"}
        </Text>
      </TouchableOpacity>
      {scannedVehicle && (
        <TouchableOpacity
          style={[
            styles.scanButton,
            { backgroundColor: "#FF6B6B", marginTop: 10 },
          ]}
          onPress={removeVehicle}
        >
          <Text style={styles.scanButtonText}>Remove Current Vehicle</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default DashboardScreen;
