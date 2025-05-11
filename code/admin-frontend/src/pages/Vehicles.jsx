import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCar, FaIdCard, FaCalendarAlt, FaMapMarkerAlt, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';

function Vehicles() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [viewVehicle, setViewVehicle] = useState(null);

  // Form state for adding/editing vehicles
  const [formData, setFormData] = useState({
    vehicleName: '',
    licensePlate: '',
    vehicleType: 'car',
    make: '',
    model: '',
    year: '',
    color: '',
    deviceId: '',
    trackingEnabled: true,
  });

  // Fetch vehicles from the backend
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:5000/api/vehicles');
        setVehicles(response.data);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        toast.error(error.response?.data?.message || 'Failed to load vehicles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const payload = {
        ...formData,
        status: 'active', // Default status
        lastLocation: 'Not tracked yet', // Default location
      };

      let response;
      if (editVehicle) {
        // Update existing vehicle
        response = await axios.put(`http://localhost:5000/api/vehicles/${editVehicle._id}`, payload);
        setVehicles(vehicles.map((v) => (v._id === editVehicle._id ? response.data : v)));
        toast.success('Vehicle updated successfully!');
      } else {
        // Create new vehicle
        response = await axios.post('http://localhost:5000/api/vehicles', payload);
        setVehicles([...vehicles, response.data]);
        toast.success('Vehicle registered successfully!');
      }

      // Reset form
      setFormData({
        vehicleName: '',
        licensePlate: '',
        vehicleType: 'car',
        make: '',
        model: '',
        year: '',
        color: '',
        deviceId: '',
        trackingEnabled: true,
      });
      setShowForm(false);
      setEditVehicle(null);
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast.error(error.response?.data?.message || 'Failed to save vehicle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (vehicle) => {
    setViewVehicle(vehicle);
  };

  const handleEdit = (vehicle) => {
    setEditVehicle(vehicle);
    setFormData({
      vehicleName: vehicle.vehicleName,
      licensePlate: vehicle.licensePlate,
      vehicleType: vehicle.vehicleType,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year ? vehicle.year.toString() : '',
      color: vehicle.color,
      deviceId: vehicle.deviceId,
      trackingEnabled: vehicle.trackingEnabled,
    });
    setShowForm(true);
  };

  const handleDelete = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      if (window.confirm('Please confirm again to delete this vehicle.')) {
        try {
          await axios.delete(`http://localhost:5000/api/vehicles/${vehicleId}`);
          setVehicles(vehicles.filter((v) => v._id !== vehicleId));
          toast.success('Vehicle deleted successfully!');
        } catch (error) {
          console.error('Error deleting vehicle:', error);
          toast.error(error.response?.data?.message || 'Failed to delete vehicle');
        }
      }
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const closeViewModal = () => {
    setViewVehicle(null);
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1><FaCar className="me-2" />Vehicle Management</h1>
        <div>
          <button className="btn btn-secondary me-2" onClick={handleGoToDashboard}>
            <FaArrowLeft className="me-1" /> Back to Dashboard
          </button>
          <button className="btn btn-primary" onClick={() => {
            setEditVehicle(null);
            setFormData({
              vehicleName: '',
              licensePlate: '',
              vehicleType: 'car',
              make: '',
              model: '',
              year: '',
              color: '',
              deviceId: '',
              trackingEnabled: true,
            });
            setShowForm(!showForm);
          }}>
            {showForm ? 'Cancel' : 'Add New Vehicle'}
          </button>
        </div>
      </div>

      {/* Registration/Edit Form */}
      {showForm && (
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">{editVehicle ? 'Edit Vehicle' : 'Register New Vehicle'}</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <h6 className="mb-3">Basic Information</h6>
                  <div className="mb-3">
                    <label className="form-label">Vehicle Name/ID*</label>
                    <div className="input-group">
                      <span className="input-group-text"><FaCar /></span>
                      <input
                        type="text"
                        className="form-control"
                        name="vehicleName"
                        value={formData.vehicleName}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Delivery Van 1"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">License Plate*</label>
                    <div className="input-group">
                      <span className="input-group-text"><FaIdCard /></span>
                      <input
                        type="text"
                        className="form-control"
                        name="licensePlate"
                        value={formData.licensePlate}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., ABC-1234"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Vehicle Type</label>
                    <select
                      className="form-select"
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleInputChange}
                    >
                      <option value="car">Car</option>
                      <option value="truck">Truck</option>
                      <option value="van">Van</option>
                      <option value="bus">Bus</option>
                      <option value="motorcycle">Motorcycle</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Make</label>
                        <input
                          type="text"
                          className="form-control"
                          name="make"
                          value={formData.make}
                          onChange={handleInputChange}
                          placeholder="e.g., Toyota"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Model</label>
                        <input
                          type="text"
                          className="form-control"
                          name="model"
                          value={formData.model}
                          onChange={handleInputChange}
                          placeholder="e.g., Corolla"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <h6 className="mb-3">Additional Information</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Year</label>
                        <div className="input-group">
                          <span className="input-group-text"><FaCalendarAlt /></span>
                          <input
                            type="number"
                            className="form-control"
                            name="year"
                            value={formData.year}
                            onChange={handleInputChange}
                            placeholder="e.g., 2023"
                            min="1900"
                            max="2100"
                          />
                        </div>
                    </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Color</label>
                        <input
                          type="text"
                          className="form-control"
                          name="color"
                          value={formData.color}
                          onChange={handleInputChange}
                          placeholder="e.g., White"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tracking Device ID*</label>
                    <div className="input-group">
                      <span className="input-group-text"><FaMapMarkerAlt /></span>
                      <input
                        type="text"
                        className="form-control"
                        name="deviceId"
                        value={formData.deviceId}
                        onChange={handleInputChange}
                        required
                        placeholder="GPS/IoT device ID"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="trackingEnabled"
                        checked={formData.trackingEnabled}
                        onChange={handleInputChange}
                        id="trackingEnabled"
                      />
                      <label className="form-check-label" htmlFor="trackingEnabled">
                        Enable Real-time Tracking
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 mt-3">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditVehicle(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : editVehicle ? 'Update Vehicle' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vehicle List */}
      <div className="card shadow-sm">
        <div className="card-header bg-light">
          <h5 className="mb-0">Registered Vehicles</h5>
        </div>
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading vehicles...</p>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-4">
              <p className="mb-0">No vehicles registered yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Vehicle Name</th>
                    <th>License Plate</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Last Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle._id}>
                      <td>{vehicle.vehicleName}</td>
                      <td>{vehicle.licensePlate}</td>
                      <td>{vehicle.vehicleType}</td>
                      <td>
                        <span className={`badge ${vehicle.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                          {vehicle.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{vehicle.lastLocation}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-primary" onClick={() => handleViewDetails(vehicle)}>
                            View
                          </button>
                          <button className="btn btn-outline-secondary" onClick={() => handleEdit(vehicle)}>
                            Edit
                          </button>
                          <button className="btn btn-danger" onClick={() => handleDelete(vehicle._id)}>
                            Delete
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

      {/* View Vehicle Modal */}
      {viewVehicle && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Vehicle Details</h5>
                <button type="button" className="btn-close btn-close-white" onClick={closeViewModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>Vehicle Name/ID:</strong> {viewVehicle.vehicleName}
                </div>
                <div className="mb-3">
                  <strong>License Plate:</strong> {viewVehicle.licensePlate}
                </div>
                <div className="mb-3">
                  <strong>Vehicle Type:</strong> {viewVehicle.vehicleType}
                </div>
                <div className="mb-3">
                  <strong>Make:</strong> {viewVehicle.make}
                </div>
                <div className="mb-3">
                  <strong>Model:</strong> {viewVehicle.model}
                </div>
                <div className="mb-3">
                  <strong>Year:</strong> {viewVehicle.year || 'N/A'}
                </div>
                <div className="mb-3">
                  <strong>Color:</strong> {viewVehicle.color || 'N/A'}
                </div>
                <div className="mb-3">
                  <strong>Tracking Device ID:</strong> {viewVehicle.deviceId}
                </div>
                <div className="mb-3">
                  <strong>Real-time Tracking:</strong> {viewVehicle.trackingEnabled ? 'Enabled' : 'Disabled'}
                </div>
                <div className="mb-3">
                  <strong>Status:</strong> {viewVehicle.status === 'active' ? 'Active' : 'Inactive'}
                </div>
                <div className="mb-3">
                  <strong>Last Location:</strong> {viewVehicle.lastLocation}
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
    </div>
  );
}

export default Vehicles;