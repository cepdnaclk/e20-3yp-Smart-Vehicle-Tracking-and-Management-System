import React, { useState, useEffect } from 'react';
import { Modal, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { Truck, AlertTriangle, Thermometer, Droplets, MapPin, Package, Clock, CheckCircle, Users } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import CombinedSensorChart from './CombinedSensorChart';
import { getSensorsData } from '../services/getSensorsData';
import LeafletMap from './LeafletMap';
import { api } from '../services/api';

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
    status: 'active',
    tampering: false,
    speedHistory: [],
    temperatureHistory: [],
    humidityHistory: []
  });
  
  const [loading, setLoading] = useState(true);
  const [vehicleIcon] = useState(createVehicleIcon());
  const [currentTask, setCurrentTask] = useState(null);
  const [driverDetails, setDriverDetails] = useState(null);

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
          speedHistory: [...prev.speedHistory.slice(-6), { time: new Date().toLocaleTimeString(), speed }],
          temperatureHistory: [...prev.temperatureHistory.slice(-6), { time: new Date().toLocaleTimeString(), temperature }],
          humidityHistory: [...prev.humidityHistory.slice(-6), { time: new Date().toLocaleTimeString(), humidity }]
        }));

        // Fetch current task for this vehicle
        const licensePlate = vehicle?.licensePlate || vehicle?.number;
        console.log('Fetching tasks for vehicle:', { licensePlate, vehicle });
        
        if (licensePlate && licensePlate !== 'Not assigned') {
          try {
            const response = await api.get(`/api/tasks/vehicle/${licensePlate}`);
            console.log('Tasks response:', response.data);
            
            const tasks = response.data;
            // Find the most recent task that is either in progress or completed
            const activeTask = tasks.find(task => 
              task.status === 'In Progress' || 
              (task.status === 'Completed' && !tasks.some(t => 
                t.status === 'In Progress' && t._id !== task._id
              ))
            );
            console.log('Active task found:', activeTask);
            setCurrentTask(activeTask || null);
            
            // Fetch driver details if an active task is found or if vehicle has a driver associated
            const driverIdToFetch = activeTask?.driverId || vehicle?.driverId;
            if (driverIdToFetch) {
              console.log('Fetching driver details for ID:', driverIdToFetch);
              try {
                const driverResponse = await api.get(`/api/drivers/${driverIdToFetch}`);
                console.log('Driver details response:', driverResponse.data);
                setDriverDetails(driverResponse.data);
              } catch (driverError) {
                console.error('Error fetching driver details:', driverError);
                setDriverDetails(null);
              }
            } else {
              setDriverDetails(null);
            }

          } catch (error) {
            console.error('Error fetching tasks:', error);
            setCurrentTask(null);
            setDriverDetails(null); // Reset driver details if task fetching fails
          }
        } else {
          console.log('No valid license plate found for vehicle:', vehicle);
          setCurrentTask(null);
          setDriverDetails(null); // Reset driver details if no valid license plate
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setDriverDetails(null); // Reset driver details on main data fetch error
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Set up interval to fetch data every 15 seconds (reduced from 30 to update more frequently)
    const intervalId = setInterval(fetchData, 15000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [vehicle]);

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

        {/* Current Delivery Task Information */}
        {currentTask && (
          <Card className="mb-4">
            <Card.Header className="d-flex align-items-center">
              <Package className="me-2" />
              {currentTask.status === 'In Progress' ? 'Current Delivery' : 'Last Completed Delivery'}
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                   {/* Display Driver Info associated with the task if available */}
                   {currentTask && driverDetails && driverDetails.driverId === currentTask.driverId && (
                     <Row className="mb-3">
                       <Col xs={4} className="text-muted"><strong>Driver:</strong></Col>
                       <Col xs={8}>{driverDetails.fullName} ({driverDetails.driverId})</Col>
                       <Col xs={4} className="text-muted"><strong>Contact:</strong></Col>
                       <Col xs={8}>{driverDetails.phone}</Col>
                     </Row>
                   )}
                   <Row className="mb-3">
                     <Col xs={4} className="text-muted"><strong>Task Number:</strong></Col>
                     <Col xs={8}>{currentTask.taskNumber}</Col>
                   </Row>
                   <Row className="mb-3">
                     <Col xs={4} className="text-muted"><strong>Cargo Type:</strong></Col>
                     <Col xs={8}>{currentTask.cargoType}</Col>
                   </Row>
                   <Row className="mb-3">
                     <Col xs={4} className="text-muted"><strong>Weight:</strong></Col>
                     <Col xs={8}>{currentTask.weight} kg</Col>
                   </Row>
                   <Row className="mb-3">
                     <Col xs={4} className="text-muted"><strong>Pickup Location:</strong></Col>
                     <Col xs={8}>{currentTask.pickup}</Col>
                   </Row>
                </Col>
                <Col md={6}>
                   <Row className="mb-3">
                     <Col xs={4} className="text-muted"><strong>Delivery Location:</strong></Col>
                     <Col xs={8}>{currentTask.delivery}</Col>
                   </Row>
                   <Row className="mb-3">
                     <Col xs={4} className="text-muted"><strong>Delivery Contact:</strong></Col>
                     <Col xs={8}>{currentTask.deliveryPhone}</Col>
                   </Row>
                   <Row className="mb-3">
                     <Col xs={4} className="text-muted"><strong>Expected Delivery:</strong></Col>
                     <Col xs={8}>{new Date(currentTask.expectedDelivery).toLocaleString()}</Col>
                   </Row>
                   <Row className="mb-3">
                     <Col xs={4} className="text-muted"><strong>Status:</strong></Col>
                     <Col xs={8}>
                       <span className={`badge ${
                         currentTask.status === 'In Progress' 
                           ? 'bg-primary' 
                           : currentTask.status === 'Completed'
                           ? 'bg-success'
                           : 'bg-secondary'
                       }`}>
                         {currentTask.status}
                       </span>
                     </Col>
                   </Row>
                </Col>
              </Row>
              {currentTask.additionalNotes && (
                <div className="mt-3">
                  <strong>Additional Notes:</strong>
                  <p className="mb-0">{currentTask.additionalNotes}</p>
                </div>
              )}
            </Card.Body>
          </Card>
        )}

        {/* Combined Sensor History Chart */}
        <Card className="mb-4">
          <Card.Header>Sensor Data History</Card.Header>
          <Card.Body>
            <CombinedSensorChart 
              speedHistory={sensorData.speedHistory}
              temperatureHistory={sensorData.temperatureHistory}
              humidityHistory={sensorData.humidityHistory}
            />
          </Card.Body>
        </Card>

        {/* Map */}
        <LeafletMap />
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VehicleDetailsModal;
