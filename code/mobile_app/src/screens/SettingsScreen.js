import React from "react";
import { ScrollView, View, Text, TouchableOpacity, Switch } from "react-native";
import Icon from "./Icon";
import { useAppContext } from "../context/AppContext";
import { styles } from "../styles/styles";

const SettingsScreen = ({ navigation }) => {
  const {
    vehicleNumber,
    removeVehicle,
    darkMode,
    setDarkMode,
    pushNotifications,
    setPushNotifications,
  } = useAppContext();

  const containerStyle = darkMode
    ? { ...styles.container, backgroundColor: "#333" }
    : styles.container;
  const textStyle = darkMode
    ? { color: "#fff" }
    : { color: styles.settingLabel.color };

  return (
    <ScrollView style={containerStyle}>
      <View style={styles.profileSection}>
        <Icon name="account-circle" size={80} color="#4DA6FF" />
        <Text style={[styles.profileName, textStyle]}>John Driver</Text>
        <Text style={[styles.profileInfo, textStyle]}>ID: DRV12345</Text>
        <Text style={[styles.profileInfo, textStyle]}>
          Vehicle: {vehicleNumber || "None"}
        </Text>
        {vehicleNumber && (
          <TouchableOpacity style={styles.removeButton} onPress={removeVehicle}>
            <Text style={styles.removeButtonText}>Remove Current Vehicle</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.settingsSection}>
        <Text style={[styles.sectionTitle, textStyle]}>App Settings</Text>
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, textStyle]}>
            Push Notifications
          </Text>
          <Switch
            value={pushNotifications}
            onValueChange={setPushNotifications}
            trackColor={{ false: "#767577", true: "#4DA6FF" }}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, textStyle]}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: "#767577", true: "#4DA6FF" }}
          />
        </View>
      </View>
      <View style={styles.settingsSection}>
        <Text style={[styles.sectionTitle, textStyle]}>Support</Text>
        <TouchableOpacity style={styles.supportItem}>
          <Icon name="help-circle" size={24} color="#4DA6FF" />
          <Text style={[styles.supportItemText, textStyle]}>Help & FAQ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.supportItem}>
          <Icon name="headset" size={24} color="#4DA6FF" />
          <Text style={[styles.supportItemText, textStyle]}>
            Contact Support
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.supportItem}>
          <Icon name="information" size={24} color="#4DA6FF" />
          <Text style={[styles.supportItemText, textStyle]}>About App</Text>
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
