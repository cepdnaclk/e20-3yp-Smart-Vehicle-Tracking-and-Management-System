import React, { useState, useEffect } from 'react';
import { Modal, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { Truck, AlertTriangle, Thermometer, Droplets, MapPin, Package, Clock, CheckCircle, Users, Activity } from 'lucide-react';
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
        // Get the license plate from the vehicle object
        const licensePlate = vehicle?.licensePlate || vehicle?.number;
        if (!licensePlate) {
          console.error("No license plate found for vehicle:", vehicle);
          setLoading(false);
          return;
        }

        // First, fetch the vehicle details to get the device ID
        try {
          const vehicleResponse = await api.get(`/api/vehicles/license/${licensePlate}`);
          const vehicleDetails = vehicleResponse.data;
          console.log(`Backend response for vehicle ${licensePlate}:`, vehicleDetails);
          
          if (!vehicleDetails || !vehicleDetails.vehicle || !vehicleDetails.vehicle.deviceId) {
            console.error(`No device ID found for vehicle with license plate ${licensePlate}`);
            setLoading(false);
            return;
          }

          // Store the deviceId in the vehicle object for the map component
          vehicle.deviceId = vehicleDetails.vehicle.deviceId;

          // Now fetch the sensor data using the device ID
          const data = await getSensorsData(vehicleDetails.vehicle.deviceId);
          
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
            tampering: data.tampering || false,
            speedHistory: [...prev.speedHistory.slice(-6), { time: new Date().toLocaleTimeString(), speed }],
            temperatureHistory: [...prev.temperatureHistory.slice(-6), { time: new Date().toLocaleTimeString(), temperature }],
            humidityHistory: [...prev.humidityHistory.slice(-6), { time: new Date().toLocaleTimeString(), humidity }]
          }));

          // Fetch current task for this vehicle
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
          console.error("Error fetching vehicle details:", error);
          setLoading(false);
          return;
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
    <Modal show={true} onHide={onClose} size="xl" backdrop="static">
      <Modal.Header 
        closeButton 
        style={{
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.1))',
          border: '1px solid rgba(102, 126, 234, 0.3)',
          color: '#4338ca'
        }}
      >
        <Modal.Title className="d-flex align-items-center" style={{ fontSize: '1.4rem', fontWeight: '600' }}>
          <div 
            style={{
              background: 'rgba(67, 56, 202, 0.15)',
              borderRadius: '8px',
              padding: '8px',
              marginRight: '12px'
            }}
          >
            <Truck size={24} color="#4338ca" />
          </div>
          Vehicle Details: {vehicle?.number || vehicle?.licensePlate || "N/A"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: '2rem', backgroundColor: '#f8fafc' }}>
        {/* Remove loading spinner for admin modal */}
        {/* If no sensor data is present, show an info alert */}
        {(!sensorData.temperature && !sensorData.humidity && !sensorData.speed) && (
          <Alert 
            variant="info" 
            style={{
              border: 'none',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
              borderLeft: '4px solid #3b82f6',
              color: '#1e40af'
            }}
          >
            <div className="d-flex align-items-center">
              <div 
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '8px',
                  padding: '8px',
                  marginRight: '12px'
                }}
              >
                <AlertTriangle size={20} color="#3b82f6" />
              </div>
              <span style={{ fontWeight: '500' }}>
                No sensor data available. Please check your Firebase database path and data.
              </span>
            </div>
          </Alert>
        )}

        {/* Tampering Alert */}
        {sensorData.tampering && (
          <Alert 
            variant="danger" 
            className="mb-4"
            style={{
              border: 'none',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
              borderLeft: '4px solid #ef4444',
              color: '#dc2626'
            }}
          >
            <div className="d-flex align-items-center">
              <div 
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '8px',
                  padding: '8px',
                  marginRight: '12px'
                }}
              >
                <AlertTriangle size={20} color="#ef4444" />
              </div>
              <span style={{ fontWeight: '600' }}>
                ALERT: Tampering detected!
              </span>
            </div>
          </Alert>
        )}

        {/* Current Delivery Task Information */}
        {currentTask && (
          <Card 
            className="mb-4" 
            style={{
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              overflow: 'hidden'
            }}
          >
            <Card.Header 
              className="d-flex align-items-center"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#047857',
                padding: '1.25rem'
              }}
            >
              <div 
                style={{
                  background: 'rgba(5, 150, 105, 0.15)',
                  borderRadius: '8px',
                  padding: '8px',
                  marginRight: '12px'
                }}
              >
                <Package size={20} color="#047857" />
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                {currentTask.status === 'In Progress' ? 'Current Delivery' : 'Last Completed Delivery'}
              </span>
            </Card.Header>
            <Card.Body style={{ padding: '1.5rem', background: 'white' }}>
              <Row>
                <Col md={6}>
                   {/* Display Driver Info associated with the task if available */}
                   {currentTask && driverDetails && driverDetails.driverId === currentTask.driverId && (
                     <div className="mb-4" style={{
                       background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(124, 58, 237, 0.03))',
                       borderRadius: '12px',
                       padding: '1rem',
                       border: '1px solid rgba(139, 92, 246, 0.1)'
                     }}>
                       <div className="d-flex align-items-center mb-3">
                         <div style={{
                           background: 'rgba(139, 92, 246, 0.1)',
                           borderRadius: '8px',
                           padding: '6px',
                           marginRight: '8px'
                         }}>
                           <Users size={16} color="#8b5cf6" />
                         </div>
                         <span style={{ fontWeight: '600', color: '#6b46c1' }}>Driver Information</span>
                       </div>
                       <div className="row mb-2">
                         <div className="col-4" style={{ color: '#6b7280', fontWeight: '500' }}>Name:</div>
                         <div className="col-8" style={{ fontWeight: '500' }}>{driverDetails.fullName} ({driverDetails.driverId})</div>
                       </div>
                       <div className="row">
                         <div className="col-4" style={{ color: '#6b7280', fontWeight: '500' }}>Contact:</div>
                         <div className="col-8" style={{ fontWeight: '500' }}>{driverDetails.phone}</div>
                       </div>
                     </div>
                   )}
                   <div className="info-row mb-3">
                     <div style={{ color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}>Task Number</div>
                     <div style={{ fontWeight: '600', color: '#1f2937' }}>{currentTask.taskNumber}</div>
                   </div>
                   <div className="info-row mb-3">
                     <div style={{ color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}>Cargo Type</div>
                     <div style={{ fontWeight: '600', color: '#1f2937' }}>{currentTask.cargoType}</div>
                   </div>
                   <div className="info-row mb-3">
                     <div style={{ color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}>Weight</div>
                     <div style={{ fontWeight: '600', color: '#1f2937' }}>{currentTask.weight} kg</div>
                   </div>
                   <div className="info-row mb-3">
                     <div style={{ color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}>Pickup Location</div>
                     <div style={{ fontWeight: '600', color: '#1f2937' }}>{currentTask.pickup}</div>
                   </div>
                </Col>
                <Col md={6}>
                   <div className="info-row mb-3">
                     <div style={{ color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}>Delivery Location</div>
                     <div style={{ fontWeight: '600', color: '#1f2937' }}>{currentTask.delivery}</div>
                   </div>
                   <div className="info-row mb-3">
                     <div style={{ color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}>Delivery Contact</div>
                     <div style={{ fontWeight: '600', color: '#1f2937' }}>{currentTask.deliveryPhone}</div>
                   </div>
                   <div className="info-row mb-3">
                     <div style={{ color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}>Expected Delivery</div>
                     <div style={{ fontWeight: '600', color: '#1f2937' }}>{new Date(currentTask.expectedDelivery).toLocaleString()}</div>
                   </div>
                   <div className="info-row mb-3">
                     <div style={{ color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}>Status</div>
                     <div>
                       <span 
                         style={{
                           background: currentTask.status === 'In Progress' 
                             ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.15))'
                             : currentTask.status === 'Completed'
                             ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.15))'
                             : 'linear-gradient(135deg, rgba(107, 114, 128, 0.2), rgba(75, 85, 99, 0.15))',
                           color: currentTask.status === 'In Progress' 
                             ? '#2563eb'
                             : currentTask.status === 'Completed'
                             ? '#047857'
                             : '#4b5563',
                           padding: '6px 12px',
                           borderRadius: '8px',
                           fontSize: '0.875rem',
                           fontWeight: '500',
                           border: currentTask.status === 'In Progress' 
                             ? '1px solid rgba(59, 130, 246, 0.4)'
                             : currentTask.status === 'Completed'
                             ? '1px solid rgba(16, 185, 129, 0.4)'
                             : '1px solid rgba(107, 114, 128, 0.4)'
                         }}
                       >
                         {currentTask.status}
                       </span>
                     </div>
                   </div>
                </Col>
              </Row>
              {currentTask.additionalNotes && (
                <div 
                  className="mt-4" 
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(37, 99, 235, 0.03))',
                    borderRadius: '12px',
                    padding: '1rem',
                    border: '1px solid rgba(59, 130, 246, 0.1)'
                  }}
                >
                  <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>Additional Notes:</div>
                  <p className="mb-0" style={{ color: '#4b5563', lineHeight: '1.5' }}>{currentTask.additionalNotes}</p>
                </div>
              )}
            </Card.Body>
          </Card>
        )}

        {/* Combined Sensor History Chart */}
        <Card 
          className="mb-4" 
          style={{
            border: 'none',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            overflow: 'hidden'
          }}
        >
          <Card.Header 
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1))',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#b45309',
              padding: '1.25rem'
            }}
          >
            <div className="d-flex align-items-center">
              <div 
                style={{
                  background: 'rgba(180, 83, 9, 0.15)',
                  borderRadius: '8px',
                  padding: '8px',
                  marginRight: '12px'
                }}
              >
                <Activity size={20} color="#b45309" />
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                Sensor Data History
              </span>
            </div>
          </Card.Header>
          <Card.Body style={{ padding: '1.5rem', background: 'white' }}>
            <CombinedSensorChart 
              speedHistory={sensorData.speedHistory}
              temperatureHistory={sensorData.temperatureHistory}
              humidityHistory={sensorData.humidityHistory}
            />
          </Card.Body>
        </Card>

        {/* Map */}
        {vehicle?.deviceId && (
          <Card 
            style={{
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              overflow: 'hidden'
            }}
          >
            <Card.Header 
              style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(8, 145, 178, 0.1))',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                color: '#0e7490',
                padding: '1.25rem'
              }}
            >
              <div className="d-flex align-items-center">
                <div 
                  style={{
                    background: 'rgba(14, 116, 144, 0.15)',
                    borderRadius: '8px',
                    padding: '8px',
                    marginRight: '12px'
                  }}
                >
                  <MapPin size={20} color="#0e7490" />
                </div>
                <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                  Live Location Tracking
                </span>
              </div>
            </Card.Header>
            <Card.Body style={{ padding: '0', background: 'white' }}>
              <LeafletMap deviceId={vehicle.deviceId} />
            </Card.Body>
          </Card>
        )}
      </Modal.Body>
      
      <Modal.Footer 
        style={{
          background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.9), rgba(226, 232, 240, 0.7))',
          border: '1px solid rgba(226, 232, 240, 0.4)',
          padding: '1.25rem 2rem'
        }}
      >
        <Button 
          style={{
            background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.15), rgba(75, 85, 99, 0.1))',
            border: '1px solid rgba(107, 114, 128, 0.4)',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontWeight: '500',
            color: '#374151'
          }}
          onClick={onClose}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VehicleDetailsModal;
