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
  Plus,
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
import { startPolling, stopPolling } from "../services/getAlerts";
import { api } from "../services/api";
import { authService } from '../services/authService';
import LeafletMap from '../components/LeafletMapDashboard';

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

  

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Modern Stats Card Component
  const StatsCardNew = ({ icon, title, value, color, percentage, isUp }) => (
    <motion.div 
      className="col-xl-3 col-lg-4 col-md-6 mb-4"
      variants={itemVariants}
    >
      <motion.div 
        className="h-100 position-relative overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
        }}
        whileHover={{ 
          scale: 1.02,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          transition: { duration: 0.2 }
        }}
      >
        {/* Background gradient overlay */}
        <div 
          className="position-absolute top-0 end-0"
          style={{
            width: '60px',
            height: '60px',
            background: color,
            borderRadius: '0 20px 0 60px',
            opacity: 0.1
          }}
        />
        
        <div className="p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            {/* Icon */}
            <motion.div 
              className="d-flex align-items-center justify-content-center text-white"
              style={{
                width: '56px',
                height: '56px',
                background: color,
                borderRadius: '16px',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'
              }}
              whileHover={{ 
                scale: 1.1,
                rotate: 5,
                transition: { duration: 0.2 }
              }}
            >
              {React.cloneElement(icon, { size: 24 })}
            </motion.div>
            
            {/* Percentage Badge */}
            {percentage !== undefined && (
              <motion.div 
                className="d-flex align-items-center px-3 py-1 text-white"
                style={{
                  background: isUp 
                    ? 'linear-gradient(135deg, #10b981, #059669)' 
                    : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                <motion.div
                  animate={{ rotate: isUp ? 0 : 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <TrendingUp size={12} className="me-1" />
                </motion.div>
                {percentage}%
              </motion.div>
            )}
          </div>
          
          {/* Value and Title */}
          <div>
            <motion.h3 
              className="fw-bold mb-1"
              style={{ 
                color: '#1f2937',
                fontSize: '2rem'
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {value}
            </motion.h3>
            <p 
              className="mb-0"
              style={{ 
                color: '#6b7280',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              {title}
            </p>
            
            {/* Progress bar for percentage */}
            {percentage !== undefined && (
              <div className="mt-3">
                <div 
                  className="position-relative"
                  style={{
                    height: '4px',
                    background: '#e5e7eb',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}
                >
                  <motion.div
                    style={{
                      height: '100%',
                      background: color,
                      borderRadius: '2px'
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percentage, 100)}%` }}
                    transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
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
    <div 
      className="min-vh-100"
      style={{ 
        paddingLeft: sidebarCollapsed ? '80px' : '280px',
        transition: 'padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh'
      }}
    >
      <Sidebar handleLogout={handleLogout} />
      
      {/* Main Content Container */}
      <motion.div 
        className="p-4"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          minHeight: '100vh'
        }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Modern Header Section */}
        <motion.div 
          className="d-flex justify-content-between align-items-center mb-5"
          variants={itemVariants}
        >
          <div className="d-flex align-items-center">
            <motion.div 
              className="me-4 p-3 rounded-3"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
              whileHover={{ scale: 1.05 }}
            >
              <BarChart2 size={28} style={{ color: 'white' }} />
            </motion.div>
            <div>
              <motion.h2 
                className="mb-2 fw-bold text-white"
                style={{ fontSize: '2.5rem' }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Dashboard Overview
              </motion.h2>
              <motion.div 
                className="d-flex align-items-center text-white opacity-75"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.75 }}
                transition={{ delay: 0.2 }}
                style={{ fontSize: '1.1rem' }}
              >
                <Calendar size={16} className="me-2" />
                {formattedDate} 
                <span className="mx-3">•</span>
                <Clock size={16} className="me-2" />
                {formattedTime}
              </motion.div>
            </div>
          </div>
          
          <div className="d-flex align-items-center gap-3">
            <motion.button 
              className="btn position-relative border-0"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                color: 'white'
              }}
              whileHover={{ 
                scale: 1.05,
                background: 'rgba(255, 255, 255, 0.25)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell size={20} />
              <motion.span 
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                style={{ 
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  fontSize: '0.7rem'
                }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {activeAlerts}
              </motion.span>
            </motion.button>
            
            <motion.div 
              className="d-flex align-items-center p-2 rounded-3"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div 
                className="d-flex align-items-center justify-content-center text-white rounded-2 me-3" 
                style={{ 
                  width: '44px', 
                  height: '44px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                }}
              >
                <User size={20} />
              </div>
              <div>
                <div className="fw-semibold text-white">Admin User</div>
                <div className="small text-white opacity-75">System Administrator</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Toast Notification */}
        <AnimatedAlert
          show={showToast}
          type={toastType}
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
        
        {/* Modern Stats Grid */}
        <motion.div 
          className="row g-4 mb-5"
          variants={containerVariants}
        >
          <StatsCardNew 
            icon={<Truck size={24} />} 
            title="Total Vehicles" 
            value={totalVehicles} 
            color="linear-gradient(135deg, #3b82f6, #1d4ed8)"
            percentage={totalVehicles > 0 ? Math.round((activeVehicles.length / totalVehicles) * 100) : 0}
            isUp={true}
          />
          <StatsCardNew 
            icon={<Zap size={24} />} 
            title="Active Vehicles" 
            value={activeVehicles.length} 
            color="linear-gradient(135deg, #10b981, #059669)"
            isUp={true}
          />
          <StatsCardNew 
            icon={<Users size={24} />} 
            title="Total Drivers" 
            value={totalDrivers} 
            color="linear-gradient(135deg, #8b5cf6, #7c3aed)"
            percentage={totalDrivers > 0 ? Math.round((activeDrivers / totalDrivers) * 100) : 0}
            isUp={true}
          />
          <StatsCardNew 
            icon={<User size={24} />} 
            title="Active Drivers" 
            value={activeDrivers} 
            color="linear-gradient(135deg, #f59e0b, #d97706)"
            isUp={true}
          />
          <StatsCardNew 
            icon={<ClipboardCheck size={24} />} 
            title="Total Tasks" 
            value={totalTasks} 
            color="linear-gradient(135deg, #06b6d4, #0891b2)"
            percentage={totalTasks > 0 ? Math.round((CompletedTasks / totalTasks) * 100) : 0}
            isUp={true}
          />
          <StatsCardNew 
            icon={<CheckCircle size={24} />} 
            title="Completed Tasks" 
            value={CompletedTasks} 
            color="linear-gradient(135deg, #84cc16, #65a30d)"
            isUp={true}
          />
          <StatsCardNew 
            icon={<AlertTriangle size={24} />} 
            title="Active Alerts" 
            value={alerts.filter(a => a.status === 'active').length}
            color="linear-gradient(135deg, #ef4444, #dc2626)"
            percentage={alerts.length > 0 ? Math.round((alerts.filter(a => a.status === 'active').length / alerts.length) * 100) : 0}
            isUp={false}
          />
          <StatsCardNew 
            icon={<Activity size={24} />} 
            title="System Health" 
            value="98.5%"
            color="linear-gradient(135deg, #22c55e, #16a34a)"
            isUp={true}
          />
        </motion.div>

        {/* Content Grid */}
        <div className="row g-4">
          {/* Live Vehicle Tracking */}
          <div className="col-lg-8">
            <motion.div 
              className="h-100"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
              }}
              variants={itemVariants}
            >
              <div className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <div 
                    className="me-3 p-3 rounded-3 d-flex align-items-center justify-content-center"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: 'white'
                    }}
                  >
                    <Map size={24} />
                  </div>
                  <div>
                    <h5 className="mb-1 fw-bold">Live Vehicle Tracking</h5>
                    <p className="text-muted mb-0">Real-time fleet monitoring</p>
                  </div>
                  <div className="ms-auto">
                    <span 
                      className="badge px-3 py-2"
                      style={{
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        borderRadius: '12px'
                      }}
                    >
                      {activeVehicles.length} Active
                    </span>
                  </div>
                </div>
                <div 
                  style={{ 
                    height: '400px',
                    borderRadius: '16px',
                    overflow: 'hidden'
                  }}
                >
                  <LeafletMap vehicles={activeVehicles} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="col-lg-4">
            <div className="row g-4 h-100">
              {/* Quick Actions */}
              <div className="col-12">
                <motion.div 
                  className="h-100"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
                  }}
                  variants={itemVariants}
                >
                  <div className="p-4">
                    <div className="d-flex align-items-center mb-4">
                      <div 
                        className="me-3 p-3 rounded-3 d-flex align-items-center justify-content-center"
                        style={{
                          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                          color: 'white'
                        }}
                      >
                        <Zap size={20} />
                      </div>
                      <h6 className="mb-0 fw-bold">Quick Actions</h6>
                    </div>
                    <div className="d-grid gap-3">
                      <motion.button 
                        className="btn text-start border-0 p-3"
                        style={{
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(29, 78, 216, 0.05))',
                          borderRadius: '12px',
                          color: '#1e40af'
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="d-flex align-items-center">
                          <Plus size={18} className="me-3" />
                          <span className="fw-medium">Add New Vehicle</span>
                        </div>
                      </motion.button>
                      
                      <motion.button 
                        className="btn text-start border-0 p-3"
                        style={{
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))',
                          borderRadius: '12px',
                          color: '#065f46'
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="d-flex align-items-center">
                          <Users size={18} className="me-3" />
                          <span className="fw-medium">Manage Drivers</span>
                        </div>
                      </motion.button>

                      <motion.button 
                        className="btn text-start border-0 p-3"
                        style={{
                          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05))',
                          borderRadius: '12px',
                          color: '#92400e'
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="d-flex align-items-center">
                          <Settings size={18} className="me-3" />
                          <span className="fw-medium">System Settings</span>
                        </div>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* System Status */}
              <div className="col-12">
                <motion.div 
                  className="h-100"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
                  }}
                  variants={itemVariants}
                >
                  <div className="p-4">
                    <div className="d-flex align-items-center mb-4">
                      <div 
                        className="me-3 p-3 rounded-3 d-flex align-items-center justify-content-center"
                        style={{
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: 'white'
                        }}
                      >
                        <Activity size={20} />
                      </div>
                      <h6 className="mb-0 fw-bold">System Status</h6>
                    </div>
                    <div className="space-y-3">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="text-muted">Server Uptime</span>
                        <span className="fw-medium text-success">99.9%</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="text-muted">Active Connections</span>
                        <span className="fw-medium">{activeVehicles.length + activeDrivers}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted">Last Updated</span>
                        <span className="fw-medium">{formattedTime}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

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