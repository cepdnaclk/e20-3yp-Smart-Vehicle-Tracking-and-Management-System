import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getSensorsData } from "../services/getSensorsData";

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

// Accept deviceId prop
const LeafletMap = ({ deviceId }) => {
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
    const maxPathSegments = 100; // Limit path length

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
    }, []); // Empty dependency array ensures this runs only once on mount

    // Fetch vehicle data periodically using the provided deviceId
    useEffect(() => {
        // Only fetch if map, marker, polyline are initialized and deviceId is provided
        if (!map || !marker || !polylineRef.current || !deviceId) {
             setLoading(false); // Ensure loading is false if requirements aren't met
             setError("Device ID not provided.");
             return;
        }

        setLoading(true);
        setError(null);

        const fetchData = async () => {
            try {
                const vTrackData = await getSensorsData(deviceId);

                if (vTrackData && vTrackData.gps?.latitude !== 0 && vTrackData.gps?.longitude !== 0) {
                    setVehicleData(vTrackData);

                    const newPosition = [vTrackData.gps.latitude, vTrackData.gps.longitude];

                    // Update marker position and popup content
                    marker.setLatLng(newPosition);
                     marker.bindPopup(`
                         <div>
                             <strong>Device ID:</strong> ${vTrackData.deviceId}<br>
                             <strong>Speed:</strong> ${vTrackData.gps?.speed_kmh || 0} km/h<br>
                             <strong>Temperature:</strong> ${vTrackData.sensor?.temperature_C || 0}°C<br>
                             <strong>Humidity:</strong> ${vTrackData.sensor?.humidity || 0}%<br>
                             ${vTrackData.tampering ? '<strong style="color: red;">TAMPERING DETECTED!</strong>' : ''}
                         </div>
                     `);
                     // Update icon color based on tampering status
                     const markerColor = vTrackData.tampering ? '#ff3b30' : '#3388ff'; // Red for tampering, Blue otherwise
                     const iconHtml = `<div class="blinking-dot" style="background-color: ${markerColor}"></div>`;
                     const currentIcon = marker.getIcon();
                     if (currentIcon && currentIcon.options.html !== iconHtml) {
                          marker.setIcon(L.divIcon({
                              className: "vehicle-marker",
                              html: iconHtml,
                              iconSize: [24, 24],
                              iconAnchor: [12, 12]
                          }));
                     }

                    // Update route on the map
                    updateRoutePath(newPosition);

                    // Re-center map only on the first valid data point or if the view hasn't been manually moved
                    // A more sophisticated approach might track user pan/zoom
                     if (isFirstDataPointRef.current && map) {
                    map.setView(newPosition, map.getZoom());
                     }

                    isFirstDataPointRef.current = false;
                    setLoading(false);
                    setError(null);

                } else {
                    console.warn(`Invalid or no data received for device ${deviceId}:`, vTrackData);
                     // If data becomes invalid, reset marker and path
                     if (marker) marker.setLatLng([0,0]); // Or a default location like [6.9271, 79.8612]
                     if (polylineRef.current) polylineRef.current.setLatLngs([]);
                     pathPointsRef.current = [];
                     lastPositionRef.current = null;
                     isFirstDataPointRef.current = true;
                     setVehicleData(null);
                     setLoading(false);
                     setError(`No valid tracking data available for device ${deviceId}`);
                }
            } catch (err) {
                 console.error(`Error fetching data for device ${deviceId}:`, err);
                 // Handle fetch error - reset marker and path
                 if (marker) marker.setLatLng([0,0]); // Or a default location
                 if (polylineRef.current) polylineRef.current.setLatLngs([]);
                 pathPointsRef.current = [];
                 lastPositionRef.current = null;
                 isFirstDataPointRef.current = true;
                 setVehicleData(null);
                setLoading(false);
                 setError(`Error fetching tracking data for device ${deviceId}`);
            }
        };

        // Fetch data immediately
        fetchData();

        // Set up interval for updates
        const interval = setInterval(fetchData, 3000); // Poll every 3 seconds

        // Cleanup:
        return () => {
            console.log(`Clearing interval for device ${deviceId}`);
            clearInterval(interval);
            // Also clear path and reset state when deviceId changes or component unmounts
            pathPointsRef.current = [];
            if(polylineRef.current) polylineRef.current.setLatLngs([]);
            lastPositionRef.current = null;
            isFirstDataPointRef.current = true;
            setVehicleData(null); // Clear previous vehicle data
             // Optionally reset marker to default or hide it
             if (marker) marker.setLatLng([0,0]); // Or a default location
             setLoading(false); // Ensure loading is off on cleanup
             setError(null); // Clear any errors on cleanup
        };
    }, [map, marker, polylineRef, deviceId]); // Re-run effect if map, marker, polylineRef or deviceId changes

        // Function to update the route path
    const updateRoutePath = (newPosition) => {
         // Only update if we have a valid position
         if (newPosition[0] === 0 && newPosition[1] === 0) {
             return;
         }

        // If this is the very first real data point, initialize
            if (isFirstDataPointRef.current) {
             pathPointsRef.current = [newPosition];
                lastPositionRef.current = newPosition;
             // isFirstDataPointRef.current = false; // Set in the data fetching effect
             if(polylineRef.current) polylineRef.current.setLatLngs(pathPointsRef.current);
                return;
            }

        // Only update if the position has actually changed from the last recorded position
        // Use a smaller tolerance for floating point comparisons to capture more detailed movement
        const tolerance = 0.0000001;
            if (lastPositionRef.current &&
            (Math.abs(lastPositionRef.current[0] - newPosition[0]) > tolerance ||
             Math.abs(lastPositionRef.current[1] - newPosition[1]) > tolerance)) {

            // Add the new position to the path points
            pathPointsRef.current = [...pathPointsRef.current, newPosition];

            // Limit the number of path segments to prevent performance/memory issues
            if (pathPointsRef.current.length > maxPathSegments) {
                pathPointsRef.current = pathPointsRef.current.slice(pathPointsRef.current.length - maxPathSegments);
                            }

                            // Update polyline
            if (polylineRef.current) {
                            polylineRef.current.setLatLngs(pathPointsRef.current);
                }

                // Update last position
                lastPositionRef.current = newPosition;
             // Optional: Re-center map on the tracked vehicle's latest position
            // if (map) {
            //      map.setView(newPosition, map.getZoom());
            // }
            }
        };

        // Helper function to calculate distance between two points in km (haversine formula)
    // (Kept this as it might be useful later)
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

    // Function to clear the path
    const clearPath = () => {
        if (polylineRef.current) {
            pathPointsRef.current = [];
            polylineRef.current.setLatLngs([]);
            lastPositionRef.current = null; // Reset last position when clearing path
            isFirstDataPointRef.current = true; // Treat next point as the first after clearing
        }
    };

    return (
        <div className="card mb-4">
            <div className="card-body">
                <h5 className="card-title">Live Vehicle Tracking</h5>
                <div className="bg-light rounded p-4">
                     {/* The map div will be populated by Leaflet JS */}
                    <div id="map" style={{ height: "400px", width: "100%" }}></div>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={clearPath}
                             disabled={!vehicleData || pathPointsRef.current.length === 0} // Disable if no data or empty path
                        >
                            Clear Path
                        </button>
                        <div className="small">
                            {loading && !vehicleData && <span>Loading vehicle data...</span>}
                            {error && <span className="text-danger">{error}</span>}
                            {vehicleData && (
                                <span>
                                    <strong>Last updated:</strong> {new Date().toLocaleTimeString()}
                                </span>
                            )}
                        </div>
                         {/* Legend - not needed for single vehicle map */}
                        {/* <div className="small">
                            <span className="me-3">
                                <span style={{ color: '#3388ff' }}>■</span> Normal
                            </span>
                            <span>
                                <span style={{ color: '#ff3b30' }}>■</span> Tampering Detected
                            </span>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeafletMap;