import React from "react";
import { View, Text, FlatList } from "react-native";
import { useAppContext } from "../context/AppContext";
import { styles } from "../styles/styles";

const NotificationsScreen = () => {
  const { notifications } = useAppContext();

  const renderItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.notificationTitle}>{item.title}</Text>
      <Text style={styles.notificationMessage}>{item.message}</Text>
      <Text style={styles.notificationTime}>{item.time}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Notifications</Text>
      {notifications.length === 0 ? (
        <Text style={styles.taskInstructions}>No notifications available.</Text>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

export default NotificationsScreen;
