// @ts-nocheck
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../api/auth";
import { mockCategories } from "../data/mockData";

const Index = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoading(true);
    const res = await logout();
    setLoading(false);
    if (res.success) {
      navigate("/login");
    }
  };

  return (
    <div>
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <Link className="navbar-brand fw-bold fs-4" to="/">
            <i className="bi bi-hammer me-2"></i>OBS
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/jobs">
                  Browse Jobs
                </Link>
              </li>
              {user ? (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/dashboard">
                      Dashboard
                    </Link>
                  </li>
                  {user.role === "poster" && (
                    <li className="nav-item">
                      <Link className="nav-link" to="/post-job">
                        Post Job
                      </Link>
                    </li>
                  )}
                  <li className="nav-item">
                    <button
                      className="btn btn-outline-light btn-sm"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link
                      className="btn btn-outline-light btn-sm ms-2 mb-2 mb-lg-0"
                      to="/login"
                    >
                      Login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="btn btn-light btn-sm ms-2" to="/signup">
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="bg-primary text-white py-5"
        style={{ minHeight: "500px" }}
      >
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">
                Find Trusted Service Providers Near You
              </h1>
              <p className="lead mb-4">
                Connect with verified professionals for all your home service
                needs. Post jobs, receive competitive bids, and hire with
                confidence.
              </p>
              <div className="d-flex gap-3">
                <Link to="/jobs" className="btn btn-light btn-lg">
                  Browse Jobs <i className="bi bi-arrow-right ms-2"></i>
                </Link>
                {/* Show dashboard link if already logged in, signup if not */}
                <Link
                  to={user ? "/dashboard" : "/signup"}
                  className="btn btn-outline-light btn-lg"
                >
                  {user ? "Go to Dashboard" : "Get Started"}
                </Link>
              </div>
            </div>
            <div className="col-lg-6 text-center mt-5 mt-lg-0">
              <i
                className="bi bi-tools"
                style={{ fontSize: "200px", opacity: 0.3 }}
              ></i>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center fw-bold mb-5">
            Popular Service Categories
          </h2>
          <div className="row g-4">
            {mockCategories.map((category) => (
              <div key={category.id} className="col-md-4 col-lg-2">
                <Link
                  to={`/jobs?category=${encodeURIComponent(category.name)}`}
                  className="text-decoration-none"
                >
                  <div className="card h-100 text-center border-0 shadow-sm hover-shadow" style={{ cursor: "pointer" }}>
                    <div className="card-body">
                      <div style={{ fontSize: "48px" }}>{category.icon}</div>
                      <h5 className="card-title mt-3">{category.name}</h5>
                      <p className="card-text text-muted small">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center fw-bold mb-5">How OBS Works</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="text-center">
                <div
                  className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: "80px", height: "80px", fontSize: "32px" }}
                >
                  <i className="bi bi-pencil-square"></i>
                </div>
                <h4 className="fw-bold">1. Post Your Job</h4>
                <p className="text-muted">
                  Describe your service needs, set your budget, and add location
                  details.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center">
                <div
                  className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: "80px", height: "80px", fontSize: "32px" }}
                >
                  <i className="bi bi-people"></i>
                </div>
                <h4 className="fw-bold">2. Receive Bids</h4>
                <p className="text-muted">
                  Qualified service providers submit their competitive bids on
                  your job.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center">
                <div
                  className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: "80px", height: "80px", fontSize: "32px" }}
                >
                  <i className="bi bi-check-circle"></i>
                </div>
                <h4 className="fw-bold">3. Hire & Complete</h4>
                <p className="text-muted">
                  Choose the best provider, complete the work, and make secure
                  payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row text-center g-4">
            <div className="col-md-3">
              <h2 className="fw-bold text-primary">500+</h2>
              <p className="text-muted">Active Jobs</p>
            </div>
            <div className="col-md-3">
              <h2 className="fw-bold text-primary">1000+</h2>
              <p className="text-muted">Service Providers</p>
            </div>
            <div className="col-md-3">
              <h2 className="fw-bold text-primary">2500+</h2>
              <p className="text-muted">Jobs Completed</p>
            </div>
            <div className="col-md-3">
              <h2 className="fw-bold text-primary">4.8/5</h2>
              <p className="text-muted">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - changes based on whether user is logged in */}
      <section className="py-5 bg-primary text-white">
        <div className="container text-center">
          <h2 className="fw-bold mb-4">
            {user ? "Find Your Next Service" : "Ready to Get Started?"}
          </h2>
          <p className="lead mb-4">
            {user
              ? "Browse available jobs or post a new one today."
              : "Join thousands of users finding trusted service providers."}
          </p>
          <Link
            to={user ? "/jobs" : "/signup"}
            className="btn btn-light btn-lg"
          >
            {user ? "Browse Jobs" : "Create Free Account"}{" "}
            <i className="bi bi-arrow-right ms-2"></i>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-4">
        <div className="container text-center">
          <div className="mb-2">
            <Link to="/privacy-policy" className="text-white me-3 text-decoration-none small">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-white me-3 text-decoration-none small">
              Terms of Service
            </Link>
            <Link to="/cookie-policy" className="text-white text-decoration-none small">
              Cookie Policy
            </Link>
          </div>
          <p className="mb-0 small">&copy; 2026 OBS. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        .hover-shadow {
          transition: all 0.3s ease;
        }
        .hover-shadow:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </div>
  );
};

export default Index;