import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaIdCard, FaPhone, FaEnvelope, FaCalendarAlt, FaMapMarkerAlt, FaCar, FaFileAlt, FaCamera, FaUserCircle, FaChartLine, FaFileUpload, FaCheck, FaTimes, FaUserEdit, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Drivers = () => {
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phoneNumber: '',
    email: '',
    licenseNumber: '',
    licenseExpiry: '',
    licenseImage: null,
    address: '',
    city: '',
    state: '',
    zipCode: '',
    employmentStatus: 'active',
    joiningDate: '',
    emergencyContact: '',
    emergencyPhone: '',
    driverNotes: '',
    profileImage: null,
  });
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDriverReport, setShowDriverReport] = useState(false);
  const [driverReport, setDriverReport] = useState({
    safetyScore: 85,
    totalTrips: 120,
    totalDistance: 15000,
    fuelEfficiency: 25,
    vehiclesAssigned: [],
    incidents: [],
    tripHistory: [],
  });

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleTriggerFileInput = (ref) => {
    ref.current.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success(isEditMode ? 'Driver updated successfully!' : 'Driver registered successfully!');
      setShowForm(false);
      resetForm();
    }, 2000);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      phoneNumber: '',
      email: '',
      licenseNumber: '',
      licenseExpiry: '',
      licenseImage: null,
      address: '',
      city: '',
      state: '',
      zipCode: '',
      employmentStatus: 'active',
      joiningDate: '',
      emergencyContact: '',
      emergencyPhone: '',
      driverNotes: '',
      profileImage: null,
    });
    setIsEditMode(false);
  };

  const handleEditDriver = (driver) => {
    setFormData(driver);
    setIsEditMode(true);
    setShowForm(true);
  };

  const handleViewReport = (driver) => {
    setSelectedDriver(driver);
    setShowDriverReport(true);
  };

  useEffect(() => {
    // Fetch drivers from API
    setIsLoading(true);
    setTimeout(() => {
      setDrivers([
        // Sample data
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '555-123-4567',
          email: 'john.doe@example.com',
          licenseNumber: 'DL-123456789',
          employmentStatus: 'active',
          profileImage: null,
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1><FaUser className="me-2" />Driver Management</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
        >
          {showForm ? 'Cancel' : 'Add New Driver'}
        </button>
      </div>

      {/* Driver Registration Form */}
      {showForm && (
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">{isEditMode ? 'Edit Driver' : 'Register New Driver'}</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                {/* Personal Info */}
                <div className="col-md-4">
                  <h6 className="mb-3">Personal Information</h6>
                  
                  <div className="mb-4 text-center">
                    <div 
                      className="position-relative d-inline-block"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleTriggerFileInput(fileInputRef)}
                    >
                      {formData.profileImage ? (
                        <img 
                          src={URL.createObjectURL(formData.profileImage)} 
                          alt="Profile preview" 
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
                      ref={fileInputRef}
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
                <div className="col-md-4">
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
                    <label className="form-label">License Image</label>
                    <div className="input-group">
                      <span className="input-group-text"><FaFileUpload /></span>
                      <input
                        type="file"
                        className="form-control"
                        name="licenseImage"
                        onChange={handleInputChange}
                        accept="image/*"
                      />
                    </div>
                    <small className="text-muted">Upload a scan of the driver's license</small>
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
                
                {/* Employment Info */}
                <div className="col-md-4">
                  <h6 className="mb-3">Employment & Emergency Information</h6>
                  
                  <div className="mb-3">
                    <label className="form-label">Employment Status</label>
                    <select
                      className="form-select"
                      name="employmentStatus"
                      value={formData.employmentStatus}
                      onChange={handleInputChange}
                    >
                      <option value="active">Active</option>
                      <option value="onLeave">On Leave</option>
                      <option value="suspended">Suspended</option>
                      <option value="terminated">Terminated</option>
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
                  
                  <div className="mb-3">
                    <label className="form-label">Emergency Contact Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      placeholder="Name of emergency contact"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Emergency Contact Phone</label>
                    <div className="input-group">
                      <span className="input-group-text"><FaPhone /></span>
                      <input
                        type="tel"
                        className="form-control"
                        name="emergencyPhone"
                        value={formData.emergencyPhone}
                        onChange={handleInputChange}
                        placeholder="e.g., 555-123-4567"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Additional Notes</label>
                    <textarea
                      className="form-control"
                      name="driverNotes"
                      value={formData.driverNotes}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Any additional information about the driver"
                    ></textarea>
                  </div>
                </div>
              </div>
              
              <div className="d-flex justify-content-end gap-2 mt-3">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-success" 
                  disabled={isLoading}
                >
                  {isLoading ? 
                    (isEditMode ? 'Updating...' : 'Registering...') : 
                    (isEditMode ? 'Update Driver' : 'Register Driver')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Driver Report Modal */}
      {showDriverReport && selectedDriver && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <FaFileAlt className="me-2" />
                  Driver Performance Report: {selectedDriver.firstName} {selectedDriver.lastName}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowDriverReport(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-3 text-center">
                    <img
                      src={selectedDriver.profileImage}
                      alt={`${selectedDriver.firstName} ${selectedDriver.lastName}`}
                      className="rounded-circle img-thumbnail mb-2"
                      style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                    />
                    <h5>{selectedDriver.firstName} {selectedDriver.lastName}</h5>
                    <p className="text-muted mb-1">ID: {selectedDriver.id}</p>
                    <p className="text-muted mb-0">License: {selectedDriver.licenseNumber}</p>
                  </div>
                  <div className="col-md-9">
                    <div className="row g-3">
                      <div className="col-md-3">
                        <div className="card border-0 bg-light h-100">
                          <div className="card-body text-center">
                            <h6 className="text-muted mb-2">Safety Score</h6>
                            <div className={`display-5 mb-0 ${driverReport.safetyScore >= 90 ? 'text-success' : driverReport.safetyScore >= 80 ? 'text-warning' : 'text-danger'}`}>
                              {driverReport.safetyScore}/100
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card border-0 bg-light h-100">
                          <div className="card-body text-center">
                            <h6 className="text-muted mb-2">Total Trips</h6>
                            <div className="display-5 mb-0">{driverReport.totalTrips}</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card border-0 bg-light h-100">
                          <div className="card-body text-center">
                            <h6 className="text-muted mb-2">Total Distance</h6>
                            <div className="display-5 mb-0">{driverReport.totalDistance.toLocaleString()}</div>
                            <small className="text-muted">miles</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card border-0 bg-light h-100">
                          <div className="card-body text-center">
                            <h6 className="text-muted mb-2">Fuel Efficiency</h6>
                            <div className="display-5 mb-0">{driverReport.fuelEfficiency}</div>
                            <small className="text-muted">mpg</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vehicle Assignment History */}
                <h5 className="mb-3"><FaCar className="me-2" />Vehicle Assignment History</h5>
                <div className="table-responsive mb-4">
                  <table className="table table-bordered table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Vehicle</th>
                        <th>Assigned Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {driverReport.vehiclesAssigned.map((vehicle, idx) => (
                        <tr key={idx}>
                          <td>{vehicle.name}</td>
                          <td>{vehicle.assignedDate}</td>
                          <td>{vehicle.endDate || '-'}</td>
                          <td>
                            <span className={`badge ${vehicle.status === 'current' ? 'bg-success' : 'bg-secondary'}`}>
                              {vehicle.status === 'current' ? 'Current' : 'Past'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Incident History */}
                <h5 className="mb-3"><FaExclamationTriangle className="me-2" />Incident History</h5>
                {driverReport.incidents.length === 0 ? (
                  <div className="alert alert-success mb-4">
                    <FaCheck className="me-2" /> No incidents reported for this driver
                  </div>
                ) : (
                  <div className="table-responsive mb-4">
                    <table className="table table-bordered table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Date</th>
                          <th>Type</th>
                          <th>Details</th>
                          <th>Severity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {driverReport.incidents.map((incident, idx) => (
                          <tr key={idx}>
                            <td>{incident.date}</td>
                            <td>{incident.type}</td>
                            <td>{incident.details}</td>
                            <td>
                              <span className={`badge ${
                                incident.severity === 'severe' ? 'bg-danger' : 
                                incident.severity === 'moderate' ? 'bg-warning' : 
                                'bg-info'
                              }`}>
                                {incident.severity}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Recent Trip History */}
                <h5 className="mb-3"><FaChartLine className="me-2" />Recent Trip History</h5>
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Vehicle</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Distance (mi)</th>
                        <th>Fuel Used (gal)</th>
                        <th>Incidents</th>
                      </tr>
                    </thead>
                    <tbody>
                      {driverReport.tripHistory.map((trip, idx) => (
                        <tr key={idx}>
                          <td>{trip.date}</td>
                          <td>{trip.vehicle}</td>
                          <td>{trip.startTime}</td>
                          <td>{trip.endTime}</td>
                          <td>{trip.distance}</td>
                          <td>{trip.fuelUsed}</td>
                          <td>
                            {trip.incidents === 0 ? 
                              <span className="text-success"><FaCheck /> None</span> : 
                              <span className="text-danger">{trip.incidents}</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => window.print()}
                >
                  <FaFileAlt className="me-1" /> Print Report
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowDriverReport(false)}
                >
                  Close
                </button>
              </div>
            </div>
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
              <table className="table table-bordered table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>License</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Employment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map(driver => (
                    <tr key={driver.id}>
                      <td>{driver.firstName} {driver.lastName}</td>
                      <td>{driver.licenseNumber}</td>
                      <td>{driver.phoneNumber}</td>
                      <td>{driver.email}</td>
                      <td>
                        <span className={`badge ${driver.employmentStatus === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                          {driver.employmentStatus === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => handleEditDriver(driver)}
                        >
                          <FaUserEdit className="me-1" /> Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-info me-2"
                          onClick={() => handleViewReport(driver)}
                        >
                          <FaChartLine className="me-1" /> Report
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
    </div>
  );
};

export default Drivers;