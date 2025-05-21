import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Form } from "react-bootstrap";
import { motion } from "framer-motion";
import { 
  Users,
  Plus, 
  Filter, 
  DownloadCloud, 
  RefreshCw,
  Eye,
  MapPin,
  Edit,
  Trash2
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import AnimatedAlert from "../components/AnimatedAlert";
import VehicleDetailsModal from "../components/VehicleDetailsModal";
import { api } from "../services/api";

const Drivers = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("info");
  const [newDriver, setNewDriver] = useState({
    driverId: '',
    fullName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    joinDate: '',
    employmentStatus: 'active'
  });
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
    
    fetchDrivers();
  }, [navigate]);

  const fetchDrivers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/drivers");
      setDrivers(response.data);
      setIsLoading(false);
      setAlertMessage("Driver data loaded successfully");
      setAlertType("success");
      setShowAlert(true);
    } catch (error) {
      setIsLoading(false);
      setAlertMessage(
        error.response?.data?.message === "Not Found"
          ? "Driver endpoint not found. Please check backend route."
          : "Failed to load driver data. Please try again."
      );
      setAlertType("danger");
      setShowAlert(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleViewDriver = (driver) => {
    console.log("View mode activated for driver:", driver.driverId);
    setViewMode(true);
    setEditMode(false);
    setNewDriver({
      driverId: driver.driverId,
      fullName: driver.fullName,
      email: driver.email,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      joinDate: driver.joinDate ? driver.joinDate.slice(0, 10) : '',
      employmentStatus: driver.employmentStatus
    });
    setModalKey(prev => prev + 1);
    setShowAddModal(true);
  };

  const handleEditDriver = (driver) => {
    setViewMode(false); // Ensure viewMode is false for editing
    setEditMode(true);
    setNewDriver({
      driverId: driver.driverId,
      fullName: driver.fullName,
      email: driver.email,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      joinDate: driver.joinDate ? driver.joinDate.slice(0, 10) : '',
      employmentStatus: driver.employmentStatus
    });
    setModalKey(prev => prev + 1);
    setShowAddModal(true);
  };

  const handleDeleteDriver = async (driver) => {
    if (window.confirm(`Are you sure you want to delete driver ${driver.fullName}? This action cannot be undone.`)) {
      try {
        await api.delete(`/api/drivers/${driver.driverId}`);
        setDrivers(drivers.filter(d => d.driverId !== driver.driverId));
        setAlertMessage("Driver deleted successfully");
        setAlertType("success");
        setShowAlert(true);
      } catch (err) {
        setAlertMessage("Failed to delete driver.");
        setAlertType("danger");
        setShowAlert(true);
      }
    }
  };

  const handleAddDriver = () => {
    console.log("Add mode activated", { viewMode: false, editMode: false });
    setViewMode(false);
    setEditMode(false);
    setNewDriver({
      driverId: '',
      fullName: '',
      email: '',
      phone: '',
      licenseNumber: '',
      joinDate: '',
      employmentStatus: 'active'
    });
    setModalKey(prev => prev + 1);
    setShowAddModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDriver({
      ...newDriver,
      [name]: value
    });
  };

  const handleAddDriverSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        driverId: newDriver.driverId.trim(),
        fullName: newDriver.fullName.trim(),
        email: newDriver.email,
        phone: newDriver.phone,
        licenseNumber: newDriver.licenseNumber,
        joinDate: newDriver.joinDate,
        employmentStatus: newDriver.employmentStatus
      };

      if (
        !payload.driverId ||
        !payload.fullName ||
        !payload.email ||
        !payload.phone ||
        !payload.licenseNumber ||
        !payload.joinDate ||
        !payload.employmentStatus
      ) {
        setAlertMessage("All fields are required.");
        setAlertType("danger");
        setShowAlert(true);
        return;
      }

      if (editMode && !viewMode) {
        await api.put(`/api/drivers/${newDriver.driverId}`, payload);
        setAlertMessage("Driver updated successfully");
      } else {
        await api.post("/api/drivers", payload);
        setAlertMessage("New driver added successfully");
      }

      setAlertType("success");
      setShowAlert(true);
      setShowAddModal(false);
      fetchDrivers();
    } catch (err) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        setAlertMessage(
          err.response.data.errors.map(e => e.msg).join(" | ")
        );
      } else if (err.response?.data?.message) {
        setAlertMessage(err.response.data.message);
      } else {
        setAlertMessage(editMode ? "Failed to update driver." : "Failed to add driver.");
      }
      setAlertType("danger");
      setShowAlert(true);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setViewMode(false);
    setEditMode(false);
  };

  // Show VehicleDetailsModal for the driver's last vehicle (if available)
  const handleViewVehicleDetails = (driver) => {
    // You may want to fetch the vehicle by driver.assignedVehicle or similar logic
    // Here, we assume driver.lastLocation or driver.vehicle is available
    setSelectedVehicle({
      licensePlate: driver.vehicleNumber || driver.assignedVehicle || "",
      driver: driver.fullName,
      number: driver.vehicleNumber || driver.assignedVehicle || "",
      // Add more fields as needed for VehicleDetailsModal
    });
    setShowVehicleDetails(true);
  };

  const tableColumns = [
    { key: 'driverId', header: 'Driver ID', sortable: true, render: (v) => <span>{v}</span> },
    { key: 'fullName', header: 'Full Name', sortable: true, render: (v) => <span>{v}</span> },
    { key: 'phone', header: 'Phone No', sortable: true, render: (v) => <span>{v}</span> },
    { key: 'employmentStatus', header: 'Employment Status', sortable: true, render: (v) => (
      <span className={`badge ${v === 'active' ? 'bg-success' : 'bg-warning'}`}>
        {v.charAt(0).toUpperCase() + v.slice(1)}
      </span>
    ) },
    { 
      key: 'lastLocation', 
      header: 'Last Location', 
      sortable: false, 
      render: (v, row) => (
        <Button
          size="sm"
          variant="outline-info"
          onClick={() => handleViewVehicleDetails(row)}
        >
           <MapPin size={16} />
        </Button>
      )
    },
    {
      key: 'actions', header: 'Action', sortable: false, render: (_, row) => (
        <div className="d-flex gap-2">
          <Button size="sm" variant="outline-primary" onClick={() => handleViewDriver(row)}>
            <Eye size={16} />
          </Button>
          <Button size="sm" variant="outline-secondary" onClick={() => handleEditDriver(row)}>
            <Edit size={16} />
          </Button>
          <Button size="sm" variant="outline-danger" onClick={() => handleDeleteDriver(row)}>
            <Trash2 size={16} />
          </Button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <LoadingSpinner size="lg" text="Loading drivers..." />
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light" style={{ 
      paddingLeft: '250px',
      transition: 'padding-left 0.3s ease-in-out'
    }}>
      <Sidebar handleLogout={handleLogout} />
      <div className="p-4">
        <PageHeader 
          title="Driver Management" 
          subtitle="Manage and monitor all your drivers"
          icon={Users}
          actions={
            <>
              <Button 
                variant="outline-primary" 
                className="d-flex align-items-center"
                onClick={fetchDrivers}
              >
                <RefreshCw size={16} className="me-2" />
                Refresh
              </Button>
              <Button 
                variant="outline-primary" 
                className="d-flex align-items-center"
              >
                <Filter size={16} className="me-2" />
                Filter
              </Button>
              <Button 
                variant="outline-primary" 
                className="d-flex align-items-center"
              >
                <DownloadCloud size={16} className="me-2" />
                Export
              </Button>
              <Button 
                variant="primary" 
                className="d-flex align-items-center"
                onClick={handleAddDriver}
              >
                <Plus size={16} className="me-2" />
                Add Driver
              </Button>
            </>
          }
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
          className="mb-4"
        >
          <DataTable 
            columns={tableColumns}
            data={drivers}
            title="All Drivers"
            icon={<Users size={18} />}
            emptyMessage="No drivers found"
          />
        </motion.div>
      </div>

      <Modal key={modalKey} show={showAddModal} onHide={handleCloseModal} centered>
        <Form onSubmit={handleAddDriverSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {viewMode ? 'View Driver' : editMode ? 'Edit Driver' : 'Add Driver'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Driver ID</Form.Label>
              <Form.Control
                type="text"
                name="driverId"
                value={newDriver.driverId}
                onChange={handleInputChange}
                required
                disabled={viewMode || editMode}
                placeholder="e.g., DR001"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                value={newDriver.fullName}
                onChange={handleInputChange}
                required
                disabled={viewMode}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={newDriver.email}
                onChange={handleInputChange}
                required
                disabled={viewMode}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone No</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={newDriver.phone}
                onChange={handleInputChange}
                required
                disabled={viewMode}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>License Number</Form.Label>
              <Form.Control
                type="text"
                name="licenseNumber"
                value={newDriver.licenseNumber}
                onChange={handleInputChange}
                required
                disabled={viewMode}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Join Date</Form.Label>
              <Form.Control
                type="date"
                name="joinDate"
                value={newDriver.joinDate}
                onChange={handleInputChange}
                required
                disabled={viewMode}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Employment Status</Form.Label>
              <Form.Select
                name="employmentStatus"
                value={newDriver.employmentStatus}
                onChange={handleInputChange}
                required
                disabled={viewMode}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={handleCloseModal}>
              Close
            </Button>
            {!viewMode && (
              <Button variant="primary" type="submit">
                {editMode ? 'Update Driver' : 'Add Driver'}
              </Button>
            )}
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Vehicle Details Modal for Last Location */}
      {showVehicleDetails && selectedVehicle && !showAddModal && (
        <VehicleDetailsModal
          vehicle={selectedVehicle}
          onClose={() => setShowVehicleDetails(false)}
        />
      )}
    </div>
  );
};

export default Drivers;