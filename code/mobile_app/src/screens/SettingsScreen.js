import React, { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, Switch } from "react-native";
import Icon from "./Icon";
import { useAppContext } from "../App";
import { styles } from "../styles/styles";

const SettingsScreen = ({ navigation }) => {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [locationTracking, setLocationTracking] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const { vehicleNumber, removeVehicle } = useAppContext();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileSection}>
        <Icon name="account-circle" size={80} color="#4DA6FF" />
        <Text style={styles.profileName}>John Driver</Text>
        <Text style={styles.profileInfo}>ID: DRV12345</Text>
        <Text style={styles.profileInfo}>
          Vehicle: {vehicleNumber || "None"}
        </Text>
        {vehicleNumber && (
          <TouchableOpacity style={styles.removeButton} onPress={removeVehicle}>
            <Text style={styles.removeButtonText}>Remove Current Vehicle</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Push Notifications</Text>
          <Switch
            value={pushNotifications}
            onValueChange={setPushNotifications}
            trackColor={{ false: "#767577", true: "#4DA6FF" }}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Location Tracking</Text>
          <Switch
            value={locationTracking}
            onValueChange={setLocationTracking}
            trackColor={{ false: "#767577", true: "#4DA6FF" }}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: "#767577", true: "#4DA6FF" }}
          />
        </View>
      </View>
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity style={styles.supportItem}>
          <Icon name="help-circle" size={24} color="#4DA6FF" />
          <Text style={styles.supportItemText}>Help & FAQ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.supportItem}>
          <Icon name="headset" size={24} color="#4DA6FF" />
          <Text style={styles.supportItemText}>Contact Support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.supportItem}>
          <Icon name="information" size={24} color="#4DA6FF" />
          <Text style={styles.supportItemText}>About App</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => navigation.replace("Login")}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SettingsScreen;
