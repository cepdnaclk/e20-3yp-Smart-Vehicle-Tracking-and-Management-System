import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getVehicleTrackingData } from "../services/getVehicleTrackingData";

// Add CSS for the blinking dot
const blinkingDotStyle = `
  .blinking-dot {
    width: 14px;
    height: 14px;
    background-color: #ff3b30;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    animation: blink 1s infinite;
  }
  
  @keyframes blink {
    0% { opacity: 1; }
    50% { opacity: 0.3; }
    100% { opacity: 1; }
  }
`;

// Accept 'vehicles' prop
const LeafletMap = ({ vehicles = [] }) => {
    const [devicesData, setDevicesData] = useState([]);
    const [map, setMap] = useState(null);
    const [markers, setMarkers] = useState({}); // Store markers by deviceId
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initial map setup
    useEffect(() => {
        // Add blinking dot style to head
        const styleElement = document.createElement("style");
        styleElement.innerHTML = blinkingDotStyle;
        document.head.appendChild(styleElement);

        // Default location (Colombo)
        const defaultLocation = [6.9271, 79.8612];

        // Create map instance
        const mapInstance = L.map("map", {
            center: defaultLocation,
            zoom: 13,
        });

        // Add OpenStreetMap tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance);

        // Store map in state
        setMap(mapInstance);

        // Cleanup function
        return () => {
            mapInstance.remove();
            document.head.removeChild(styleElement);
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    // Listen for vehicle tracking data changes
    useEffect(() => {
        setLoading(true);
        setError(null);
        const unsubscribe = getVehicleTrackingData((data) => {
            console.log("Received device data:", data);
            if (data && data.length > 0) {
                setDevicesData(data);
                setLoading(false);
                setError(null);
            } else if (data && data.length === 0) {
                 // No devices found or no tracking data
                setDevicesData([]);
                setLoading(false);
                setError("No vehicle tracking data available.");
            } else {
                 // Error case (though getVehicleTrackingData handles errors internally, 
                 // this is a fallback)
                 setDevicesData([]);
                 setLoading(false);
                 setError("Failed to fetch vehicle data.");
            }
        });

        // Cleanup: unsubscribe from the Firebase listener when the component unmounts
        return () => { 
            console.log("Unsubscribing from Firebase listener");
            unsubscribe();
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    // Update markers when devices data changes or map is initialized
    useEffect(() => {
        if (!map) return; // Ensure map is initialized

        // Remove old markers
        Object.values(markers).forEach(marker => {
            if (map.hasLayer(marker)) {
                map.removeLayer(marker);
            }
        });

        const newMarkers = {};
        let bounds = L.latLngBounds();
        let hasValidData = false;

        // Add new markers
        devicesData.forEach(device => {
            // Check if latitude and longitude are valid numbers and not zero
            if (device.latitude && device.longitude &&
                typeof device.latitude === 'number' && typeof device.longitude === 'number' &&
                (device.latitude !== 0 || device.longitude !== 0)) {

                hasValidData = true;

                // Find the corresponding vehicle from the vehicles prop
                const correspondingVehicle = vehicles.find(v => v.deviceId === device.deviceId);
                const licensePlate = correspondingVehicle?.licensePlate || 'N/A'; // Get license plate or use N/A

                // Create custom icon with different colors based on tampering status
                const markerColor = device.tampering ? '#ff3b30' : '#3388ff'; // Red for tampering, Blue otherwise
                const vehicleIcon = L.divIcon({
                    className: "vehicle-marker",
                    html: `<div class="blinking-dot" style="background-color: ${markerColor}"></div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });

                const position = [device.latitude, device.longitude];
                const marker = L.marker(position, { icon: vehicleIcon });

                // Create popup content
                const popupContent = `
                    <div>
                        <strong>Vehicle:</strong> ${licensePlate}<br>
                        <strong>Device ID:</strong> ${device.deviceId}<br>
                        <strong>Speed:</strong> ${device.speed_kmh || device.speed || 0} km/h<br>
                        <strong>Temperature:</strong> ${device.temperature_C || 0}°C<br>
                        <strong>Humidity:</strong> ${device.humidity || 0}%<br>
                        ${device.tampering ? '<strong style="color: red;">TAMPERING DETECTED!</strong>' : ''}
                    </div>
                `;

                marker.bindPopup(popupContent);
                marker.addTo(map);
                newMarkers[device.deviceId] = marker;

                // Extend bounds to include this marker
                bounds.extend(position);
            }
        });

        setMarkers(newMarkers);

        // Adjust map view to fit all markers if there is valid data
        if (hasValidData && bounds.isValid()) {
             // Only fit bounds if there's more than one point or if it's the first data point
             // This prevents zooming in too close on a single point initially
             if (devicesData.length > 1 || Object.keys(markers).length === 0) {
                map.fitBounds(bounds, { padding: [50, 50] });
             } else {
                // If only one point and markers already exist, just pan to the new position
                const device = devicesData[0];
                 if (device.latitude && device.longitude) {
                    map.panTo([device.latitude, device.longitude]);
                 }
             }
        }

    }, [map, devicesData, vehicles]); // Rerun this effect when map, devicesData, or vehicles changes

    return (
        <div className="bg-light rounded">
            {loading && !error && <div className="text-center">Loading vehicle data...</div>}
            {error && <div className="text-danger text-center">{error}</div>}
            {/* The map div will be populated by Leaflet JS */}
            <div id="map" style={{ height: "400px", width: "100%" }}></div>
            <div className="d-flex justify-content-between align-items-center mt-2 p-2">
                <div className="small">
                    {!loading && !error && devicesData.length > 0 && (
                        <span>
                            <strong>Last updated:</strong> {new Date().toLocaleTimeString()}
                        </span>
                    )}
                    {!loading && !error && devicesData.length === 0 && (
                        <span>No vehicle tracking data available.</span>
                    )}
                </div>
                {/* Legend */}
                <div className="small">
                    <span className="me-3">
                        <span style={{ color: '#3388ff' }}>■</span> Normal
                    </span>
                    <span>
                        <span style={{ color: '#ff3b30' }}>■</span> Tampering Detected
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LeafletMap;