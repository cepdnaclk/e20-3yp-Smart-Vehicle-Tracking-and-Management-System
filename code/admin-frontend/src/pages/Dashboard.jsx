import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bell, Map, Truck, Users, AlertTriangle, Settings, LogOut } from "lucide-react";
import Sidebar from "../components/Sidebar";
import VehicleDetailsModal from "../components/VehicleDetailsModal";
import StatsCard from "../components/StatsCard";
import AlertCard from "../components/AlertCard";
import VehicleCard from "../components/VehicleCard";
import SpeedChart from "../components/SpeedChart";
import { getSensorsData } from "../services/getSensorsData";
import LeafletMap from "../components/LeafletMap";
import { getAlerts } from "../services/getAlerts";

const Dashboard = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [activeVehicles, setActiveVehicles] = useState([]);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [activeDrivers, setActiveDrivers] = useState(0);
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Fetch total vehicles
  useEffect(() => {
    const fetchTotalVehicles = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/vehicles/count");
        setTotalVehicles(response.data.totalVehicles);
      } catch (error) {
        console.error("Error fetching total vehicles:", error);
      }
    };

    fetchTotalVehicles();
  }, []);

  // Fetch active vehicles
  useEffect(() => {
    const fetchActiveVehicles = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/vehicles?status=active");
        setActiveVehicles(response.data);
      } catch (error) {
        console.error("Error fetching active vehicles:", error);
      }
    };

    fetchActiveVehicles();
  }, []);

  // Fetch total drivers
  useEffect(() => {
    const fetchTotalDrivers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/drivers/count");
        setTotalDrivers(response.data.totalDrivers);
      } catch (error) {
        console.error("Error fetching total drivers:", error);
      }
    };

    fetchTotalDrivers();
  }, []);

  // Fetch active drivers
  useEffect(() => {
    const fetchActiveDrivers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/drivers/count/active");
        setActiveDrivers(response.data.activeDriversCount);
      } catch (error) {
        console.error("Error fetching active drivers count:", error);
      }
    };

    fetchActiveDrivers();
  }, []);

  //Fetch sensors
  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const sensorsData = await getSensorsData();
        console.log('This is sensorsData', sensorsData) //Feed this sensors data to the dashboard
      } catch (error) {
        console.error("Error fetching invoice:", error);
      }
    }

    fetchSensors();
  }, [])

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const alertsData = await getAlerts();
        const alert = {
          type: 'Tamper',
          vehicle: "CAM-8086",
          time: alertsData.tampering_timestamp.split(" ")[1],
          location: `${alertsData.tampering_latitude}° N, ${alertsData.tampering_longitude}° E`,
        }
        setAlert(alert)
      } catch (error) {
        console.error("Error fetching invoice:", error);
      }
    }

    fetchAlerts();
  }, [])

  const recentAlerts = [
    {
      id: 1,
      type: "Accident",
      vehicle: "TN-01-AB-1234",
      time: "10:30 AM",
      location: "12.9716° N, 77.5946° E",
    },
    {
      id: 2,
      type: "Tamper",
      vehicle: "TN-01-CD-5678",
      time: "09:15 AM",
      location: "13.0827° N, 80.2707° E",
    },
    {
      id: 3,
      type: "Speed",
      vehicle: "TN-01-EF-9012",
      time: "08:45 AM",
      location: "12.9716° N, 77.5946° E",
    },
  ];

  const speedData = [
    { time: "00:00", speed: 45 },
    { time: "04:00", speed: 55 },
    { time: "08:00", speed: 65 },
    { time: "12:00", speed: 60 },
    { time: "16:00", speed: 70 },
    { time: "20:00", speed: 50 },
  ];

  return (
    <div className="min-vh-100 bg-light" style={{ paddingLeft: "250px" }}>
      <Sidebar handleLogout={handleLogout} />
      <div style={{ padding: "2rem" }}>
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Dashboard Overview</h2>
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-light position-relative">
              <Bell />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                3
              </span>
            </button>
            <div className="d-flex align-items-center">
              <img
                src="/api/placeholder/32/32"
                alt="Profile"
                className="rounded-circle me-2"
              />
              <span className="fw-medium">Admin User</span>
            </div>
          </div>
        </div>

        {/* Live Vehicle Tracking Map */}
        <LeafletMap />

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-2">
            <StatsCard title="Total Vehicles" value={totalVehicles} />
          </div>
          <div className="col-md-2">
            <StatsCard title="Active Vehicles" value={activeVehicles.length} color="text-success" />
          </div>
          <div className="col-md-2">
            <StatsCard title="Total Drivers" value={totalDrivers} color="text-primary" />
          </div>
          <div className="col-md-2">
            <StatsCard title="Active Drivers" value={activeDrivers} color="text-info" />
          </div>
          <div className="col-md-2">
            <StatsCard title="Active Alerts" value={activeAlerts} color="text-danger" />
          </div>
        </div>

        {/* Recent Alerts and Active Vehicles */}
        <div className="row">
          <div className="col-lg-6 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title mb-4">Recent Alerts</h5>
                <div style={{ maxHeight: "370px", overflowY: "auto" }}>
                  {/* {recentAlerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))} */}
                  {alert !== null && <AlertCard alert={alert} />}
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title mb-4">Active Vehicles</h5>
                <div style={{ maxHeight: "370px", overflowY: "auto" }}>
                  {activeVehicles.map((vehicle) => (
                    <VehicleCard
                      key={vehicle._id}
                      vehicle={vehicle}
                      onClick={() => {
                        setSelectedVehicle(vehicle);
                        setShowVehicleDetails(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Details Modal */}
      {showVehicleDetails && selectedVehicle && (
        <VehicleDetailsModal
          vehicle={selectedVehicle}
          onClose={() => setShowVehicleDetails(false)}
          speedData={speedData}
        />
      )}
    </div>
  );
};

export default Dashboard;