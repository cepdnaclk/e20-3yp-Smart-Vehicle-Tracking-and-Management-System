import React from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useAppContext } from "../context/AppContext";

const SettingsScreen = ({ navigation }) => {
  const {
    driverName,
    driverId,
    darkMode,
    setDarkMode,
    pushNotifications,
    setPushNotifications,
    logout,
  } = useAppContext();

  const handleLogout = () => {
    logout();
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {driverName ? driverName[0] : "D"}
          </Text>
        </View>
        <Text style={styles.profileName}>{driverName || "Driver Name"}</Text>
        <Text style={styles.profileInfo}>ID: {driverId || "DR001"}</Text>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>App Settings</Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: "#D1D1D6", true: "#81b0ff" }}
            thumbColor={darkMode ? "#4DA6FF" : "#f4f3f4"}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Push Notifications</Text>
          <Switch
            value={pushNotifications}
            onValueChange={setPushNotifications}
            trackColor={{ false: "#D1D1D6", true: "#81b0ff" }}
            thumbColor={pushNotifications ? "#4DA6FF" : "#f4f3f4"}
          />
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Support</Text>

        <TouchableOpacity style={styles.supportItem}>
          <Text style={styles.supportItemText}>Contact Support</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.supportItem}>
          <Text style={styles.supportItemText}>Help Center</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.supportItem}>
          <Text style={styles.supportItemText}>Terms of Service</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.supportItem}>
          <Text style={styles.supportItemText}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.versionInfo}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  profileSection: {
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
    margin: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4DA6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    color: "white",
    fontWeight: "bold",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    color: "#333",
  },
  profileInfo: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  settingsSection: {
    backgroundColor: "white",
    padding: 15,
    margin: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  settingLabel: {
    fontSize: 16,
    color: "#333",
  },
  supportItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  supportItemText: {
    fontSize: 16,
    color: "#333",
  },
  logoutButton: {
    backgroundColor: "#FF6B6B",
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  versionInfo: {
    alignItems: "center",
    marginBottom: 30,
  },
  versionText: {
    color: "#999",
    fontSize: 12,
  },
});

export default SettingsScreen;
