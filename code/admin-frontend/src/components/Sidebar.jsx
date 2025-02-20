import { Map, Truck, Users, AlertTriangle, Settings, LogOut } from 'lucide-react';
import {Link} from 'react-router-dom';


const Sidebar = ({ handleLogout }) => (
  <div className="position-fixed h-100 bg-white border-end" style={{ width: '250px', left: 0, top: 0, zIndex: 1000 }}>
    <div className="p-4">
      <h4 className="mb-4">Cargo manager</h4>
      <div className="nav flex-column">
        <Link to="/dashboard" className="nav-link active d-flex align-items-center mb-2">
          <Map className="me-2" />
          Dashboard
        </Link>
        <Link to="/vehicles" className="nav-link text-dark d-flex align-items-center mb-2">
          <Truck className="me-2" />
          Vehicles
        </Link>
        <Link to="/drivers" className="nav-link text-dark d-flex align-items-center mb-2">
          <Users className="me-2" />
          Drivers
        </Link>
        <Link to="/alerts" className="nav-link text-dark d-flex align-items-center mb-2">
          <AlertTriangle className="me-2" />
          Alerts
        </Link>
        <Link to="/settings" className="nav-link text-dark d-flex align-items-center mb-2">
          <Settings className="me-2" />
          Settings
        </Link>
      </div>
    </div>
    <div className="position-absolute bottom-0 w-100 p-4">
      <button
        onClick={handleLogout}
        className="btn btn-light d-flex align-items-center w-100"
      >
        <LogOut className="me-2" />
        Logout
      </button>
    </div>
  </div>
);

export default Sidebar;