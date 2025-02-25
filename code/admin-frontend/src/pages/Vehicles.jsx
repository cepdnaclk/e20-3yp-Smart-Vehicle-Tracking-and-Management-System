import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCar, FaIdCard, FaUserAlt, FaCalendarAlt, FaMapMarkerAlt, FaTags } from 'react-icons/fa';

function Vehicles() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
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

  // Fetch vehicles on component mount
  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchVehicles = async () => {
      try {
        setIsLoading(true);
        // Mock data - replace with actual API call
        const mockVehicles = [
          {
            id: '1',
            vehicleName: 'Delivery Van 1',
            licensePlate: 'ABC-1234',
            vehicleType: 'van',
            make: 'Toyota',
            model: 'HiAce',
            status: 'active',
            lastLocation: 'New York, NY',
            driverName: 'John Doe'
          },
          {
            id: '2',
            vehicleName: 'Service Truck 2',
            licensePlate: 'XYZ-5678',
            vehicleType: 'truck',
            make: 'Ford',
            model: 'F-150',
            status: 'inactive',
            lastLocation: 'Boston, MA',
            driverName: 'Jane Smith'
          }
        ];
        
        setVehicles(mockVehicles);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        toast.error('Failed to load vehicles');
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
      
      // TODO: Replace with actual API call
      console.log('Submitting vehicle data:', formData);
      
      // Mock successful registration
      setTimeout(() => {
        // Add new vehicle to the list (in a real app, you'd get the ID from the API)
        const newVehicle = {
          id: Date.now().toString(),
          ...formData,
          status: 'active',
          lastLocation: 'Not tracked yet'
        };
        
        setVehicles([...vehicles, newVehicle]);
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
        setIsLoading(false);
        toast.success('Vehicle registered successfully!');
      }, 1000);
      
    } catch (error) {
      console.error('Error registering vehicle:', error);
      toast.error('Failed to register vehicle');
      setIsLoading(false);
    }
  };

  const handleViewDetails = (vehicleId) => {
    navigate(`/vehicles/${vehicleId}`);
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1><FaCar className="me-2" />Vehicle Management</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add New Vehicle'}
        </button>
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
                    <tr key={vehicle.id}>
                      <td>{vehicle.vehicleName}</td>
                      <td>{vehicle.licensePlate}</td>
                      <td>{vehicle.vehicleType}</td>
                      <td>{`${vehicle.make} ${vehicle.model}`}</td>
                      <td>
                        <span className={`badge ${vehicle.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                          {vehicle.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{vehicle.lastLocation}</td>
                      <td>{vehicle.driverName}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button 
                            className="btn btn-primary" 
                            onClick={() => handleViewDetails(vehicle.id)}
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

export default Vehicles;