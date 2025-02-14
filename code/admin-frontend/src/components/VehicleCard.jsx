import React from 'react';
import { Truck } from 'lucide-react';

const VehicleCard = ({ vehicle, onClick }) => (
  <div className="card mb-3 cursor-pointer" onClick={onClick} style={{ marginBottom: '10px' }}>
    <div className="card-body d-flex justify-content-between align-items-center">
      <div className="d-flex align-items-center">
        <Truck className="text-primary me-3" />
        <div>
          <p className="mb-1 fw-medium">{vehicle.number}</p>
          <p className="mb-1 small text-muted">{vehicle.driver}</p>
          <p className="mb-0 small text-muted">Speed: {vehicle.speed} km/h</p>
        </div>
      </div>
      <div className="text-end">
        <span className={`badge ${vehicle.status === 'Moving' ? 'bg-success' : 'bg-warning'}`}>
          {vehicle.status}
        </span>
        <div className="mt-2 small text-muted">
          <div>Fuel: {vehicle.fuel}%</div>
          <div>Battery: {vehicle.battery}%</div>
        </div>
      </div>
    </div>
  </div>
);

export default VehicleCard;