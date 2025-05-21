import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  StatusBar,
} from "react-native";
import { useAppContext } from "../context/AppContext";
import { styles } from "../styles/styles";
import { api } from "../services/apihost";
import AnimatedPlaceholder from "../components/AnimatedPlaceholder";

export const TaskScreen = ({ navigation }) => {
  const {
    driverId,
    tasks,
    setTasks,
    completedTasks,
    loading,
    setLoading,
    vehicleNumber,
  } = useAppContext();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [driverId]);

  const loadTasks = async () => {
    // Hardcoded driverId to match the specific driver created in admin frontend
    const hardcodedDriverId = "DR001";

    setLoading(true);
    try {
      // Use the actual API endpoint from the backend
      const response = await api.get(`/api/tasks/driver/${hardcodedDriverId}`);

      if (response.data && Array.isArray(response.data)) {
        console.log("Tasks fetched successfully:", response.data);
        setTasks(response.data);
      } else {
        console.log("No tasks found or invalid response format");
        // Fallback to mock data if API returns empty or invalid data
        setTasks([
          {
            _id: "mockTask1",
            taskNumber: "TSK0001",
            cargoType: "Electronics",
            weight: 150,
            pickup: "Warehouse A",
            delivery: "Colombo City Center",
            deliveryPhone: "0712345678",
            expectedDelivery: new Date().toISOString(),
            status: "Pending",
            driverId: hardcodedDriverId,
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      Alert.alert("Error", "Failed to load tasks. Using cached data.");

      // Use mock data as fallback
      setTasks([
        {
          _id: "mockTask1",
          taskNumber: "TSK0001",
          cargoType: "Electronics",
          weight: 150,
          pickup: "Warehouse A",
          delivery: "Colombo City Center",
          deliveryPhone: "0712345678",
          expectedDelivery: new Date().toISOString(),
          status: "Pending",
          driverId: hardcodedDriverId,
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

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
    const isOverdue =
      new Date(item.expectedDelivery) < new Date() && !isCompleted;

    return (
      <TouchableOpacity
        style={[
          styles.taskItem,
          isCompleted && styles.completedTask,
          isOverdue && styles.overdueTask,
        ]}
        onPress={() => handleTaskPress(item._id)}
      >
        <View style={styles.taskHeader}>
          <View>
            <Text style={styles.taskNumber}>{item.taskNumber}</Text>
            <Text style={styles.cargoTypeText}>{item.cargoType}</Text>
          </View>
          <Text
            style={[
              styles.statusBadge,
              item.status === "Pending"
                ? styles.pendingBadge
                : item.status === "In Progress"
                ? styles.inProgressBadge
                : item.status === "Completed"
                ? styles.completedBadge
                : styles.cancelledBadge,
            ]}
          >
            {item.status}
          </Text>
        </View>

        <View style={styles.taskDetails}>
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>{item.delivery}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoText}>
                {new Date(item.expectedDelivery).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoText}>{item.weight} kg</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => {
    if (loading) {
      return <AnimatedPlaceholder type="tasks" count={3} />;
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No tasks available</Text>
        <Text style={styles.emptySubtext}>
          Pull down to refresh or check back later
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Delivery Tasks</Text>
        <Text style={styles.taskInstructions}>
          View your assigned delivery tasks and track their progress
        </Text>
      </View>

      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[
          styles.listContainer,
          tasks.length === 0 && styles.emptyListContainer,
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyList}
      />
    </View>
  );
};

// Basic TaskDetailsScreen stub - will be expanded later
export const TaskDetailsScreen = ({ route, navigation }) => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Task Details Screen</Text>
      <Text>Task ID: {route.params?.taskId}</Text>
      <TouchableOpacity
        style={{
          marginTop: 20,
          padding: 10,
          backgroundColor: "#4DA6FF",
          borderRadius: 5,
        }}
        onPress={() => navigation.goBack()}
      >
        <Text style={{ color: "white" }}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};
