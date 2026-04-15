import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center">
        <h1 className="display-1 fw-bold text-primary">404</h1>
        <h2 className="fw-bold mb-3">Page Not Found</h2>
        <p className="text-muted mb-4">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary btn-lg">
          <i className="bi bi-house me-2"></i>
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
