import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Badge, Modal } from "react-bootstrap";
import { motion } from "framer-motion";
import { 
  Clipboard,
  Filter, 
  DownloadCloud, 
  RefreshCw,
  Eye,
  Edit,
  Trash2
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import AnimatedAlert from "../components/AnimatedAlert";
import { api } from "../services/api";

const Tasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("info");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    taskNumber: '',
    cargoType: '',
    weight: '',
    pickup: '',
    delivery: '',
    deliveryPhone: '',
    expectedDelivery: '',
    additionalNotes: '',
    status: 'Pending'
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
    
    fetchDrivers();
    fetchAllTasks();
  }, [navigate]);

  const fetchDrivers = async () => {
    try {
      const response = await api.get("/api/drivers");
      setDrivers(response.data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  const fetchAllTasks = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/tasks");
      setTasks(response.data);
      setIsLoading(false);
      
      setAlertMessage("Task data loaded successfully");
      setAlertType("success");
      setShowAlert(true);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setIsLoading(false);
      
      setAlertMessage("Failed to load task data");
      setAlertType("danger");
      setShowAlert(true);
    }
  };

  const fetchTasksForDriver = async (driverId) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/tasks/driver/${driverId}`);
      setTasks(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching driver tasks:", error);
      setIsLoading(false);
      
      setAlertMessage("Failed to load tasks for this driver");
      setAlertType("danger");
      setShowAlert(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleDriverChange = (e) => {
    const driverId = e.target.value;
    setSelectedDriverId(driverId);
    
    if (driverId) {
      fetchTasksForDriver(driverId);
    } else {
      fetchAllTasks();
    }
  };
  
  const handleDeleteTask = async (task) => {
    if (window.confirm(`Are you sure you want to delete task ${task.taskNumber}?`)) {
      try {
        await api.delete(`/api/tasks/${task._id}`);
        
        setAlertMessage("Task deleted successfully");
        setAlertType("success");
        setShowAlert(true);
        
        // Refresh tasks
        if (selectedDriverId) {
          fetchTasksForDriver(selectedDriverId);
        } else {
          fetchAllTasks();
        }
      } catch (error) {
        console.error("Error deleting task:", error);
        setAlertMessage("Failed to delete task");
        setAlertType("danger");
        setShowAlert(true);
      }
    }
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setViewMode(true);
    setEditMode(false);
    
    setTaskFormData({
      taskNumber: task.taskNumber,
      cargoType: task.cargoType,
      weight: task.weight,
      pickup: task.pickup,
      delivery: task.delivery,
      deliveryPhone: task.deliveryPhone,
      expectedDelivery: task.expectedDelivery ? new Date(task.expectedDelivery).toISOString().split('T')[0] : '',
      additionalNotes: task.additionalNotes || '',
      status: task.status,
      driverId: task.driverId,
      licensePlate: task.licensePlate
    });
    
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setEditMode(true);
    setViewMode(false);
    
    setTaskFormData({
      taskNumber: task.taskNumber,
      cargoType: task.cargoType,
      weight: task.weight,
      pickup: task.pickup,
      delivery: task.delivery,
      deliveryPhone: task.deliveryPhone,
      expectedDelivery: task.expectedDelivery ? new Date(task.expectedDelivery).toISOString().split('T')[0] : '',
      additionalNotes: task.additionalNotes || '',
      status: task.status,
      driverId: task.driverId,
      licensePlate: task.licensePlate
    });
    
    setShowTaskModal(true);
  };

  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setTaskFormData({
      ...taskFormData,
      [name]: value
    });
  };

  const handleTaskFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...taskFormData
      };
      
      if (editMode) {
        await api.put(`/api/tasks/${selectedTask._id}`, payload);
        setAlertMessage("Task updated successfully");
      }
      
      setAlertType("success");
      setShowAlert(true);
      setShowTaskModal(false);
      
      // Refresh the task list
      if (selectedDriverId) {
        fetchTasksForDriver(selectedDriverId);
      } else {
        fetchAllTasks();
      }
    } catch (error) {
      console.error("Error saving task:", error);
      setAlertMessage(editMode ? "Failed to update task" : "Failed to save task");
      setAlertType("danger");
      setShowAlert(true);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'In Progress':
        return <Badge bg="info">In Progress</Badge>;
      case 'Completed':
        return <Badge bg="success">Completed</Badge>;
      case 'Cancelled':
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  const tableColumns = [
    { 
      key: 'driverId', 
      header: 'Driver ID', 
      sortable: true, 
      render: (v) => {
        const driver = drivers.find(d => d.driverId === v);
        return <span>{driver ? `${v} (${driver.fullName})` : v}</span>;
      }
    },
    { key: 'taskNumber', header: 'Task ID', sortable: true, render: (v) => <span>{v}</span> },
    { key: 'cargoType', header: 'Cargo Type', sortable: true, render: (v) => <span>{v}</span> },
    { key: 'expectedDelivery', header: 'Expected Delivery', sortable: true, render: (v) => <span>{formatDate(v)}</span> },
    { key: 'status', header: 'Status', sortable: true, render: (v) => getStatusBadge(v) },
    {
      key: 'actions', 
      header: 'Action', 
      sortable: false, 
      render: (_, row) => (
        <div className="d-flex gap-2">
          <Button size="sm" variant="outline-primary" onClick={() => handleViewTask(row)}>
            <Eye size={16} />
          </Button>
          <Button size="sm" variant="outline-secondary" onClick={() => handleEditTask(row)}>
            <Edit size={16} />
          </Button>
          <Button size="sm" variant="outline-danger" onClick={() => handleDeleteTask(row)}>
            <Trash2 size={16} />
          </Button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <LoadingSpinner size="lg" text="Loading tasks..." />
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
          title="Task Management" 
          subtitle="View and manage all assigned tasks"
          icon={Clipboard}
          actions={
            <>
              <Form.Group className="d-flex align-items-center me-2">
                <Form.Label className="me-2 mb-0">Filter by Driver:</Form.Label>
                <Form.Select 
                  style={{ width: '200px' }}
                  value={selectedDriverId}
                  onChange={handleDriverChange}
                >
                  <option value="">All Drivers</option>
                  {drivers.map(driver => (
                    <option key={driver.driverId} value={driver.driverId}>
                      {driver.fullName} ({driver.driverId})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              
              <Button 
                variant="outline-primary" 
                className="d-flex align-items-center"
                onClick={selectedDriverId ? () => fetchTasksForDriver(selectedDriverId) : fetchAllTasks}
              >
                <RefreshCw size={16} className="me-2" />
                Refresh
              </Button>
              <Button 
                variant="outline-primary" 
                className="d-flex align-items-center"
              >
                <DownloadCloud size={16} className="me-2" />
                Export
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
            data={tasks}
            title={selectedDriverId ? `Tasks for Driver ${selectedDriverId}` : "All Tasks"}
            icon={<Clipboard size={18} />}
            emptyMessage="No tasks found"
          />
        </motion.div>
        
        {/* Task View/Edit Modal */}
        {showTaskModal && (
          <Modal show={showTaskModal} onHide={() => setShowTaskModal(false)} centered size="lg">
            <Form onSubmit={handleTaskFormSubmit}>
              <Modal.Header closeButton>
                <Modal.Title>
                  {viewMode ? 'View Task' : 'Edit Task'}
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
                      <Form.Label>Driver ID</Form.Label>
                      <Form.Control
                        type="text"
                        value={taskFormData.driverId}
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
                        disabled={viewMode}
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Weight (kg)</Form.Label>
                      <Form.Control
                        type="number"
                        name="weight"
                        value={taskFormData.weight}
                        onChange={handleTaskInputChange}
                        disabled={viewMode}
                        required
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Pickup Location</Form.Label>
                      <Form.Control
                        type="text"
                        name="pickup"
                        value={taskFormData.pickup}
                        onChange={handleTaskInputChange}
                        disabled={viewMode}
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Delivery Location</Form.Label>
                      <Form.Control
                        type="text"
                        name="delivery"
                        value={taskFormData.delivery}
                        onChange={handleTaskInputChange}
                        disabled={viewMode}
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Delivery Phone Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="deliveryPhone"
                        value={taskFormData.deliveryPhone}
                        onChange={handleTaskInputChange}
                        disabled={viewMode}
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Expected Delivery Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="expectedDelivery"
                        value={taskFormData.expectedDelivery}
                        onChange={handleTaskInputChange}
                        disabled={viewMode}
                        required
                      />
                    </Form.Group>
                  </div>
                </div>
                
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={taskFormData.status}
                    onChange={handleTaskInputChange}
                    disabled={viewMode}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Additional Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="additionalNotes"
                    value={taskFormData.additionalNotes}
                    onChange={handleTaskInputChange}
                    disabled={viewMode}
                  />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="outline-secondary" onClick={() => setShowTaskModal(false)}>
                  {viewMode ? 'Close' : 'Cancel'}
                </Button>
                {!viewMode && (
                  <Button variant="primary" type="submit">
                    Update Task
                  </Button>
                )}
              </Modal.Footer>
            </Form>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Tasks;
