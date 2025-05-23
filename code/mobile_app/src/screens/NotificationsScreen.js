import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Button,
} from "react-native";
import { useAppContext } from "../context/AppContext";
import {
  markNotificationAsRead,
  setupNotificationListeners,
} from "../services/NotificationService";
import AnimatedPlaceholder from "../components/AnimatedPlaceholder";
import socketService from "../services/SocketService";
import { Feather } from "@expo/vector-icons";

const NotificationsScreen = ({ navigation }) => {
  const { notifications, setNotifications } = useAppContext();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Handle new notifications
  const handleNewNotification = useCallback(
    (notification) => {
      console.log("New notification received:", notification.title);
      setNotifications((prev) => [notification, ...prev]);
    },
    [setNotifications]
  );

  // Set up notification listeners
  useEffect(() => {
    console.log("Setting up notification listeners in NotificationsScreen");
    const unsubscribe = setupNotificationListeners(handleNewNotification);

    // Initialize
    setTimeout(() => setLoading(false), 500);

    return () => {
      console.log("Cleaning up notification listeners");
      unsubscribe();
    };
  }, [handleNewNotification]);

  const onRefresh = () => {
    setRefreshing(true);
    // Test socket connection
    socketService.emitTest();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear Notifications",
      "Are you sure you want to clear all notifications?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear All",
          onPress: clearNotifications,
          style: "destructive",
        },
      ]
    );
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
      <View style={styles.notificationIcon}>
        {getNotificationIcon(item.action)}
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>
          {item.title}
          {!item.read && <View style={styles.unreadDot} />}
        </Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>
          {item.time} • {item.date}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Helper function to get the appropriate icon for each notification type
  const getNotificationIcon = (action) => {
    switch (action) {
      case "assign":
        return <Feather name="plus-circle" size={24} color="#4DA6FF" />;
      case "update":
        return <Feather name="edit" size={24} color="#FFC107" />;
      case "delete":
        return <Feather name="trash-2" size={24} color="#FF6B6B" />;
      case "reminder":
        return <Feather name="clock" size={24} color="#4CAF50" />;
      default:
        return <Feather name="bell" size={24} color="#4DA6FF" />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Notifications</Text>
        <Text style={styles.subHeaderText}>
          Stay updated with your delivery tasks
        </Text>
      </View>

      {/* Debug button - remove in production */}
      <TouchableOpacity
        style={{
          backgroundColor: "#4DA6FF",
          padding: 10,
          margin: 10,
          borderRadius: 5,
          alignItems: "center",
        }}
        onPress={() => {
          const success = socketService.emitTest();
          if (success) {
            setNotifications((prev) => [
              {
                id: `notif_test_${Date.now()}`,
                title: "Test Notification",
                message:
                  "This is a test notification to verify the system is working.",
                time: new Date().toLocaleTimeString(),
                date: new Date().toLocaleDateString(),
                read: false,
                createdAt: new Date(),
              },
              ...prev,
            ]);
          }
        }}
      >
        <Text style={{ color: "white" }}>Test Connection</Text>
      </TouchableOpacity>

      {loading ? (
        <AnimatedPlaceholder type="notification" count={3} />
      ) : (
        <FlatList
          data={notifications}
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
                You'll be notified when tasks are updated
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerSubrow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  subHeaderText: {
    fontSize: 14,
    color: "#666",
  },
  clearButton: {
    padding: 5,
  },
  clearButtonText: {
    color: "#FF6B6B",
    fontWeight: "500",
  },
  connectionIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  connected: {
    backgroundColor: "#4CAF50",
  },
  disconnected: {
    backgroundColor: "#FF6B6B",
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
    flexDirection: "row",
  },
  notificationIcon: {
    marginRight: 15,
    alignSelf: "center",
  },
  notificationContent: {
    flex: 1,
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
  emptyIcon: {
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginBottom: 10,
    fontWeight: "500",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#BBB",
    textAlign: "center",
    marginBottom: 20,
  },
  socketButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#4DA6FF",
    borderRadius: 20,
    marginTop: 10,
  },
  socketButtonText: {
    color: "white",
    fontWeight: "500",
  },
});

export default NotificationsScreen;
