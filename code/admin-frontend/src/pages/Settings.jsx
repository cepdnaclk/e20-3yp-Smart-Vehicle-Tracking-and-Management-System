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
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        const { firstName, lastName, email, phone, companyId } = response.data.data.user;
        setUserProfile({
          firstName,
          lastName,
          email,
          phone,
          companyId,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setAlertMessage('Failed to fetch profile data');
      setAlertType('error');
      setShowAlert(true);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.put(
        '/api/admin/profile',
        {
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          phone: userProfile.phone,
          companyId: userProfile.companyId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        setAlertMessage('Profile updated successfully!');
        setAlertType('success');
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setAlertMessage(error.response?.data?.message || 'Failed to update profile');
      setAlertType('error');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);
    const isLongEnough = password.length >= 8;

    const errors = [];
    if (!isLongEnough) errors.push('Password must be at least 8 characters long');
    if (!hasUpperCase) errors.push('Password must contain at least one uppercase letter');
    if (!hasLowerCase) errors.push('Password must contain at least one lowercase letter');
    if (!hasNumbers) errors.push('Password must contain at least one number');
    if (!hasSpecialChar) errors.push('Password must contain at least one special character (@$!%*?&)');

    return errors;
  };

  const handleSaveSecurity = async () => {
    // Validate current password
    if (!securitySettings.oldPassword) {
      setAlertMessage('Current password is required');
      setAlertType('error');
      setShowAlert(true);
      return;
    }

    // Validate new password
    const passwordErrors = validatePassword(securitySettings.changePassword);
    if (passwordErrors.length > 0) {
      setAlertMessage(`Password requirements not met:\n${passwordErrors.join('\n')}`);
      setAlertType('error');
      setShowAlert(true);
      return;
    }

    // Check if passwords match
    if (securitySettings.changePassword !== securitySettings.confirmPassword) {
      setAlertMessage('New passwords do not match');
      setAlertType('error');
      setShowAlert(true);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        '/api/admin/change-password',
        {
          currentPassword: securitySettings.oldPassword,
          newPassword: securitySettings.changePassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        setAlertMessage('Password changed successfully!');
        setAlertType('success');
        setShowAlert(true);
        // Clear password fields
        setSecuritySettings({
          oldPassword: '',
          changePassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      setAlertMessage(errorMessage);
      setAlertType('error');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDisplayPreferences = () => {
    setAlertMessage('Display preferences updated successfully!');
    setAlertType('success');
    setShowAlert(true);
    // Add API call to save display preferences
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-vh-100 bg-light" style={{ 
      paddingLeft: sidebarCollapsed ? '80px' : '250px',
      transition: 'padding-left 0.3s ease-in-out'
    }}>
      <Sidebar handleLogout={handleLogout} />
      <div className="p-4">
        <PageHeader 
          title="Settings" 
          subtitle="Manage your account and system preferences"
          icon={FaCog}
        />
        
        <AnimatedAlert
          show={showAlert}
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
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
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={userProfile.firstName}
                      onChange={(e) => setUserProfile({ ...userProfile, firstName: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={userProfile.lastName}
                      onChange={(e) => setUserProfile({ ...userProfile, lastName: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      <FaBuilding className="me-2" />
                      Company ID
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={userProfile.companyId}
                      disabled
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={userProfile.email}
                      disabled
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={userProfile.phone}
                      onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                    />
                  </div>
                </div>
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
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter your current password"
                  value={securitySettings.oldPassword}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, oldPassword: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter new password"
                  value={securitySettings.changePassword}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, changePassword: e.target.value })}
                />
                <small className="text-muted">
                  Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character (@$!%*?&)
                </small>
              </div>
              <div className="mb-3">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Confirm new password"
                  value={securitySettings.confirmPassword}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, confirmPassword: e.target.value })}
                />
              </div>
              <button 
                className="btn btn-primary" 
                onClick={handleSaveSecurity}
                disabled={loading}
              >
                <FaSave className="me-2" />
                {loading ? 'Saving...' : 'Save Security Settings'}
              </button>
            </div>
          </div>

          {/* Display Preferences Section */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <FaDesktop className="me-2" />
                Display Preferences
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      <FaDesktop className="me-2" />
                      Dashboard Layout
                    </label>
                    <select
                      className="form-select"
                      value={displayPreferences.dashboardLayout}
                      onChange={(e) => setDisplayPreferences({ ...displayPreferences, dashboardLayout: e.target.value })}
                    >
                      <option value="default">Default</option>
                      <option value="compact">Compact</option>
                      <option value="detailed">Detailed</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      <FaClock className="me-2" />
                      Data Refresh Rate (seconds)
                    </label>
                    <select
                      className="form-select"
                      value={displayPreferences.dataRefreshRate}
                      onChange={(e) => setDisplayPreferences({ ...displayPreferences, dataRefreshRate: parseInt(e.target.value) })}
                    >
                      <option value="3">3 seconds</option>
                      <option value="5">5 seconds</option>
                      <option value="10">10 seconds</option>
                      <option value="15">15 seconds</option>
                      <option value="30">30 seconds</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      <FaGlobe className="me-2" />
                      Date/Time Format
                    </label>
                    <select
                      className="form-select"
                      value={displayPreferences.dateTimeFormat}
                      onChange={(e) => setDisplayPreferences({ ...displayPreferences, dateTimeFormat: e.target.value })}
                    >
                      <option value="12h">12-hour (AM/PM)</option>
                      <option value="24h">24-hour</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      {isDarkMode ? <FaMoon className="me-2" /> : <FaSun className="me-2" />}
                      Theme
                    </label>
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
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Settings;