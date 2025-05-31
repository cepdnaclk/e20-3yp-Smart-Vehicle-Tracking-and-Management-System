import React from "react";
import { View, Text, Platform, StyleSheet } from "react-native";

// Only import react-native-maps in native environments
const MapView = Platform.select({
  native: () => require("react-native-maps").default,
  default: () => {
    // Web environment - return a simple component that renders an iframe with OpenStreetMap
    return ({
      style,
      region,
      children,
      showsUserLocation,
      initialRegion,
      ...otherProps
    }) => {
      // Generate OpenStreetMap URL from the provided region
      const lat = region?.latitude || initialRegion?.latitude || 0;
      const lng = region?.longitude || initialRegion?.longitude || 0;
      const zoom = 15; // Default zoom level

      return (
        <View style={[styles.container, style]}>
          <iframe
            title="Map"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight="0"
            marginWidth="0"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${
              lng - 0.01
            }%2C${lat - 0.01}%2C${lng + 0.01}%2C${
              lat + 0.01
            }&layer=mapnik&marker=${lat}%2C${lng}`}
            style={styles.iframe}
          />
          <View style={styles.overlay}>{children}</View>
        </View>
      );
    };
  },
})();

// Create a web-compatible Marker component
const Marker = Platform.select({
  native: () => require("react-native-maps").Marker,
  default: () => (props) => {
    // In web, markers are handled by the OpenStreetMap iframe, so this is just a placeholder
    return null;
  },
})();

// Export platform-specific components
export { Marker };

const styles = StyleSheet.create({
  container: {
    height: 300,
    width: "100%",
    position: "relative",
    backgroundColor: "#f0f0f0",
  },
  iframe: {
    border: "none",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

// Export the MapView as the default
export default MapView;
