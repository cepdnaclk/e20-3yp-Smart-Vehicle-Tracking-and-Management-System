import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Badge, Dropdown } from "react-bootstrap";
import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  Bell,
  Filter, 
  DownloadCloud,
  RefreshCw,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  ThermometerIcon,
  DropletIcon,
  BatteryIcon,
  ShieldAlert,
  Info,
  Settings,
  Eye,
  Activity
} from "lucide-react";
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, BarController } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import Sidebar from "../components/Sidebar";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import AnimatedAlert from "../components/AnimatedAlert";
import { startPolling, stopPolling, fetchAlertsFromAPI } from "../services/getAlerts";
import { api } from "../services/api";
import './Alerts.css';  // Import the CSS file
import VehicleDetailsModal from "../components/VehicleDetailsModal"; // Import the modal

// Register Chart.js components (needed for tree-shaking)
Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, BarController, ChartDataLabels);

const Alerts = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");
  const [filter, setFilter] = useState('all');
  const [showVehicleModal, setShowVehicleModal] = useState(false); // State for modal visibility
  const [selectedVehicleForModal, setSelectedVehicleForModal] = useState(null); // State for modal data

  // Function to fetch alerts manually
  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const alertsData = await fetchAlertsFromAPI();
      setAlerts(alertsData);
      setToastMessage("Alerts refreshed successfully");
      setToastType("success");
      setShowToast(true);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      setToastMessage("Failed to refresh alerts");
      setToastType("danger");
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle PDF export
  const handleExportPdf = async () => {
    try {
      // Dynamically import jsPDF and jspdf-autotable
      const { default: jsPDF } = await import('jspdf');
      const { autoTable } = await import('jspdf-autotable');

      // Re-register Chart.js components to ensure they're available
      Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, BarController, ChartDataLabels);

      const doc = new jsPDF();

      // Add title
      doc.setFontSize(18);
      doc.text("Vehicle Alert Report", 14, 22);

      // --- Add Alert Statistics Chart --- //

      // Function to create the alert statistics chart image
      const createAlertStatisticsChartImage = () => {
        return new Promise((resolve, reject) => {
          try {
            const canvas = document.createElement('canvas');
            const size = 600; // Increase size for more bars
            canvas.width = size;
            canvas.height = size / 2; // Aspect ratio 2:1

            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Failed to get 2D context for canvas'));
              return;
            }

            // Create the bar chart with updated data
            const chart = new Chart(ctx, {
              type: 'bar',
              data: {
                labels: ['Active', 'Resolved', 'Tampering', 'Temperature', 'Speed', 'Humidity', 'Accident'],
                datasets: [{
                  label: 'Alert Statistics',
                  data: [
                    filteredAlerts.filter(a => a.status === 'active').length,
                    filteredAlerts.filter(a => a.status === 'resolved').length,
                    filteredAlerts.filter(a => a.type === 'tampering' && a.status === 'active').length,
                    filteredAlerts.filter(a => a.type === 'temperature' && a.status === 'active').length,
                    filteredAlerts.filter(a => a.type === 'speed' && a.status === 'active').length,
                    filteredAlerts.filter(a => a.type === 'humidity' && a.status === 'active').length,
                    filteredAlerts.filter(a => a.type === 'accident' && a.status === 'active').length
                  ],
                  backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#F59E0B', '#4BC0C0', '#9966FF', '#FF9F40'],
                  borderColor: ['#D32F2F', '#0E7490', '#F57C00', '#D97706', '#2E8B57', '#8A2BE2', '#DC143C'],
                  borderWidth: 1
                }]
              },
              options: {
                responsive: false,
                maintainAspectRatio: false,
                plugins: {
                  title: {
                    display: true,
                    text: 'Alert Statistics',
                    font: { size: 14 }
                  },
                  legend: {
                    display: false,
                    position: 'top'
                  },
                  datalabels: {
                    anchor: 'end',
                    align: 'top',
                    formatter: (value) => value > 0 ? value : '',
                    color: '#000',
                    font: {
                      weight: 'bold'
                    }
                  }
                },
                layout: {
                  padding: { left: 10, right: 10, top: 10, bottom: 10 }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Count'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Alert Type'
                    }
                  }
                },
                animation: {
                  onComplete: () => {
                    try {
                      const imageData = canvas.toDataURL('image/png');
                      resolve(imageData);
                    } catch (error) {
                      reject(error);
                    }
                  }
                }
              }
            });

            // Fallback timeout in case animation doesn't complete
            setTimeout(() => {
              try {
                const imageData = canvas.toDataURL('image/png');
                resolve(imageData);
              } catch (error) {
                reject(error);
              }
            }, 500);
          } catch (error) {
            reject(error);
          }
        });
      };

      // Generate the alert statistics chart image
      const alertStatisticsChartImage = await createAlertStatisticsChartImage();

      // Add the image to the PDF
      let chartWidth = 150;
      let chartHeight = 75;
      let yOffset = 30;
      const margin = 14;

      doc.addImage(alertStatisticsChartImage, 'PNG', margin, yOffset, chartWidth, chartHeight);

      yOffset += chartHeight + 10;

      // --- Add Table --- //

      // Define columns for the table
      const tableColumn = ["Type", "Severity", "Vehicle", "Message", "Time", "Status"];

      // Define rows from filtered alerts data
      const tableRows = filteredAlerts.map(alert => [
        `${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert`,
        alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1),
        alert.vehicle?.licensePlate || alert.vehicle?.number || 'N/A',
        alert.message,
        formatDateTime(alert.timestamp),
        alert.status.charAt(0).toUpperCase() + alert.status.slice(1)
      ]);

      // Add the table
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: yOffset,
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        bodyStyles: { textColor: 50 },
        didDrawPage: (data) => {
          let pageNumber = doc.internal.getNumberOfPages();
          doc.setFontSize(10);
          doc.text(`Page ${pageNumber}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
        }
      });

      // Save the PDF
      doc.save(`Vehicle_Alert_Report_${new Date().toISOString().slice(0,10)}.pdf`);

      setToastMessage("PDF report generated");
      setToastType("success");
      setShowToast(true);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setToastMessage("Failed to generate PDF: " + (error.message || "Unknown error"));
      setToastType("danger");
      setShowToast(true);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
    
    // Initial fetch is now handled by startPolling internally
    // We still call fetchAlerts here for consistency and immediate display
    fetchAlerts();
    
    // Start polling for alerts
    const stopPollingFn = startPolling((newAlerts) => {
      setAlerts(newAlerts);
      // Polling also sets isLoading to false once data is fetched
      setIsLoading(false);
    });

    // Cleanup function to stop polling when component unmounts
    return () => {
      stopPollingFn();
      stopPolling();
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleAlertClick = (alert) => {
    setSelectedAlert(alert);
    // We will handle view action with modal now, so this navigation is not needed for view
    // If you need navigation for other purposes, keep it.
    // navigate(`/vehicles?highlight=${alert.vehicle?.id}`);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getTimeSince = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hr ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    } catch (error) {
      return 'Unknown';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'temperature':
        return <ThermometerIcon size={18} className="text-warning" />;
      case 'humidity':
        return <DropletIcon size={18} className="text-info" />;
      case 'speed':
        return <Truck size={18} className="text-info" />;
      case 'accident':
        return <AlertTriangle size={18} className="text-danger" />;
      case 'tampering':
        return <ShieldAlert size={18} className="text-danger" />;
      default:
        return <Info size={18} className="text-info" />;
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return <Badge bg="danger">Critical</Badge>;
      case 'high':
        return <Badge bg="danger">High</Badge>;
      case 'medium':
        return <Badge bg="warning">Medium</Badge>;
      case 'low':
        return <Badge bg="info">Low</Badge>;
      case 'info':
        return <Badge bg="secondary">Info</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <Badge bg="danger" className="d-flex align-items-center gap-1">
            <span className="pulse-dot"></span>
            Active
          </Badge>
        );
      case 'resolved':
        return (
          <Badge bg="success" className="d-flex align-items-center gap-1">
            <CheckCircle size={10} />
            Resolved
          </Badge>
        );
      case 'ignored':
        return (
          <Badge bg="secondary" className="d-flex align-items-center gap-1">
            <XCircle size={10} />
            Ignored
          </Badge>
        );
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : filter === 'active' 
      ? alerts.filter(alert => alert.status === 'active')
      : alerts.filter(alert => alert.status === 'resolved');

  const tableColumns = [
    {
      key: 'type',
      header: 'Alert Type',
      sortable: true,
      render: (value, row) => (
        <div className="d-flex align-items-center">
          <div className="rounded-circle p-2 me-2" style={{ 
            backgroundColor: value === 'tampering' || value === 'accident'
              ? 'rgba(239, 68, 68, 0.1)' 
              : value === 'temperature'
                ? 'rgba(245, 158, 11, 0.1)'
                : value === 'humidity' || value === 'speed'
                  ? 'rgba(14, 165, 233, 0.1)'
                  : 'rgba(107, 114, 128, 0.1)'
          }}>
            {getAlertIcon(value)}
          </div>
          <div>
            <div className="fw-medium">
              {value.charAt(0).toUpperCase() + value.slice(1)} Alert
            </div>
            <div className="text-muted small">{row.message}</div>
          </div>
        </div>
      )
    },
    {
      key: 'severity',
      header: 'Severity',
      sortable: true,
      render: (value) => getSeverityBadge(value)
    },
    {
      key: 'vehicle',
      header: 'Vehicle',
      sortable: true,
      render: (value) => (
        <div>
          {value ? (
            <div className="d-flex align-items-center">
              <Truck size={14} className="text-primary me-1" />
              <div>
                <div>{value.name}</div>
                <div className="text-muted small">{value.licensePlate}</div>
              </div>
            </div>
          ) : (
            <span className="text-muted">System Alert</span>
          )}
        </div>
      )
    },
    {
      key: 'timestamp',
      header: 'Time',
      sortable: true,
      render: (value) => (
        <div>
          <div className="mb-1">{formatDateTime(value)}</div>
          <div className="text-muted small d-flex align-items-center">
            <Clock size={12} className="me-1" />
            {getTimeSince(value)}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            size="sm"
            className="d-flex align-items-center"
            onClick={(e) => {
              e.stopPropagation();
              // Open VehicleDetailsModal
              if (row.vehicle) {
                setSelectedVehicleForModal({ 
                  licensePlate: row.vehicle.licensePlate,
                  number: row.vehicle.licensePlate,
                  driverId: row.vehicle.driverId,
                  deviceId: row.vehicle.deviceId
                });
                setShowVehicleModal(true);
              } else {
                // Handle cases where alert might not have associated vehicle
                console.warn("View button clicked for alert without vehicle data:", row);
                setToastMessage("Vehicle details not available for this alert.");
                setToastType("info");
                setShowToast(true);
              }
            }}
          >
            <Eye size={14} className="me-1" />
            View
          </Button>
          
          {row.status === 'active' && (
            <Button
              variant="outline-success"
              size="sm"
              className="d-flex align-items-center"
              onClick={(e) => {
                e.stopPropagation();
                // Mark as resolved
                const updatedAlerts = alerts.map(alert => 
                  alert._id === row._id ? { ...alert, status: 'resolved' } : alert
                );
                setAlerts(updatedAlerts);
                
                // Call backend API to update status
                api.put(`/api/alerts/${row._id}/status`, { status: 'resolved' })
                  .then(() => {
                    setToastMessage("Alert marked as resolved");
                    setToastType("success");
                    setShowToast(true);
                  })
                  .catch(error => {
                    console.error("Error updating alert status:", error);
                    // Revert the frontend state if the API call fails
                    setAlerts(alerts);
                    setToastMessage("Failed to update alert status");
                    setToastType("danger");
                    setShowToast(true);
                  });
              }}
            >
              <CheckCircle size={14} className="me-1" />
              Resolve
            </Button>
          )}
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <LoadingSpinner size="lg" text="Loading alerts..." />
      </div>
    );
  }

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
      <Sidebar 
        handleLogout={handleLogout} 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
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
        {/* Modern Header */}
        <motion.div 
          className="d-flex justify-content-between align-items-center mb-5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
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
              <AlertTriangle size={28} style={{ color: 'white' }} />
            </motion.div>
            <div>
              <h2 
                className="mb-2 fw-bold text-white"
                style={{ fontSize: '2.5rem' }}
              >
                Alert Management
              </h2>
              <p 
                className="text-white opacity-75 mb-0"
                style={{ fontSize: '1.1rem' }}
              >
                Monitor and manage system alerts
              </p>
            </div>
          </div>
          
          <div className="d-flex gap-3">
            <Dropdown>
              <Dropdown.Toggle 
                className="btn border-0 d-flex align-items-center px-4 py-2"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  borderRadius: '12px'
                }}
                id="dropdown-filter"
              >
                <Filter size={16} className="me-2" />
                {filter === 'all' ? 'All Alerts' : filter === 'active' ? 'Active Alerts' : 'Resolved Alerts'}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setFilter('all')}>All Alerts</Dropdown.Item>
                <Dropdown.Item onClick={() => setFilter('active')}>Active Alerts</Dropdown.Item>
                <Dropdown.Item onClick={() => setFilter('resolved')}>Resolved Alerts</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            
            <motion.button 
              className="btn border-0 d-flex align-items-center px-4 py-2"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                borderRadius: '12px'
              }}
              onClick={fetchAlerts}
              disabled={isLoading}
              whileHover={{ 
                scale: 1.05,
                background: 'rgba(255, 255, 255, 0.25)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw size={16} className={`me-2 ${isLoading ? 'spinning' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </motion.button>
            
            <motion.button 
              className="btn border-0 d-flex align-items-center px-4 py-2"
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                borderRadius: '12px',
                boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)'
              }}
              onClick={handleExportPdf}
              disabled={filteredAlerts.length === 0}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 12px 30px rgba(239, 68, 68, 0.4)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <DownloadCloud size={16} className="me-2" />
              Export PDF
            </motion.button>
          </div>
        </motion.div>
        
        <AnimatedAlert
          show={showToast}
          type={toastType}
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
        
        {/* Modern Alert Statistics Cards */}
        <motion.div 
          className="row g-4 mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="col-md-3">
            <motion.div 
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                padding: '2rem',
                textAlign: 'center'
              }}
              whileHover={{ scale: 1.02 }}
            >
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white'
                }}
              >
                <AlertTriangle size={24} />
              </div>
              <h2 className="mb-0 fw-bold">{alerts.filter(a => a.status === 'active').length}</h2>
              <p className="text-muted mb-0">Active Alerts</p>
            </motion.div>
          </div>

          <div className="col-md-3">
            <motion.div 
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                padding: '2rem',
                textAlign: 'center'
              }}
              whileHover={{ scale: 1.02 }}
            >
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white'
                }}
              >
                <CheckCircle size={24} />
              </div>
              <h2 className="mb-0 fw-bold">{alerts.filter(a => a.status === 'resolved').length}</h2>
              <p className="text-muted mb-0">Resolved Alerts</p>
            </motion.div>
          </div>

          <div className="col-md-3">
            <motion.div 
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                padding: '2rem',
                textAlign: 'center'
              }}
              whileHover={{ scale: 1.02 }}
            >
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white'
                }}
              >
                <Bell size={24} />
              </div>
              <h2 className="mb-0 fw-bold">{alerts.length}</h2>
              <p className="text-muted mb-0">Total Alerts</p>
            </motion.div>
          </div>

          <div className="col-md-3">
            <motion.div 
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                padding: '2rem',
                textAlign: 'center'
              }}
              whileHover={{ scale: 1.02 }}
            >
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white'
                }}
              >
                <Activity size={24} />
              </div>
              <h2 className="mb-0 fw-bold">
                {alerts.length > 0 
                  ? Math.round((alerts.filter(alert => alert.status === 'resolved').length / alerts.length) * 100)
                  : 0
                }%
              </h2>
              <p className="text-muted mb-0">System Health</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Modern Data Table Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}
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
                <AlertTriangle size={24} />
              </div>
              <div>
                <h5 className="mb-1 fw-bold">Alert Management</h5>
                <p className="text-muted mb-0">{filteredAlerts.length} alerts found</p>
              </div>
              <div className="ms-auto">
                <span 
                  className="badge px-3 py-2"
                  style={{
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    borderRadius: '12px'
                  }}
                >
                  {filter === 'all' ? 'All' : filter === 'active' ? 'Active' : 'Resolved'}: {filteredAlerts.length}
                </span>
              </div>
            </div>
            
            <DataTable 
              columns={tableColumns}
              data={filteredAlerts}
              emptyMessage="No alerts found matching the current filter."
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Render VehicleDetailsModal */}
      {showVehicleModal && selectedVehicle && (
        <VehicleDetailsModal
          vehicle={selectedVehicle}
          onClose={() => setShowVehicleModal(false)}
        />
      )}
    </div>
  );
};

export default Alerts;
