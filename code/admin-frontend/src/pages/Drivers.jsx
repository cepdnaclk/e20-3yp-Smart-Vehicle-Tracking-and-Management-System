import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaIdCard, FaPhone, FaEnvelope, FaCalendarAlt, FaMapMarkerAlt, FaCamera, FaUserCircle, FaArrowLeft, FaTasks, FaBox, FaWeightHanging, FaTrash } from 'react-icons/fa';
import axios from 'axios';

function Drivers() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showTaskView, setShowTaskView] = useState(false);
  const [showAssignTaskForm, setShowAssignTaskForm] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [editDriver, setEditDriver] = useState(null);
  const [viewDriver, setViewDriver] = useState(null);

  // Driver registration/edit form state
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

  // Assign task form state
  const [taskFormData, setTaskFormData] = useState({
    cargoType: '',
    weight: '',
    pickup: '',
    delivery: '',
    expectedDelivery: '',
  });

  // Fetch drivers from the backend
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

  // Fetch tasks for a specific driver
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

      // Create FormData for file uploads
      const payload = new FormData();
      for (const key in formData) {
        if (formData[key]) {
          payload.append(key, formData[key]);
        }
      }

      let response;
      if (editDriver) {
        // Update existing driver
        response = await axios.put(`http://localhost:5000/api/drivers/${editDriver._id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setDrivers(drivers.map((d) => (d._id === editDriver._id ? response.data : d)));
        toast.success('Driver updated successfully!');
      } else {
        // Create new driver
        response = await axios.post('http://localhost:5000/api/drivers', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setDrivers([...drivers, response.data]);
        toast.success('Driver registered successfully!');
      }

      // Reset form
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
      const response = await axios.post(`http://localhost:5000/api/drivers/${selectedDriverId}/tasks`, taskFormData);
      setTasks([...tasks, response.data]);
      setTaskFormData({
        cargoType: '',
        weight: '',
        pickup: '',
        delivery: '',
        expectedDelivery: '',
      });
      setShowAssignTaskForm(false);
      toast.success('Task assigned successfully!');
    } catch (error) {
      console.error('Error assigning task:', error);
      toast.error(error.response?.data?.message || 'Failed to assign task');
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
    setShowAssignTaskForm(true);
  };

  const closeViewModal = () => {
    setViewDriver(null);
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

          {/* Registration/Edit Form */}
          {showForm && (
            <div className="card mb-4 shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">{editDriver ? 'Edit Driver' : 'Register New Driver'}</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {/* Personal Info */}
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
                    {/* License & Address */}
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

          {/* Driver List */}
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
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Registered Number</th>
                        <th>Employment</th>
                        <th>Actions</th>
                        <th>Assign Task</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drivers.map((driver, index) => (
                        <tr key={driver._id}>
                          <td>{driver.firstName} {driver.lastName}</td>
                          <td>{driver.phoneNumber}</td>
                          <td>DR{String(index + 1).padStart(4, '0')}</td>
                          <td>
                            <span className={`badge ${driver.employmentStatus === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                              {driver.employmentStatus === 'active' ? 'Active' : driver.employmentStatus}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button className="btn btn-primary" onClick={() => handleViewDetails(driver)}>
                                View
                              </button>
                              <button className="btn btn-outline-secondary" onClick={() => handleEdit(driver)}>
                                Edit
                              </button>
                              <button className="btn btn-danger" onClick={() => handleDeleteDriver(driver._id)}>
                                Delete
                              </button>
                            </div>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleAssignTask(driver._id)}
                            >
                              <FaTasks className="me-1" /> Assign
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* View Driver Modal */}
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
                            <th>Task Number</th>
                            <th>Cargo Type</th>
                            <th>Weight (kg)</th>
                            <th>Pickup</th>
                            <th>Delivery</th>
                            <th>Expected Delivery</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tasks.map((task, index) => (
                            <tr key={task._id}>
                              <td>TSK{String(index + 1).padStart(4, '0')}</td>
                              <td>{task.cargoType}</td>
                              <td>{task.weight}</td>
                              <td>{task.pickup}</td>
                              <td>{task.delivery}</td>
                              <td>{new Date(task.expectedDelivery).toLocaleDateString()}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleDeleteTask(task._id)}
                                >
                                  <FaTrash className="me-1" /> Delete
                                </button>
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
                <h5 className="mb-0">Assign New Task</h5>
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
                          <span className="input-group-text"><FaWeightHanging /></span>
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
                      {isLoading ? 'Assigning...' : 'Assign Task'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Drivers;