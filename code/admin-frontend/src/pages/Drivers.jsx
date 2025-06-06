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
  Briefcase // Add this new icon for tasks
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
          <Button size="sm" variant="outline-danger" onClick={() => handleDeleteClick(row)}>
            <Trash2 size={16} />
          </Button>
          <Button size="sm" variant="outline-success" onClick={() => handleAssignTask(row)}>
            <Briefcase size={16} />
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
                onClick={handleExportPDF}
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

      {/* Task Assignment Modal */}
      <Modal show={showTaskModal} onHide={() => setShowTaskModal(false)} centered size="lg">
        <Form onSubmit={handleTaskSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              Assign Task to {selectedDriverForTask?.fullName}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Task Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="taskNumber"
                    value={taskFormData.taskNumber}
                    disabled
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Cargo Type</Form.Label>
                  <Form.Control
                    type="text"
                    name="cargoType"
                    value={taskFormData.cargoType}
                    onChange={handleTaskInputChange}
                    required
                    placeholder="e.g., Electronics, Furniture"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Weight (kg)</Form.Label>
                  <Form.Control
                    type="number"
                    name="weight"
                    value={taskFormData.weight}
                    onChange={handleTaskInputChange}
                    required
                    placeholder="Weight in kilograms"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Pickup Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="pickup"
                    value={taskFormData.pickup}
                    onChange={handleTaskInputChange}
                    required
                    placeholder="Full pickup address"
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Delivery Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="delivery"
                    value={taskFormData.delivery}
                    onChange={handleTaskInputChange}
                    required
                    placeholder="Full delivery address"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Delivery Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="deliveryPhone"
                    value={taskFormData.deliveryPhone}
                    onChange={handleTaskInputChange}
                    required
                    placeholder="Contact number at delivery location"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Expected Delivery Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="expectedDelivery"
                    value={taskFormData.expectedDelivery}
                    onChange={handleTaskInputChange}
                    required
                  />
                </Form.Group>
              </div>
            </div>
            
            <Form.Group className="mb-3">
              <Form.Label>Additional Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="additionalNotes"
                value={taskFormData.additionalNotes}
                onChange={handleTaskInputChange}
                placeholder="Any special instructions or notes"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowTaskModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Assign Task
            </Button>
          </Modal.Footer>
        </Form>
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