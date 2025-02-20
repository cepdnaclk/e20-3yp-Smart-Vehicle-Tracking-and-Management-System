import {useState} from 'react';
import {useNavigate} from 'react-router-dom';

function Vehicles() {
  const [vehicleName, setVehicleName] = useState('');
  const [license, setLicense] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className='container mt-4'>
      <h1 className='mb-3'>Vehicles</h1>
      <form onSubmit={handleSubmit}>
        <div className='mb-3'>
          <label className='form-label'>Vehicle Name:</label>
          <input
            type='text'
            className='form-control'
            value={vehicleName}
            onChange={(e) => setVehicleName(e.target.value)}
          />
        </div>
        <div className='mb-3'>
          <label className='form-label'>License:</label>
          <input
            type='text'
            className='form-control'
            value={license}
            onChange={(e) => setLicense(e.target.value)}
          />
        </div>
        <button type='submit' className='btn btn-primary'>Register Vehicle</button>
      </form>
    </div>
  );
}

export default Vehicles;