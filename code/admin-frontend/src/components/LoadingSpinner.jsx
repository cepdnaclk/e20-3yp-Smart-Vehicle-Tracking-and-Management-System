import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ size = 'md', text = 'Loading...', color = 'primary' }) => {
  const getSpinnerSize = () => {
    switch (size) {
      case 'sm':
        return { width: '1rem', height: '1rem' };
      case 'lg':
        return { width: '3rem', height: '3rem' };
      case 'md':
      default:
        return { width: '2rem', height: '2rem' };
    }
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center">
      <Spinner
        animation="border"
        variant={color}
        role="status"
        style={getSpinnerSize()}
      />
      {text && <p className="mt-3 text-center text-muted">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
