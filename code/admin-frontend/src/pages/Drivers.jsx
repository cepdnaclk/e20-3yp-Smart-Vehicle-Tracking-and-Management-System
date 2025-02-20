import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Drivers() {
  const [driverName, setDriverName] = useState('');
  const [license, setLicense] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: implement registration logic
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-3">Drivers</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Driver Name:</label>
          <input
            type="text"
            className="form-control"
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">License:</label>
          <input
            type="text"
            className="form-control"
            value={license}
            onChange={(e) => setLicense(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">Register Driver</button>
      </form>
    </div>
  );
}

export default Drivers;