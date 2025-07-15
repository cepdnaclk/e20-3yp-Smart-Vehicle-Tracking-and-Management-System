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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
              <Clipboard size={28} style={{ color: 'white' }} />
            </motion.div>
            <div>
              <h2 
                className="mb-2 fw-bold text-white"
                style={{ fontSize: '2.5rem' }}
              >
                Task Management
              </h2>
              <p 
                className="text-white opacity-75 mb-0"
                style={{ fontSize: '1.1rem' }}
              >
                View and manage all assigned tasks
              </p>
            </div>
          </div>
          
          <div className="d-flex gap-3 align-items-center">
            <div 
              className="p-3 rounded-3"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <Form.Group className="d-flex align-items-center mb-0">
                <Form.Label className="me-2 mb-0 text-white">Filter by Driver:</Form.Label>
                <Form.Select 
                  style={{ 
                    width: '200px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white'
                  }}
                  value={selectedDriverId}
                  onChange={handleDriverChange}
                >
                  <option value="" style={{ color: 'black' }}>All Drivers</option>
                  {drivers.map(driver => (
                    <option key={driver.driverId} value={driver.driverId} style={{ color: 'black' }}>
                      {driver.fullName} ({driver.driverId})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
            
            <motion.button 
              className="btn border-0 d-flex align-items-center px-4 py-2"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                borderRadius: '12px'
              }}
              onClick={selectedDriverId ? () => fetchTasksForDriver(selectedDriverId) : fetchAllTasks}
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
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                borderRadius: '12px',
                boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)'
              }}
              onClick={handleExportPdf}
              disabled={tasks.length === 0}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 12px 30px rgba(245, 158, 11, 0.4)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <DownloadCloud size={16} className="me-2" />
              Export PDF
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
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: 'white'
                }}
              >
                <Clipboard size={24} />
              </div>
              <div>
                <h5 className="mb-1 fw-bold">
                  {selectedDriverId ? `Tasks for Driver ${selectedDriverId}` : "All Tasks"}
                </h5>
                <p className="text-muted mb-0">{tasks.length} tasks found</p>
              </div>
              <div className="ms-auto">
                <span 
                  className="badge px-3 py-2"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: 'white',
                    borderRadius: '12px'
                  }}
                >
                  Total: {tasks.length}
                </span>
              </div>
            </div>
            
            <DataTable 
              columns={tableColumns}
              data={tasks}
              emptyMessage="No tasks found. Tasks will appear here once assigned to drivers."
            />
          </div>
        </motion.div>
      </motion.div>
        
        {/* Task View/Edit Modal */}
        {showTaskModal && (
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
              <Form onSubmit={handleTaskFormSubmit}>
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
                        background: viewMode ? 
                          'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 
                          'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white'
                      }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <i className="fas fa-tasks" style={{ fontSize: '20px' }}></i>
                    </motion.div>
                    {viewMode ? 'View Task Details' : 'Edit Task'}
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
                            disabled={viewMode}
                            required
                            className="modern-input"
                            style={{
                              border: '2px solid #e5e7eb',
                              borderRadius: '8px',
                              padding: '12px 16px',
                              fontSize: '0.875rem',
                              backgroundColor: viewMode ? '#f9fafb' : '#ffffff',
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
                            disabled={viewMode}
                            required
                            className="modern-input"
                            style={{
                              border: '2px solid #e5e7eb',
                              borderRadius: '8px',
                              padding: '12px 16px',
                              fontSize: '0.875rem',
                              backgroundColor: viewMode ? '#f9fafb' : '#ffffff',
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
                            disabled={viewMode}
                            required
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
                            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
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
                                  disabled={viewMode}
                                  required
                                  className="modern-input-small"
                                  style={{
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    padding: '10px 12px',
                                    fontSize: '0.8rem',
                                    backgroundColor: viewMode ? '#f9fafb' : '#ffffff'
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
                                  disabled={viewMode}
                                  required
                                  className="modern-input-small"
                                  style={{
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    padding: '10px 12px',
                                    fontSize: '0.8rem',
                                    backgroundColor: viewMode ? '#f9fafb' : '#ffffff'
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
                                  disabled={viewMode}
                                  required
                                  className="modern-input-small"
                                  style={{
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    padding: '10px 12px',
                                    fontSize: '0.8rem',
                                    backgroundColor: viewMode ? '#f9fafb' : '#ffffff'
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
                          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                          border: '1px solid #bbf7d0'
                        }}
                      >
                        <div className="mb-3">
                          <h6 className="mb-1 fw-semibold d-flex align-items-center gap-2" style={{ color: '#065f46' }}>
                            <i className="fas fa-sticky-note" style={{ fontSize: '14px' }}></i>
                            Additional Notes
                          </h6>
                          <p className="mb-0 small" style={{ color: '#047857' }}>
                            {viewMode ? 'Task instructions and requirements' : 'Update task instructions or requirements'}
                          </p>
                        </div>
                        <Form.Group>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="additionalNotes"
                            value={taskFormData.additionalNotes}
                            onChange={handleTaskInputChange}
                            disabled={viewMode}
                            placeholder={viewMode ? "No additional notes provided." : "Any special instructions or notes..."}
                            className="modern-input"
                            style={{
                              border: '1px solid #bbf7d0',
                              borderRadius: '6px',
                              padding: '12px 16px',
                              fontSize: '0.875rem',
                              backgroundColor: viewMode ? '#f9fafb' : '#ffffff',
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
                        <i className="fas fa-times me-2"></i>
                        {viewMode ? 'Close' : 'Cancel'}
                      </Button>
                    </motion.div>
                    {!viewMode && (
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          type="submit"
                          className="px-4 py-2"
                          style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '500',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <i className="fas fa-check me-2"></i>
                          Update Task
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </Modal.Footer>
              </Form>
            </motion.div>
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
    </>
  );
};

export default Tasks;
