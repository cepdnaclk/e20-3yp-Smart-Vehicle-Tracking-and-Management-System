import { User, Battery, Fuel, Clock, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const VehicleDetailsModal = ({ vehicle, onClose, speedData }) => (
  <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Vehicle Details: {vehicle.number}</h5>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>
        <div className="modal-body">
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <div className="mb-3">
                    <User className="me-2 text-primary" />
                    <span className="fw-medium">Driver: {vehicle.driver}</span>
                  </div>
                  <div className="mb-3">
                    <Battery className="me-2 text-success" />
                    <span>Battery: {vehicle.battery}%</span>
                  </div>
                  <div>
                    <Fuel className="me-2 text-warning" />
                    <span>Fuel Level: {vehicle.fuel}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <div className="mb-3">
                    <Clock className="me-2 text-purple" />
                    <span>Last Maintenance: {vehicle.lastMaintenance}</span>
                  </div>
                  <div className="mb-3">
                    <Info className="me-2 text-primary" />
                    <span>Engine Status: {vehicle.engineStatus}</span>
                  </div>
                  <div>
                    <User className="me-2 text-success" />
                    <span>Occupancy: {vehicle.occupancy ? 'Occupied' : 'Empty'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h5 className="mb-3">Speed History</h5>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={speedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="speed" stroke="#0d6efd" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Live Location</h5>
              <div className="bg-light rounded p-4 text-center" style={{ height: '300px' }}>
                <span className="text-muted">Map showing vehicle at {vehicle.location.lat}, {vehicle.location.lng}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default VehicleDetailsModal;