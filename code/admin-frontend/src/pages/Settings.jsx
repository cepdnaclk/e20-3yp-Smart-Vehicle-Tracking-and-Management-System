import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaShieldAlt, FaCog, FaSave, FaDesktop, FaClock, FaGlobe, FaMoon, FaSun, FaBuilding } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import AnimatedAlert from '../components/AnimatedAlert';
import { useTheme } from '../context/ThemeContext';
import '../styles/darkMode.css';
import axios from 'axios';

function Settings() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('info');
  const [loading, setLoading] = useState(false);

  const [userProfile, setUserProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyId: '',
  });

  const [securitySettings, setSecuritySettings] = useState({
    oldPassword: '',
    changePassword: '',
    confirmPassword: '',
  });

  const [displayPreferences, setDisplayPreferences] = useState({
    dashboardLayout: 'default',
    dataRefreshRate: 5,
    dateTimeFormat: '12h',
    language: 'en',
  });

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/api/admin/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUserProfile(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await axios.put('/api/admin/profile', userProfile, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAlertType('success');
      setAlertMessage('Profile updated successfully!');
      setShowAlert(true);
    } catch (error) {
      setAlertType('error');
      setAlertMessage('Failed to update profile. Please try again.');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (securitySettings.changePassword !== securitySettings.confirmPassword) {
      setAlertType('error');
      setAlertMessage('New passwords do not match!');
      setShowAlert(true);
      return;
    }

    setLoading(true);
    try {
      await axios.put('/api/admin/change-password', {
        oldPassword: securitySettings.oldPassword,
        newPassword: securitySettings.changePassword
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAlertType('success');
      setAlertMessage('Password changed successfully!');
      setShowAlert(true);
      setSecuritySettings({ oldPassword: '', changePassword: '', confirmPassword: '' });
    } catch (error) {
      setAlertType('error');
      setAlertMessage('Failed to change password. Please check your current password.');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDisplayPreferences = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('displayPreferences', JSON.stringify(displayPreferences));
      setAlertType('success');
      setAlertMessage('Display preferences saved successfully!');
      setShowAlert(true);
      setLoading(false);
    }, 1000);
  };

  // Reset settings to defaults
  const handleResetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      setDisplayPreferences({
        dashboardLayout: 'default',
        dataRefreshRate: 5,
        dateTimeFormat: '12h',
        language: 'en',
      });
      setSecuritySettings({
        oldPassword: '',
        changePassword: '',
        confirmPassword: '',
      });
      setAlertType('success');
      setAlertMessage('Settings reset to defaults successfully!');
      setShowAlert(true);
    }
  };

  return (
    <div 
      className="min-vh-100"
      style={{ 
        paddingLeft: sidebarCollapsed ? '90px' : '280px',
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <PageHeader 
          title="Settings" 
          subtitle="Manage your account and application preferences"
          icon={FaCog}
          actions={[
            {
              label: 'Reset to Defaults',
              onClick: handleResetToDefaults,
              variant: 'outline-secondary'
            }
          ]}
        />

        {showAlert && (
          <AnimatedAlert 
            type={alertType}
            message={alertMessage}
            onClose={() => setShowAlert(false)}
          />
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Settings Grid */}
          <div className="row g-4">
            {/* User Profile Section */}
            <div className="col-lg-6">
              <motion.div 
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden'
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
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
                      <FaUser size={24} />
                    </div>
                    <div>
                      <h5 className="mb-1 fw-bold">User Profile</h5>
                      <p className="text-muted mb-0">Manage your personal information</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium">First Name</label>
                    <input
                      type="text"
                      className="form-control modern-input"
                      placeholder="Enter your first name"
                      value={userProfile.firstName}
                      onChange={(e) => setUserProfile({ ...userProfile, firstName: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-medium">Last Name</label>
                    <input
                      type="text"
                      className="form-control modern-input"
                      placeholder="Enter your last name"
                      value={userProfile.lastName}
                      onChange={(e) => setUserProfile({ ...userProfile, lastName: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-medium">Email</label>
                    <input
                      type="email"
                      className="form-control modern-input"
                      placeholder="Enter your email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-medium">Phone</label>
                    <input
                      type="tel"
                      className="form-control modern-input"
                      placeholder="Enter your phone number"
                      value={userProfile.phone}
                      onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                    />
                  </div>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleSaveProfile}
                    disabled={loading}
                  >
                    <FaSave className="me-2" />
                    {loading ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Security Settings Section */}
            <div className="col-lg-6">
              <motion.div 
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden'
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-4">
                  <div className="d-flex align-items-center mb-4">
                    <div 
                      className="me-3 p-3 rounded-3 d-flex align-items-center justify-content-center"
                      style={{
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: 'white'
                      }}
                    >
                      <FaShieldAlt size={24} />
                    </div>
                    <div>
                      <h5 className="mb-1 fw-bold">Security Settings</h5>
                      <p className="text-muted mb-0">Update your password</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium">Current Password</label>
                    <input
                      type="password"
                      className="form-control modern-input"
                      placeholder="Enter your current password"
                      value={securitySettings.oldPassword}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, oldPassword: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-medium">New Password</label>
                    <input
                      type="password"
                      className="form-control modern-input"
                      placeholder="Enter new password"
                      value={securitySettings.changePassword}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, changePassword: e.target.value })}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-medium">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control modern-input"
                      placeholder="Confirm your new password"
                      value={securitySettings.confirmPassword}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, confirmPassword: e.target.value })}
                    />
                  </div>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleChangePassword}
                    disabled={loading}
                  >
                    <FaShieldAlt className="me-2" />
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Display Preferences Section */}
            <div className="col-12">
              <motion.div 
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden'
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
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
                      <FaDesktop size={24} />
                    </div>
                    <div>
                      <h5 className="mb-1 fw-bold">Display Preferences</h5>
                      <p className="text-muted mb-0">Customize your interface</p>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-medium">Dashboard Layout</label>
                        <select
                          className="form-select modern-input"
                          value={displayPreferences.dashboardLayout}
                          onChange={(e) => setDisplayPreferences({ ...displayPreferences, dashboardLayout: e.target.value })}
                        >
                          <option value="default">Default</option>
                          <option value="compact">Compact</option>
                          <option value="expanded">Expanded</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-medium">Data Refresh Rate (seconds)</label>
                        <select
                          className="form-select modern-input"
                          value={displayPreferences.dataRefreshRate}
                          onChange={(e) => setDisplayPreferences({ ...displayPreferences, dataRefreshRate: parseInt(e.target.value) })}
                        >
                          <option value={5}>5 seconds</option>
                          <option value={10}>10 seconds</option>
                          <option value={30}>30 seconds</option>
                          <option value={60}>1 minute</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-medium">Date & Time Format</label>
                        <select
                          className="form-select modern-input"
                          value={displayPreferences.dateTimeFormat}
                          onChange={(e) => setDisplayPreferences({ ...displayPreferences, dateTimeFormat: e.target.value })}
                        >
                          <option value="12h">12-hour format</option>
                          <option value="24h">24-hour format</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-medium">Language</label>
                        <select
                          className="form-select modern-input"
                          value={displayPreferences.language}
                          onChange={(e) => setDisplayPreferences({ ...displayPreferences, language: e.target.value })}
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="mb-3">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="darkModeToggle"
                            checked={isDarkMode}
                            onChange={toggleDarkMode}
                          />
                          <label className="form-check-label" htmlFor="darkModeToggle">
                            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleSaveDisplayPreferences}
                    disabled={loading}
                  >
                    <FaSave className="me-2" />
                    {loading ? 'Saving...' : 'Save Display Preferences'}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Settings;
