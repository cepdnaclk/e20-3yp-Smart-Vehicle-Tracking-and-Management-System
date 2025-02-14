import React from 'react';
import { AlertTriangle } from 'lucide-react';

const AlertCard = ({ alert }) => (
  <div className="card mb-3">
    <div className="card-body d-flex justify-content-between align-items-center">
      <div className="d-flex align-items-center">
        <AlertTriangle className="text-danger me-3" />
        <div>
          <p className="mb-1 fw-medium">{alert.type} Alert</p>
          <p className="mb-1 small text-muted">{alert.vehicle}</p>
          <p className="mb-0 small text-muted">{alert.location}</p>
        </div>
      </div>
      <span className="text-muted">{alert.time}</span>
    </div>
  </div>
);

export default AlertCard;