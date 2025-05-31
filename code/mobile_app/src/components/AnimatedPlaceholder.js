import React from "react";
import { View, Animated, StyleSheet } from "react-native";

const AnimatedPlaceholder = ({ type, count = 1 }) => {
  // Create array of placeholders based on count
  const placeholders = Array.from({ length: count }, (_, i) => i);

  // Create placeholder based on type
  const renderPlaceholder = (index) => {
    if (type === "tasks") {
      return <TaskPlaceholder key={index} />;
    } else if (type === "notification") {
      return <NotificationPlaceholder key={index} />;
    } else {
      return <DefaultPlaceholder key={index} />;
    }
  };

  return (
    <View style={styles.container}>
      {placeholders.map((_, index) => renderPlaceholder(index))}
    </View>
  );
};

const TaskPlaceholder = () => {
  return (
    <View style={styles.taskPlaceholder}>
      <View style={styles.taskHeader}>
        <View style={styles.taskTitle} />
        <View style={styles.taskBadge} />
      </View>
      <View style={styles.taskDivider} />
      <View style={styles.taskContent}>
        <View style={styles.taskLocation} />
        <View style={styles.taskRow}>
          <View style={styles.taskInfoPill} />
          <View style={styles.taskInfoPill} />
        </View>
      </View>
    </View>
  );
};

const NotificationPlaceholder = () => {
  return (
    <View style={styles.notificationPlaceholder}>
      <View style={styles.notificationTitle} />
      <View style={styles.notificationContent} />
      <View style={styles.notificationTime} />
    </View>
  );
};

const DefaultPlaceholder = () => {
  return (
    <View style={styles.defaultPlaceholder}>
      <View style={styles.defaultLine} />
      <View style={styles.defaultLine} />
      <View style={[styles.defaultLine, { width: "70%" }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  // Task placeholder styles
  taskPlaceholder: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  taskTitle: {
    width: "60%",
    height: 18,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
  },
  taskBadge: {
    width: 80,
    height: 24,
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
  },
  taskDivider: {
    height: 1,
    backgroundColor: "#e8e8e8",
    marginVertical: 10,
  },
  taskContent: {
    marginTop: 10,
  },
  taskLocation: {
    width: "90%",
    height: 16,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginBottom: 10,
  },
  taskRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  taskInfoPill: {
    width: "45%",
    height: 14,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
  },
  // Notification placeholder styles
  notificationPlaceholder: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  notificationTitle: {
    width: "70%",
    height: 18,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginBottom: 10,
  },
  notificationContent: {
    width: "90%",
    height: 40,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginBottom: 10,
  },
  notificationTime: {
    width: "30%",
    height: 12,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    alignSelf: "flex-end",
  },
  // Default placeholder styles
  defaultPlaceholder: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  defaultLine: {
    width: "100%",
    height: 16,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginBottom: 10,
  },
});

export default AnimatedPlaceholder;
