import React, { useState, useEffect } from 'react';
import { Modal, Button, Card, Row, Col, Tab, Nav } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, 
  AlertTriangle, 
  Thermometer, 
  Droplets, 
  MapPin, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Check,
  Clock,
  ArrowRight,
  FileText,
  Calendar,
  User,
  Zap,
  Settings,
  Map
} from 'lucide-react';

import LoadingSpinner from './LoadingSpinner';
import SpeedChart from './SpeedChart';
import TemperatureChart from './TemperatureChart';
import HumidityChart from './HumidityChart';
import { database } from "../lib/firebase";
import { ref, onValue } from "firebase/database";

const VehicleDetailsModal = ({ vehicle, onClose }) => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('overview');
  
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

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };

  const slideUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  useEffect(() => {
    // Fetch sensor data from Firebase
    if (vehicle && vehicle._id) {
      const vehicleRef = ref(database, `sensors/${vehicle._id}`);
      
      const fetchSensorData = async () => {
        try {
          onValue(vehicleRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
              // Process real data
              setSensorData({
                temperature: data.temperature || 0,
                humidity: data.humidity || 0,
                speed: data.speed || 0,
                location: { 
                  lat: data.location?.lat || 0, 
                  lng: data.location?.lng || 0 
                },
                status: data.status || 'Idle',
                tampering: data.tampering || false,
                speedHistory: data.speedHistory || generateDummyHistoryData(60, 0, 120),
                temperatureHistory: data.temperatureHistory || generateDummyHistoryData(60, 20, 45),
                humidityHistory: data.humidityHistory || generateDummyHistoryData(60, 30, 80)
              });
            } else {
              // Generate mock data if no real data available
              setSensorData({
                temperature: Math.floor(Math.random() * 25) + 20,
                humidity: Math.floor(Math.random() * 40) + 30,
                speed: Math.floor(Math.random() * 60) + 20,
                location: { lat: 6.9271, lng: 79.8612 },
                status: getRandomStatus(),
                tampering: Math.random() > 0.8,
                speedHistory: generateDummyHistoryData(60, 0, 120),
                temperatureHistory: generateDummyHistoryData(60, 20, 45),
                humidityHistory: generateDummyHistoryData(60, 30, 80)
              });
            }
            setLoading(false);
          });
        } catch (error) {
          console.error("Error fetching sensor data:", error);
          // Generate mock data on error
          setSensorData({
            temperature: Math.floor(Math.random() * 25) + 20,
            humidity: Math.floor(Math.random() * 40) + 30,
            speed: Math.floor(Math.random() * 60) + 20,
            location: { lat: 6.9271, lng: 79.8612 },
            status: getRandomStatus(),
            tampering: Math.random() > 0.8,
            speedHistory: generateDummyHistoryData(60, 0, 120),
            temperatureHistory: generateDummyHistoryData(60, 20, 45),
            humidityHistory: generateDummyHistoryData(60, 30, 80)
          });
          setLoading(false);
        }
      };

      fetchSensorData();
      
      // Cleanup function to detach listeners
      return () => {
        // Detach Firebase listeners if needed
      };
    }
  }, [vehicle]);

  // Helper function to generate dummy history data
  const generateDummyHistoryData = (points, min, max) => {
    return Array.from({ length: points }, () => 
      Math.floor(Math.random() * (max - min + 1)) + min
    );
  };

  // Helper function to get random status
  const getRandomStatus = () => {
    const statuses = ['Moving', 'Idle', 'Stopped', 'Loading', 'Unloading'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Moving':
        return 'success';
      case 'Idle':
        return 'warning';
      case 'Stopped':
        return 'danger';
      case 'Loading':
      case 'Unloading':
        return 'info';
      default:
        return 'secondary';
    }
  };

  // Get dates for vehicle info
  const today = new Date();
  const lastServiceDate = new Date(today);
  lastServiceDate.setMonth(today.getMonth() - 2);
  
  const nextServiceDate = new Date(today);
  nextServiceDate.setMonth(today.getMonth() + 1);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Modal show={true} onHide={onClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Vehicle Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <LoadingSpinner size="md" text="Loading vehicle data..." />
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <Modal 
      show={true} 
      onHide={onClose} 
      centered 
      size="xl"
      backdrop="static"
      className="vehicle-details-modal"
    >
      <Modal.Header className="border-0 pb-0">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="d-flex align-items-center"
        >
          <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
            <Truck size={24} className="text-primary" />
          </div>
          <div>
            <h5 className="mb-0 fw-bold">{vehicle.vehicleName || 'Vehicle'}</h5>
            <p className="text-muted mb-0">
              {vehicle.licensePlate || 'No license plate'} • 
              <span className={`text-${getStatusColor(sensorData.status)} ms-1`}>
                {sensorData.status}
              </span>
            </p>
          </div>
        </motion.div>
        <Button 
          variant="link" 
          className="p-0 ms-auto border-0 text-muted"
          onClick={onClose}
        >
          <X size={24} />
        </Button>
      </Modal.Header>
      
      <Modal.Body className="pt-2 px-4 pb-4">
        <Tab.Container 
          activeKey={activeTab} 
          onSelect={(key) => setActiveTab(key)}
        >
          <Nav 
            variant="tabs" 
            className="mb-4 nav-fill border-bottom"
          >
            <Nav.Item>
              <Nav.Link 
                eventKey="overview" 
                className="border-0 rounded-0 px-4"
              >
                <div className="d-flex align-items-center">
                  <Truck size={18} className="me-2" />
                  <span>Overview</span>
                </div>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                eventKey="telemetry" 
                className="border-0 rounded-0 px-4"
              >
                <div className="d-flex align-items-center">
                  <Zap size={18} className="me-2" />
                  <span>Telemetry</span>
                </div>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                eventKey="location" 
                className="border-0 rounded-0 px-4"
              >
                <div className="d-flex align-items-center">
                  <MapPin size={18} className="me-2" />
                  <span>Location</span>
                </div>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                eventKey="maintenance" 
                className="border-0 rounded-0 px-4"
              >
                <div className="d-flex align-items-center">
                  <Settings size={18} className="me-2" />
                  <span>Maintenance</span>
                </div>
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            {/* Overview Tab */}
            <Tab.Pane eventKey="overview">
              <AnimatePresence mode="wait">
                <motion.div
                  key="overview"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={fadeIn}
                >
                  <Row className="g-4">
                    {/* Vehicle Status Card */}
                    <Col md={6}>
                      <motion.div 
                        variants={slideUp} 
                        className="card border-0 shadow-sm h-100"
                      >
                        <div className="card-body">
                          <h6 className="card-title d-flex align-items-center mb-3">
                            <Truck size={18} className="me-2 text-primary" />
                            Vehicle Status
                          </h6>
                          
                          <div className="d-flex flex-column h-100">
                            <div className="mb-3 pb-3 border-bottom">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="text-muted">Status</span>
                                <span className={`badge bg-${getStatusColor(sensorData.status)}`}>
                                  {sensorData.status}
                                </span>
                              </div>
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="text-muted">Current Speed</span>
                                <span className="fw-medium">{sensorData.speed} km/h</span>
                              </div>
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">Tampering Alert</span>
                                <span className={`badge ${sensorData.tampering ? 'bg-danger' : 'bg-success'}`}>
                                  {sensorData.tampering ? 'Detected' : 'None'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="mb-3 pb-3 border-bottom">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="text-muted">Temperature</span>
                                <span className="fw-medium">{sensorData.temperature}°C</span>
                              </div>
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">Humidity</span>
                                <span className="fw-medium">{sensorData.humidity}%</span>
                              </div>
                            </div>
                            
                            <div>
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="text-muted">Location</span>
                                <span className="fw-medium">
                                  {sensorData.location.lat.toFixed(4)}, {sensorData.location.lng.toFixed(4)}
                                </span>
                              </div>
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">Last Update</span>
                                <span className="fw-medium">
                                  <Clock size={14} className="me-1" />
                                  Just now
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Col>
                    
                    {/* Vehicle Information Card */}
                    <Col md={6}>
                      <motion.div 
                        variants={slideUp} 
                        className="card border-0 shadow-sm h-100"
                      >
                        <div className="card-body">
                          <h6 className="card-title d-flex align-items-center mb-3">
                            <FileText size={18} className="me-2 text-primary" />
                            Vehicle Information
                          </h6>
                          
                          <div className="d-flex flex-column h-100">
                            <div className="mb-3 pb-3 border-bottom">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="text-muted">Vehicle ID</span>
                                <span className="fw-medium">{vehicle._id || 'N/A'}</span>
                              </div>
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="text-muted">License Plate</span>
                                <span className="fw-medium">{vehicle.licensePlate || 'N/A'}</span>
                              </div>
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">Vehicle Type</span>
                                <span className="fw-medium">{vehicle.vehicleType || 'Truck'}</span>
                              </div>
                            </div>
                            
                            <div className="mb-3 pb-3 border-bottom">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="text-muted">Assigned Driver</span>
                                <span className="fw-medium">
                                  <User size={14} className="me-1" />
                                  {vehicle.driver || 'Not assigned'}
                                </span>
                              </div>
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">Registration Date</span>
                                <span className="fw-medium">
                                  <Calendar size={14} className="me-1" />
                                  {formatDate(new Date())}
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="text-muted">Last Maintenance</span>
                                <span className="fw-medium">{formatDate(lastServiceDate)}</span>
                              </div>
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">Next Maintenance</span>
                                <span className="fw-medium">{formatDate(nextServiceDate)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Col>
                    
                    {/* Recent Alerts */}
                    <Col md={12}>
                      <motion.div 
                        variants={slideUp} 
                        className="card border-0 shadow-sm"
                      >
                        <div className="card-body">
                          <h6 className="card-title d-flex align-items-center mb-3">
                            <AlertTriangle size={18} className="me-2 text-primary" />
                            Recent Alerts
                          </h6>
                          
                          {sensorData.tampering ? (
                            <div className="alert alert-danger d-flex align-items-center">
                              <AlertTriangle size={18} className="me-2" />
                              <div>
                                <strong>Tampering Detected!</strong> - Vehicle tampering was detected at location {sensorData.location.lat.toFixed(4)}, {sensorData.location.lng.toFixed(4)}
                              </div>
                            </div>
                          ) : (
                            <div className="alert alert-success d-flex align-items-center">
                              <Check size={18} className="me-2" />
                              <div>
                                <strong>All systems normal.</strong> - No alerts detected for this vehicle.
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-3 text-end">
                            <Button variant="outline-primary" size="sm">
                              View All Alerts
                              <ArrowRight size={14} className="ms-1" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    </Col>
                  </Row>
                </motion.div>
              </AnimatePresence>
            </Tab.Pane>
            
            {/* Telemetry Tab */}
            <Tab.Pane eventKey="telemetry">
              <AnimatePresence mode="wait">
                <motion.div
                  key="telemetry"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={fadeIn}
                >
                  <Row className="g-4">
                    {/* Speed Chart */}
                    <Col md={12}>
                      <motion.div 
                        variants={slideUp} 
                        className="card border-0 shadow-sm"
                      >
                        <div className="card-body">
                          <h6 className="card-title d-flex align-items-center mb-3">
                            <Zap size={18} className="me-2 text-primary" />
                            Speed Monitoring
                          </h6>
                          <div style={{ height: '300px' }}>
                            <SpeedChart data={sensorData.speedHistory} />
                          </div>
                        </div>
                      </motion.div>
                    </Col>
                    
                    {/* Temperature Chart */}
                    <Col md={6}>
                      <motion.div 
                        variants={slideUp} 
                        className="card border-0 shadow-sm h-100"
                      >
                        <div className="card-body">
                          <h6 className="card-title d-flex align-items-center mb-3">
                            <Thermometer size={18} className="me-2 text-primary" />
                            Temperature Monitoring
                          </h6>
                          <div style={{ height: '250px' }}>
                            <TemperatureChart data={sensorData.temperatureHistory} />
                          </div>
                        </div>
                      </motion.div>
                    </Col>
                    
                    {/* Humidity Chart */}
                    <Col md={6}>
                      <motion.div 
                        variants={slideUp} 
                        className="card border-0 shadow-sm h-100"
                      >
                        <div className="card-body">
                          <h6 className="card-title d-flex align-items-center mb-3">
                            <Droplets size={18} className="me-2 text-primary" />
                            Humidity Monitoring
                          </h6>
                          <div style={{ height: '250px' }}>
                            <HumidityChart data={sensorData.humidityHistory} />
                          </div>
                        </div>
                      </motion.div>
                    </Col>
                  </Row>
                </motion.div>
              </AnimatePresence>
            </Tab.Pane>
            
            {/* Location Tab */}
            <Tab.Pane eventKey="location">
              <AnimatePresence mode="wait">
                <motion.div
                  key="location"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={fadeIn}
                >
                  <Row className="g-4">
                    <Col md={12}>
                      <motion.div 
                        variants={slideUp} 
                        className="card border-0 shadow-sm"
                      >
                        <div className="card-body">
                          <h6 className="card-title d-flex align-items-center mb-3">
                            <Map size={18} className="me-2 text-primary" />
                            Current Location
                          </h6>
                          <div className="ratio ratio-16x9">
                            <iframe 
                              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${sensorData.location.lat},${sensorData.location.lng}&zoom=14`}
                              style={{ border: 0, borderRadius: 'var(--border-radius)' }}
                              allowFullScreen=""
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                            />
                          </div>
                          
                          <div className="mt-3">
                            <h6>Location History</h6>
                            <div className="table-responsive">
                              <table className="table table-hover">
                                <thead>
                                  <tr>
                                    <th scope="col">Date & Time</th>
                                    <th scope="col">Latitude</th>
                                    <th scope="col">Longitude</th>
                                    <th scope="col">Speed</th>
                                    <th scope="col">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {[...Array(5)].map((_, index) => {
                                    const date = new Date();
                                    date.setMinutes(date.getMinutes() - (index * 30));
                                    const time = date.toLocaleTimeString('en-US', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    });
                                    const dateStr = date.toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    });
                                    
                                    const lat = (sensorData.location.lat + (Math.random() * 0.01 - 0.005)).toFixed(4);
                                    const lng = (sensorData.location.lng + (Math.random() * 0.01 - 0.005)).toFixed(4);
                                    const speed = Math.floor(Math.random() * 60) + 20;
                                    const status = getRandomStatus();
                                    
                                    return (
                                      <tr key={index}>
                                        <td>{dateStr} {time}</td>
                                        <td>{lat}</td>
                                        <td>{lng}</td>
                                        <td>{speed} km/h</td>
                                        <td>
                                          <span className={`badge bg-${getStatusColor(status)}`}>
                                            {status}
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Col>
                  </Row>
                </motion.div>
              </AnimatePresence>
            </Tab.Pane>
            
            {/* Maintenance Tab */}
            <Tab.Pane eventKey="maintenance">
              <AnimatePresence mode="wait">
                <motion.div
                  key="maintenance"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={fadeIn}
                >
                  <Row className="g-4">
                    <Col md={12}>
                      <motion.div 
                        variants={slideUp} 
                        className="card border-0 shadow-sm"
                      >
                        <div className="card-body">
                          <h6 className="card-title d-flex align-items-center mb-3">
                            <Settings size={18} className="me-2 text-primary" />
                            Maintenance Schedule
                          </h6>
                          
                          <div className="alert alert-info d-flex align-items-center mb-4">
                            <Calendar size={18} className="me-2" />
                            <div>
                              <strong>Next Scheduled Maintenance:</strong> {formatDate(nextServiceDate)}
                            </div>
                          </div>
                          
                          <div className="table-responsive">
                            <table className="table table-hover">
                              <thead>
                                <tr>
                                  <th scope="col">Maintenance Type</th>
                                  <th scope="col">Last Service</th>
                                  <th scope="col">Next Service</th>
                                  <th scope="col">Status</th>
                                  <th scope="col">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>Oil Change</td>
                                  <td>{formatDate(lastServiceDate)}</td>
                                  <td>{formatDate(nextServiceDate)}</td>
                                  <td><span className="badge bg-warning">Due Soon</span></td>
                                  <td>
                                    <Button variant="outline-primary" size="sm">
                                      Schedule
                                    </Button>
                                  </td>
                                </tr>
                                <tr>
                                  <td>Tire Rotation</td>
                                  <td>{formatDate(new Date(lastServiceDate.getTime() - 15 * 24 * 60 * 60 * 1000))}</td>
                                  <td>{formatDate(new Date(nextServiceDate.getTime() + 15 * 24 * 60 * 60 * 1000))}</td>
                                  <td><span className="badge bg-success">On Track</span></td>
                                  <td>
                                    <Button variant="outline-primary" size="sm">
                                      Schedule
                                    </Button>
                                  </td>
                                </tr>
                                <tr>
                                  <td>Brake Inspection</td>
                                  <td>{formatDate(new Date(lastServiceDate.getTime() - 5 * 24 * 60 * 60 * 1000))}</td>
                                  <td>{formatDate(new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000))}</td>
                                  <td><span className="badge bg-danger">Overdue</span></td>
                                  <td>
                                    <Button variant="outline-primary" size="sm">
                                      Schedule
                                    </Button>
                                  </td>
                                </tr>
                                <tr>
                                  <td>Full Service</td>
                                  <td>{formatDate(new Date(lastServiceDate.getTime() - 30 * 24 * 60 * 60 * 1000))}</td>
                                  <td>{formatDate(new Date(nextServiceDate.getTime() + 30 * 24 * 60 * 60 * 1000))}</td>
                                  <td><span className="badge bg-success">On Track</span></td>
                                  <td>
                                    <Button variant="outline-primary" size="sm">
                                      Schedule
                                    </Button>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          
                          <div className="mt-4">
                            <h6 className="mb-3">Maintenance History</h6>
                            <div className="table-responsive">
                              <table className="table table-hover">
                                <thead>
                                  <tr>
                                    <th scope="col">Date</th>
                                    <th scope="col">Service Type</th>
                                    <th scope="col">Technician</th>
                                    <th scope="col">Cost</th>
                                    <th scope="col">Notes</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>{formatDate(lastServiceDate)}</td>
                                    <td>Oil Change</td>
                                    <td>John Smith</td>
                                    <td>$120</td>
                                    <td>Routine maintenance</td>
                                  </tr>
                                  <tr>
                                    <td>{formatDate(new Date(lastServiceDate.getTime() - 30 * 24 * 60 * 60 * 1000))}</td>
                                    <td>Full Service</td>
                                    <td>Mike Johnson</td>
                                    <td>$350</td>
                                    <td>Replaced air filter</td>
                                  </tr>
                                  <tr>
                                    <td>{formatDate(new Date(lastServiceDate.getTime() - 60 * 24 * 60 * 60 * 1000))}</td>
                                    <td>Tire Replacement</td>
                                    <td>Sarah Williams</td>
                                    <td>$600</td>
                                    <td>Replaced all four tires</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Col>
                  </Row>
                </motion.div>
              </AnimatePresence>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Modal.Body>
      
      <Modal.Footer className="border-0 pt-0">
        <div className="d-flex justify-content-between w-100">
          <Button 
            variant="outline-secondary" 
            onClick={onClose}
          >
            Close
          </Button>
          <div>
            <Button 
              variant="primary" 
              className="ms-2"
            >
              Track Vehicle
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default VehicleDetailsModal;
