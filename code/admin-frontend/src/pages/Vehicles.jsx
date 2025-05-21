import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Form } from "react-bootstrap";
import { motion } from "framer-motion";
import { 
  Truck, 
  Plus, 
  Filter, 
  DownloadCloud, 
  RefreshCw,
  MapPin,
  Eye,  
  Trash2,
  Edit
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import VehicleDetailsModal from "../components/VehicleDetailsModal";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import AnimatedAlert from "../components/AnimatedAlert";
import { api } from "../services/api";

const Vehicles = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("info");
  const [modalKey, setModalKey] = useState(0);
  const [modalState, setModalState] = useState({
    type: null, // null, 'addEdit', 'details'
    editMode: false,
    viewMode: false,
    vehicle: null,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
    
    fetchVehicles();
  }, [navigate]);

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/vehicles");
      setVehicles(response.data);
      setIsLoading(false);
      setAlertMessage("Vehicle data loaded successfully");
      setAlertType("success");
      setShowAlert(true);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setIsLoading(false);
      setAlertMessage("Failed to load vehicle data. Please try again.");
      setAlertType("danger");
      setShowAlert(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const openAddEditModal = (editMode = false, viewMode = false, vehicle = null) => {
    console.log("Opening add/edit modal:", { editMode, viewMode, vehicle });
    setModalState({
      type: 'addEdit',
      editMode,
      viewMode,
      vehicle: vehicle || {
        vehicleName: "",
        licensePlate: "",
        vehicleType: "car",
        year: "",
        color: "",
        deviceId: "",
        trackingEnabled: true,
        status: "active",
      },
    });
    setModalKey(prev => prev + 1);
  };

  const openDetailsModal = (vehicle) => {
    console.log("Opening details modal for vehicle:", vehicle);
    setModalState({
      type: 'details',
      editMode: false,
      viewMode: false,
      vehicle,
    });
  };

  const closeModal = () => {
    console.log("Closing modal, resetting state");
    setModalState({
      type: null,
      editMode: false,
      viewMode: false,
      vehicle: null,
    });
  };

  const handleAddVehicle = () => {
    console.log("Handle add vehicle");
    openAddEditModal(false, false);
  };

  const handleVehicleClick = (vehicle) => {
    console.log("Handle vehicle click for view:", vehicle);
    openDetailsModal(vehicle);
  };

  const handleViewVehicle = (vehicle) => {
    console.log("Handle view vehicle:", vehicle);
    openAddEditModal(false, true, {
      vehicleName: vehicle.vehicleName || "",
      licensePlate: vehicle.licensePlate || "",
      vehicleType: vehicle.vehicleType || "car",
      year: vehicle.year || "",
      color: vehicle.color || "",
      deviceId: vehicle.deviceId || "",
      trackingEnabled: typeof vehicle.trackingEnabled === "boolean" ? vehicle.trackingEnabled : true,
      status: vehicle.status || "active",
      _id: vehicle._id,
    });
  };

  const handleEditVehicle = (vehicle) => {
    console.log("Handle edit vehicle:", vehicle);
    openAddEditModal(true, false, {
      vehicleName: vehicle.vehicleName || "",
      licensePlate: vehicle.licensePlate || "",
      vehicleType: vehicle.vehicleType || "car",
      year: vehicle.year || "",
      color: vehicle.color || "",
      deviceId: vehicle.deviceId || "",
      trackingEnabled: typeof vehicle.trackingEnabled === "boolean" ? vehicle.trackingEnabled : true,
      status: vehicle.status || "active",
      _id: vehicle._id,
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setModalState((prev) => {
      const newState = {
        ...prev,
        vehicle: {
          ...prev.vehicle,
          [name]: type === "checkbox" ? checked : value,
        },
      };
      console.log("Input changed, new modal state:", newState);
      return newState;
    });
  };

  const handleAddVehicleSubmit = async (e) => {
    e.preventDefault();
    if (modalState.viewMode) {
      console.log("View mode, submission prevented");
      return;
    }
    try {
      const payload = { ...modalState.vehicle };
      console.log("Submitting vehicle:", payload);
      if (modalState.editMode && payload._id) {
        await api.put(`/api/vehicles/${payload._id}`, payload);
        setAlertMessage("Vehicle updated successfully");
      } else {
        await api.post("/api/vehicles", payload);
        setAlertMessage("Vehicle added successfully");
      }
      setAlertType("success");
      setShowAlert(true);
      closeModal();
      fetchVehicles();
    } catch (err) {
      console.error("Error submitting vehicle:", err);
      setAlertMessage(modalState.editMode ? "Failed to update vehicle." : "Failed to add vehicle.");
      setAlertType("danger");
      setShowAlert(true);
    }
  };

  const handleDeleteVehicle = async (vehicle) => {
    if (window.confirm(`Are you sure you want to delete vehicle ${vehicle.licensePlate}? This action cannot be undone.`)) {
      try {
        await api.delete(`/api/vehicles/${vehicle._id}`);
        setAlertMessage("Vehicle deleted successfully");
        setAlertType("success");
        setShowAlert(true);
        closeModal();
        fetchVehicles();
      } catch (err) {
        console.error("Error deleting vehicle:", err);
        setAlertMessage("Failed to delete vehicle.");
        setAlertType("danger");
        setShowAlert(true);
      }
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const tableColumns = [
    { key: 'licensePlate', header: 'License Plate', sortable: true, render: (v) => <span>{v}</span> },
    { key: 'vehicleType', header: 'Vehicle Type', sortable: true, render: (v) => <span>{v}</span> },
    { 
      key: 'lastLocation', 
      header: 'Last Location', 
      sortable: false, 
      render: (_, row) => (
        <Button size="sm" variant="outline-info" onClick={() => handleVehicleClick(row)}>
          <MapPin size={16} />
        </Button>
      ) 
    },
    { key: 'status', header: 'Status', sortable: true, render: (v) => <span>{v}</span> },
    {
      key: 'actions', header: 'Action', sortable: false, render: (_, row) => (
        <div className="d-flex gap-2">
          <Button size="sm" variant="outline-primary" onClick={() => handleViewVehicle(row)}>
            <Eye size={16} />
          </Button>
          <Button size="sm" variant="outline-secondary" onClick={() => handleEditVehicle(row)}>
            <Edit size={16} />
          </Button>
          <Button size="sm" variant="outline-danger" onClick={() => handleDeleteVehicle(row)}>
            <Trash2 size={16} />
          </Button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <LoadingSpinner size="lg" text="Loading vehicles..." />
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
        <PageHeader 
          title="Vehicle Management" 
          subtitle="Manage and monitor all your fleet vehicles"
          icon={Truck}
          actions={
            <>
              <Button 
                variant="outline-primary" 
                className="d-flex align-items-center"
                onClick={fetchVehicles}
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
                onClick={handleAddVehicle}
              >
                <Plus size={16} className="me-2" />
                Add Vehicle
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
            data={vehicles}
            title="All Vehicles"
            icon={<Truck size={18} />}
            emptyMessage="No vehicles found"
          />
        </motion.div>

        {/* Add/Edit/View Vehicle Modal */}
        {modalState.type === 'addEdit' && modalState.vehicle && (
          <Modal key={modalKey} show={true} onHide={closeModal} centered>
            <Form onSubmit={handleAddVehicleSubmit}>
              <Modal.Header closeButton>
                <Modal.Title>
                  {modalState.viewMode ? 'View Vehicle' : modalState.editMode ? 'Edit Vehicle' : 'Add New Vehicle'}
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Vehicle Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="vehicleName"
                    value={modalState.vehicle.vehicleName || ""}
                    onChange={handleInputChange}
                    required
                    disabled={modalState.viewMode}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>License Plate</Form.Label>
                  <Form.Control
                    type="text"
                    name="licensePlate"
                    value={modalState.vehicle.licensePlate || ""}
                    onChange={handleInputChange}
                    required
                    disabled={modalState.viewMode}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Vehicle Type</Form.Label>
                  <Form.Select
                    name="vehicleType"
                    value={modalState.vehicle.vehicleType || "car"}
                    onChange={handleInputChange}
                    required
                    disabled={modalState.viewMode}
                  >
                    <option value="car">Car</option>
                    <option value="truck">Truck</option>
                    <option value="van">Van</option>
                    <option value="bus">Bus</option>
                    <option value="motorcycle">Motorcycle</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Year Made</Form.Label>
                  <Form.Control
                    type="number"
                    name="year"
                    value={modalState.vehicle.year || ""}
                    onChange={handleInputChange}
                    min={1900}
                    max={2100}
                    required
                    disabled={modalState.viewMode}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Color</Form.Label>
                  <Form.Control
                    type="text"
                    name="color"
                    value={modalState.vehicle.color || ""}
                    onChange={handleInputChange}
                    disabled={modalState.viewMode}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Tracking Device ID</Form.Label>
                  <Form.Control
                    type="text"
                    name="deviceId"
                    value={modalState.vehicle.deviceId || ""}
                    onChange={handleInputChange}
                    required
                    disabled={modalState.viewMode}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="trackingEnabled"
                    label="Enable Real-Time Tracking"
                    name="trackingEnabled"
                    checked={modalState.vehicle.trackingEnabled ?? true}
                    onChange={handleInputChange}
                    disabled={modalState.viewMode}
                  />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="outline-secondary" onClick={closeModal}>
                  Close
                </Button>
                {!modalState.viewMode && (
                  <Button variant="primary" type="submit">
                    {modalState.editMode ? "Update Vehicle" : "Add Vehicle"}
                  </Button>
                )}
              </Modal.Footer>
            </Form>
          </Modal>
        )}

        {/* Vehicle Details Modal for Last Location */}
        {modalState.type === 'details' && modalState.vehicle && (
          <VehicleDetailsModal
            vehicle={modalState.vehicle}
            onClose={closeModal}
          />
        )}
      </div>
    </div>
  );
};

export default Vehicles;