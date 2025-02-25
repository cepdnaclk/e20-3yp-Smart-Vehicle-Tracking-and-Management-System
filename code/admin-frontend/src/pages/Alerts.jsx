import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle, FaThermometerHalf, FaTint, FaMapMarkerAlt, FaCarCrash, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

function Alert() {
  const [alerts, setAlerts] = useState([]);
  const navigate = useNavigate();

  // Simulate fetching alerts from an API
  useEffect(() => {
    // Mock data for demonstration
    const mockAlerts = [
      {
        id: 1,
        type: 'temperature',
        message: 'Temperature increased beyond threshold (30°C).',
        timestamp: '2023-10-15T10:30:00Z',
        severity: 'high',
        vehicleId: 'VH123456',
      },
      {
        id: 2,
        type: 'humidity',
        message: 'Cargo humidity level increased (75%).',
        timestamp: '2023-10-15T10:25:00Z',
        severity: 'medium',
        vehicleId: 'VH123456',
      },
      {
        id: 3,
        type: 'gps',
        message: 'GPS deviation detected. Vehicle off-route.',
        timestamp: '2023-10-15T10:20:00Z',
        severity: 'high',
        vehicleId: 'VH123456',
      },
      {
        id: 4,
        type: 'tampering',
        message: 'Tampering detected in cargo area.',
        timestamp: '2023-10-15T10:15:00Z',
        severity: 'critical',
        vehicleId: 'VH123456',
      },
      {
        id: 5,
        type: 'accident',
        message: 'Vehicle accident detected (High impact).',
        timestamp: '2023-10-15T10:10:00Z',
        severity: 'critical',
        vehicleId: 'VH123456',
      },
    ];
    setAlerts(mockAlerts);
  }, []);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'temperature':
        return <FaThermometerHalf className="text-warning" />;
      case 'humidity':
        return <FaTint className="text-info" />;
      case 'gps':
        return <FaMapMarkerAlt className="text-danger" />;
      case 'tampering':
        return <FaShieldAlt className="text-danger" />;
      case 'accident':
        return <FaCarCrash className="text-danger" />;
      default:
        return <FaExclamationTriangle className="text-secondary" />;
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'high':
        return <span className="badge bg-warning">High</span>;
      case 'medium':
        return <span className="badge bg-info">Medium</span>;
      case 'critical':
        return <span className="badge bg-danger">Critical</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  const handleViewDetails = (alert) => {
    toast.info(`Viewing details for alert: ${alert.message}`);
    // Navigate to a detailed alert page or open a modal
    // navigate(`/alert-details/${alert.id}`);
  };

  return (
    <div className="container-fluid p-4">
      <h1 className="mb-4">
        <FaExclamationTriangle className="me-2" />
        Alerts
      </h1>

      <div className="card shadow-sm">
        <div className="card-header bg-light">
          <h5 className="mb-0">Recent Alerts</h5>
        </div>
        <div className="card-body">
          {alerts.length === 0 ? (
            <div className="text-center py-4">
              <p className="mb-0">No alerts found.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Type</th>
                    <th>Message</th>
                    <th>Severity</th>
                    <th>Timestamp</th>
                    <th>Vehicle ID</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert) => (
                    <tr key={alert.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          {getAlertIcon(alert.type)}
                          <span className="ms-2 text-capitalize">{alert.type}</span>
                        </div>
                      </td>
                      <td>{alert.message}</td>
                      <td>{getSeverityBadge(alert.severity)}</td>
                      <td>{new Date(alert.timestamp).toLocaleString()}</td>
                      <td>{alert.vehicleId}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleViewDetails(alert)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Alert;