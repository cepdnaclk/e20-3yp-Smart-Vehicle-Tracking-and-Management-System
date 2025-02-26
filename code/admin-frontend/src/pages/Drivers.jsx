import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaIdCard, FaPhone, FaEnvelope, FaCalendarAlt, FaMapMarkerAlt, FaCar, FaFileAlt, FaCamera, FaUserCircle, FaChartLine, FaFileUpload, FaCheck, FaTimes, FaUserEdit, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';

function Drivers() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Form state
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

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'file' ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      // Create FormData for file uploads
      const payload = new FormData();
      for (const key in formData) {
        payload.append(key, formData[key]);
      }

      // Submit the form data to the backend
      const response = await axios.post('http://localhost:5000/api/drivers', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Add the new driver to the list
      setDrivers([...drivers, response.data]);

      // Reset the form
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

      setShowForm(false);
      toast.success('Driver registered successfully!');
    } catch (error) {
      console.error('Error registering driver:', error);
      toast.error(error.response?.data?.message || 'Failed to register driver');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (driverId) => {
    navigate(`/drivers/${driverId}`);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1><FaUser className="me-2" />Driver Management</h1>
        <div>
          <button
            className="btn btn-secondary me-2"
            onClick={handleBackToDashboard}
          >
            <FaArrowLeft className="me-1" /> Back to Dashboard
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Add New Driver'}
          </button>
        </div>
      </div>

      {/* Registration Form */}
      {showForm && (
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Register New Driver</h5>
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
                      onClick={() => document.getElementById('profileImage').click()}
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
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={isLoading}
                >
                  {isLoading ? 'Registering...' : 'Register Driver'}
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
                    <th>License</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Employment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((driver) => (
                    <tr key={driver._id}>
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
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-primary"
                            onClick={() => handleViewDetails(driver._id)}
                          >
                            View
                          </button>
                          <button className="btn btn-outline-secondary">Edit</button>
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
    </div>
  );
}

export default Drivers;