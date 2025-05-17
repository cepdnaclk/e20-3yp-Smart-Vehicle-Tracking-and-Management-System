import React from "react";
import { Text } from "react-native";

const Icon = ({ name, size, color }) => (
  <Text style={{ color, fontSize: size }}>
    {name === "view-dashboard"
      ? "📊"
      : name === "qrcode-scan"
      ? "📷"
      : name === "format-list-checks"
      ? "📋"
      : name === "bell"
      ? "🔔"
      : name === "account-settings"
      ? "⚙️"
      : name === "account-circle"
      ? "👤"
      : name === "help-circle"
      ? "❓"
      : name === "headset"
      ? "🎧"
      : name === "information"
      ? "ℹ️"
      : name === "truck"
      ? "🚚"
      : name === "package"
      ? "📦"
      : name === "clock"
      ? "⏰"
      : name === "check-circle"
      ? "✅"
      : name === "flashlight"
      ? "🔦"
      : ""}
  </Text>
);

export default Icon;
