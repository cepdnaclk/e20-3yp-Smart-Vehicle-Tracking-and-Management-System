import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Form } from "react-bootstrap";
import { motion } from "framer-motion";
import { 
  Users,
  Plus, 
  DownloadCloud, 
  RefreshCw,
  Eye,
  MapPin,
  Edit,
  Trash2,
  Briefcase,
  Clipboard // Add this new icon for tasks
} from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import Sidebar from "../components/Sidebar";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import AnimatedAlert from "../components/AnimatedAlert";
import VehicleDetailsModal from "../components/VehicleDetailsModal";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { api } from "../services/api";

const Drivers = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedDriverForTask, setSelectedDriverForTask] = useState(null);
  const [taskFormData, setTaskFormData] = useState({
    taskNumber: '',
    cargoType: '',
    weight: '',
    pickup: '',
    delivery: '',
    deliveryPhone: '',
    expectedDelivery: '',
    additionalNotes: ''
  });
  const [taskSubmitted, setTaskSubmitted] = useState(false);
  const [driverTasks, setDriverTasks] = useState([]);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    driver: null
  });
  const [assignedVehicleForTask, setAssignedVehicleForTask] = useState(null);

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

  const handleDeleteClick = (driver) => {
    setDeleteModal({
      show: true,
      driver
    });
  };

  const handleDeleteConfirm = async () => {
    const driver = deleteModal.driver;
    if (!driver) return;
    
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
    } finally {
      setDeleteModal({ show: false, driver: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, driver: null });
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
        employmentStatus: newDriver.employmentStatus,
        // No need to add companyId here - it's extracted from JWT token in the backend
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
        console.log("Submitting new driver:", payload);
        await api.post("/api/drivers", payload);
        setAlertMessage("New driver added successfully");
      }

      setAlertType("success");
      setShowAlert(true);
      setShowAddModal(false);
      fetchDrivers();
    } catch (err) {
      console.error("Error saving driver:", err);
      
      // Better error handling with more details
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
  const handleViewVehicleDetails = async (driver) => {
    try {
      // Fetch the vehicle details using the license plate
      const vehicleResponse = await api.get(`/api/vehicles/license/${driver.vehicleNumber || driver.assignedVehicle}`);
      const vehicleDetails = vehicleResponse.data;
      
      if (vehicleDetails && vehicleDetails.vehicle) {
        setSelectedVehicle({
          licensePlate: vehicleDetails.vehicle.licensePlate,
          number: vehicleDetails.vehicle.licensePlate,
          deviceId: vehicleDetails.vehicle.deviceId,
          driver: driver.fullName
        });
        setShowVehicleDetails(true);
      } else {
        setAlertMessage("Vehicle details not found");
        setAlertType("warning");
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Error fetching vehicle details:", error);
      setAlertMessage("Failed to fetch vehicle details");
      setAlertType("danger");
      setShowAlert(true);
    }
  };

  // Add this function to fetch tasks for a specific driver
  const fetchDriverTasks = async (driverId) => {
    try {
      const response = await api.get(`/api/tasks/driver/${driverId}`);
      setDriverTasks(response.data);
    } catch (error) {
      console.error("Error fetching driver tasks:", error);
    }
  };

  const handleAssignTask = async (driver) => {
    try {
      console.log("Attempting to assign task for driver:", driver);
      // Reset task states
      setTaskSubmitted(false);
      setDriverTasks([]);
      
      // Fetch the latest driver data to get the current assigned vehicle
      const driverResponse = await api.get(`/api/drivers/${driver.driverId}`);
      console.log("Fetched latest driver data:", driverResponse.data);
      const latestDriverData = driverResponse.data;
      
      if (!latestDriverData || !latestDriverData.assignedVehicle) {
        console.warn("Driver has no assigned vehicle or data not fetched correctly.", { latestDriverData });
        setAlertMessage("Driver has no assigned vehicle. Please ask the driver to set it on the mobile app dashboard.");
        setAlertType("danger");
        setShowAlert(true);
        return;
      }

      // Generate a driver-specific task number
      const taskNumberResponse = await api.get(`/api/tasks/next-number/${driver.driverId}`);
      const taskNum = taskNumberResponse.data.nextTaskNumber;
      
      console.log(`Generated task number for driver ${driver.driverId}: ${taskNum}`);
      
      setSelectedDriverForTask(latestDriverData); // Use the latest driver data
      setTaskFormData({
        taskNumber: taskNum,
        cargoType: '',
        weight: '',
        pickup: '',
        delivery: '',
        deliveryPhone: '',
        expectedDelivery: '',
        additionalNotes: ''
      });
      
      setAssignedVehicleForTask(latestDriverData.assignedVehicle); // Set the assigned vehicle
      console.log("Assigned vehicle for task assignment:", latestDriverData.assignedVehicle);
      setShowTaskModal(true);
    } catch (error) {
      console.error("Error preparing task assignment:", error);
      setAlertMessage(`Failed to prepare task assignment: ${error.response?.data?.message || error.message}`);
      setAlertType("danger");
      setShowAlert(true);
    }
  };

  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setTaskFormData({
      ...taskFormData,
      [name]: value
    });
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedDriverForTask) {
        setAlertMessage("No driver selected");
        setAlertType("danger");
        setShowAlert(true);
        return;
      }
      
      console.log(`Submitting task ${taskFormData.taskNumber} for driver ${selectedDriverForTask.driverId}`);
      
      // Use the assigned vehicle from the state variable
      if (!assignedVehicleForTask) {
         setAlertMessage("No assigned vehicle found for the driver.");
         setAlertType("danger");
         setShowAlert(true);
         return;
      }

      const payload = {
        ...taskFormData,
        driverId: selectedDriverForTask.driverId,
        licensePlate: assignedVehicleForTask // Use the state variable
      };

      console.log("Creating task with payload:", payload);

      // Directly use the task creation endpoint to ensure companyId is set properly
      const response = await api.post(`/api/tasks`, {
        ...payload,
        status: "Pending" // Set initial status explicitly
      });
      
      console.log("Task created successfully:", response.data);
      
      setAlertMessage("Task assigned successfully! The driver will be notified in real-time.");
      setAlertType("success");
      setShowAlert(true);
      
      // Close the modal after successful submission
      setShowTaskModal(false);
      
      // Clear the form data and assigned vehicle state
      setTaskFormData({
        taskNumber: '',
        cargoType: '',
        weight: '',
        pickup: '',
        delivery: '',
        deliveryPhone: '',
        expectedDelivery: '',
        additionalNotes: ''
      });
      setAssignedVehicleForTask(null); // Clear assigned vehicle state
    } catch (err) {
      console.error("Failed to assign task:", err);
      setAlertMessage(`Failed to assign task: ${err.response?.data?.message || err.message}`);
      setAlertType("danger");
      setShowAlert(true);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Add title to PDF
    doc.setFontSize(18);
    doc.text('Driver Management System - Driver Report', 14, 22);
    
    // Add date
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 30);
    
    // Define the columns for the table
    const tableColumn = [
      "Driver ID", 
      "Full Name",
      "Email", 
      "Phone", 
      "License Number",
      "Join Date",
      "Status"
    ];
    
    // Define the rows for the table
    const tableRows = [];
    
    // Add data rows
    drivers.forEach(driver => {
      const driverData = [
        driver.driverId,
        driver.fullName,
        driver.email,
        driver.phone,
        driver.licenseNumber,
        new Date(driver.joinDate).toLocaleDateString(),
        driver.employmentStatus
      ];
      tableRows.push(driverData);
    });
    
    // Create the table
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
        fillColor: [76, 175, 80], // Green color for driver management
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
    
    // Add summary section
    const finalY = (doc.lastAutoTable?.finalY || 40) + 10;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total Drivers: ${drivers.length}`, 14, finalY);
    
    // Add active/inactive driver counts
    const activeDrivers = drivers.filter(d => d.employmentStatus === 'active').length;
    const inactiveDrivers = drivers.filter(d => d.employmentStatus === 'inactive').length;
    doc.text(`Active Drivers: ${activeDrivers}`, 14, finalY + 10);
    doc.text(`Inactive Drivers: ${inactiveDrivers}`, 14, finalY + 20);
    
    // Add driver statistics (e.g., newest drivers)
    if (drivers.length > 0) {
      // Sort drivers by join date descending to get newest drivers
      const sortedDrivers = [...drivers].sort((a, b) => 
        new Date(b.joinDate) - new Date(a.joinDate));
      
      doc.text('Recently Added Drivers:', 14, finalY + 35);
      let yOffset = finalY + 45;
      
      // List 5 most recent drivers
      sortedDrivers.slice(0, 5).forEach((driver, index) => {
        doc.text(
          `${index + 1}. ${driver.fullName} (${driver.driverId}) - ${new Date(driver.joinDate).toLocaleDateString()}`, 
          20, 
          yOffset
        );
        yOffset += 8;
      });
    }
    
    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('Smart Vehicle Tracking and Management System', 14, doc.internal.pageSize.height - 10);
    
    // Save PDF
    doc.save('driver_report.pdf');
  };

  const tableColumns = [
    { key: 'driverId', header: 'Driver ID', sortable: true, render: (v) => <span>{v}</span> },
    { key: 'fullName', header: 'Full Name', sortable: true, render: (v) => <span>{v}</span> },
    { key: 'phone', header: 'Phone No', sortable: true, render: (v) => <span>{v}</span> },
    { key: 'employmentStatus', header: 'Employment Status', sortable: true, render: (v) => (
      <span 
        className="badge px-3 py-2"
        style={{
          background: v === 'active' 
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(4, 120, 87, 0.1))' 
            : 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1))',
          color: v === 'active' ? '#059669' : '#d97706',
          border: `1px solid ${v === 'active' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '500'
        }}
      >
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
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05))',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            color: '#7c3aed',
            borderRadius: '6px'
          }}
          onClick={() => handleViewVehicleDetails(row)}
        >
           <MapPin size={14} className="me-1" />
           Track
        </Button>
      )
    },
    {
      key: 'actions', header: 'Action', sortable: false, render: (_, row) => (
        <div className="d-flex gap-2">
          <Button 
            size="sm" 
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#3b82f6',
              borderRadius: '6px'
            }}
            onClick={() => handleViewDriver(row)}
          >
            <Eye size={14} />
          </Button>
          <Button 
            size="sm" 
            style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05))',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#22c55e',
              borderRadius: '6px'
            }}
            onClick={() => handleEditDriver(row)}
          >
            <Edit size={14} />
          </Button>
          <Button 
            size="sm" 
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              borderRadius: '6px'
            }}
            onClick={() => handleDeleteClick(row)}
          >
            <Trash2 size={14} />
          </Button>
          <Button 
            size="sm" 
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05))',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#8b5cf6',
              borderRadius: '6px'
            }}
            onClick={() => handleAssignTask(row)}
          >
            <Briefcase size={14} />
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
              <Users size={28} style={{ color: 'white' }} />
            </motion.div>
            <div>
              <h2 
                className="mb-2 fw-bold text-white"
                style={{ fontSize: '2.5rem' }}
              >
                Driver Management
              </h2>
              <p 
                className="text-white opacity-75 mb-0"
                style={{ fontSize: '1.1rem' }}
              >
                Manage and monitor all your drivers
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
              onClick={fetchDrivers}
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
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: 'white',
                borderRadius: '12px',
                boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)'
              }}
              onClick={handleAddDriver}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 12px 30px rgba(139, 92, 246, 0.4)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={16} className="me-2" />
              Add Driver
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
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white'
                }}
              >
                <Users size={24} />
              </div>
              <div>
                <h5 className="mb-1 fw-bold">Driver Team</h5>
                <p className="text-muted mb-0">{drivers.length} drivers in your team</p>
              </div>
              <div className="ms-auto">
                <span 
                  className="badge px-3 py-2"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    color: 'white',
                    borderRadius: '12px'
                  }}
                >
                  Total: {drivers.length}
                </span>
              </div>
            </div>
            
            <DataTable 
              columns={tableColumns}
              data={drivers}
              emptyMessage="No drivers found. Add your first driver to get started!"
            />
          </div>
        </motion.div>
      </motion.div>

      <Modal 
        key={modalKey} 
        show={showAddModal} 
        onHide={handleCloseModal} 
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
          <Form onSubmit={handleAddDriverSubmit}>
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
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    color: 'white'
                  }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Users size={20} />
                </motion.div>
                {viewMode ? 'Driver Details' : editMode ? 'Edit Driver' : 'Add New Driver'}
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
                {/* Driver ID */}
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
                        Driver ID *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="driverId"
                        value={newDriver.driverId}
                        onChange={handleInputChange}
                        required
                        disabled={viewMode || editMode}
                        className="modern-input"
                        style={{
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          fontSize: '0.875rem',
                          backgroundColor: (viewMode || editMode) ? '#f9fafb' : '#ffffff',
                          transition: 'all 0.2s ease',
                          fontFamily: 'monospace',
                          fontWeight: '500'
                        }}
                        placeholder="e.g., DR001"
                      />
                    </Form.Group>
                  </motion.div>
                </div>

                {/* Full Name */}
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
                        Full Name *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="fullName"
                        value={newDriver.fullName}
                        onChange={handleInputChange}
                        required
                        disabled={viewMode}
                        className="modern-input"
                        style={{
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          fontSize: '0.875rem',
                          backgroundColor: viewMode ? '#f9fafb' : '#ffffff',
                          transition: 'all 0.2s ease'
                        }}
                        placeholder="Enter full name"
                      />
                    </Form.Group>
                  </motion.div>
                </div>

                {/* Email */}
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
                        Email Address *
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={newDriver.email}
                        onChange={handleInputChange}
                        required
                        disabled={viewMode}
                        className="modern-input"
                        style={{
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          fontSize: '0.875rem',
                          backgroundColor: viewMode ? '#f9fafb' : '#ffffff',
                          transition: 'all 0.2s ease'
                        }}
                        placeholder="driver@company.com"
                      />
                    </Form.Group>
                  </motion.div>
                </div>

                {/* Phone */}
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
                        Phone Number *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={newDriver.phone}
                        onChange={handleInputChange}
                        required
                        disabled={viewMode}
                        className="modern-input"
                        style={{
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          fontSize: '0.875rem',
                          backgroundColor: viewMode ? '#f9fafb' : '#ffffff',
                          transition: 'all 0.2s ease'
                        }}
                        placeholder="+1 (555) 123-4567"
                      />
                    </Form.Group>
                  </motion.div>
                </div>

                {/* License Number */}
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
                        License Number *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="licenseNumber"
                        value={newDriver.licenseNumber}
                        onChange={handleInputChange}
                        required
                        disabled={viewMode}
                        className="modern-input"
                        style={{
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          fontSize: '0.875rem',
                          backgroundColor: viewMode ? '#f9fafb' : '#ffffff',
                          transition: 'all 0.2s ease',
                          fontFamily: 'monospace',
                          textTransform: 'uppercase'
                        }}
                        placeholder="DL123456789"
                      />
                    </Form.Group>
                  </motion.div>
                </div>

                {/* Join Date */}
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
                        Join Date *
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="joinDate"
                        value={newDriver.joinDate}
                        onChange={handleInputChange}
                        required
                        disabled={viewMode}
                        className="modern-input"
                        style={{
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          fontSize: '0.875rem',
                          backgroundColor: viewMode ? '#f9fafb' : '#ffffff',
                          transition: 'all 0.2s ease'
                        }}
                      />
                    </Form.Group>
                  </motion.div>
                </div>

                {/* Employment Status */}
                <div className="col-12">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-4 rounded-3"
                    style={{
                      background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                      border: '1px solid #d8b4fe'
                    }}
                  >
                    <h6 className="fw-semibold mb-3 d-flex align-items-center gap-2" style={{ color: '#581c87' }}>
                      <div 
                        className="p-1 rounded"
                        style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
                      >
                        <Briefcase size={14} style={{ color: 'white' }} />
                      </div>
                      Employment Status
                    </h6>
                    
                    <Form.Group>
                      <Form.Select
                        name="employmentStatus"
                        value={newDriver.employmentStatus}
                        onChange={handleInputChange}
                        required
                        disabled={viewMode}
                        className="modern-select"
                        style={{
                          border: '2px solid #bae6fd',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          fontSize: '0.875rem',
                          backgroundColor: viewMode ? '#f0f9ff' : '#ffffff',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <option value="active">✅ Active - Currently Working</option>
                        <option value="inactive">⏸️ Inactive - Not Available</option>
                      </Form.Select>
                    </Form.Group>
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
                    onClick={handleCloseModal}
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
                {!viewMode && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="primary" 
                      type="submit"
                      className="px-4 py-2"
                      style={{
                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '500',
                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {editMode ? 'Update Driver' : 'Add Driver'}
                    </Button>
                  </motion.div>
                )}
              </div>
            </Modal.Footer>
          </Form>
        </motion.div>
      </Modal>

      {/* Vehicle Details Modal for Last Location */}
      {showVehicleDetails && selectedVehicle && !showAddModal && (
        <VehicleDetailsModal
          vehicle={selectedVehicle}
          onClose={() => setShowVehicleDetails(false)}
        />
      )}

      {/* Task Assignment Modal */}
      <Modal 
        show={showTaskModal} 
        onHide={() => setShowTaskModal(false)} 
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
          <Form onSubmit={handleTaskSubmit}>
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
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    color: 'white'
                  }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Clipboard size={24} />
                  
                </motion.div>
                Assign Task to {selectedDriverForTask?.fullName}
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
                {/* Task Number */}
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
                        Task Number *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="taskNumber"
                        value={taskFormData.taskNumber}
                        disabled
                        className="modern-input"
                        style={{
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          fontSize: '0.875rem',
                          backgroundColor: '#f9fafb',
                          transition: 'all 0.2s ease',
                          fontFamily: 'monospace',
                          fontWeight: '500'
                        }}
                      />
                    </Form.Group>
                  </motion.div>
                </div>

                {/* Cargo Type */}
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
                        Cargo Type *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="cargoType"
                        value={taskFormData.cargoType}
                        onChange={handleTaskInputChange}
                        required
                        className="modern-input"
                        style={{
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          fontSize: '0.875rem',
                          backgroundColor: '#ffffff',
                          transition: 'all 0.2s ease'
                        }}
                        placeholder="e.g., Electronics, Furniture"
                      />
                    </Form.Group>
                  </motion.div>
                </div>

                {/* Weight */}
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
                        Weight (kg) *
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="weight"
                        value={taskFormData.weight}
                        onChange={handleTaskInputChange}
                        required
                        className="modern-input"
                        style={{
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          fontSize: '0.875rem',
                          backgroundColor: '#ffffff',
                          transition: 'all 0.2s ease'
                        }}
                        placeholder="Weight in kilograms"
                      />
                    </Form.Group>
                  </motion.div>
                </div>

                {/* Expected Delivery Date */}
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
                        Expected Delivery Date *
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="expectedDelivery"
                        value={taskFormData.expectedDelivery}
                        onChange={handleTaskInputChange}
                        required
                        className="modern-input"
                        style={{
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          fontSize: '0.875rem',
                          backgroundColor: '#ffffff',
                          transition: 'all 0.2s ease'
                        }}
                      />
                    </Form.Group>
                  </motion.div>
                </div>

                {/* Location Information Section */}
                <div className="col-12">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 rounded-3 mt-3"
                    style={{
                      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <h6 className="fw-semibold mb-3 d-flex align-items-center gap-2" style={{ color: '#374151' }}>
                      <div 
                        className="p-1 rounded"
                        style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
                      >
                        <i className="fas fa-map-marker-alt" style={{ color: 'white', fontSize: '14px' }}></i>
                      </div>
                      Location Information
                    </h6>
                    
                    <div className="row g-3">
                      {/* Pickup Location */}
                      <div className="col-md-6">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.35 }}
                        >
                          <Form.Group>
                            <Form.Label 
                              className="fw-medium mb-2"
                              style={{ 
                                color: '#6b7280',
                                fontSize: '0.8rem'
                              }}
                            >
                              Pickup Location *
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="pickup"
                              value={taskFormData.pickup}
                              onChange={handleTaskInputChange}
                              required
                              className="modern-input-small"
                              style={{
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                padding: '10px 12px',
                                fontSize: '0.8rem',
                                backgroundColor: '#ffffff'
                              }}
                              placeholder="Full pickup address"
                            />
                          </Form.Group>
                        </motion.div>
                      </div>

                      {/* Delivery Location */}
                      <div className="col-md-6">
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <Form.Group>
                            <Form.Label 
                              className="fw-medium mb-2"
                              style={{ 
                                color: '#6b7280',
                                fontSize: '0.8rem'
                              }}
                            >
                              Delivery Location *
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="delivery"
                              value={taskFormData.delivery}
                              onChange={handleTaskInputChange}
                              required
                              className="modern-input-small"
                              style={{
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                padding: '10px 12px',
                                fontSize: '0.8rem',
                                backgroundColor: '#ffffff'
                              }}
                              placeholder="Full delivery address"
                            />
                          </Form.Group>
                        </motion.div>
                      </div>

                      {/* Delivery Phone */}
                      <div className="col-md-6">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.45 }}
                        >
                          <Form.Group>
                            <Form.Label 
                              className="fw-medium mb-2"
                              style={{ 
                                color: '#6b7280',
                                fontSize: '0.8rem'
                              }}
                            >
                              Delivery Phone Number *
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="deliveryPhone"
                              value={taskFormData.deliveryPhone}
                              onChange={handleTaskInputChange}
                              required
                              className="modern-input-small"
                              style={{
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                padding: '10px 12px',
                                fontSize: '0.8rem',
                                backgroundColor: '#ffffff'
                              }}
                              placeholder="Contact number at delivery location"
                            />
                          </Form.Group>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Additional Notes */}
                <div className="col-12">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-3 rounded-2 d-flex flex-column"
                    style={{
                      background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                      border: '1px solid #d8b4fe'
                    }}
                  >
                    <div className="mb-3">
                      <h6 className="mb-1 fw-semibold d-flex align-items-center gap-2" style={{ color: '#581c87' }}>
                        <i className="fas fa-sticky-note" style={{ fontSize: '14px' }}></i>
                        Additional Notes
                      </h6>
                      <p className="mb-0 small" style={{ color: '#7c3aed' }}>
                        Add any special instructions or requirements
                      </p>
                    </div>
                    <Form.Group>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="additionalNotes"
                        value={taskFormData.additionalNotes}
                        onChange={handleTaskInputChange}
                        placeholder="Any special instructions or notes..."
                        className="modern-input"
                        style={{
                          border: '1px solid #d8b4fe',
                          borderRadius: '6px',
                          padding: '12px 16px',
                          fontSize: '0.875rem',
                          backgroundColor: '#ffffff',
                          resize: 'vertical',
                          minHeight: '80px'
                        }}
                      />
                    </Form.Group>
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
                    onClick={() => setShowTaskModal(false)}
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
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    type="submit"
                    className="px-4 py-2"
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '500',
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Assign Task
                  </Button>
                </motion.div>
              </div>
            </Modal.Footer>
          </Form>
        </motion.div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={deleteModal.show}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemType="Driver"
        itemName={deleteModal.driver ? `${deleteModal.driver.fullName} (${deleteModal.driver.driverId})` : ""}
        additionalMessage="this driver will be permanently removed."
      />
    </div>
  );
};

export default Drivers;