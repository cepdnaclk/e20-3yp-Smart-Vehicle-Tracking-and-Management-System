import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaIdCard, FaPhone, FaEnvelope, FaCalendarAlt, FaMapMarkerAlt, FaCamera, FaUserCircle, FaArrowLeft, FaTasks, FaBox, FaTrash, FaEye, FaEdit, FaFileDownload, FaFilter } from 'react-icons/fa';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [selectedStatuses, setSelectedStatuses] = useState(['Pending', 'In Progress', 'Completed', 'Cancelled']);
  const [reportData, setReportData] = useState([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phoneNumber: '',
    email: '',
    licenseNumber: '',
    licenseExpiry: '',
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
    vehicle: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const payload = new FormData();
      payload.append('firstName', formData.firstName);
      payload.append('lastName', formData.lastName);
      payload.append('phoneNumber', formData.phoneNumber);
      payload.append('email', formData.email);
      payload.append('licenseNumber', formData.licenseNumber);
      payload.append('licenseExpiry', formData.licenseExpiry ? new Date(formData.licenseExpiry).toISOString() : '');
      payload.append('employmentStatus', formData.employmentStatus);
      if (formData.dateOfBirth) payload.append('dateOfBirth', new Date(formData.dateOfBirth).toISOString());
      if (formData.address.trim()) payload.append('address', formData.address);
      if (formData.city.trim()) payload.append('city', formData.city);
      if (formData.state.trim()) payload.append('state', formData.state);
      if (formData.zipCode.trim()) payload.append('zipCode', formData.zipCode);
      if (formData.joiningDate) payload.append('joiningDate', new Date(formData.joiningDate).toISOString());
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
      toast.error(error.response?.data?.message || 'Failed to save driver');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const payload = {
        cargoType: taskFormData.cargoType,
        weight: taskFormData.weight ? parseFloat(taskFormData.weight) : 0,
        pickup: taskFormData.pickup,
        delivery: taskFormData.delivery,
        expectedDelivery: taskFormData.expectedDelivery ? new Date(taskFormData.expectedDelivery).toISOString() : new Date().toISOString(),
        vehicle: taskFormData.vehicle,
      };

      // Validate vehicle registration
      const vehicleResponse = await axios.get(`http://localhost:5000/api/vehicles?licensePlate=${taskFormData.vehicle}`);
      if (vehicleResponse.data.length === 0) {
        toast.error('Vehicle is not registered.');
        return;
      }

      let response;
      if (editTask) {
        response = await axios.put(`http://localhost:5000/api/drivers/${selectedDriverId}/tasks/${editTask._id}`, payload);
        setTasks(tasks.map((t) => (t._id === editTask._id ? response.data : t)));
        toast.success('Task updated successfully!');
      } else {
        response = await axios.post(`http://localhost:5000/api/drivers/${selectedDriverId}/tasks`, payload);
        setTasks([...tasks, response.data]);
        toast.success('Task assigned successfully!');
      }

      setTaskFormData({
        cargoType: '',
        weight: '',
        pickup: '',
        delivery: '',
        expectedDelivery: '',
        vehicle: '',
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
      dateOfBirth: driver.dateOfBirth ? new Date(driver.dateOfBirth).toISOString().split('T')[0] : '',
      phoneNumber: driver.phoneNumber,
      email: driver.email,
      licenseNumber: driver.licenseNumber,
      licenseExpiry: driver.licenseExpiry ? new Date(driver.licenseExpiry).toISOString().split('T')[0] : '',
      address: driver.address || '',
      city: driver.city || '',
      state: driver.state || '',
      zipCode: driver.zipCode || '',
      employmentStatus: driver.employmentStatus,
      joiningDate: driver.joiningDate ? new Date(driver.joiningDate).toISOString().split('T')[0] : '',
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
      expectedDelivery: task.expectedDelivery ? new Date(task.expectedDelivery).toISOString().split('T')[0] : '',
      vehicle: task.vehicle,
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
      vehicle: '',
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
    setDateRange('7');
    setSelectedStatuses(['Pending', 'In Progress', 'Completed', 'Cancelled']);
    setReportData([]);
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

  const handleStatusChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setSelectedStatuses(selected);
  };

  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:5000/api/drivers/${selectedDriverId}/tasks`);
      const tasksWithNum = response.data
        .filter((task) => selectedStatuses.includes(task.status))
        .filter((task) => {
          if (dateRange === 'all') return true;
          const taskDate = new Date(task.createdAt);
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRange));
          return taskDate >= cutoffDate;
        })
        .map((task, index) => ({
          ...task,
          taskNum: `TSK${String(index + 1).padStart(4, '0')}`,
        }));
      setReportData(tasksWithNum);
      if (tasksWithNum.length === 0) {
        toast.info('No tasks found for the selected filters');
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
    try {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [['Task Number', 'Cargo Type', 'Pick Up', 'Delivery', 'Expected Delivery', 'Status']],
        body: reportData.map((item) => [
          item.taskNum,
          item.cargoType,
          item.pickup,
          item.delivery,
          new Date(item.expectedDelivery).toLocaleDateString(),
          item.status,
        ]),
        startY: 60,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [0, 123, 255] },
      });

      doc.setFontSize(16);
      doc.text('Driver Task Report', 20, 20);
      doc.setFontSize(12);
      doc.text(`Driver ID: ${selectedDriverId}`, 20, 30);
      doc.text(`Date Range: Last ${dateRange} days`, 20, 40);
      doc.text(`Statuses: ${selectedStatuses.join(', ')}`, 20, 50);

      doc.save(`driver_report_${selectedDriverId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
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
                            <label className="form-label">First Name</label>
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
                            <label className="form-label">Last Name</label>
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
                        <label className="form-label">Phone Number</label>
                        <div className="input-group">
                          <span className="input-group-text"><FaPhone /></span>
                          <input
                            type="tel"
                            className="form-control"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <div className="input-group">
                          <span className="input-group-text"><FaEnvelope /></span>
                          <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <h6 className="mb-3">License & Address</h6>
                      <div className="mb-3">
                        <label className="form-label">License Number</label>
                        <div className="input-group">
                          <span className="input-group-text"><FaIdCard /></span>
                          <input
                            type="text"
                            className="form-control"
                            name="licenseNumber"
                            value={formData.licenseNumber}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">License Expiry</label>
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
                        <label className="form-label">Address</label>
                        <div className="input-group">
                          <span className="input-group-text"><FaMapMarkerAlt /></span>
                          <input
                            type="text"
                            className="form-control"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">City</label>
                            <input
                              type="text"
                              className="form-control"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">State</label>
                            <input
                              type="text"
                              className="form-control"
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Zip Code</label>
                        <input
                          type="text"
                          className="form-control"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Employment Status</label>
                        <select
                          className="form-control"
                          name="employmentStatus"
                          value={formData.employmentStatus}
                          onChange={handleInputChange}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Joining Date</label>
                        <div className="input-group">
                          <span className="input-group-text"><FaCalendarAlt /></span>
                          <input
                            type="date"
                            className="form-control"
                            name="joiningDate"
                            value={formData.joiningDate}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                      {isLoading ? 'Saving...' : (editDriver ? 'Update Driver' : 'Register Driver')}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary ms-2"
                      onClick={() => {
                        setShowForm(false);
                        setEditDriver(null);
                        setFormData({
                          firstName: '',
                          lastName: '',
                          dateOfBirth: '',
                          phoneNumber: '',
                          email: '',
                          licenseNumber: '',
                          licenseExpiry: '',
                          address: '',
                          city: '',
                          state: '',
                          zipCode: '',
                          employmentStatus: 'active',
                          joiningDate: '',
                          profileImage: null,
                        });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="card shadow-sm">
              <div className="card-body">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Vehicle Number</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map((driver) => (
                      <tr key={driver._id}>
                        <td>{`${driver.firstName} ${driver.lastName}`}</td>
                        <td>{driver.email}</td>
                        <td>{driver.phoneNumber}</td>
                        <td>{driver.vehicleNumber || 'N/A'}</td>
                        <td>
                          <span className={`badge ${driver.employmentStatus === 'active' ? 'bg-success' : 'bg-danger'}`}>
                            {driver.employmentStatus}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-1"
                            onClick={() => handleViewDetails(driver)}
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-warning me-1"
                            onClick={() => handleEdit(driver)}
                            title="Edit Driver"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger me-1"
                            onClick={() => handleDeleteDriver(driver._id)}
                            title="Delete Driver"
                          >
                            <FaTrash />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-info me-1"
                            onClick={() => handleAssignTask(driver._id)}
                            title="Manage Tasks"
                          >
                            <FaTasks />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => openReportModal(driver._id)}
                            title="Generate Report"
                          >
                            <FaFileDownload />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1><FaTasks className="me-2" />Manage Tasks for Driver</h1>
            <div>
              <button className="btn btn-secondary me-2" onClick={handleBackToDrivers}>
                <FaArrowLeft className="me-1" /> Back to Drivers
              </button>
              <button className="btn btn-primary" onClick={handleShowTaskForm}>
                Assign New Task
              </button>
            </div>
          </div>

          {showAssignTaskForm && (
            <div className="card mb-4 shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">{editTask ? 'Edit Task' : 'Assign New Task'}</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleTaskSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Cargo Type</label>
                        <input
                          type="text"
                          className="form-control"
                          name="cargoType"
                          value={taskFormData.cargoType}
                          onChange={handleTaskInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Weight (kg)</label>
                        <input
                          type="number"
                          className="form-control"
                          name="weight"
                          value={taskFormData.weight}
                          onChange={handleTaskInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Pickup Location</label>
                        <input
                          type="text"
                          className="form-control"
                          name="pickup"
                          value={taskFormData.pickup}
                          onChange={handleTaskInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Delivery Location</label>
                        <input
                          type="text"
                          className="form-control"
                          name="delivery"
                          value={taskFormData.delivery}
                          onChange={handleTaskInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Expected Delivery Date</label>
                        <input
                          type="date"
                          className="form-control"
                          name="expectedDelivery"
                          value={taskFormData.expectedDelivery}
                          onChange={handleTaskInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Vehicle Number</label>
                        <input
                          type="text"
                          className="form-control"
                          name="vehicle"
                          value={taskFormData.vehicle}
                          onChange={handleTaskInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                      {isLoading ? 'Saving...' : (editTask ? 'Update Task' : 'Assign Task')}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary ms-2"
                      onClick={() => {
                        setShowAssignTaskForm(false);
                        setEditTask(null);
                        setTaskFormData({
                          cargoType: '',
                          weight: '',
                          pickup: '',
                          delivery: '',
                          expectedDelivery: '',
                          vehicle: '',
                        });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="card shadow-sm">
              <div className="card-body">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Cargo Type</th>
                      <th>Pickup</th>
                      <th>Delivery</th>
                      <th>Vehicle</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task._id}>
                        <td>{task.cargoType}</td>
                        <td>{task.pickup}</td>
                        <td>{task.delivery}</td>
                        <td>{task.vehicle}</td>
                        <td>
                          <span className={`badge ${task.status === 'Completed' ? 'bg-success' : task.status === 'Pending' ? 'bg-warning' : task.status === 'In Progress' ? 'bg-info' : 'bg-danger'}`}>
                            {task.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-1"
                            onClick={() => handleViewTask(task)}
                            title="View Task"
                          >
                            <FaEye />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-warning me-1"
                            onClick={() => handleEditTask(task)}
                            title="Edit Task"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteTask(task._id)}
                            title="Delete Task"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {viewDriver && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Driver Details</h5>
                <button type="button" className="btn-close" onClick={closeViewModal}></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-4">
                  {viewDriver.profileImage ? (
                    <img
                      src={`http://localhost:5000/${viewDriver.profileImage}`}
                      alt="Profile"
                      className="rounded-circle border"
                      style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    />
                  ) : (
                    <FaUserCircle size={150} className="text-secondary" />
                  )}
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Name:</strong> {`${viewDriver.firstName} ${viewDriver.lastName}`}</p>
                    <p><strong>Email:</strong> {viewDriver.email}</p>
                    <p><strong>Phone:</strong> {viewDriver.phoneNumber}</p>
                    <p><strong>Date of Birth:</strong> {viewDriver.dateOfBirth ? new Date(viewDriver.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Vehicle Number:</strong> {viewDriver.vehicleNumber || 'N/A'}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>License Number:</strong> {viewDriver.licenseNumber}</p>
                    <p><strong>License Expiry:</strong> {viewDriver.licenseExpiry ? new Date(viewDriver.licenseExpiry).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Address:</strong> {viewDriver.address || 'N/A'}</p>
                    <p><strong>City:</strong> {viewDriver.city || 'N/A'}, {viewDriver.state || 'N/A'} {viewDriver.zipCode || ''}</p>
                    <p><strong>Status:</strong> {viewDriver.employmentStatus}</p>
                  </div>
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

      {viewTask && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Task Details</h5>
                <button type="button" className="btn-close" onClick={closeTaskViewModal}></button>
              </div>
              <div className="modal-body">
                <p><strong>Cargo Type:</strong> {viewTask.cargoType}</p>
                <p><strong>Weight:</strong> {viewTask.weight} kg</p>
                <p><strong>Pickup:</strong> {viewTask.pickup}</p>
                <p><strong>Delivery:</strong> {viewTask.delivery}</p>
                <p><strong>Vehicle:</strong> {viewTask.vehicle}</p>
                <p><strong>Expected Delivery:</strong> {new Date(viewTask.expectedDelivery).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {viewTask.status}</p>
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

      {showReportModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Generate Task Report</h5>
                <button type="button" className="btn-close" onClick={closeReportModal}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Date Range</label>
                    <select className="form-control" value={dateRange} onChange={handleDateRangeChange}>
                      <option value="7">Last 7 Days</option>
                      <option value="30">Last 30 Days</option>
                      <option value="90">Last 90 Days</option>
                      <option value="all">All Time</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Task Status</label>
                    <select
                      className="form-control"
                      multiple
                      value={selectedStatuses}
                      onChange={handleStatusChange}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <button
                  className="btn btn-primary mb-3"
                  onClick={fetchReportData}
                  disabled={isLoading}
                >
                  <FaFilter className="me-1" /> {isLoading ? 'Filtering...' : 'Apply Filters'}
                </button>
                {reportData.length > 0 && (
                  <>
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Task Number</th>
                          <th>Cargo Type</th>
                          <th>Pickup</th>
                          <th>Delivery</th>
                          <th>Expected Delivery</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.map((item) => (
                          <tr key={item._id}>
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
                    <div className="d-flex justify-content-end">
                      <button className="btn btn-success me-2" onClick={generateCSV}>
                        <FaFileDownload className="me-1" /> Download CSV
                      </button>
                      <button className="btn btn-danger" onClick={generatePDF}>
                        <FaFileDownload className="me-1" /> Download PDF
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