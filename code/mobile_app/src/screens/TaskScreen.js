import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from "react-native";
import { useAppContext } from "../context/AppContext";
import { styles } from "../styles/styles";
import AnimatedPlaceholder from "../components/AnimatedPlaceholder";
import { Feather } from "@expo/vector-icons";

export const TaskScreen = ({ navigation }) => {
  const { tasks, completedTasks, activeTaskId, loading } = useAppContext();
  const [refreshing, setRefreshing] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  // Function to handle task refresh
  const onRefresh = async () => {
    // This will be handled by the socket listeners in AppContext
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Filter tasks based on completion status
  const filteredTasks = showCompleted
    ? tasks.filter(
        (task) =>
          task.status === "Completed" || completedTasks.includes(task._id)
      )
    : tasks.filter(
        (task) =>
          task.status !== "Completed" && !completedTasks.includes(task._id)
      );

  const renderTaskItem = ({ item }) => {
    const isCompleted =
      item.status === "Completed" || completedTasks.includes(item._id);
    const isActive = item._id === activeTaskId;
    const isOverdue =
      new Date(item.expectedDelivery) < new Date() && !isCompleted;

    return (
      <TouchableOpacity
        style={[
          styles.taskItem,
          isCompleted && styles.completedTask,
          isOverdue && styles.overdueTask,
        ]}
        onPress={() => navigation.navigate("TaskDetails", { taskId: item._id })}
      >
        <View style={styles.taskHeader}>
          <View>
            <Text style={styles.taskNumber}>{item.taskNumber}</Text>
            <Text style={styles.cargoTypeText}>{item.cargoType}</Text>
          </View>
          <Text
            style={[
              styles.statusBadge,
              isCompleted
                ? styles.completedBadge
                : isActive
                ? styles.inProgressBadge
                : styles.pendingBadge,
            ]}
          >
            {isCompleted ? "Completed" : isActive ? "In Progress" : "Pending"}
          </Text>
        </View>

        <View style={styles.taskDetails}>
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>
              {item.pickup} → {item.delivery}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Feather name="calendar" size={12} color="#666" />
              <Text style={styles.infoText}>
                {new Date(item.expectedDelivery).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Feather name="package" size={12} color="#666" />
              <Text style={styles.infoText}>{item.weight} kg</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Delivery Tasks</Text>
        <Text style={styles.taskInstructions}>
          {showCompleted
            ? "Your completed deliveries"
            : "View and manage your assigned deliveries"}
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          paddingHorizontal: 15,
          paddingVertical: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => setShowCompleted(!showCompleted)}
          style={{
            backgroundColor: showCompleted ? "#4DA6FF" : "#f0f0f0",
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
          }}
        >
          <Text
            style={{
              color: showCompleted ? "white" : "#333",
              fontWeight: "500",
            }}
          >
            {showCompleted ? "Show Active Tasks" : "Show Completed"}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <AnimatedPlaceholder type="tasks" count={3} />
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather
                name={showCompleted ? "check-circle" : "inbox"}
                size={50}
                color="#ccc"
              />
              <Text style={styles.emptyText}>
                {showCompleted
                  ? "No completed tasks yet"
                  : "No pending tasks found"}
              </Text>
              <Text style={styles.emptySubtext}>
                {showCompleted
                  ? "Completed tasks will appear here"
                  : "Pull down to refresh"}
              </Text>
            </View>
          }
        />
      )}
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
