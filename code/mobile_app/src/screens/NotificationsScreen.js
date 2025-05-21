import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useAppContext } from "../context/AppContext";

const NotificationsScreen = () => {
  const { notifications } = useAppContext();

  // Mock notifications for development
  const mockNotifications = [
    {
      id: "1",
      title: "New Task Assigned",
      message:
        "You have been assigned a new delivery task to Colombo City Center.",
      time: "10:30 AM",
    },
    {
      id: "2",
      title: "Task Reminder",
      message: "Reminder: You have a pending delivery due in 2 hours.",
      time: "11:45 AM",
    },
  ];

  const allNotifications =
    notifications.length > 0 ? notifications : mockNotifications;

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.notificationItem}>
      <Text style={styles.notificationTitle}>{item.title}</Text>
      <Text style={styles.notificationMessage}>{item.message}</Text>
      <Text style={styles.notificationTime}>{item.time}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Notifications</Text>
        <Text style={styles.subHeaderText}>
          Stay updated with your delivery tasks
        </Text>
      </View>

      <FlatList
        data={allNotifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.notificationsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
      />
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
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
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
  },
});

export default NotificationsScreen;
