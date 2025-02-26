import React, { useState, useEffect } from 'react';
import { Modal, Button, Alert, Card, Row, Col, Spinner } from 'react-bootstrap';
import { X, Truck, AlertTriangle, Activity, Thermometer, Droplets, MapPin } from 'lucide-react';
import SpeedChart from './SpeedChart';

const VehicleDetailsModal = ({ vehicle, onClose }) => {
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    speed: 0,
    location: { lat: 0, lng: 0 },
    accelerometer: { x: 0, y: 0, z: 0 },
    status: 'Idle',
    connected: true, // Initially set to true for demonstration
    tampering: false, // Set tampering status
    speedHistory: [] // History of speeds
  });
  
  const [loading, setLoading] = useState(true);

  // Fetch sensor data when the vehicle is selected
  useEffect(() => {
    if (vehicle) {
      fetchSensorData(vehicle.id);
    }
  }, [vehicle]);

  // Simulate fetching sensor data for the active vehicle
  const fetchSensorData = async (vehicleId) => {
    try {
      setLoading(true);
      const response = await new Promise((resolve) =>
        setTimeout(() => {
          resolve({
            temperature: Math.random() * 40, // Random temperature for example
            humidity: Math.random() * 100,   // Random humidity
            speed: Math.random() * 100,      // Random speed
            location: { lat: Math.random() * 180 - 90, lng: Math.random() * 360 - 180 }, // Random location
            accelerometer: { x: Math.random() * 10, y: Math.random() * 10, z: Math.random() * 10 }, // Random accelerometer values
            status: 'Moving',  // Simulated status
            tampering: Math.random() > 0.9, // Simulate a 10% chance of tampering
            speedHistory: generateMockSpeedHistory() // Simulate speed history
          });
        }, 1000)
      );
      setSensorData(response);
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock speed history
  const generateMockSpeedHistory = () => {
    const now = new Date();
    const data = [];
    for (let i = 0; i < 7; i++) {
      const time = new Date(now - i * 10 * 60000); // Simulate 10 min intervals
      data.push({ time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), speed: Math.random() * 100 });
    }
    return data;
  };

  return (
    <Modal show={true} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <Truck className="me-2" /> Vehicle Details: {vehicle.number}
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
            {/* Connection Alert */}
            {!sensorData.connected && (
              <Alert variant="warning" className="mb-4">
                <AlertTriangle className="me-2" />
                <strong>Warning:</strong> Device not connected! Unable to fetch sensor data.
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
                        <tr><th>Driver:</th><td>{vehicle.driver}</td></tr>
                        <tr><th>Status:</th><td>{sensorData.status}</td></tr>
                        <tr><th>License Plate:</th><td>{vehicle.number}</td></tr>
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
                      <Activity className="text-success me-2" />
                      <strong>Accelerometer:</strong> X: {sensorData.accelerometer.x}, Y: {sensorData.accelerometer.y}, Z: {sensorData.accelerometer.z}
                    </div>
                    <div>
                      <MapPin className="text-warning me-2" />
                      <strong>Location:</strong> Lat: {sensorData.location.lat}, Lng: {sensorData.location.lng}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Speed History Chart */}
            <Card className="mb-4">
              <Card.Header>Speed History</Card.Header>
              <Card.Body>
                {sensorData.speedHistory.length > 0 ? (
                  <SpeedChart data={sensorData.speedHistory} />
                ) : (
                  <div className="text-center">No speed history available</div>
                )}
              </Card.Body>
            </Card>

            {/* Map (Placeholder) */}
            <Card>
              <Card.Header>Vehicle Location on Map</Card.Header>
              <Card.Body>
                <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
                  <MapPin size={32} className="text-primary mb-3" />
                  <p>Map display here for Lat: {sensorData.location.lat}, Lng: {sensorData.location.lng}</p>
                </div>
              </Card.Body>
            </Card>
          </>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Close</Button>
        <Button variant="primary" onClick={() => fetchSensorData(vehicle.id)}>Refresh Data</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VehicleDetailsModal;
