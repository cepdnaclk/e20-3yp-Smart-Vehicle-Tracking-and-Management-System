import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
      <h1 className="display-1 fw-bold text-primary">404</h1>
      <h2 className="mb-4">Page Not Found</h2>
      <p className="lead text-center mb-5">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/login" className="btn btn-primary px-4 py-2">
        Go to Login
      </Link>
    </div>
  );
}

export default NotFound;
