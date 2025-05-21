import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Maximize2, Minimize2, Layers, Truck, AlertTriangle } from 'lucide-react';
import { Button, Dropdown } from 'react-bootstrap';
import LeafletMap from './LeafletMap';

const MapContainer = ({ vehicles = [], alerts = [] }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapType, setMapType] = useState('standard');
  
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const element = document.getElementById('map-container');
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };
  
  // Track fullscreen changes from Escape key or F11
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <motion.div 
      className="card shadow-sm border-0 mb-4 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      id="map-container"
    >
      <div className="card-header bg-white d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <MapPin size={18} className="me-2 text-primary" />
          <h5 className="mb-0">Live Vehicle Tracking</h5>
        </div>
        <div className="d-flex gap-2">
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" size="sm" id="map-type-dropdown">
              <Layers size={16} className="me-1" />
              {mapType === 'standard' ? 'Standard' : mapType === 'satellite' ? 'Satellite' : 'Terrain'}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setMapType('standard')}>Standard</Dropdown.Item>
              <Dropdown.Item onClick={() => setMapType('satellite')}>Satellite</Dropdown.Item>
              <Dropdown.Item onClick={() => setMapType('terrain')}>Terrain</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" size="sm" id="map-filter-dropdown">
              <Truck size={16} className="me-1" />
              Display Filters
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" defaultChecked id="showActiveVehicles" />
                  <label className="form-check-label" htmlFor="showActiveVehicles">
                    Active Vehicles
                  </label>
                </div>
              </Dropdown.Item>
              <Dropdown.Item>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" defaultChecked id="showInactiveVehicles" />
                  <label className="form-check-label" htmlFor="showInactiveVehicles">
                    Inactive Vehicles
                  </label>
                </div>
              </Dropdown.Item>
              <Dropdown.Item>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" defaultChecked id="showAlerts" />
                  <label className="form-check-label" htmlFor="showAlerts">
                    Alert Locations
                  </label>
                </div>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          
          <Button variant="outline-primary" size="sm" onClick={() => window.location.reload()}>
            Refresh
          </Button>
          
          <Button variant="primary" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            {isFullscreen ? ' Exit Fullscreen' : ' Fullscreen'}
          </Button>
        </div>
      </div>
      <div className="card-body p-0" style={{ height: isFullscreen ? '100vh' : '400px' }}>
        <LeafletMap mapType={mapType} />
        
        {/* Vehicle and alert count indicators */}
        <div className="position-absolute bottom-0 start-0 m-3 d-flex gap-2">
          <div className="bg-white rounded shadow-sm p-2 d-flex align-items-center">
            <Truck size={16} className="text-primary me-2" />
            <span className="fw-medium">
              {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {alerts.length > 0 && (
            <div className="bg-white rounded shadow-sm p-2 d-flex align-items-center">
              <AlertTriangle size={16} className="text-danger me-2" />
              <span className="fw-medium">
                {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MapContainer;
