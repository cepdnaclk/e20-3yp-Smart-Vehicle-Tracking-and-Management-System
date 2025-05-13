import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaIdCard, FaPhone, FaEnvelope, FaCalendarAlt, FaMapMarkerAlt, FaCamera, FaUserCircle, FaArrowLeft, FaTasks, FaBox, FaTrash, FaEye, FaEdit, FaFileDownload } from 'react-icons/fa';
import axios from 'axios';
import { jsPDF } from 'jspdf';

function Drivers() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showTaskView, setShowTaskView] = useState(false);
  const [showAssignTaskForm, setShowAssignTaskForm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [editDriver, setEditDriver] = useState(null);
  const [viewDriver, setViewDriver] = useState(null);
  const [viewTask, setViewTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [dateRange, setDateRange] = useState('7');
  const [reportData, setReportData] = useState([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phoneNumber: '',
    email: '',
    licenseNumber: '',
    licenseExpiry: '',
    vehicleId: '',
    lastLocation: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    employmentStatus: 'active',
    joiningDate: '',
    profileImage: null,
  });

  const [taskFormData, setTaskFormData] = useState({
    cargoType: '',
    weight: '',
    pickup: '',
    delivery: '',
    expectedDelivery: '',
    status: 'Pending',
  });

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:5000/api/drivers');
        setDrivers(response.data);
      } catch (error) {
        console.error('Error fetching drivers:', error);
        toast.error(error.response?.data?.message || 'Failed to load drivers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  const fetchTasks = async (driverId) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:5000/api/drivers/${driverId}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error(error.response?.data?.message || 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'file' ? files[0] : value,
    });
  };

  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setTaskFormData({
      ...taskFormData,
      [name]: value,
    });
  };

  const validateFormData = () => {
    const errors = [];
    if (!formData.firstName.trim()) errors.push('First name is required');
    if (!formData.lastName.trim()) errors.push('Last name is required');
    if (!formData.phoneNumber.trim()) errors.push('Phone number is required');
    if (!formData.email.trim()) errors.push('Email is required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.push('Invalid email format');
    if (!formData.licenseNumber.trim()) errors.push('License number is required');
    if (!formData.vehicleId.trim()) errors.push('Vehicle ID is required');
    if (!formData.licenseExpiry) errors.push('License expiry date is required');
    else if (isNaN(new Date(formData.licenseExpiry).getTime())) errors.push('Invalid license expiry date');
    if (formData.dateOfBirth && isNaN(new Date(formData.dateOfBirth).getTime())) errors.push('Invalid date of birth');
    if (formData.joiningDate && isNaN(new Date(formData.joiningDate).getTime())) errors.push('Invalid joining date');

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateFormData();
    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => toast.error(error));
      return;
    }

    try {
      setIsLoading(true);
      const payload = new FormData();
      payload.append('firstName', formData.firstName);
      payload.append('lastName', formData.lastName);
      payload.append('phoneNumber', formData.phoneNumber);
      payload.append('email', formData.email);
      payload.append('licenseNumber', formData.licenseNumber);
      payload.append('licenseExpiry', formData.licenseExpiry);
      payload.append('vehicleId', formData.vehicleId);
      payload.append('lastLocation', formData.lastLocation);
      payload.append('employmentStatus', formData.employmentStatus);
      if (formData.dateOfBirth) payload.append('dateOfBirth', formData.dateOfBirth);
      if (formData.address.trim()) payload.append('address', formData.address);
      if (formData.city.trim()) payload.append('city', formData.city);
      if (formData.state.trim()) payload.append('state', formData.state);
      if (formData.zipCode.trim()) payload.append('zipCode', formData.zipCode);
      if (formData.joiningDate) payload.append('joiningDate', formData.joiningDate);
      if (formData.profileImage) payload.append('profileImage', formData.profileImage);

      let response;
      if (editDriver) {
        response = await axios.put(`http://localhost:5000/api/drivers/${editDriver._id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setDrivers(drivers.map((d) => (d._id === editDriver._id ? response.data : d)));
        toast.success('Driver updated successfully!');
      } else {
        response = await axios.post('http://localhost:5000/api/drivers', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setDrivers([...drivers, response.data]);
        toast.success('Driver registered successfully!');
      }

      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        phoneNumber: '',
        email: '',
        licenseNumber: '',
        licenseExpiry: '',
        vehicleId: '',
        lastLocation: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        employmentStatus: 'active',
        joiningDate: '',
        profileImage: null,
      });
      setShowForm(false);
      setEditDriver(null);
    } catch (error) {
      console.error('Error saving driver:', error);
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) => toast.error(err.msg));
      } else {
        toast.error(error.response?.data?.message || 'Failed to save driver');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      let response;
      if (editTask) {
        response = await axios.put(`http://localhost:5000/api/drivers/${selectedDriverId}/tasks/${editTask._id}`, taskFormData);
        setTasks(tasks.map((t) => (t._id === editTask._id ? response.data : t)));
        toast.success('Task updated successfully!');
      } else {
        response = await axios.post(`http://localhost:5000/api/drivers/${selectedDriverId}/tasks`, taskFormData);
        setTasks([...tasks, response.data]);
        toast.success('Task assigned successfully!');
      }

      setTaskFormData({
        cargoType: '',
        weight: '',
        pickup: '',
        delivery: '',
        expectedDelivery: '',
        status: 'Pending',
      });
      setShowAssignTaskForm(false);
      setEditTask(null);
    } catch (error) {
      console.error('Error processing task:', error);
      toast.error(error.response?.data?.message || 'Failed to process task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (driver) => {
    setViewDriver(driver);
  };

  const handleEdit = (driver) => {
    setEditDriver(driver);
    setFormData({
      firstName: driver.firstName,
      lastName: driver.lastName,
      dateOfBirth: driver.dateOfBirth ? driver.dateOfBirth.split('T')[0] : '',
      phoneNumber: driver.phoneNumber,
      email: driver.email,
      licenseNumber: driver.licenseNumber,
      licenseExpiry: driver.licenseExpiry ? driver.licenseExpiry.split('T')[0] : '',
      vehicleId: driver.vehicleId || '',
      lastLocation: driver.lastLocation || '',
      address: driver.address || '',
      city: driver.city || '',
      state: driver.state || '',
      zipCode: driver.zipCode || '',
      employmentStatus: driver.employmentStatus,
      joiningDate: driver.joiningDate ? driver.joiningDate.split('T')[0] : '',
      profileImage: null,
    });
    setShowForm(true);
  };

  const handleDeleteDriver = async (driverId) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      if (window.confirm('Please confirm again to delete this driver.')) {
        try {
          await axios.delete(`http://localhost:5000/api/drivers/${driverId}`);
          setDrivers(drivers.filter((d) => d._id !== driverId));
          toast.success('Driver deleted successfully!');
        } catch (error) {
          console.error('Error deleting driver:', error);
          toast.error(error.response?.data?.message || 'Failed to delete driver');
        }
      }
    }
  };

  const handleViewTask = (task) => {
    setViewTask(task);
  };

  const handleEditTask = (task) => {
    setEditTask(task);
    setTaskFormData({
      cargoType: task.cargoType,
      weight: task.weight.toString(),
      pickup: task.pickup,
      delivery: task.delivery,
      expectedDelivery: task.expectedDelivery ? task.expectedDelivery.split('T')[0] : '',
      status: task.status,
    });
    setShowAssignTaskForm(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      if (window.confirm('Please confirm again to delete this task.')) {
        try {
          await axios.delete(`http://localhost:5000/api/drivers/${selectedDriverId}/tasks/${taskId}`);
          setTasks(tasks.filter((t) => t._id !== taskId));
          toast.success('Task deleted successfully!');
        } catch (error) {
          console.error('Error deleting task:', error);
          toast.error(error.response?.data?.message || 'Failed to delete task');
        }
      }
    }
  };

  const handleAssignTask = (driverId) => {
    setSelectedDriverId(driverId);
    setShowTaskView(true);
    fetchTasks(driverId);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleBackToDrivers = () => {
    setShowTaskView(false);
    setShowAssignTaskForm(false);
    setSelectedDriverId(null);
    setTasks([]);
  };

  const handleShowTaskForm = () => {
    setEditTask(null);
    setTaskFormData({
      cargoType: '',
      weight: '',
      pickup: '',
      delivery: '',
      expectedDelivery: '',
      status: 'Pending',
    });
    setShowAssignTaskForm(true);
  };

  const closeViewModal = () => {
    setViewDriver(null);
  };

  const closeTaskViewModal = () => {
    setViewTask(null);
  };

  const openReportModal = (driverId) => {
    setSelectedDriverId(driverId);
    setShowReportModal(true);
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setSelectedDriverId(null);
    setReportData([]);
  };

  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
  };

  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:5000/api/drivers/${selectedDriverId}/tasks/report`, {
        params: { dateRange },
      });
      const tasksWithNum = response.data.map((task, index) => ({
        ...task,
        taskNum: `TSK${String(index + 1).padStart(4, '0')}`,
      }));
      setReportData(tasksWithNum);
      if (tasksWithNum.length === 0) {
        toast.info('No tasks found for the selected date range');
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch report data');
      setReportData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCSV = () => {
    const headers = ['Task Number,Cargo Type,Pick Up,Delivery,Expected Delivery,Status'];
    const rows = reportData.map((item) => [
      item.taskNum,
      item.cargoType,
      item.pickup,
      item.delivery,
      new Date(item.expectedDelivery).toLocaleDateString(),
      item.status,
    ].join(','));

    const csvContent = [...headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `driver_report_${selectedDriverId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Driver Task Report', 20, 20);

    doc.setFontSize(12);
    doc.text(`Driver ID: ${selectedDriverId}`, 20, 30);
    doc.text(`Date Range: Last ${dateRange} days`, 20, 40);

    const headers = [['Task Number', 'Cargo Type', 'Pick Up', 'Delivery', 'Expected Delivery', 'Status']];
    const data = reportData.map((item) => [
      item.taskNum,
      item.cargoType,
      item.pickup,
      item.delivery,
      new Date(item.expectedDelivery).toLocaleDateString(),
      item.status,
    ]);

    doc.autoTable({
      head: headers,
      body: data,
      startY: 50,
      theme: 'grid',
    });

    doc.save(`driver_report_${selectedDriverId}.pdf`);
  };

  return (
      <div className="container-fluid p-4">
        {!showTaskView ? (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h1><FaUser className="me-2" />Driver Management</h1>
                <div>
                  <button className="btn btn-secondary me-2" onClick={handleBackToDashboard}>
                    <FaArrowLeft className="me-1" /> Back to Dashboard
                  </button>
                  <button className="btn btn-primary" onClick={() => {
                    setEditDriver(null);
                    setFormData({
                      firstName: '',
                      lastName: '',
                      dateOfBirth: '',
                      phoneNumber: '',
                      email: '',
                      licenseNumber: '',
                      licenseExpiry: '',
                      vehicleId: '',
                      lastLocation: '',
                      address: '',
                      city: '',
                      state: '',
                      zipCode: '',
                      employmentStatus: 'active',
                      joiningDate: '',
                      profileImage: null,
                    });
                    setShowForm(!showForm);
                  }}>
                    {showForm ? 'Cancel' : 'Add New Driver'}
                  </button>
                </div>
              </div>

              {showForm && (
                  <div className="card mb-4 shadow-sm">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">{editDriver ? 'Edit Driver' : 'Register New Driver'}</h5>
                    </div>
                    <div className="card-body">
                      <form onSubmit={handleSubmit}>
                        <div className="row">
                          <div className="col-md-6">
                            <h6 className="mb-3">Personal Information</h6>
                            <div className="mb-4 text-center">
                              <div
                                  className="position-relative d-inline-block"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => document.getElementById('profileImage').click()}
                              >
                                {formData.profileImage ? (
                                    <img
                                        src={URL.createObjectURL(formData.profileImage)}
                                        alt="Profile preview"
                                        className="rounded-circle border"
                                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                    />
                                ) : editDriver && editDriver.profileImage ? (
                                    <img
                                        src={`http://localhost:5000/${editDriver.profileImage}`}
                                        alt="Profile"
                                        className="rounded-circle border"
                                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div
                                        className="rounded-circle bg-light d-flex align-items-center justify-content-center border"
                                        style={{ width: '150px', height: '150px' }}
                                    >
                                      <FaUserCircle size={80} className="text-secondary" />
                                    </div>
                                )}
                                <div
                                    className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2"
                                    style={{ boxShadow: '0px 0px 5px rgba(0,0,0,0.3)' }}
                                >
                                  <FaCamera />
                                </div>
                              </div>
                              <input
                                  id="profileImage"
                                  type="file"
                                  className="d-none"
                                  name="profileImage"
                                  accept="image/*"
                                  onChange={handleInputChange}
                              />
                              <div className="mt-2 text-muted small">Click to upload profile photo</div>
                            </div>
                            <div className="row">
                              <div className="col-md-6">
                                <div className="mb-3">
                                  <label className="form-label">First Name*</label>
                                  <input
                                      type="text"
                                      className="form-control"
                                      name="firstName"
                                      value={formData.firstName}
                                      onChange={handleInputChange}
                                      required
                                  />
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="mb-3">
                                  <label className="form-label">Last Name*</label>
                                  <input
                                      type="text"
                                      className="form-control"
                                      name="lastName"
                                      value={formData.lastName}
                                      onChange={handleInputChange}
                                      required
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Date of Birth</label>
                              <div className="input-group">
                                <span className="input-group-text"><FaCalendarAlt /></span>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleInputChange}
                                />
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Phone Number*</label>
                              <div className="input-group">
                                <span className="input-group-text"><FaPhone /></span>
                                <input
                                    type="tel"
                                    className="form-control"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., 555-123-4567"
                                />
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Email Address*</label>
                              <div className="input-group">
                                <span className="input-group-text"><FaEnvelope /></span>
                                <input
                                    type="email"
                                    className="form-control"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., driver@example.com"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <h6 className="mb-3">License Information & Address</h6>
                            <div className="mb-3">
                              <label className="form-label">Driver's License Number*</label>
                              <div className="input-group">
                                <span className="input-group-text"><FaIdCard /></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="licenseNumber"
                                    value={formData.licenseNumber}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., DL-123456789"
                                />
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">License Expiry Date*</label>
                              <div className="input-group">
                                <span className="input-group-text"><FaCalendarAlt /></span>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="licenseExpiry"
                                    value={formData.licenseExpiry}
                                    onChange={handleInputChange}
                                    required
                                />
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Vehicle ID*</label>
                              <div className="input-group">
                                <span className="input-group-text"><FaIdCard /></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="vehicleId"
                                    value={formData.vehicleId}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., VEH-1234"
                                />
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Last Location</label>
                              <div className="input-group">
                                <span className="input-group-text"><FaMapMarkerAlt /></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="lastLocation"
                                    value={formData.lastLocation}
                                    onChange={handleInputChange}
                                    placeholder="e.g., New York, NY"
                                />
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Address</label>
                              <input
                                  type="text"
                                  className="form-control mb-2"
                                  name="address"
                                  value={formData.address}
                                  onChange={handleInputChange}
                                  placeholder="Street Address"
                              />
                              <div className="row">
                                <div className="col-md-6">
                                  <input
                                      type="text"
                                      className="form-control mb-2"
                                      name="city"
                                      value={formData.city}
                                      onChange={handleInputChange}
                                      placeholder="City"
                                  />
                                </div>
                                <div className="col-md-6">
                                  <input
                                      type="text"
                                      className="form-control mb-2"
                                      name="state"
                                      value={formData.state}
                                      onChange={handleInputChange}
                                      placeholder="State/Province"
                                  />
                                </div>
                              </div>
                              <input
                                  type="text"
                                  className="form-control"
                                  name="zipCode"
                                  value={formData.zipCode}
                                  onChange={handleInputChange}
                                  placeholder="ZIP/Postal Code"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="d-flex justify-content-end gap-2 mt-3">
                          <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => {
                                setShowForm(false);
                                setEditDriver(null);
                              }}
                          >
                            Cancel
                          </button>
                          <button
                              type="submit"
                              className="btn btn-success"
                              disabled={isLoading}
                          >
                            {isLoading ? 'Saving...' : editDriver ? 'Update Driver' : 'Register Driver'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
              )}

              <div className="card shadow-sm">
                <div className="card-header bg-light">
                  <h5 className="mb-0">Registered Drivers</h5>
                </div>
                <div className="card-body">
                  {isLoading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2">Loading drivers...</p>
                      </div>
                  ) : drivers.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="mb-0">No drivers registered yet.</p>
                      </div>
                  ) : (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead className="table-light">
                          <tr>
                            <th>Register Number</th>
                            <th>Vehicle Number</th>
                            <th>Status</th>
                            <th>Location</th>
                            <th>Assign Task</th>
                            <th>Generate Report</th>
                            <th>Action</th>
                          </tr>
                          </thead>
                          <tbody>
                          {drivers.map((driver) => (
                              <tr key={driver._id}>
                                <td>{driver.licenseNumber}</td>
                                <td>{driver.vehicleId || 'N/A'}</td>
                                <td>
                            <span className={`badge ${driver.employmentStatus === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                              {driver.employmentStatus.charAt(0).toUpperCase() + driver.employmentStatus.slice(1)}
                            </span>
                                </td>
                                <td>{driver.lastLocation || 'N/A'}</td>
                                <td>
                                  <button
                                      className="btn btn-sm btn-success"
                                      onClick={() => handleAssignTask(driver._id)}
                                  >
                                    <FaTasks className="me-1" /> Assign
                                  </button>
                                </td>
                                <td>
                                  <button
                                      className="btn btn-sm btn-info"
                                      onClick={() => openReportModal(driver._id)}
                                  >
                                    <FaFileDownload className="me-1" /> Generate
                                  </button>
                                </td>
                                <td>
                                  <div className="btn-group btn-group-sm">
                                    <button className="btn btn-primary" onClick={() => handleViewDetails(driver)}>
                                      <FaEye className="me-1" /> View
                                    </button>
                                    <button className="btn btn-outline-secondary" onClick={() => handleEdit(driver)}>
                                      <FaEdit className="me-1" /> Edit
                                    </button>
                                    <button className="btn btn-danger" onClick={() => handleDeleteDriver(driver._id)}>
                                      <FaTrash className="me-1" /> Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                          ))}
                          </tbody>
                        </table>
                      </div>
                  )}
                </div>
              </div>

              {viewDriver && (
                  <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                      <div className="modal-content">
                        <div className="modal-header bg-primary text-white">
                          <h5 className="modal-title">Driver Details</h5>
                          <button type="button" className="btn-close btn-close-white" onClick={closeViewModal}></button>
                        </div>
                        <div className="modal-body">
                          <div className="mb-3 text-center">
                            {viewDriver.profileImage ? (
                                <img
                                    src={`http://localhost:5000/${viewDriver.profileImage}`}
                                    alt="Profile"
                                    className="rounded-circle border"
                                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                />
                            ) : (
                                <FaUserCircle size={80} className="text-secondary" />
                            )}
                          </div>
                          <div className="mb-3">
                            <strong>Name:</strong> {viewDriver.firstName} {viewDriver.lastName}
                          </div>
                          <div className="mb-3">
                            <strong>Date of Birth:</strong> {viewDriver.dateOfBirth ? new Date(viewDriver.dateOfBirth).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="mb-3">
                            <strong>Phone Number:</strong> {viewDriver.phoneNumber}
                          </div>
                          <div className="mb-3">
                            <strong>Email:</strong> {viewDriver.email}
                          </div>
                          <div className="mb-3">
                            <strong>License Number:</strong> {viewDriver.licenseNumber}
                          </div>
                          <div className="mb-3">
                            <strong>License Expiry:</strong> {viewDriver.licenseExpiry ? new Date(viewDriver.licenseExpiry).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="mb-3">
                            <strong>Vehicle ID:</strong> {viewDriver.vehicleId || 'N/A'}
                          </div>
                          <div className="mb-3">
                            <strong>Last Location:</strong> {viewDriver.lastLocation || 'N/A'}
                          </div>
                          <div className="mb-3">
                            <strong>Address:</strong> {viewDriver.address || 'N/A'}, {viewDriver.city || 'N/A'}, {viewDriver.state || 'N/A'} {viewDriver.zipCode || 'N/A'}
                          </div>
                          <div className="mb-3">
                            <strong>Employment Status:</strong> {viewDriver.employmentStatus}
                          </div>
                          <div className="mb-3">
                            <strong>Joining Date:</strong> {viewDriver.joiningDate ? new Date(viewDriver.joiningDate).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button type="button" className="btn btn-secondary" onClick={closeViewModal}>
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
              )}
            </>
        ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h1><FaTasks className="me-2" />Tasks for Driver</h1>
                <button className="btn btn-secondary" onClick={handleBackToDrivers}>
                  <FaArrowLeft className="me-1" /> Back to Drivers
                </button>
              </div>

              {!showAssignTaskForm ? (
                  <>
                    <div className="card shadow-sm mb-4">
                      <div className="card-header bg-light d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Assigned Tasks</h5>
                        <button className="btn btn-primary btn-sm" onClick={handleShowTaskForm}>
                          Add New Task
                        </button>
                      </div>
                      <div className="card-body">
                        {isLoading ? (
                            <div className="text-center py-4">
                              <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                              <p className="mt-2">Loading tasks...</p>
                            </div>
                        ) : tasks.length === 0 ? (
                            <div className="text-center py-4">
                              <p className="mb-0">No tasks assigned yet.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                              <table className="table table-hover">
                                <thead className="table-light">
                                <tr>
                                  <th>Task Num</th>
                                  <th>Cargo Type</th>
                                  <th>Pick Up</th>
                                  <th>Delivery</th>
                                  <th>Expected Delivery</th>
                                  <th>Status</th>
                                  <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {tasks.map((task, index) => (
                                    <tr key={task._id}>
                                      <td>TSK{String(index + 1).padStart(4, '0')}</td>
                                      <td>{task.cargoType}</td>
                                      <td>{task.pickup}</td>
                                      <td>{task.delivery}</td>
                                      <td>{new Date(task.expectedDelivery).toLocaleDateString()}</td>
                                      <td>
                                <span className={`badge ${task.status === 'Completed' ? 'bg-success' : task.status === 'In Progress' ? 'bg-warning' : 'bg-secondary'}`}>
                                  {task.status}
                                </span>
                                      </td>
                                      <td>
                                        <div className="btn-group btn-group-sm">
                                          <button className="btn btn-primary" onClick={() => handleViewTask(task)}>
                                            <FaEye className="me-1" /> View
                                          </button>
                                          <button className="btn btn-outline-secondary" onClick={() => handleEditTask(task)}>
                                            <FaEdit className="me-1" /> Edit
                                          </button>
                                          <button className="btn btn-danger" onClick={() => handleDeleteTask(task._id)}>
                                            <FaTrash className="me-1" /> Delete
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                ))}
                                </tbody>
                              </table>
                            </div>
                        )}
                      </div>
                    </div>
                  </>
              ) : (
                  <div className="card shadow-sm">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">{editTask ? 'Edit Task' : 'Assign New Task'}</h5>
                    </div>
                    <div className="card-body">
                      <form onSubmit={handleTaskSubmit}>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Cargo Type*</label>
                              <div className="input-group">
                                <span className="input-group-text"><FaBox /></span>
                                <select
                                    className="form-select"
                                    name="cargoType"
                                    value={taskFormData.cargoType}
                                    onChange={handleTaskInputChange}
                                    required
                                >
                                  <option value="">Select Cargo Type</option>
                                  <option value="Electronics">Electronics</option>
                                  <option value="Furniture">Furniture</option>
                                  <option value="Perishables">Perishables</option>
                                  <option value="Machinery">Machinery</option>
                                  <option value="Textiles">Textiles</option>
                                </select>
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Weight (kg)*</label>
                              <div className="input-group">
                                <span className="input-group-text"><FaBox /></span>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="weight"
                                    value={taskFormData.weight}
                                    onChange={handleTaskInputChange}
                                    required
                                    placeholder="Enter weight in kg"
                                    min="0"
                                />
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Pickup Location*</label>
                              <div className="input-group">
                                <span className="input-group-text"><FaMapMarkerAlt /></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="pickup"
                                    value={taskFormData.pickup}
                                    onChange={handleTaskInputChange}
                                    required
                                    placeholder="Enter pickup location"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Delivery Location*</label>
                              <div className="input-group">
                                <span className="input-group-text"><FaMapMarkerAlt /></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="delivery"
                                    value={taskFormData.delivery}
                                    onChange={handleTaskInputChange}
                                    required
                                    placeholder="Enter delivery location"
                                />
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Expected Delivery Date*</label>
                              <div className="input-group">
                                <span className="input-group-text"><FaCalendarAlt /></span>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="expectedDelivery"
                                    value={taskFormData.expectedDelivery}
                                    onChange={handleTaskInputChange}
                                    required
                                />
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Status*</label>
                              <select
                                  className="form-select"
                                  name="status"
                                  value={taskFormData.status}
                                  onChange={handleTaskInputChange}
                                  required
                              >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex justify-content-end gap-2 mt-3">
                          <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setShowAssignTaskForm(false)}
                          >
                            Cancel
                          </button>
                          <button
                              type="submit"
                              className="btn btn-success"
                              disabled={isLoading}
                          >
                            {isLoading ? 'Processing...' : editTask ? 'Update Task' : 'Assign Task'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
              )}

              {viewTask && (
                  <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                      <div className="modal-content">
                        <div className="modal-header bg-primary text-white">
                          <h5 className="modal-title">Task Details</h5>
                          <button type="button" className="btn-close btn-close-white" onClick={closeTaskViewModal}></button>
                        </div>
                        <div className="modal-body">
                          <div className="mb-3">
                            <strong>Task Number:</strong> TSK{String(tasks.findIndex(t => t._id === viewTask._id) + 1).padStart(4, '0')}
                          </div>
                          <div className="mb-3">
                            <strong>Cargo Type:</strong> {viewTask.cargoType}
                          </div>
                          <div className="mb-3">
                            <strong>Weight (kg):</strong> {viewTask.weight}
                          </div>
                          <div className="mb-3">
                            <strong>Pickup Location:</strong> {viewTask.pickup}
                          </div>
                          <div className="mb-3">
                            <strong>Delivery Location:</strong> {viewTask.delivery}
                          </div>
                          <div className="mb-3">
                            <strong>Expected Delivery:</strong> {new Date(viewTask.expectedDelivery).toLocaleDateString()}
                          </div>
                          <div className="mb-3">
                            <strong>Status:</strong> {viewTask.status}
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button type="button" className="btn btn-secondary" onClick={closeTaskViewModal}>
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
              )}
            </>
        )}

        {showReportModal && (
            <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title">Generate Task Report</h5>
                    <button type="button" className="btn-close btn-close-white" onClick={closeReportModal}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Select Date Range</label>
                      <select
                          className="form-select"
                          value={dateRange}
                          onChange={handleDateRangeChange}
                      >
                        <option value="1">Last 1 Day</option>
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                      </select>
                    </div>
                    <button
                        className="btn btn-primary w-100 mb-3"
                        onClick={fetchReportData}
                        disabled={isLoading}
                    >
                      {isLoading ? 'Fetching Data...' : 'Fetch Report Data'}
                    </button>
                    {reportData.length > 0 && (
                        <>
                          <div className="table-responsive">
                            <table className="table table-bordered">
                              <thead>
                              <tr>
                                <th>Task Number</th>
                                <th>Cargo Type</th>
                                <th>Pick Up</th>
                                <th>Delivery</th>
                                <th>Expected Delivery</th>
                                <th>Status</th>
                              </tr>
                              </thead>
                              <tbody>
                              {reportData.map((item, index) => (
                                  <tr key={index}>
                                    <td>{item.taskNum}</td>
                                    <td>{item.cargoType}</td>
                                    <td>{item.pickup}</td>
                                    <td>{item.delivery}</td>
                                    <td>{new Date(item.expectedDelivery).toLocaleDateString()}</td>
                                    <td>{item.status}</td>
                                  </tr>
                              ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="d-flex gap-2">
                            <button className="btn btn-success w-50" onClick={generateCSV}>
                              Download CSV
                            </button>
                            <button className="btn btn-danger w-50" onClick={generatePDF}>
                              Download PDF
                            </button>
                          </div>
                        </>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={closeReportModal}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}

export default Drivers;
