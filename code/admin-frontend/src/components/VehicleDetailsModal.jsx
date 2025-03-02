import React, { useState, useEffect } from 'react';
import { Modal, Button, Alert, Card, Row, Col, Spinner } from 'react-bootstrap';
import { X, Truck, AlertTriangle, Activity, Thermometer, Droplets, MapPin } from 'lucide-react';
import SpeedChart from './SpeedChart';
import TemperatureChart from './TemperatureChart';  // Import the TemperatureChart component
import HumidityChart from './HumidityChart';      // Import the HumidityChart component

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
    speedHistory: [], // History of speeds
    temperatureHistory: [], // Temperature history
    humidityHistory: [] // Humidity history
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
            speedHistory: generateMockSpeedHistory(), // Simulate speed history
            temperatureHistory: generateMockTemperatureHistory(), // Simulate temperature history
            humidityHistory: generateMockHumidityHistory() // Simulate humidity history
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

  // Generate mock temperature history
  const generateMockTemperatureHistory = () => {
    const now = new Date();
    const data = [];
    for (let i = 0; i < 7; i++) {
      const time = new Date(now - i * 10 * 60000); // Simulate 10 min intervals
      data.push({ time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), temperature: Math.random() * 40 });
    }
    return data;
  };

  // Generate mock humidity history
  const generateMockHumidityHistory = () => {
    const now = new Date();
    const data = [];
    for (let i = 0; i < 7; i++) {
      const time = new Date(now - i * 10 * 60000); // Simulate 10 min intervals
      data.push({ time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), humidity: Math.random() * 100 });
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

            {/* Speed, Temperature, and Humidity History Charts */}
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

            <Card className="mb-4">
              <Card.Header>Temperature History</Card.Header>
              <Card.Body>
                {sensorData.temperatureHistory.length > 0 ? (
                  <TemperatureChart data={sensorData.temperatureHistory} />
                ) : (
                  <div className="text-center">No temperature history available</div>
                )}
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>Humidity History</Card.Header>
              <Card.Body>
                {sensorData.humidityHistory.length > 0 ? (
                  <HumidityChart data={sensorData.humidityHistory} />
                ) : (
                  <div className="text-center">No humidity history available</div>
                )}
              </Card.Body>
            </Card>

            {/* Map (Placeholder) */}
            <Card>
              <Card.Header>Vehicle Location on Map</Card.Header>
              <Card.Body>
                {/* Map Container */}
                <div style={{ height: '300px', backgroundColor: '#f5f5f5', position: 'relative' }}>
                  {/* Map Icon */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 1,
                      textAlign: 'center',
                    }}
                  >
                    <MapPin size={32} className="text-primary mb-2" />
                    <p style={{ margin: 0 }}>Loading map...</p>
                  </div>

                  {/* Map Iframe */}
                      <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no"
                        marginHeight="0"
                        marginWidth="0"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=77.5946%2C12.9716%2C80.2707%2C13.0827&layer=mapnik&marker=${sensorData.location.lat},${sensorData.location.lng}`}
                        style={{ border: '1px solid black', position: 'relative', zIndex: 2 }}
                      ></iframe>
                    </div>

                {/* Location Text */}
                <p className="mt-3" style={{ textAlign: 'center' }}>
                  Map display for Lat: {sensorData.location.lat}, Lng: {sensorData.location.lng}
                </p>
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
