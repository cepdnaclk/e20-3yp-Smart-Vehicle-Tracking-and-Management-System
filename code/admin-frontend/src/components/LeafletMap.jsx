import React, { useEffect, useState, useRef } from "react";
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

const LeafletMap = ({ mapType = 'standard' }) => {
    const [vehicleData, setVehicleData] = useState(null);
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Use refs to store path data and the polyline object
    const pathPointsRef = useRef([]);
    const polylineRef = useRef(null);
    const lastPositionRef = useRef(null);
    const isFirstDataPointRef = useRef(true);

    // Store max path segments to limit API calls and memory usage
    const maxPathSegments = 20;

    // Initial map setup
    useEffect(() => {
        // Add blinking dot style to head
        const styleElement = document.createElement("style");
        styleElement.innerHTML = blinkingDotStyle;
        document.head.appendChild(styleElement);

        // Default location if no vehicle data is available
        const defaultLocation = [6.9271, 79.8612];

        // Create map instance
        const mapInstance = L.map("map", {
            center: defaultLocation,
            zoom: 15,
        });

        // Add OpenStreetMap tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance);

        // Create custom icon for vehicle
        const vehicleIcon = L.divIcon({
            className: "vehicle-marker",
            html: '<div class="blinking-dot"></div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        // Create marker with default location
        const markerInstance = L.marker(defaultLocation, { icon: vehicleIcon }).addTo(mapInstance);

        // Create polyline for tracking path (empty initially)
        const polyline = L.polyline([], {
            color: '#3388ff',
            weight: 5,
            opacity: 0.8,
            lineJoin: 'round'
        }).addTo(mapInstance);

        // Store references
        polylineRef.current = polyline;

        // Store map and marker in state
        setMap(mapInstance);
        setMarker(markerInstance);

        // Cleanup function
        return () => {
            mapInstance.remove();
            document.head.removeChild(styleElement);
        };
    }, []);

    // Function to get route between two points using OSRM
    const getRoutePoints = async (startLat, startLng, endLat, endLng) => {
        try {
            const response = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
            );

            if (!response.ok) {
                throw new Error("Routing API request failed");
            }

            const data = await response.json();

            if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
                throw new Error("No route found");
            }

            // Extract route coordinates
            const routeCoordinates = data.routes[0].geometry.coordinates;

            // Convert [lng, lat] format to [lat, lng] format that Leaflet uses
            return routeCoordinates.map(coord => [coord[1], coord[0]]);
        } catch (error) {
            console.error("Error fetching route:", error);
            // Fall back to straight line if routing fails
            return [[startLat, startLng], [endLat, endLng]];
        }
    };

    // Fetch vehicle data and update periodically
    useEffect(() => {
        if (!map || !marker || !polylineRef.current) return;

        const fetchAndUpdateData = async () => {
            try {
                setLoading(true);
                const vTrackData = await getVehicleTrackingData();

                // Check if the data is valid and has location properties
                if (vTrackData && vTrackData.latitude && vTrackData.longitude) {
                    setVehicleData(vTrackData);

                    const newPosition = [vTrackData.latitude, vTrackData.longitude];

                    // Update marker position
                    marker.setLatLng(newPosition);

                    // Update route on the map
                    await updateRoutePath(newPosition);

                    // Re-center map
                    map.setView(newPosition, map.getZoom());

                    // We've received actual data now
                    isFirstDataPointRef.current = false;
                } else {
                    console.warn("Invalid vehicle data received:", vTrackData);
                    setError("No valid vehicle tracking data available");
                }
            } catch (error) {
                console.error("Error fetching vehicle tracking data:", error);
                setError("Failed to fetch vehicle data");
            } finally {
                setLoading(false);
            }
        };

        // Function to update the route path
        const updateRoutePath = async (newPosition) => {
            // If this is the first real data point, just set it without drawing a route
            if (isFirstDataPointRef.current) {
                lastPositionRef.current = newPosition;
                return;
            }

            // Only update if we have a new position that's different from the last one
            // and if we have a previous position to connect from
            if (lastPositionRef.current &&
                (lastPositionRef.current[0] !== newPosition[0] ||
                    lastPositionRef.current[1] !== newPosition[1])) {

                // Check if the distance is meaningful (to prevent routing for tiny movements)
                const distance = calculateDistance(
                    lastPositionRef.current[0], lastPositionRef.current[1],
                    newPosition[0], newPosition[1]
                );

                // Only get a route if the vehicle has moved a meaningful distance (e.g., 10 meters)
                if (distance > 0.01) { // ~10 meters
                    try {
                        // Get road-following route between the last position and the new position
                        const routePoints = await getRoutePoints(
                            lastPositionRef.current[0], lastPositionRef.current[1],
                            newPosition[0], newPosition[1]
                        );

                        // Add route to the path
                        if (routePoints && routePoints.length > 0) {
                            // Add all new route points except the first one (which is already the last point of the previous route)
                            if (pathPointsRef.current.length === 0) {
                                // If this is the first segment, add all points
                                pathPointsRef.current = routePoints;
                            } else {
                                // Otherwise, append all points except the first one
                                pathPointsRef.current = pathPointsRef.current.concat(routePoints.slice(1));
                            }

                            // Limit the number of path segments to prevent memory issues
                            if (pathPointsRef.current.length > maxPathSegments * 20) { // Assuming average of 20 points per segment
                                // Keep only the most recent points (approximately last 20 segments)
                                pathPointsRef.current = pathPointsRef.current.slice(-maxPathSegments * 20);
                            }

                            // Update polyline
                            polylineRef.current.setLatLngs(pathPointsRef.current);
                        }
                    } catch (error) {
                        console.error("Failed to update route:", error);
                    }
                }

                // Update last position
                lastPositionRef.current = newPosition;
            }
        };

        // Helper function to calculate distance between two points in km (haversine formula)
        const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371; // Radius of the earth in km
            const dLat = deg2rad(lat2 - lat1);
            const dLon = deg2rad(lon2 - lon1);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const d = R * c; // Distance in km
            return d;
        };

        const deg2rad = (deg) => {
            return deg * (Math.PI / 180);
        };

        // Fetch data immediately
        fetchAndUpdateData();

        // Set up interval for updates
        const interval = setInterval(fetchAndUpdateData, 3000);

        // Clean up interval
        return () => clearInterval(interval);
    }, [map, marker]);

    // Function to clear the path
    const clearPath = () => {
        if (polylineRef.current) {
            pathPointsRef.current = [];
            polylineRef.current.setLatLngs([]);
        }
    };

    return (
        <div className="card mb-4">
            <div className="card-body">
                <h5 className="card-title">Live Vehicle Tracking</h5>
                <div className="bg-light rounded p-4">
                    <div id="map" style={{ height: "400px", width: "100%" }}></div>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={clearPath}
                        >
                            Clear Path
                        </button>
                        <div className="small">
                            {loading && !vehicleData && <span>Loading vehicle data...</span>}
                            {error && <span className="text-danger">{error}</span>}
                            {vehicleData && (
                                <span>
                                    <strong> Last updated:</strong> {new Date().toLocaleTimeString()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeafletMap;