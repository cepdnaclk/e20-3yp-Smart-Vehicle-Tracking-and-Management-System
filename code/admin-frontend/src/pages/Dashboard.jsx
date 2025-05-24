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
  X
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import VehicleDetailsModal from "../components/VehicleDetailsModal";
import LoadingSpinner from "../components/LoadingSpinner";
import AnimatedAlert from "../components/AnimatedAlert";
import { getSensorsData } from "../services/getSensorsData";
import LeafletMap from "../components/LeafletMap";
import { getAlerts } from "../services/getAlerts";
import { api } from "../services/api";

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

const Dashboard = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [activeVehicles, setActiveVehicles] = useState([]);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [activeDrivers, setActiveDrivers] = useState(0);
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [alert, setAlert] = useState(null);
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
    
    // Initial loading
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchTotalVehicles(),
          fetchActiveVehicles(),
          fetchTotalDrivers(),
          fetchActiveDrivers(),
          fetchSensors(),
          fetchAlerts()
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
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
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

  // Fetch sensors
  const fetchSensors = async () => {
    try {
      const sensorsData = await getSensorsData();
      console.log('This is sensorsData', sensorsData); //Feed this sensors data to the dashboard
    } catch (error) {
      console.error("Error fetching sensors data:", error);
    }
  };

  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      const alertsData = await getAlerts();
      if (alertsData && alertsData.tampering_timestamp) {
        const alert = {
          type: 'Tamper',
          vehicle: "CAM-8087",
          time: alertsData.tampering_timestamp.split(" ")[1],
          location: `${alertsData.tampering_latitude}° N, ${alertsData.tampering_longitude}° E`,
        };
        setAlert(alert);
        setActiveAlerts(1);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
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
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className={`rounded-circle p-3 ${color}`} style={{ opacity: 0.2 }}>
              {icon}
            </div>
            {percentage && (
              <div className={`badge ${isUp ? 'bg-success' : 'bg-danger'} d-flex align-items-center`}>
                {isUp ? <TrendingUp size={14} className="me-1" /> : <TrendingUp size={14} className="me-1" style={{ transform: 'rotate(180deg)' }} />}
                {percentage}%
              </div>
            )}
          </div>
          <div className="d-flex flex-column">
            <h5 className="card-title text-gray-900 mb-1">{value}</h5>
            <p className="card-text text-muted small mb-0">{title}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Alert card component
  const AlertCardNew = ({ alert }) => (
    <motion.div 
      className="card border-0 shadow-sm mb-3"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="card-body p-3">
        <div className="d-flex align-items-center mb-2">
          <div className="rounded-circle bg-danger p-2 me-3" style={{ opacity: 0.2 }}>
            <AlertTriangle size={20} className="text-danger" />
          </div>
          <div>
            <h6 className="mb-0 fw-bold">{alert.type} Alert</h6>
            <span className="text-muted small">{alert.time}</span>
          </div>
        </div>
        <div className="ps-5">
          <p className="mb-1">Vehicle: <strong>{alert.vehicle}</strong></p>
          <p className="mb-0 small">Location: {alert.location}</p>
        </div>
        <div className="d-flex justify-content-end mt-2">
          <button className="btn btn-sm btn-outline-primary me-2">Acknowledge</button>
          <button className="btn btn-sm btn-primary">View Details</button>
        </div>
      </div>
    </motion.div>
  );

  // Vehicle card component
  const VehicleCardNew = ({ vehicle, onClick }) => (
    <motion.div 
      className="card border-0 shadow-sm mb-3"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="card-body p-3">
        <div className="d-flex align-items-center">
          <div className="rounded-circle bg-primary p-2 me-3" style={{ opacity: 0.2 }}>
            <Truck size={20} className="text-primary" />
          </div>
          <div>
            <h6 className="mb-0 fw-bold">{vehicle.vehicleName || "Unnamed Vehicle"}</h6>
            <span className="text-muted small">License: {vehicle.licensePlate}</span>
          </div>
          <div className="ms-auto">
            <span className={`badge ${vehicle.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
              {vehicle.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        <div className="ps-5 mt-1">
          <p className="mb-0 small">Last seen: {vehicle.lastLocation || "Not tracked yet"}</p>
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
            percentage="12"
            isUp={true}
          />
          <StatsCardNew 
            icon={<Zap size={24} className="text-success" />} 
            title="Active Vehicles" 
            value={activeVehicles.length} 
            color="bg-success"
            percentage="5"
            isUp={true}
          />
          <StatsCardNew 
            icon={<Users size={24} className="text-info" />} 
            title="Total Drivers" 
            value={totalDrivers} 
            color="bg-info"
            percentage="8"
            isUp={true}
          />
          <StatsCardNew 
            icon={<User size={24} className="text-warning" />} 
            title="Active Drivers" 
            value={activeDrivers} 
            color="bg-warning"
            percentage="10"
            isUp={true}
          />
        </motion.div>

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
            <LeafletMap />
          </div>
        </motion.div>

        {/* Recent Alerts and Active Vehicles in Cards */}
        <div className="row">
          <div className="col-lg-6 mb-4">
            <motion.div 
              className="card border-0 shadow-sm h-100"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="card-header bg-white">
                <div className="d-flex align-items-center">
                  <AlertTriangle size={18} className="me-2 text-danger" />
                  <h5 className="mb-0">Recent Alerts</h5>
                </div>
              </div>
              <div className="card-body" style={{ maxHeight: '370px', overflowY: 'auto' }}>
                {alert !== null && <AlertCardNew alert={alert} />}
                {!alert && (
                  <div className="text-center py-5 text-muted">
                    <AlertTriangle size={40} className="mb-3 text-muted" />
                    <p>No active alerts at this time.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <div className="col-lg-6 mb-4">
            <motion.div 
              className="card border-0 shadow-sm h-100"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="card-header bg-white">
                <div className="d-flex align-items-center">
                  <Truck size={18} className="me-2 text-primary" />
                  <h5 className="mb-0">Active Vehicles</h5>
                </div>
              </div>
              <div className="card-body" style={{ maxHeight: '370px', overflowY: 'auto' }}>
                {activeVehicles.map((vehicle) => (
                  <VehicleCardNew
                    key={vehicle._id}
                    vehicle={vehicle}
                    onClick={() => {
                      setSelectedVehicle(vehicle);
                      setShowVehicleDetails(true);
                    }}
                  />
                ))}
                {activeVehicles.length === 0 && (
                  <div className="text-center py-5 text-muted">
                    <Truck size={40} className="mb-3 text-muted" />
                    <p>No active vehicles at this time.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
        
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
            <div className="text-center py-5">
              <p className="text-muted">Analytics data will be displayed here</p>
            </div>
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