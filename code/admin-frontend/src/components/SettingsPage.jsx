import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Card, Row, Col, Tab, Nav, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Map, 
  Save, 
  RefreshCw, 
  X,
  Check
} from 'lucide-react';

import Sidebar from './Sidebar';
import PageHeader from './PageHeader';
import AnimatedAlert from './AnimatedAlert';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');

  // Example account settings
  const [accountSettings, setAccountSettings] = useState({
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '+94 71 234 5678',
    company: 'TrackMaster Solutions',
    profilePicture: null
  });
  
  // Example notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    dailySummary: true,
    securityAlerts: true,
    maintenanceAlerts: true
  });
  
  // Example security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiryDays: 90,
    lastPasswordChange: '2023-01-15'
  });
  
  // Example map settings
  const [mapSettings, setMapSettings] = useState({
    defaultMapType: 'standard',
    refreshInterval: 60,
    showInactiveVehicles: true,
    autoCenter: true,
    nightMode: false
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleAccountSubmit = (e) => {
    e.preventDefault();
    setAlertType('success');
    setAlertMessage('Account settings updated successfully!');
    setShowAlert(true);
  };

  const handleNotificationSubmit = (e) => {
    e.preventDefault();
    setAlertType('success');
    setAlertMessage('Notification preferences updated successfully!');
    setShowAlert(true);
  };

  const handleSecuritySubmit = (e) => {
    e.preventDefault();
    setAlertType('success');
    setAlertMessage('Security settings updated successfully!');
    setShowAlert(true);
  };

  const handleMapSubmit = (e) => {
    e.preventDefault();
    setAlertType('success');
    setAlertMessage('Map preferences updated successfully!');
    setShowAlert(true);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
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
          subtitle="Configure your account and system preferences"
          icon={Settings}
        />
        
        <AnimatedAlert
          show={showAlert}
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
        
        <Row className="mb-4">
          <Col md={12}>
            <motion.div 
              className="card border-0 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card-body">
                <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                  <Row>
                    <Col md={3}>
                      <div className="border-end h-100 pe-md-3">
                        <h5 className="mb-3">Settings</h5>
                        <Nav variant="pills" className="flex-column">
                          <Nav.Item>
                            <Nav.Link 
                              eventKey="account" 
                              className="d-flex align-items-center mb-2"
                            >
                              <User size={18} className="me-2" />
                              Account
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item>
                            <Nav.Link 
                              eventKey="notifications" 
                              className="d-flex align-items-center mb-2"
                            >
                              <Bell size={18} className="me-2" />
                              Notifications
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item>
                            <Nav.Link 
                              eventKey="security" 
                              className="d-flex align-items-center mb-2"
                            >
                              <Shield size={18} className="me-2" />
                              Security
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item>
                            <Nav.Link 
                              eventKey="map" 
                              className="d-flex align-items-center mb-2"
                            >
                              <Map size={18} className="me-2" />
                              Map Preferences
                            </Nav.Link>
                          </Nav.Item>
                        </Nav>
                      </div>
                    </Col>
                    <Col md={9}>
                      <Tab.Content>
                        <Tab.Pane eventKey="account">
                          <h5 className="mb-4">Account Settings</h5>
                          <Form onSubmit={handleAccountSubmit}>
                            <Row className="mb-3">
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label>Full Name</Form.Label>
                                  <Form.Control 
                                    type="text" 
                                    value={accountSettings.name}
                                    onChange={(e) => setAccountSettings({...accountSettings, name: e.target.value})}
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label>Email Address</Form.Label>
                                  <Form.Control 
                                    type="email" 
                                    value={accountSettings.email}
                                    onChange={(e) => setAccountSettings({...accountSettings, email: e.target.value})}
                                  />
                                </Form.Group>
                              </Col>
                            </Row>
                            
                            <Row className="mb-3">
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label>Phone Number</Form.Label>
                                  <Form.Control 
                                    type="tel" 
                                    value={accountSettings.phone}
                                    onChange={(e) => setAccountSettings({...accountSettings, phone: e.target.value})}
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label>Company</Form.Label>
                                  <Form.Control 
                                    type="text" 
                                    value={accountSettings.company}
                                    onChange={(e) => setAccountSettings({...accountSettings, company: e.target.value})}
                                  />
                                </Form.Group>
                              </Col>
                            </Row>
                            
                            <Form.Group className="mb-3">
                              <Form.Label>Profile Picture</Form.Label>
                              <Form.Control type="file" />
                            </Form.Group>
                            
                            <div className="d-flex justify-content-end mt-4">
                              <Button variant="primary" type="submit" className="d-flex align-items-center">
                                <Save size={16} className="me-2" />
                                Save Changes
                              </Button>
                            </div>
                          </Form>
                        </Tab.Pane>
                        
                        <Tab.Pane eventKey="notifications">
                          <h5 className="mb-4">Notification Preferences</h5>
                          <Form onSubmit={handleNotificationSubmit}>
                            <div className="mb-4">
                              <h6 className="mb-3">Delivery Methods</h6>
                              <Form.Check 
                                type="switch"
                                id="email-alerts"
                                label="Email Alerts"
                                className="mb-3"
                                checked={notificationSettings.emailAlerts}
                                onChange={(e) => setNotificationSettings({...notificationSettings, emailAlerts: e.target.checked})}
                              />
                              <Form.Check 
                                type="switch"
                                id="sms-alerts"
                                label="SMS Alerts"
                                className="mb-3"
                                checked={notificationSettings.smsAlerts}
                                onChange={(e) => setNotificationSettings({...notificationSettings, smsAlerts: e.target.checked})}
                              />
                              <Form.Check 
                                type="switch"
                                id="push-notifications"
                                label="Push Notifications"
                                className="mb-3"
                                checked={notificationSettings.pushNotifications}
                                onChange={(e) => setNotificationSettings({...notificationSettings, pushNotifications: e.target.checked})}
                              />
                              <Form.Check 
                                type="switch"
                                id="daily-summary"
                                label="Daily Summary Email"
                                checked={notificationSettings.dailySummary}
                                onChange={(e) => setNotificationSettings({...notificationSettings, dailySummary: e.target.checked})}
                              />
                            </div>
                            
                            <div className="mb-4">
                              <h6 className="mb-3">Alert Types</h6>
                              <Form.Check 
                                type="switch"
                                id="security-alerts"
                                label="Security Alerts (Tampering, Unauthorized Access)"
                                className="mb-3"
                                checked={notificationSettings.securityAlerts}
                                onChange={(e) => setNotificationSettings({...notificationSettings, securityAlerts: e.target.checked})}
                              />
                              <Form.Check 
                                type="switch"
                                id="maintenance-alerts"
                                label="Maintenance Alerts (Service Due, Low Battery)"
                                checked={notificationSettings.maintenanceAlerts}
                                onChange={(e) => setNotificationSettings({...notificationSettings, maintenanceAlerts: e.target.checked})}
                              />
                            </div>
                            
                            <div className="d-flex justify-content-end mt-4">
                              <Button variant="primary" type="submit" className="d-flex align-items-center">
                                <Save size={16} className="me-2" />
                                Save Changes
                              </Button>
                            </div>
                          </Form>
                        </Tab.Pane>
                        
                        <Tab.Pane eventKey="security">
                          <h5 className="mb-4">Security Settings</h5>
                          <Form onSubmit={handleSecuritySubmit}>
                            <div className="mb-4">
                              <h6 className="mb-3">Authentication</h6>
                              <Form.Check 
                                type="switch"
                                id="two-factor"
                                label="Enable Two-Factor Authentication"
                                className="mb-3"
                                checked={securitySettings.twoFactorAuth}
                                onChange={(e) => setSecuritySettings({...securitySettings, twoFactorAuth: e.target.checked})}
                              />
                              
                              {securitySettings.twoFactorAuth && (
                                <Alert variant="info" className="d-flex align-items-start">
                                  <Info size={20} className="me-2 mt-1" />
                                  <div>
                                    <strong>Two-factor authentication is enabled.</strong>
                                    <p className="mb-0 mt-1">You will receive a verification code to your email or phone when logging in from a new device.</p>
                                  </div>
                                </Alert>
                              )}
                            </div>
                            
                            <div className="mb-4">
                              <h6 className="mb-3">Session Settings</h6>
                              <Form.Group className="mb-3">
                                <Form.Label>Session Timeout (minutes)</Form.Label>
                                <Form.Control 
                                  type="number" 
                                  min="5" 
                                  max="120"
                                  value={securitySettings.sessionTimeout}
                                  onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: e.target.value})}
                                />
                                <Form.Text className="text-muted">
                                  You will be automatically logged out after this period of inactivity.
                                </Form.Text>
                              </Form.Group>
                            </div>
                            
                            <div className="mb-4">
                              <h6 className="mb-3">Password</h6>
                              <Form.Group className="mb-3">
                                <Form.Label>Password Expiry (days)</Form.Label>
                                <Form.Control 
                                  type="number" 
                                  min="30" 
                                  max="180"
                                  value={securitySettings.passwordExpiryDays}
                                  onChange={(e) => setSecuritySettings({...securitySettings, passwordExpiryDays: e.target.value})}
                                />
                                <Form.Text className="text-muted">
                                  You will be prompted to change your password after this many days.
                                </Form.Text>
                              </Form.Group>
                              
                              <div className="d-grid gap-2">
                                <Button variant="outline-primary">
                                  Change Password
                                </Button>
                              </div>
                            </div>
                            
                            <div className="d-flex justify-content-end mt-4">
                              <Button variant="primary" type="submit" className="d-flex align-items-center">
                                <Save size={16} className="me-2" />
                                Save Changes
                              </Button>
                            </div>
                          </Form>
                        </Tab.Pane>
                        
                        <Tab.Pane eventKey="map">
                          <h5 className="mb-4">Map Preferences</h5>
                          <Form onSubmit={handleMapSubmit}>
                            <Form.Group className="mb-3">
                              <Form.Label>Default Map Type</Form.Label>
                              <Form.Select
                                value={mapSettings.defaultMapType}
                                onChange={(e) => setMapSettings({...mapSettings, defaultMapType: e.target.value})}
                              >
                                <option value="standard">Standard</option>
                                <option value="satellite">Satellite</option>
                                <option value="terrain">Terrain</option>
                              </Form.Select>
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                              <Form.Label>Data Refresh Interval (seconds)</Form.Label>
                              <Form.Control 
                                type="number" 
                                min="10" 
                                max="300"
                                value={mapSettings.refreshInterval}
                                onChange={(e) => setMapSettings({...mapSettings, refreshInterval: e.target.value})}
                              />
                            </Form.Group>
                            
                            <Form.Check 
                              type="switch"
                              id="show-inactive"
                              label="Show Inactive Vehicles"
                              className="mb-3"
                              checked={mapSettings.showInactiveVehicles}
                              onChange={(e) => setMapSettings({...mapSettings, showInactiveVehicles: e.target.checked})}
                            />
                            
                            <Form.Check 
                              type="switch"
                              id="auto-center"
                              label="Auto-center Map on Selected Vehicle"
                              className="mb-3"
                              checked={mapSettings.autoCenter}
                              onChange={(e) => setMapSettings({...mapSettings, autoCenter: e.target.checked})}
                            />
                            
                            <Form.Check 
                              type="switch"
                              id="night-mode"
                              label="Night Mode"
                              className="mb-3"
                              checked={mapSettings.nightMode}
                              onChange={(e) => setMapSettings({...mapSettings, nightMode: e.target.checked})}
                            />
                            
                            <div className="d-flex justify-content-end mt-4">
                              <Button variant="primary" type="submit" className="d-flex align-items-center">
                                <Save size={16} className="me-2" />
                                Save Changes
                              </Button>
                            </div>
                          </Form>
                        </Tab.Pane>
                      </Tab.Content>
                    </Col>
                  </Row>
                </Tab.Container>
              </div>
            </motion.div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default SettingsPage;
