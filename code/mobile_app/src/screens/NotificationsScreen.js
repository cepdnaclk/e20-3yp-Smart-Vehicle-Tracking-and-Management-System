import React from "react";
import { View, Text, FlatList } from "react-native";
import { styles } from "../styles/styles";

const NotificationsScreen = () => {
  const notifications = [
    {
      id: "1",
      title: "New Delivery Assigned",
      message:
        "You have been assigned a new delivery task for vehicle TN-01-GH-3456.",
      time: "2 hours ago",
    },
    {
      id: "2",
      title: "Route Update",
      message:
        "Your route has been updated due to traffic congestion on Highway 101.",
      time: "5 hours ago",
    },
    {
      id: "3",
      title: "Delivery Confirmation",
      message: "Your delivery to Distribution Center B has been confirmed.",
      time: "1 day ago",
    },
    {
      id: "4",
      title: "System Maintenance",
      message:
        "The system will undergo maintenance on May 12, 2025 from 2 AM to 4 AM.",
      time: "2 days ago",
    },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.notificationTitle}>{item.title}</Text>
      <Text style={styles.notificationMessage}>{item.message}</Text>
      <Text style={styles.notificationTime}>{item.time}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

export default NotificationsScreen;
