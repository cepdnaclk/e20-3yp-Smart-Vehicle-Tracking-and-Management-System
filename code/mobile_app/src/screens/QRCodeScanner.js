import React from "react";
import { View, Text, TouchableOpacity, Vibration } from "react-native";
import { styles } from "../styles/styles";

const QRCodeScanner = ({ onRead, topContent, bottomContent }) => (
  <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
    {topContent}
    <View style={{ marginVertical: 20 }}>
      <Text style={{ textAlign: "center", marginBottom: 20, color: "#666" }}>
        For demo purposes, select a vehicle to scan:
      </Text>
      {["TN-01-AB-1234", "TN-01-CD-5678", "TN-01-EF-9012"].map((vehicle) => (
        <TouchableOpacity
          key={vehicle}
          style={{
            width: 200,
            height: 50,
            borderWidth: 2,
            borderColor: "#4DA6FF",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
            borderRadius: 8,
          }}
          onPress={() => {
            Vibration.vibrate(100);
            onRead({ data: vehicle });
          }}
        >
          <Text style={{ color: "#4DA6FF" }}>Scan {vehicle}</Text>
        </TouchableOpacity>
      ))}
    </View>
    {bottomContent}
  </View>
);

export default QRCodeScanner;
