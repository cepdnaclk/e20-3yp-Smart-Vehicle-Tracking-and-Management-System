import React, { useState, useEffect } from 'react';
import { Modal, Button, Alert, Card, Row, Col, Spinner } from 'react-bootstrap';
import { Truck, AlertTriangle, Thermometer, Droplets, MapPin } from 'lucide-react';
import SpeedChart from './SpeedChart';
import TemperatureChart from './TemperatureChart';
import HumidityChart from './HumidityChart';
import { database } from "../lib/firebase";
import { ref, onValue } from "firebase/database";

const VehicleDetailsModal = ({ vehicle, onClose }) => {
  // Initial state for sensor data
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    speed: 0,
    location: { lat: 0, lng: 0 },
    status: 'Idle',
    tampering: false,
    speedHistory: [],
    temperatureHistory: [],
    humidityHistory: []
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If your Firebase structure is global (like your working HTML example), fetch from root "/"
    const rootRef = ref(database, "/");

    const unsubscribe = onValue(
      rootRef,
      (snapshot) => {
        console.log("Fetched Data from Firebase:", snapshot.val());
        if (snapshot.exists()) {
          const data = snapshot.val();

          // Extract data from the root JSON structure:
          // {
          //   "gps": { "latitude": ..., "longitude": ..., "speed_kmh": ... },
          //   "sensor": { "temperature_C": ..., "humidity": ... }
          // }
          const temperature = data.sensor?.temperature_C || 0;
          const humidity = data.sensor?.humidity || 0;
          const speed = data.gps?.speed_kmh || 0;
          const location = {
            lat: data.gps?.latitude || 0,
            lng: data.gps?.longitude || 0
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
        } else {
          console.error("No data found at the root of the database.");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    );

    // Clean up listener on unmount
    return () => unsubscribe();
  }, []); // Empty dependency array because data is global

  return (
    <Modal show={true} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <Truck className="me-2" /> Vehicle Details: {vehicle?.number || "N/A"}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p>Loading data...</p>
          </div>
        ) : (
          <>
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
                        <tr><th>License Plate:</th><td>{vehicle?.number || "Unknown"}</td></tr>
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
                        <strong>Location:</strong> Lat: {sensorData.location.lat}, Lng: {sensorData.location.lng}
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
                <div style={{ height: '300px', backgroundColor: '#f5f5f5', position: 'relative' }}>
                  <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 1,
                      textAlign: 'center',
                    }}>
                    <MapPin size={32} className="text-primary mb-2" />
                    <p>Loading map...</p>
                  </div>
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight="0"
                    marginWidth="0"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${sensorData.location.lng}%2C${sensorData.location.lat}%2C${sensorData.location.lng+0.01}%2C${sensorData.location.lat+0.01}&layer=mapnik&marker=${sensorData.location.lat},${sensorData.location.lng}`}
                    style={{ border: '1px solid black', position: 'relative', zIndex: 2 }}
                  ></iframe>
                </div>
              </Card.Body>
            </Card>
          </>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VehicleDetailsModal;
