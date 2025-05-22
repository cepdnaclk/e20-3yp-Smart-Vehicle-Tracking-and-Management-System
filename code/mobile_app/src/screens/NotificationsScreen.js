import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { useAppContext } from "../context/AppContext";
import { markNotificationAsRead } from "../services/NotificationService";
import AnimatedPlaceholder from "../components/AnimatedPlaceholder";

const NotificationsScreen = ({ navigation }) => {
  const { notifications, setNotifications } = useAppContext();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Just to show loading UI briefly
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // Just to simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleNotificationPress = async (notification) => {
    try {
      // Mark notification as read
      if (!notification.read) {
        await markNotificationAsRead(notification.id);

        // Update local state to mark this notification as read
        setNotifications(
          notifications.map((item) =>
            item.id === notification.id ? { ...item, read: true } : item
          )
        );
      }

      // If this notification is related to a task, navigate to that task
      if (notification.taskId) {
        navigation.navigate("TaskDetails", { taskId: notification.taskId });
      }
    } catch (error) {
      console.error("Error handling notification:", error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        item.read ? styles.readNotification : styles.unreadNotification,
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <Text style={styles.notificationTitle}>
        {item.title}
        {!item.read && <View style={styles.unreadDot} />}
      </Text>
      <Text style={styles.notificationMessage}>{item.message}</Text>
      <Text style={styles.notificationTime}>
        {item.time} • {item.date}
      </Text>
    </TouchableOpacity>
  );

  // Sort notifications with newest first
  const sortedNotifications = [...notifications].sort(
    (a, b) =>
      new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now())
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Notifications</Text>
        <Text style={styles.subHeaderText}>
          Stay updated with your delivery tasks
        </Text>
      </View>

      {loading ? (
        <AnimatedPlaceholder type="notification" count={3} />
      ) : (
        <FlatList
          data={sortedNotifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.notificationsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No notifications yet</Text>
              <Text style={styles.emptySubtext}>
                You'll be notified of task assignments and updates here
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerContainer: {
    padding: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  subHeaderText: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  notificationsList: {
    padding: 15,
  },
  notificationItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: "#4DA6FF",
  },
  readNotification: {
    opacity: 0.8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
    position: "relative",
    paddingRight: 20,
  },
  unreadDot: {
    position: "absolute",
    top: 5,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4DA6FF",
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 10,
    color: "#666",
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#BBB",
  },
});

export default NotificationsScreen;
