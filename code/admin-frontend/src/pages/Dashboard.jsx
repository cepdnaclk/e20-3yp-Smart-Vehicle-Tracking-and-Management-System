import React, { useState, useEffect } from 'react';
import { Bell, Map, Truck, Users, AlertTriangle, Settings, LogOut } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import VehicleDetailsModal from '../components/VehicleDetailsModal';
import StatsCard from '../components/StatsCard';
import AlertCard from '../components/AlertCard';
import VehicleCard from '../components/VehicleCard';
import SpeedChart from '../components/SpeedChart';

const Dashboard = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);

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

  const recentAlerts = [
    { id: 1, type: 'Accident', vehicle: 'TN-01-AB-1234', time: '10:30 AM', location: '12.9716° N, 77.5946° E' },
    { id: 2, type: 'Tamper', vehicle: 'TN-01-CD-5678', time: '09:15 AM', location: '13.0827° N, 80.2707° E' },
    { id: 3, type: 'Speed', vehicle: 'TN-01-EF-9012', time: '08:45 AM', location: '12.9716° N, 77.5946° E' }
  ];

  const activeVehicles = [
    {
      id: 1,
      number: 'TN-01-AB-1234',
      driver: 'John Doe',
      status: 'Moving',
      speed: 65,
      fuel: 75,
      battery: 90,
      location: { lat: 12.9716, lng: 77.5946 },
      temperature: 28,
      lastMaintenance: '2024-01-15',
      engineStatus: 'Good',
      occupancy: true
    }
  ];

  const speedData = [
    { time: '00:00', speed: 45 },
    { time: '04:00', speed: 55 },
    { time: '08:00', speed: 65 },
    { time: '12:00', speed: 60 },
    { time: '16:00', speed: 70 },
    { time: '20:00', speed: 50 }
  ];

  return (
    <div className="min-vh-100 bg-light" style={{ paddingLeft: '250px' }}>
      <Sidebar handleLogout={handleLogout} />
      <div style={{ padding: '2rem' }}>
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

        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Live Vehicle Tracking</h5>
            <div className="bg-light rounded p-4 text-center" style={{ height: '400px' }}>
              <span className="text-muted">Interactive Map Component</span>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-3">
            <StatsCard title="Total Vehicles" value="24" />
          </div>
          <div className="col-md-3">
            <StatsCard title="Active Vehicles" value="18" color="text-success" />
          </div>
          <div className="col-md-3">
            <StatsCard title="Total Drivers" value="20" color="text-primary" />
          </div>
          <div className="col-md-3">
            <StatsCard title="Active Alerts" value="3" color="text-danger" />
          </div>
        </div>

        <div className="row">
          <div className="col-lg-6 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title mb-4">Recent Alerts</h5>
                {recentAlerts.map(alert => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-6 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title mb-4">Active Vehicles</h5>
                {activeVehicles.map(vehicle => (
                  <VehicleCard
                    key={vehicle.id}
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