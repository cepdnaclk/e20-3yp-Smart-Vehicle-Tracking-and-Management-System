import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Bell, 
  Map, 
  Truck, 
  Users, 
  AlertTriangle, 
  Settings, 
  LogOut,
  TrendingUp,
  Calendar,
  Clock,
  BarChart2,
  Zap,
  Activity,
  User,
  Menu,
  X,
  Thermometer,
  Droplets,
  Gauge,
  Hash,
  ClipboardCheck,
  CheckCircle
} from "lucide-react";
import { Card, Row, Col, Alert } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import Sidebar from "../components/Sidebar";
import VehicleDetailsModal from "../components/VehicleDetailsModal";
import LoadingSpinner from "../components/LoadingSpinner";
import AnimatedAlert from "../components/AnimatedAlert";
import { getSensorsData } from "../services/getSensorsData";
import { startPolling, stopPolling } from "../services/getAlerts";
import { api } from "../services/api";
import { authService } from '../services/authService';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

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

const Dashboard = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [activeVehicles, setActiveVehicles] = useState([]);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [activeDrivers, setActiveDrivers] = useState(0);
  const [totalTasks,setTotaltasks] = useState(0);
  const [CompletedTasks,setCompletedTasks] = useState(0);
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");

  // Get current date and time 
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Format date for display
  const formattedDate = currentTime.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Format time for display
  const formattedTime = currentTime.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit'
  });

  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    speed: 0,
    location: {
      lat: 6.9271,
      lng: 79.8612
    }
  });

  const [vehicleIcon] = useState(createVehicleIcon());

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
    
    // Start alerts polling
    const stopAlertsPolling = startPolling((alertsData) => {
      if (Array.isArray(alertsData)) {
        setAlerts(alertsData);
        setActiveAlerts(alertsData.filter(a => a.status === 'active').length);
      }
    });

    // Initial loading
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchTotalVehicles(),
          fetchActiveVehicles(),
          fetchTotalDrivers(),
          fetchActiveDrivers(),
          fetchTotalTasks(),
          fetchCompltedTasks(),
          fetchSensors()
        ]);
        
        setIsLoading(false);
        
        // Show welcome message
        setToastMessage("Welcome to the dashboard! Everything is up to date.");
        setToastType("success");
        setShowToast(true);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setIsLoading(false);
        
        // Show error message
        setToastMessage("There was an error loading some dashboard data. Please try refreshing.");
        setToastType("danger");
        setShowToast(true);
      }
    };
    
    fetchData();

    // Cleanup function
    return () => {
      stopAlertsPolling();
      stopPolling();
    };
  }, [navigate]);

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const data = await getSensorsData();
        setSensorData({
          temperature: data.sensor.temperature_C,
          humidity: data.sensor.humidity,
          speed: data.gps.speed_kmh,
          location: {
            lat: data.gps.latitude,
            lng: data.gps.longitude
          }
        });
      } catch (error) {
        console.error('Error fetching sensor data:', error);
      }
    };

    fetchSensorData();
    const interval = setInterval(fetchSensorData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      // Navigate to login page with replace to prevent going back
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout API fails, still navigate to login
      navigate('/login', { replace: true });
    }
  };

  // Fetch total vehicles
  const fetchTotalVehicles = async () => {
    try {
      const response = await api.get("/api/vehicles");
      setTotalVehicles(response.data.length);
    } catch (error) {
      console.error("Error fetching total vehicles:", error);
    }
  };

  // Fetch active vehicles
  const fetchActiveVehicles = async () => {
    try {
      const response = await api.get("/api/vehicles");
      // Filter for vehicles with tracking enabled (which means status is Active)
      const activeVehiclesList = response.data.filter(v => v.trackingEnabled === true);
      setActiveVehicles(activeVehiclesList);
    } catch (error) {
      console.error("Error fetching active vehicles:", error);
    }
  };

  // Fetch total drivers
  const fetchTotalDrivers = async () => {
    try {
      const response = await api.get("/api/drivers");
      setTotalDrivers(response.data.length);
    } catch (error) {
      console.error("Error fetching total drivers:", error);
    }
  };

  // Fetch active drivers
  const fetchActiveDrivers = async () => {
    try {
      const response = await api.get("/api/drivers");
      // Count drivers with employmentStatus = 'active'
      const activeDriversCount = response.data.filter(
        driver => driver.employmentStatus === 'active'
      ).length;
      setActiveDrivers(activeDriversCount);
    } catch (error) {
      console.error("Error fetching active drivers count:", error);
    }
  };

  const fetchTotalTasks = async () => {
    try {
      const response = await api.get("/api/tasks");
      if (response.data && response.data.length >= 0) {
        setTotaltasks(response.data.length);
      }
    } catch (error) {
      console.error("Error fetching total tasks:", error);
      setTotaltasks(0);
    }
  };

  const fetchCompltedTasks = async () => {
    try {
      const response = await api.get("/api/tasks");
      if (response.data && Array.isArray(response.data)) {
        // Filter tasks where status is 'completed'
        const completedTasks = response.data.filter(task => task.status === 'Completed');
        setCompletedTasks(completedTasks.length);
      }
    } catch (error) {
      console.error("Error fetching completed tasks:", error);
      setCompletedTasks(0);
    }
  };

  // Fetch sensors
  const fetchSensors = async () => {
    try {
      const sensorsData = await getSensorsData();
      console.log('This is sensorsData', sensorsData); //Feed this sensors data to the dashboard
    } catch (error) {
      console.error("Error fetching sensors data:", error);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Stats card component
  const StatsCardNew = ({ icon, title, value, color, percentage, isUp }) => (
    <motion.div 
      className="col-xl-3 col-md-6 mb-4"
      variants={itemVariants}
    >
      <div className="card border-0 shadow-sm h-100 stats-card">
        <div className="card-body d-flex align-items-center">
          {/* Icon */}
          <div className={`rounded-circle p-3 me-3 d-flex align-items-center justify-content-center ${color}`} style={{ width: '60px', height: '60px' }}>
            {React.cloneElement(icon, { size: 28, color: 'white' })}
          </div>
          
          {/* Value and Title */}
          <div className="flex-grow-1">
            <div className="d-flex align-items-center justify-content-between">
              <h5 className="card-title text-gray-900 mb-1">{value}</h5>
              {/* Percentage Badge */}
              {percentage !== undefined && ( // Check if percentage is provided
                <div className={`badge ${isUp ? 'bg-success' : 'bg-danger'} d-flex align-items-center`}>
                  {isUp ? <TrendingUp size={14} className="me-1" /> : <TrendingUp size={14} className="me-1" style={{ transform: 'rotate(180deg)' }} />}
                  {percentage}%
                </div>
              )}
            </div>
            <p className="card-text text-muted small mb-0">{title}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light" style={{ 
      paddingLeft: sidebarCollapsed ? '80px' : '250px',
      transition: 'padding-left 0.3s ease-in-out'
    }}>
      <Sidebar handleLogout={handleLogout} />
      <div className="p-4">
        {/* Header Section with Animated Toggle and Date/Time */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <motion.button 
              className="btn btn-light border-0 me-3 d-flex align-items-center justify-content-center" 
              style={{ width: '40px', height: '40px', borderRadius: '50%' }}
              onClick={toggleSidebar}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
            </motion.button>
            <div>
              <motion.h4 
                className="mb-0 fw-bold"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                Dashboard Overview
              </motion.h4>
              <motion.div 
                className="text-muted d-flex align-items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Calendar size={14} className="me-1" />
                {formattedDate} 
                <span className="mx-2">•</span>
                <Clock size={14} className="me-1" />
                {formattedTime}
              </motion.div>
            </div>
          </div>
          
          <div className="d-flex align-items-center gap-3">
            <motion.button 
              className="btn btn-light position-relative rounded-circle"
              style={{ width: '40px', height: '40px' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Bell size={18} />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                1
              </span>
            </motion.button>
            <motion.div 
              className="d-flex align-items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="d-flex align-items-center justify-content-center bg-primary text-white rounded-circle me-2" 
                style={{ width: '40px', height: '40px' }}>
                <User size={18} />
              </div>
              <div>
                <div className="fw-medium">Admin</div>
                <div className="text-muted small">System Owner</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Toast Notification */}
        <AnimatedAlert
          show={showToast}
          type={toastType}
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
        
        {/* Interactive Map Section with Title */}
        <motion.div 
          className="card shadow-sm border-0 mb-4 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Map size={18} className="me-2 text-primary" />
              <h5 className="mb-0">Live Vehicle Tracking</h5>
            </div>
            <div>
              <button className="btn btn-sm btn-outline-primary me-2">Refresh</button>
              <button className="btn btn-sm btn-primary">Full Screen</button>
            </div>
          </div>
          <div className="card-body p-0" style={{ height: '400px' }}>
            <div style={{ height: '380px', width: '100%' }}>
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
                    <div>
                      <h6 className="mb-2">Vehicle Status</h6>
                      <p className="mb-1">
                        <Hash className="text-secondary me-2" size={16} />
                        License: {activeVehicles[0]?.licensePlate || 'N/A'}
                      </p>
                      <p className="mb-1">
                        <Gauge className="text-primary me-2" size={16} />
                        Speed: {sensorData.speed} km/h
                      </p>
                      <p className="mb-1">
                        <Thermometer className="text-danger me-2" size={16} />
                        Temperature: {sensorData.temperature}°C
                      </p>
                      <p className="mb-0">
                        <Droplets className="text-info me-2" size={16} />
                        Humidity: {sensorData.humidity}%
                      </p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </motion.div>

        {/* Performance Analytics Section */}
        <motion.div 
          className="card border-0 shadow-sm mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="card-header bg-white">
            <div className="d-flex align-items-center">
              <BarChart2 size={18} className="me-2 text-primary" />
              <h5 className="mb-0">Performance Analytics</h5>
            </div>
          </div>
          <div className="card-body">
            {/* Stats Cards */}
            <motion.div 
              className="row mb-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <StatsCardNew 
                icon={<Truck size={24} className="text-primary" />} 
                title="Total Vehicles" 
                value={totalVehicles} 
                color="bg-primary"
                percentage={totalVehicles > 0 ? Math.round((activeVehicles.length / totalVehicles) * 100) : 0}
                isUp={true}
              />
              <StatsCardNew 
                icon={<Zap size={24} className="text-success" />} 
                title="Active Vehicles" 
                value={activeVehicles.length} 
                color="bg-success"
                //percentage={totalVehicles > 0 ? Math.round((activeVehicles.length / totalVehicles) * 100) : 0}
                isUp={true}
              />
              <StatsCardNew 
                icon={<Users size={24} className="text-info" />} 
                title="Total Drivers" 
                value={totalDrivers} 
                color="bg-info"
                percentage={totalDrivers > 0 ? Math.round((activeDrivers / totalDrivers) * 100) : 0}
                isUp={true}
              />
              <StatsCardNew 
                icon={<User size={24} className="text-warning" />} 
                title="Active Drivers" 
                value={activeDrivers} 
                color="bg-warning"
                //percentage={totalDrivers > 0 ? Math.round((activeDrivers / totalDrivers) * 100) : 0}
                isUp={true}
              />
              <StatsCardNew 
                icon={<ClipboardCheck size={24} className="text-info" />} 
                title="Total Tasks" 
                value={totalTasks} 
                color="bg-info"
                percentage={totalTasks > 0 ? Math.round((CompletedTasks / totalTasks) * 100) : 0}
                isUp={true}
              />
              <StatsCardNew 
                icon={<CheckCircle size={24} className="text-success" />} 
                title="Completed Tasks" 
                value={CompletedTasks} 
                color="bg-success"
                //percentage={totalTasks > 0 ? Math.round((CompletedTasks / totalTasks) * 100) : 0}
                isUp={true}
              />
              <StatsCardNew 
                icon={<AlertTriangle size={24} className="text-danger" />} 
                title="Active Alerts" 
                value={alerts.filter(a => a.status === 'active').length}
                color="bg-danger"
                percentage={alerts.length > 0 ? Math.round((alerts.filter(a => a.status === 'active').length / alerts.length) * 100) : 0}
                isUp={false}
              />
              <StatsCardNew 
                icon={<CheckCircle size={24} className="text-success" />} 
                title="Resolved Alerts" 
                value={alerts.filter(a => a.status === 'resolved').length}
                color="bg-success"
                percentage={alerts.length > 0 ? Math.round((alerts.filter(a => a.status === 'resolved').length / alerts.length) * 100) : 0}
                isUp={true}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Vehicle Details Modal */}
      {showVehicleDetails && selectedVehicle && (
        <VehicleDetailsModal
          vehicle={selectedVehicle}
          onClose={() => setShowVehicleDetails(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;