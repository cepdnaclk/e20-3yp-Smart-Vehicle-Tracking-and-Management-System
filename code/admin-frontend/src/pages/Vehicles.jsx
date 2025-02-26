import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCar, FaIdCard, FaUserAlt, FaCalendarAlt, FaMapMarkerAlt, FaTags,FaArrowLeft  } from 'react-icons/fa';
import axios from 'axios';
import VehicleDetailsModal from "../components/VehicleDetailsModal";

function Vehicles() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    vehicleName: '',
    licensePlate: '',
    vehicleType: 'car',
    make: '',
    model: '',
    year: '',
    vin: '',
    color: '',
    fuelType: 'gasoline',
    assignedDriver: '',
    deviceId: '',
    trackingEnabled: true,
    sensorEnabled: true,
    occupancyDetectionEnabled: true,
    notes: ''
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
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      // Add default data for fields not provided by the user
      const payload = {
        ...formData,
        status: 'active', // Default status
        lastLocation: 'Not tracked yet', // Default location
      };

      // Submit the form data to the backend
      const response = await axios.post('http://localhost:5000/api/vehicles', payload);

      // Add the new vehicle to the list
      setVehicles([...vehicles, response.data]);

      // Reset the form
      setFormData({
        vehicleName: '',
        licensePlate: '',
        vehicleType: 'car',
        make: '',
        model: '',
        year: '',
        vin: '',
        color: '',
        fuelType: 'gasoline',
        assignedDriver: '',
        deviceId: '',
        trackingEnabled: true,
        sensorEnabled: true,
        occupancyDetectionEnabled: true,
        notes: ''
      });

      setShowForm(false);
      toast.success('Vehicle registered successfully!');
    } catch (error) {
      console.error('Error registering vehicle:', error);
      toast.error(error.response?.data?.message || 'Failed to register vehicle');
    } finally {
      setIsLoading(false);
    }
  };

  // handel delete vehicle

  const handleDelete = async (vehicleId) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/vehicles/${vehicleId}`, {
          method: "DELETE",
        });
  
        if (!response.ok) {
          throw new Error("Failed to delete vehicle");
        }
  
        // Update the state to remove the deleted vehicle from the UI
        setVehicles((prevVehicles) => prevVehicles.filter((v) => v._id !== vehicleId));
  
        alert("Vehicle deleted successfully");
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        alert("Error deleting vehicle. Please try again.");
      }
    }
  };
  


  // handel view vehicle

  const handleViewDetails = (vehicleId) => {
    navigate(`/vehicles/${vehicleId}`);
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  // speed data for the vehicle details modal
  const speedData = [
    { time: "00:00", speed: 45 },
    { time: "04:00", speed: 55 },
    { time: "08:00", speed: 65 },
    { time: "12:00", speed: 60 },
    { time: "16:00", speed: 70 },
    { time: "20:00", speed: 50 },
  ];

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1><FaCar className="me-2" />Vehicle Management</h1>
        <div>
          <button
            className="btn btn-secondary me-2"
            onClick={handleGoToDashboard}
          >
          <FaArrowLeft className="me-2" />
            Back to Dashboard
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Add New Vehicle'}
          </button>
        </div>
      </div>

      {/* Registration Form */}
      {showForm && (
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Register New Vehicle</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                {/* Basic Info */}
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
                </div>

                {/* Additional Info */}
                <div className="col-md-6">
                  <h6 className="mb-3">Tracking & Monitoring Setup</h6>

                  <div className="mb-3">
                    <label className="form-label">VIN Number</label>
                    <input
                      type="text"
                      className="form-control"
                      name="vin"
                      value={formData.vin}
                      onChange={handleInputChange}
                      placeholder="Vehicle Identification Number"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Fuel Type</label>
                    <select
                      className="form-select"
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleInputChange}
                    >
                      <option value="gasoline">Gasoline</option>
                      <option value="diesel">Diesel</option>
                      <option value="electric">Electric</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="cng">CNG</option>
                      <option value="lpg">LPG</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Assigned Driver</label>
                    <div className="input-group">
                      <span className="input-group-text"><FaUserAlt /></span>
                      <input
                        type="text"
                        className="form-control"
                        name="assignedDriver"
                        value={formData.assignedDriver}
                        onChange={handleInputChange}
                        placeholder="Name of assigned driver"
                      />
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

                  <div className="mb-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="sensorEnabled"
                        checked={formData.sensorEnabled}
                        onChange={handleInputChange}
                        id="sensorEnabled"
                      />
                      <label className="form-check-label" htmlFor="sensorEnabled">
                        Enable Accident/Tamper Detection
                      </label>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="occupancyDetectionEnabled"
                        checked={formData.occupancyDetectionEnabled}
                        onChange={handleInputChange}
                        id="occupancyDetectionEnabled"
                      />
                      <label className="form-check-label" htmlFor="occupancyDetectionEnabled">
                        Enable Human Occupancy Detection
                      </label>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="col-12">
                  <div className="mb-3">
                    <label className="form-label">Additional Notes</label>
                    <textarea
                      className="form-control"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Any additional information about the vehicle"
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
                  {isLoading ? 'Registering...' : 'Register Vehicle'}
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
                    <th>Make & Model</th>
                    <th>Status</th>
                    <th>Last Location</th>
                    <th>Driver</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle._id}>
                      <td>{vehicle.vehicleName}</td>
                      <td>{vehicle.licensePlate}</td>
                      <td>{vehicle.vehicleType}</td>
                      <td>{`${vehicle.make} ${vehicle.model}`}</td>
                      <td>
                        <span className={`badge ${vehicle.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                          {vehicle.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setShowVehicleDetails(true);
                          }}
                        >
                          View
                        </button>
                      </td>
                      <td>{vehicle.assignedDriver}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-success"
                            onClick={() => handleViewDetails(vehicle._id)}
                          >
                            View
                          </button>
                          <button className="btn btn-outline-secondary">Edit</button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDelete(vehicle._id)}
                          >
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
      {/* Vehicle Details Modal */}
      {showVehicleDetails && selectedVehicle && (
        <VehicleDetailsModal
          vehicle={selectedVehicle}
          onClose={() => setShowVehicleDetails(false)}
          speedData={speedData}
        />
      )}
    </div>
  );
}

export default Vehicles;