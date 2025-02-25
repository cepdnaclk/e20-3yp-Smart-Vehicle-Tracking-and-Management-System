import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaShieldAlt, FaBell, FaCar, FaCog, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';

function Settings() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 555-123-4567',
    role: 'Owner', // or 'Driver'
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    changePassword: '',
    confirmPassword: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
  });

  const [vehicleSettings, setVehicleSettings] = useState({
    speedLimit: 80, // in km/h
    geofenceEnabled: true,
    tamperAlerts: true,
    accidentAlerts: true,
  });

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully!');
    // Add API call to save profile data
  };

  const handleSaveSecurity = () => {
    toast.success('Security settings updated successfully!');
    // Add API call to save security settings
  };

  const handleSaveNotifications = () => {
    toast.success('Notification settings updated successfully!');
    // Add API call to save notification settings
  };

  const handleSaveVehicleSettings = () => {
    toast.success('Vehicle settings updated successfully!');
    // Add API call to save vehicle settings
  };

  return (
    <div className="container-fluid p-4">
      <h1 className="mb-4">
        <FaCog className="me-2" />
        Settings
      </h1>

      {/* User Profile Section */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">
            <FaUser className="me-2" />
            User Profile
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={userProfile.name}
                  onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={userProfile.email}
                  onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={userProfile.phone}
                  onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Role</label>
                <input
                  type="text"
                  className="form-control"
                  value={userProfile.role}
                  disabled
                />
              </div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleSaveProfile}>
            <FaSave className="me-2" />
            Save Profile
          </button>
        </div>
      </div>

      {/* Security Settings Section */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">
            <FaShieldAlt className="me-2" />
            Security Settings
          </h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Enable Two-Factor Authentication</label>
            <div className="form-check form-switch">
              <input
                type="checkbox"
                className="form-check-input"
                checked={securitySettings.twoFactorAuth}
                onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorAuth: e.target.checked })}
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Change Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="New Password"
              value={securitySettings.changePassword}
              onChange={(e) => setSecuritySettings({ ...securitySettings, changePassword: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Confirm New Password"
              value={securitySettings.confirmPassword}
              onChange={(e) => setSecuritySettings({ ...securitySettings, confirmPassword: e.target.value })}
            />
          </div>
          <button className="btn btn-primary" onClick={handleSaveSecurity}>
            <FaSave className="me-2" />
            Save Security Settings
          </button>
        </div>
      </div>

      {/* Notification Settings Section */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">
            <FaBell className="me-2" />
            Notification Settings
          </h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Email Notifications</label>
            <div className="form-check form-switch">
              <input
                type="checkbox"
                className="form-check-input"
                checked={notificationSettings.emailNotifications}
                onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">SMS Notifications</label>
            <div className="form-check form-switch">
              <input
                type="checkbox"
                className="form-check-input"
                checked={notificationSettings.smsNotifications}
                onChange={(e) => setNotificationSettings({ ...notificationSettings, smsNotifications: e.target.checked })}
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Push Notifications</label>
            <div className="form-check form-switch">
              <input
                type="checkbox"
                className="form-check-input"
                checked={notificationSettings.pushNotifications}
                onChange={(e) => setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked })}
              />
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleSaveNotifications}>
            <FaSave className="me-2" />
            Save Notification Settings
          </button>
        </div>
      </div>

      {/* Vehicle Settings Section */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">
            <FaCar className="me-2" />
            Vehicle Settings
          </h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Speed Limit (km/h)</label>
            <input
              type="number"
              className="form-control"
              value={vehicleSettings.speedLimit}
              onChange={(e) => setVehicleSettings({ ...vehicleSettings, speedLimit: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Enable Geofence</label>
            <div className="form-check form-switch">
              <input
                type="checkbox"
                className="form-check-input"
                checked={vehicleSettings.geofenceEnabled}
                onChange={(e) => setVehicleSettings({ ...vehicleSettings, geofenceEnabled: e.target.checked })}
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Enable Tamper Alerts</label>
            <div className="form-check form-switch">
              <input
                type="checkbox"
                className="form-check-input"
                checked={vehicleSettings.tamperAlerts}
                onChange={(e) => setVehicleSettings({ ...vehicleSettings, tamperAlerts: e.target.checked })}
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Enable Accident Alerts</label>
            <div className="form-check form-switch">
              <input
                type="checkbox"
                className="form-check-input"
                checked={vehicleSettings.accidentAlerts}
                onChange={(e) => setVehicleSettings({ ...vehicleSettings, accidentAlerts: e.target.checked })}
              />
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleSaveVehicleSettings}>
            <FaSave className="me-2" />
            Save Vehicle Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;