import React from "react";
import { View, Text, TouchableOpacity, Alert, Vibration } from "react-native";
import QRCodeScanner from "./QRCodeScanner";
import { useAppContext } from "../App";
import { styles } from "../styles/styles";

const QRScannerScreen = ({ navigation, route }) => {
  const { setScannedVehicle } = useAppContext();
  const { requiredVehicle } = route.params || {};

  const onSuccess = (e) => {
    const vehicleNumber = e.data;
    if (requiredVehicle && vehicleNumber !== requiredVehicle) {
      Alert.alert(
        "Wrong Vehicle",
        `You scanned ${vehicleNumber}, but you need to scan ${requiredVehicle} for this task.`,
        [{ text: "Try Again" }]
      );
      return;
    }
    setScannedVehicle(vehicleNumber);
    Vibration.vibrate(100);
    Alert.alert("Vehicle Scanned", `Vehicle Number: ${vehicleNumber}`, [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <View style={styles.container}>
      {requiredVehicle && (
        <View style={styles.requiredVehicleContainer}>
          <Text style={styles.requiredVehicleText}>
            Please scan vehicle:{" "}
            <Text style={styles.requiredVehicleNumber}>{requiredVehicle}</Text>
          </Text>
        </View>
      )}
      <QRCodeScanner
        onRead={onSuccess}
        topContent={
          <Text style={styles.centerText}>
            {requiredVehicle
              ? `Scan the QR code for vehicle ${requiredVehicle}`
              : "Scan any vehicle QR code to begin"}
          </Text>
        }
        bottomContent={
          <TouchableOpacity style={styles.buttonTouchable}>
            <Text style={styles.buttonText}>Position QR code in the frame</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
};

export default QRScannerScreen;
