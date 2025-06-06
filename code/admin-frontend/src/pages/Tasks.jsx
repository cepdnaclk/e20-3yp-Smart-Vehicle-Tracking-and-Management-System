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
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, Legend, ArcElement } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import Sidebar from "../components/Sidebar";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import AnimatedAlert from "../components/AnimatedAlert";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { api } from "../services/api";
import { startTaskPolling, stopTaskPolling } from "../services/getTasks";

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
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    task: null
  });

  // Register Chart.js components (needed for tree-shaking)
  Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ChartDataLabels, ArcElement);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
    
    fetchDrivers();
    
    // Start polling for tasks
    const stopPollingFn = startTaskPolling((newTasks) => {
      setTasks(newTasks);
      setIsLoading(false);
    });

    // Cleanup function to stop polling when component unmounts
    return () => {
      stopPollingFn();
      stopTaskPolling();
    };
  }, [navigate]);

  const fetchDrivers = async () => {
    try {
      const response = await api.get("/api/drivers");
      setDrivers(response.data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  const handleDriverChange = (e) => {
    const driverId = e.target.value;
    setSelectedDriverId(driverId);
    
    // Stop current polling and start new polling for selected driver
    stopTaskPolling();
    const stopPollingFn = startTaskPolling((newTasks) => {
      setTasks(newTasks);
      setIsLoading(false);
    }, driverId);
  };

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching all tasks for current admin...");
      const response = await api.get("/api/tasks");
      
      // Log the response to help debug
      console.log("Tasks response:", response.data);
      
      // Sort tasks by taskNumber for consistent display
      const sortedTasks = response.data.sort((a, b) => {
        return a.taskNumber.localeCompare(b.taskNumber);
      });
      
      setTasks(sortedTasks);
      setIsLoading(false);
      
      setAlertMessage(`Successfully loaded ${sortedTasks.length} tasks`);
      setAlertType("success");
      setShowAlert(true);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      
      // More detailed error logging
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      
      setAlertMessage("Failed to load task data. Please try again.");
      setAlertType("danger");
      setShowAlert(true);
      setIsLoading(false);
    }
  };

  const fetchAllTasks = async () => {
    try {
      setIsLoading(true);
      await fetchTasks();
    } catch (error) {
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
  
  const handleDeleteClick = (task) => {
    setDeleteModal({
      show: true,
      task
    });
  };

  // Update the handleDeleteConfirm function to handle deletion by taskNumber
  const handleDeleteConfirm = async () => {
    const task = deleteModal.task;
    if (!task) return;
    
    try {
      // Try to delete by ID first if available
      if (task._id) {
        await api.delete(`/api/tasks/${task._id}`);
      } else {
        // Fallback to using taskNumber
        await api.delete(`/api/tasks/${task.taskNumber}`);
      }
      
      setAlertMessage("Task deleted successfully");
      setAlertType("success");
      setShowAlert(true);
      
      // Refresh the appropriate task list
      if (selectedDriverId) {
        fetchTasksForDriver(selectedDriverId);
      } else {
        fetchAllTasks();
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      
      // More detailed error message
      let errorMsg = "Failed to delete task.";
      if (err.response?.data?.message) {
        errorMsg += ` Server message: ${err.response.data.message}`;
      } else if (err.message) {
        errorMsg += ` Error: ${err.message}`;
      }
      
      setAlertMessage(errorMsg);
      setAlertType("danger");
      setShowAlert(true);
    } finally {
      setDeleteModal({ show: false, task: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, task: null });
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
        console.log("Updating task:", selectedTask._id, payload);
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
      
      // More detailed error logging
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      
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

  // Update the tableColumns definition to handle null driverId
  const tableColumns = [
    { 
      key: 'taskNumber', 
      header: 'Task ID', 
      sortable: true, 
      render: (v) => <span className="fw-bold">{v}</span> 
    },
    { 
      key: 'driverId', 
      header: 'Driver ID', 
      sortable: true, 
      render: (v) => v ? <span>{v}</span> : <span className="text-danger">(Driver deleted)</span>
    },
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
          <Button size="sm" variant="outline-danger" onClick={() => handleDeleteClick(row)}>
            <Trash2 size={16} />
          </Button>
        </div>
      )
    }
  ];

  // Function to handle PDF export
  const handleExportPdf = async () => {
    try {
      // Dynamically import jsPDF and jspdf-autotable
      const { default: jsPDF } = await import('jspdf');
      const { autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF();

      // Add title
      doc.setFontSize(18);
      doc.text("Vehicle Task Report", 14, 22);

      // --- Add Task Status Chart ---
      const createTaskStatusChartImage = () => {
        return new Promise((resolve, reject) => {
          const canvas = document.createElement('canvas');
          const size = 600; // Chart size for PDF
          canvas.width = size;
          canvas.height = size / 2; // Aspect ratio 2:1

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get 2D context for canvas'));
            return;
          }

          const statusCounts = tasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
          }, {});

          const chart = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
              datasets: [{
                label: 'Number of Tasks',
                data: [
                  statusCounts['Pending'] || 0,
                  statusCounts['In Progress'] || 0,
                  statusCounts['Completed'] || 0,
                  statusCounts['Cancelled'] || 0,
                ],
                backgroundColor: [
                  'rgba(255, 193, 7, 0.8)', // warning
                  'rgba(23, 162, 184, 0.8)', // info
                  'rgba(40, 167, 69, 0.8)', // success
                  'rgba(220, 53, 69, 0.8)', // danger
                ],
                borderColor: [
                  'rgba(255, 193, 7, 1)',
                  'rgba(23, 162, 184, 1)',
                  'rgba(40, 167, 69, 1)',
                  'rgba(220, 53, 69, 1)',
                ],
                borderWidth: 1
              }]
            },
            options: {
              responsive: false,
              maintainAspectRatio: false,
              plugins: {
                title: {
                  display: true,
                  text: 'Task Status Overview',
                  font: { size: 14 } // Slightly smaller for PDF
                },
                legend: {
                  display: false,
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
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Count'
                  },
                  ticks: {
                      stepSize: 1
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Status'
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
            },
          });

           // Fallback for animation completion
          setTimeout(() => {
            try {
              const imageData = canvas.toDataURL('image/png');
              resolve(imageData);
            } catch (error) {
              reject(error);
            }
          }, 500);
        });
      };

      // Generate the chart image
      const taskStatusChartImage = await createTaskStatusChartImage();

      // Add the image to the PDF
      let chartWidth = 150; // Width for PDF
      let chartHeight = 75; // Height for PDF (maintaining aspect ratio)
      let yOffset = 30; // Start below the title
      const margin = 14; // Left margin

      doc.addImage(taskStatusChartImage, 'PNG', margin, yOffset, chartWidth, chartHeight);

      yOffset += chartHeight + 10; // Move down for the table

      // Define columns for the table
      const tableColumn = ["Task ID", "Driver ID", "Cargo Type", "Weight (kg)", "Pickup", "Delivery", "Expected Delivery", "Status"];

      // Define rows from tasks data
      const tableRows = [];

      tasks.forEach(task => {
        const taskData = [
          task.taskNumber,
          task.driverId || 'N/A',
          task.cargoType,
          task.weight || 'N/A',
          task.pickup || 'N/A',
          task.delivery || 'N/A',
          task.expectedDelivery ? formatDate(task.expectedDelivery) : 'N/A',
          task.status,
        ];
        tableRows.push(taskData);
      });

      // Add the table
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: yOffset, // Start table below the chart
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        bodyStyles: { textColor: 50 },
        didDrawPage: (data) => {
          // Footer
          let pageNumber = doc.internal.getNumberOfPages();
          doc.setFontSize(10);
          doc.text(`Page ${pageNumber}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
        }
      });

      // Save the PDF
      doc.save(`Vehicle_Task_Report_${new Date().toISOString().slice(0,10)}.pdf`);

      setAlertMessage("PDF report generated");
      setAlertType("success");
      setShowAlert(true);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setAlertMessage("Failed to generate PDF: " + error.message);
      setAlertType("danger");
      setShowAlert(true);
    }
  };

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
                onClick={handleExportPdf}
                disabled={tasks.length === 0}
              >
                <DownloadCloud size={16} className="me-2" />
                Export PDF
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
        
        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          show={deleteModal.show}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          itemType="Task"
          itemName={deleteModal.task ? `${deleteModal.task.taskNumber}` : ""}
          additionalMessage="All task data and completion history will be permanently removed."
        />

        
      </div>
    </div>
  );
};

export default Tasks;
