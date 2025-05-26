import React, { useState, useEffect } from 'react';
import { Modal, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { Truck, AlertTriangle, Thermometer, Droplets, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SpeedChart from './SpeedChart';
import TemperatureChart from './TemperatureChart';
import HumidityChart from './HumidityChart';
import { getSensorsData } from '../services/getSensorsData';

// Create custom vehicle icon
const createVehicleIcon = () => {
  return L.divIcon({
    className: 'custom-vehicle-icon',
    html: `
      <div style="
        background-color: #3388ff;
        border: 2px solid white;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 10px rgba(0,0,0,0.3);
      ">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const VehicleDetailsModal = ({ vehicle, onClose }) => {
  // Initial state for sensor data
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    speed: 0,
    location: { lat: 6.9271, lng: 79.8612 }, // Default to Colombo coordinates
    status: 'Idle',
    tampering: false,
    speedHistory: [],
    temperatureHistory: [],
    humidityHistory: []
  });
  
  const [loading, setLoading] = useState(true);
  const [vehicleIcon] = useState(createVehicleIcon());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSensorsData();
        
        // Extract data from the mock structure
        const temperature = data.sensor?.temperature_C || 0;
        const humidity = data.sensor?.humidity || 0;
        const speed = data.gps?.speed_kmh || 0;
        const location = {
          lat: data.gps?.latitude || 6.9271,
          lng: data.gps?.longitude || 79.8612
        };

        setSensorData((prev) => ({
          ...prev,
          temperature,
          humidity,
          speed,
          location,
          // Append new data to history arrays (keeping only the last 7 entries)
          speedHistory: [...prev.speedHistory.slice(-6), { time: new Date().toLocaleTimeString(), speed }],
          temperatureHistory: [...prev.temperatureHistory.slice(-6), { time: new Date().toLocaleTimeString(), temperature }],
          humidityHistory: [...prev.humidityHistory.slice(-6), { time: new Date().toLocaleTimeString(), humidity }]
        }));
      } catch (error) {
        console.error("Error fetching mock data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Set up interval to fetch data every 5 seconds
    const intervalId = setInterval(fetchData, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array

  return (
    <Modal show={true} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <Truck className="me-2" /> Vehicle Details: {vehicle?.number || vehicle?.licensePlate || "N/A"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Remove loading spinner for admin modal */}
        {/* If no sensor data is present, show an info alert */}
        {(!sensorData.temperature && !sensorData.humidity && !sensorData.speed) && (
          <Alert variant="info">
            No sensor data available. Please check your Firebase database path and data.
          </Alert>
        )}

        {/* Tampering Alert */}
        {sensorData.tampering && (
          <Alert variant="danger" className="mb-4">
            <AlertTriangle className="me-2" />
            <strong>ALERT:</strong> Tampering detected!
          </Alert>
        )}

        {/* Vehicle Information */}
        <Row className="mb-4">
          <Col md={6}>
            <Card>
              <Card.Header>Vehicle Information</Card.Header>
              <Card.Body>
                <table className="table table-borderless">
                  <tbody>
                    <tr><th>Driver:</th><td>{vehicle?.driver || "Unknown"}</td></tr>
                    <tr><th>Status:</th><td>{sensorData.status}</td></tr>
                    <tr><th>License Plate:</th><td>{vehicle?.number || vehicle?.licensePlate}</td></tr>
                  </tbody>
                </table>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card>
              <Card.Header>Sensor Readings</Card.Header>
              <Card.Body>
              <div className="mb-3">
                <Thermometer className="text-danger me-2" />
                <strong>Temperature:</strong> {sensorData.temperature} °C
              </div>
              <div className="mb-3">
                <Droplets className="text-primary me-2" />
                <strong>Humidity:</strong> {sensorData.humidity} %
              </div>
              <div className="mb-3">
                <MapPin className="text-warning me-2" />
                <strong>Location:</strong> Lat: {sensorData.location.lat.toFixed(6)}, Lng: {sensorData.location.lng.toFixed(6)}
              </div>
              <div>
                <Truck className="text-success me-2" />
                <strong>Speed:</strong> {sensorData.speed} km/h
              </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* History Charts */}
        <Card className="mb-4">
          <Card.Header>Speed History</Card.Header>
          <Card.Body>
            <SpeedChart data={sensorData.speedHistory} />
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header>Temperature History</Card.Header>
          <Card.Body>
            <TemperatureChart data={sensorData.temperatureHistory} />
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header>Humidity History</Card.Header>
          <Card.Body>
            <HumidityChart data={sensorData.humidityHistory} />
          </Card.Body>
        </Card>

        {/* Map */}
        <Card>
          <Card.Header>Vehicle Location on Map</Card.Header>
          <Card.Body>
            <div style={{ height: '300px', width: '100%' }}>
              <MapContainer
                center={[sensorData.location.lat, sensorData.location.lng]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker 
                  position={[sensorData.location.lat, sensorData.location.lng]}
                  icon={vehicleIcon}
                >
                  <Popup>
                    <div className="text-center">
                      <h6 className="mb-2">Vehicle Location</h6>
                      <div className="d-flex flex-column gap-1">
                        <div>
                          <Truck size={16} className="text-success me-1" />
                          Speed: {sensorData.speed} km/h
                        </div>
                        <div>
                          <Thermometer size={16} className="text-danger me-1" />
                          Temperature: {sensorData.temperature}°C
                        </div>
                        <div>
                          <Droplets size={16} className="text-primary me-1" />
                          Humidity: {sensorData.humidity}%
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </Card.Body>
        </Card>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VehicleDetailsModal;
