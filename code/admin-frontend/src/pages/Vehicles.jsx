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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import Sidebar from "../components/Sidebar";
import VehicleDetailsModal from "../components/VehicleDetailsModal";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import AnimatedAlert from "../components/AnimatedAlert";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
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
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    vehicle: null
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
      
      // Get user info for debugging
      const user = JSON.parse(localStorage.getItem('user'));
      console.log("Current user context:", user);
      
      console.log("Fetching vehicles...");
      const response = await api.get("/api/vehicles");
      console.log("Vehicle API response:", response.data);
      
      // Validate that response.data is an array
      if (Array.isArray(response.data)) {
        setVehicles(response.data);
        setAlertMessage(`${response.data.length} vehicle(s) loaded successfully`);
        setAlertType("success");
      } else {
        console.error("API returned non-array data:", response.data);
        setAlertMessage("Server returned invalid data format. Please contact support.");
        setAlertType("danger");
      }
      
      setShowAlert(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      console.error("Error details:", error.response?.data || error.message);
      
      // Handle token expiration
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      
      setIsLoading(false);
      setAlertMessage(
        error.response?.data?.message || 
        "Failed to load vehicle data. Please try again."
      );
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
      temperatureLimit: vehicle.temperatureLimit || 0,
      humidityLimit: vehicle.humidityLimit || 0,
      speedLimit: vehicle.speedLimit || 0,
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
      temperatureLimit: vehicle.temperatureLimit || 0,
      humidityLimit: vehicle.humidityLimit || 0,
      speedLimit: vehicle.speedLimit || 0,
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
      const user = JSON.parse(localStorage.getItem('user'));
      const payload = { 
        ...modalState.vehicle,
        // Include companyId in the payload for new vehicles
        companyId: user?.companyId || ""
      };
      
      console.log("Submitting vehicle with payload:", payload);
      
      let response;
      if (modalState.editMode && payload._id) {
        response = await api.put(`/api/vehicles/${payload._id}`, payload);
        console.log("Vehicle updated:", response.data);
        setAlertMessage("Vehicle updated successfully");
      } else {
        response = await api.post("/api/vehicles", payload);
        console.log("Vehicle added:", response.data);
        setAlertMessage("Vehicle added successfully");
      }
      
      setAlertType("success");
      setShowAlert(true);
      closeModal();
      fetchVehicles(); // Reload the vehicles list
    } catch (err) {
      console.error("Error submitting vehicle:", err);
      console.error("Error details:", err.response?.data || err.message);
      
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        setAlertMessage(
          err.response.data.errors.map(e => e.msg).join(" | ")
        );
      } else {
        setAlertMessage(
          err.response?.data?.message || 
          (modalState.editMode ? "Failed to update vehicle." : "Failed to add vehicle.")
        );
      }
      
      setAlertType("danger");
      setShowAlert(true);
    }
  };

  const handleDeleteClick = (vehicle) => {
    setDeleteModal({
      show: true,
      vehicle
    });
  };

  const handleDeleteConfirm = async () => {
    const vehicle = deleteModal.vehicle;
    if (!vehicle) return;
    
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
    } finally {
      setDeleteModal({ show: false, vehicle: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, vehicle: null });
  };
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Add title to PDF
    doc.setFontSize(18);
    doc.text('Vehicle Management System - Vehicle Report', 14, 22);
    
    // Add date
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 30);
    
    // Define the columns for the table
    const tableColumn = [
      "License Plate", 
      "Vehicle Name", 
      "Type", 
      "Year", 
      "Color", 
      "Status"
    ];
    
    // Define the rows for the table
    const tableRows = [];
    
    // Add data rows with updated status based on trackingEnabled
    vehicles.forEach(vehicle => {
      const vehicleData = [
        vehicle.licensePlate,
        vehicle.vehicleName,
        vehicle.vehicleType,
        vehicle.year,
        vehicle.color,
        // Update the status value to reflect tracking status
        vehicle.trackingEnabled ? 'Active' : 'Inactive'
      ];
      tableRows.push(vehicleData);
    });
    
    // Create the table - use the imported autoTable function
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3,
        lineColor: [200, 200, 200]
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
    
    // Update the summary section to include tracking statistics
    const finalY = (doc.lastAutoTable?.finalY || 40) + 10;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total Vehicles: ${vehicles.length}`, 14, finalY);
    
    // Count active (tracked) and inactive vehicles
    const activeVehicles = vehicles.filter(v => v.trackingEnabled).length;
    const inactiveVehicles = vehicles.filter(v => !v.trackingEnabled).length;
    
    doc.text(`Active (Tracked) Vehicles: ${activeVehicles}`, 14, finalY + 10);
    doc.text(`Inactive Vehicles: ${inactiveVehicles}`, 14, finalY + 20);
    
    // Add vehicle type distribution
    const typeCounts = {};
    vehicles.forEach(v => {
      typeCounts[v.vehicleType] = (typeCounts[v.vehicleType] || 0) + 1;
    });
    
    doc.text('Vehicle Type Distribution:', 14, finalY + 30);
    let yOffset = finalY + 40;
    Object.entries(typeCounts).forEach(([type, count]) => {
      doc.text(`- ${type}: ${count}`, 20, yOffset);
      yOffset += 8;
    });
    
    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('Smart Vehicle Tracking and Management System', 14, doc.internal.pageSize.height - 10);
    
    // Save PDF
    doc.save('vehicle_report.pdf');
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
    { 
      key: 'status', 
      header: 'Status', 
      sortable: true, 
      render: (v, row) => (
        <span className={`badge ${row.trackingEnabled ? 'bg-success' : 'bg-warning'}`}>
          {row.trackingEnabled ? 'Active' : 'Inactive'}
        </span>
      ) 
    },
    {
      key: 'actions', header: 'Action', sortable: false, render: (_, row) => (
        <div className="d-flex gap-2">
          <Button size="sm" variant="outline-primary" onClick={() => handleViewVehicle(row)}>
            <Eye size={16} />
          </Button>
          <Button size="sm" variant="outline-secondary" onClick={() => handleEditVehicle(row)}>
            <Edit size={16} />
          </Button>
          <Button size="sm" variant="outline-danger" onClick={() => handleDeleteClick(row)}>
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
    <>
      <div 
        className="min-vh-100"
        style={{ 
          paddingLeft: sidebarCollapsed ? '90px' : '280px',
          transition: 'padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'linear-gradient(135deg,rgb(49, 115, 190) 0%,rgb(138, 176, 233) 100%)',
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
              <Truck size={28} style={{ color: 'white' }} />
            </motion.div>
            <div>
              <h2 
                className="mb-2 fw-bold text-white"
                style={{ fontSize: '2.5rem' }}
              >
                Vehicle Management
              </h2>
              <p 
                className="text-white opacity-75 mb-0"
                style={{ fontSize: '1.1rem' }}
              >
                Manage and monitor all your cargo vehicles
              </p>
            </div>
          </div>
          
          <div className="d-flex gap-3">
            <motion.button 
              className="btn border-0 d-flex align-items-center px-4 py-2"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                borderRadius: '12px'
              }}
              onClick={fetchVehicles}
              whileHover={{ 
                scale: 1.05,
                background: 'rgba(255, 255, 255, 0.25)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw size={16} className="me-2" />
              Refresh
            </motion.button>
            
            <motion.button 
              className="btn border-0 d-flex align-items-center px-4 py-2"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                borderRadius: '12px'
              }}
              onClick={handleExportPDF}
              whileHover={{ 
                scale: 1.05,
                background: 'rgba(255, 255, 255, 0.25)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <DownloadCloud size={16} className="me-2" />
              Export
            </motion.button>
            
            <motion.button 
              className="btn border-0 d-flex align-items-center px-4 py-2"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                borderRadius: '12px',
                boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
              }}
              onClick={handleAddVehicle}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 12px 30px rgba(59, 130, 246, 0.4)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={16} className="me-2" />
              Add Vehicle
            </motion.button>
          </div>
        </motion.div>
        
        <AnimatedAlert
          show={showAlert}
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
        
        {/* Modern Data Table Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
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
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white'
                }}
              >
                <Truck size={24} />
              </div>
              <div>
                <h5 className="mb-1 fw-bold">Vehicle cargo</h5>
                <p className="text-muted mb-0">{vehicles.length} vehicles in your cargo</p>
              </div>
              <div className="ms-auto">
                <span 
                  className="badge px-3 py-2"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    borderRadius: '12px'
                  }}
                >
                  Total: {vehicles.length}
                </span>
              </div>
            </div>
            
            <DataTable 
              columns={tableColumns}
              data={vehicles}
              emptyMessage="No vehicles found. Add your first vehicle to get started!"
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Add/Edit/View Vehicle Modal */}
      {modalState.type === 'addEdit' && modalState.vehicle && (
          <Modal 
            key={modalKey} 
            show={true} 
            onHide={closeModal} 
            centered 
            size="lg"
            className="modern-modal"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Form onSubmit={handleAddVehicleSubmit}>
                <Modal.Header 
                  closeButton 
                  className="border-0 pb-0"
                  style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    borderRadius: '12px 12px 0 0'
                  }}
                >
                  <Modal.Title 
                    className="d-flex align-items-center gap-3"
                    style={{ 
                      color: '#1e293b', 
                      fontWeight: '600',
                      fontSize: '1.25rem'
                    }}
                  >
                    <motion.div
                      className="p-2 rounded-2"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: 'white'
                      }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Truck size={20} />
                    </motion.div>
                    {modalState.viewMode ? 'Vehicle Details' : modalState.editMode ? 'Edit Vehicle' : 'Add New Vehicle'}
                  </Modal.Title>
                </Modal.Header>
                
                <Modal.Body 
                  className="px-4 py-4"
                  style={{
                    background: '#ffffff',
                    maxHeight: '70vh',
                    overflowY: 'auto'
                  }}
                >
                  <div className="row g-4">
                    {/* Vehicle Name */}
                    <div className="col-md-6">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Form.Group>
                          <Form.Label 
                            className="fw-semibold mb-2"
                            style={{ 
                              color: '#374151',
                              fontSize: '0.875rem',
                              letterSpacing: '0.025em'
                            }}
                          >
                            Vehicle Name *
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="vehicleName"
                            value={modalState.vehicle.vehicleName || ""}
                            onChange={handleInputChange}
                            required
                            disabled={modalState.viewMode}
                            className="modern-input"
                            style={{
                              border: '2px solid #e5e7eb',
                              borderRadius: '8px',
                              padding: '12px 16px',
                              fontSize: '0.875rem',
                              backgroundColor: modalState.viewMode ? '#f9fafb' : '#ffffff',
                              transition: 'all 0.2s ease',
                              ':focus': {
                                borderColor: '#3b82f6',
                                boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
                              }
                            }}
                            placeholder="Enter vehicle name"
                          />
                        </Form.Group>
                      </motion.div>
                    </div>

                    {/* License Plate */}
                    <div className="col-md-6">
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                      >
                        <Form.Group>
                          <Form.Label 
                            className="fw-semibold mb-2"
                            style={{ 
                              color: '#374151',
                              fontSize: '0.875rem',
                              letterSpacing: '0.025em'
                            }}
                          >
                            License Plate *
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="licensePlate"
                            value={modalState.vehicle.licensePlate || ""}
                            onChange={handleInputChange}
                            required
                            disabled={modalState.viewMode}
                            className="modern-input"
                            style={{
                              border: '2px solid #e5e7eb',
                              borderRadius: '8px',
                              padding: '12px 16px',
                              fontSize: '0.875rem',
                              backgroundColor: modalState.viewMode ? '#f9fafb' : '#ffffff',
                              transition: 'all 0.2s ease',
                              textTransform: 'uppercase'
                            }}
                            placeholder="Enter license plate"
                          />
                        </Form.Group>
                      </motion.div>
                    </div>

                    {/* Vehicle Type */}
                    <div className="col-md-6">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Form.Group>
                          <Form.Label 
                            className="fw-semibold mb-2"
                            style={{ 
                              color: '#374151',
                              fontSize: '0.875rem',
                              letterSpacing: '0.025em'
                            }}
                          >
                            Vehicle Type *
                          </Form.Label>
                          <Form.Select
                            name="vehicleType"
                            value={modalState.vehicle.vehicleType || "car"}
                            onChange={handleInputChange}
                            required
                            disabled={modalState.viewMode}
                            className="modern-select"
                            style={{
                              border: '2px solid #e5e7eb',
                              borderRadius: '8px',
                              padding: '12px 16px',
                              fontSize: '0.875rem',
                              backgroundColor: modalState.viewMode ? '#f9fafb' : '#ffffff',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <option value="car">🚗 Car</option>
                            <option value="truck">🚛 Truck</option>
                            <option value="van">🚐 Van</option>
                            <option value="bus">🚌 Bus</option>
                            <option value="motorcycle">🏍️ Motorcycle</option>
                            <option value="other">📦 Other</option>
                          </Form.Select>
                        </Form.Group>
                      </motion.div>
                    </div>

                    {/* Year */}
                    <div className="col-md-6">
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 }}
                      >
                        <Form.Group>
                          <Form.Label 
                            className="fw-semibold mb-2"
                            style={{ 
                              color: '#374151',
                              fontSize: '0.875rem',
                              letterSpacing: '0.025em'
                            }}
                          >
                            Year Made *
                          </Form.Label>
                          <Form.Control
                            type="number"
                            name="year"
                            value={modalState.vehicle.year || ""}
                            onChange={handleInputChange}
                            min={1900}
                            max={2100}
                            required
                            disabled={modalState.viewMode}
                            className="modern-input"
                            style={{
                              border: '2px solid #e5e7eb',
                              borderRadius: '8px',
                              padding: '12px 16px',
                              fontSize: '0.875rem',
                              backgroundColor: modalState.viewMode ? '#f9fafb' : '#ffffff',
                              transition: 'all 0.2s ease'
                            }}
                            placeholder="2020"
                          />
                        </Form.Group>
                      </motion.div>
                    </div>

                    {/* Color */}
                    <div className="col-md-6">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Form.Group>
                          <Form.Label 
                            className="fw-semibold mb-2"
                            style={{ 
                              color: '#374151',
                              fontSize: '0.875rem',
                              letterSpacing: '0.025em'
                            }}
                          >
                            Color
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="color"
                            value={modalState.vehicle.color || ""}
                            onChange={handleInputChange}
                            disabled={modalState.viewMode}
                            className="modern-input"
                            style={{
                              border: '2px solid #e5e7eb',
                              borderRadius: '8px',
                              padding: '12px 16px',
                              fontSize: '0.875rem',
                              backgroundColor: modalState.viewMode ? '#f9fafb' : '#ffffff',
                              transition: 'all 0.2s ease'
                            }}
                            placeholder="Enter vehicle color"
                          />
                        </Form.Group>
                      </motion.div>
                    </div>

                    {/* Device ID */}
                    <div className="col-md-6">
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 }}
                      >
                        <Form.Group>
                          <Form.Label 
                            className="fw-semibold mb-2"
                            style={{ 
                              color: '#374151',
                              fontSize: '0.875rem',
                              letterSpacing: '0.025em'
                            }}
                          >
                            Tracking Device ID *
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="deviceId"
                            value={modalState.vehicle.deviceId || ""}
                            onChange={handleInputChange}
                            required
                            disabled={modalState.viewMode}
                            className="modern-input"
                            style={{
                              border: '2px solid #e5e7eb',
                              borderRadius: '8px',
                              padding: '12px 16px',
                              fontSize: '0.875rem',
                              backgroundColor: modalState.viewMode ? '#f9fafb' : '#ffffff',
                              transition: 'all 0.2s ease',
                              fontFamily: 'monospace'
                            }}
                            placeholder="DEVICE_001"
                          />
                        </Form.Group>
                      </motion.div>
                    </div>

                    {/* Monitoring Limits Section */}
                    <div className="col-12">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="p-4 rounded-3 mt-3"
                        style={{
                          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                          border: '1px solid #e5e7eb'
                        }}
                      >
                        <h6 className="fw-semibold mb-3 d-flex align-items-center gap-2" style={{ color: '#374151' }}>
                          <div 
                            className="p-1 rounded"
                            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                          >
                            <Filter size={14} style={{ color: 'white' }} />
                          </div>
                          Monitoring Limits
                        </h6>
                        
                        <div className="row g-3">
                          <div className="col-md-4">
                            <Form.Group>
                              <Form.Label 
                                className="fw-medium mb-2"
                                style={{ 
                                  color: '#6b7280',
                                  fontSize: '0.8rem'
                                }}
                              >
                                Temperature Limit (°C) *
                              </Form.Label>
                              <Form.Control
                                type="number"
                                name="temperatureLimit"
                                value={modalState.vehicle.temperatureLimit || ""}
                                onChange={handleInputChange}
                                min={0}
                                max={100}
                                required
                                disabled={modalState.viewMode}
                                className="modern-input-small"
                                style={{
                                  border: '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  padding: '10px 12px',
                                  fontSize: '0.8rem',
                                  backgroundColor: modalState.viewMode ? '#f9fafb' : '#ffffff'
                                }}
                                placeholder="25"
                              />
                            </Form.Group>
                          </div>

                          <div className="col-md-4">
                            <Form.Group>
                              <Form.Label 
                                className="fw-medium mb-2"
                                style={{ 
                                  color: '#6b7280',
                                  fontSize: '0.8rem'
                                }}
                              >
                                Humidity Limit (%) *
                              </Form.Label>
                              <Form.Control
                                type="number"
                                name="humidityLimit"
                                value={modalState.vehicle.humidityLimit || ""}
                                onChange={handleInputChange}
                                min={0}
                                max={100}
                                required
                                disabled={modalState.viewMode}
                                className="modern-input-small"
                                style={{
                                  border: '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  padding: '10px 12px',
                                  fontSize: '0.8rem',
                                  backgroundColor: modalState.viewMode ? '#f9fafb' : '#ffffff'
                                }}
                                placeholder="60"
                              />
                            </Form.Group>
                          </div>

                          <div className="col-md-4">
                            <Form.Group>
                              <Form.Label 
                                className="fw-medium mb-2"
                                style={{ 
                                  color: '#6b7280',
                                  fontSize: '0.8rem'
                                }}
                              >
                                Speed Limit (km/h) *
                              </Form.Label>
                              <Form.Control
                                type="number"
                                name="speedLimit"
                                value={modalState.vehicle.speedLimit || ""}
                                onChange={handleInputChange}
                                min={0}
                                max={100}
                                required
                                disabled={modalState.viewMode}
                                className="modern-input-small"
                                style={{
                                  border: '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  padding: '10px 12px',
                                  fontSize: '0.8rem',
                                  backgroundColor: modalState.viewMode ? '#f9fafb' : '#ffffff'
                                }}
                                placeholder="80"
                              />
                            </Form.Group>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Tracking Toggle */}
                    <div className="col-12">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="p-3 rounded-2 d-flex align-items-center justify-content-between"
                        style={{
                          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                          border: '1px solid #bbf7d0'
                        }}
                      >
                        <div>
                          <h6 className="mb-1 fw-semibold" style={{ color: '#065f46' }}>
                            Real-Time Tracking
                          </h6>
                          <p className="mb-0 small" style={{ color: '#047857' }}>
                            Enable continuous location monitoring for this vehicle
                          </p>
                        </div>
                        <Form.Check
                          type="switch"
                          id="trackingEnabled"
                          name="trackingEnabled"
                          checked={modalState.vehicle.trackingEnabled ?? true}
                          onChange={handleInputChange}
                          disabled={modalState.viewMode}
                          className="modern-switch"
                          style={{
                            transform: 'scale(1.2)'
                          }}
                        />
                      </motion.div>
                    </div>
                  </div>
                </Modal.Body>
                
                <Modal.Footer 
                  className="border-0 pt-0 px-4 pb-4"
                  style={{
                    background: '#ffffff',
                    borderRadius: '0 0 12px 12px'
                  }}
                >
                  <div className="d-flex gap-3 w-100 justify-content-end">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        variant="outline-secondary"
                        onClick={closeModal}
                        className="px-4 py-2"
                        style={{
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          fontWeight: '500',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Cancel
                      </Button>
                    </motion.div>
                    {!modalState.viewMode && (
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          variant="primary" 
                          type="submit"
                          className="px-4 py-2"
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '500',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {modalState.editMode ? "Update Vehicle" : "Add Vehicle"}
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </Modal.Footer>
              </Form>
            </motion.div>
          </Modal>
        )}

        {/* Vehicle Details Modal for Last Location */}
        {modalState.type === 'details' && modalState.vehicle && (
          <VehicleDetailsModal
            vehicle={modalState.vehicle}
            onClose={closeModal}
          />
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          show={deleteModal.show}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          itemType="Vehicle"
          itemName={deleteModal.vehicle ? `${deleteModal.vehicle.vehicleName} (${deleteModal.vehicle.licensePlate})` : ""}
          additionalMessage="All data related to this vehicle will be permanently removed."
        />
      </div>
    </>
  );
};

export default Vehicles;