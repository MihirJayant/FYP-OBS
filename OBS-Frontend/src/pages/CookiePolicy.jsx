import React from "react";
import { Link } from "react-router-dom";

var CookiePolicy = function () {
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">
            <i className="bi bi-hammer me-2"></i>OBS
          </Link>
          <div className="ms-auto">
            <Link to="/" className="btn btn-outline-light btn-sm">
              Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <h1 className="fw-bold mb-4">Cookie Policy</h1>
            <p className="text-muted mb-4">
              Last updated: April 2026
            </p>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">1. What Are Cookies</h4>
                <p>
                  Cookies are small text files stored on your device when you
                  visit a website. They are widely used to make websites work
                  more efficiently and to provide information to website
                  operators. The Online Bidding System uses browser local
                  storage, which functions similarly to cookies, to store
                  essential data for the platform to operate.
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">
                  2. What We Store and Why
                </h4>
                <p>
                  <strong>Authentication Tokens (Essential):</strong> We store
                  JWT access and refresh tokens in your browser's local storage.
                  These are required to keep you logged in and authenticate your
                  requests. Without these, the platform cannot function.
                </p>
                <p>
                  <strong>User Profile Data (Essential):</strong> Basic user
                  information such as your name, role, and location is cached
                  locally to provide a responsive experience without requiring
                  constant server requests.
                </p>
                <p>
                  <strong>Accessibility Preferences (Functional):</strong> Your
                  chosen accessibility settings including font size, colour
                  contrast, dark mode, and line spacing preferences are stored
                  locally so they persist across sessions.
                </p>
                <p>
                  <strong>Cookie Consent Status (Essential):</strong> We store
                  your cookie consent preference so you are not asked
                  repeatedly.
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">
                  3. Third-Party Cookies
                </h4>
                <p>
                  <strong>Google Authentication:</strong> If you choose to sign
                  in with Google, Google may set cookies as part of the OAuth
                  authentication process. These cookies are governed by Google's
                  own cookie policy.
                </p>
                <p>
                  We do not use any advertising, analytics, or tracking cookies.
                  We do not share your data with advertisers or third-party
                  analytics providers.
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">4. Managing Your Data</h4>
                <p>
                  You can clear all locally stored data at any time by clearing
                  your browser's local storage. In most browsers, this can be
                  done through Settings, then Privacy and Security, then Clear
                  Browsing Data. Note that clearing this data will log you out
                  and reset your accessibility preferences.
                </p>
                <p>
                  You can also delete your account entirely through the
                  Dashboard, which removes all server-side data associated with
                  your account.
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">5. Contact</h4>
                <p>
                  If you have any questions about our use of cookies and local
                  storage, please contact us at:
                </p>
                <p>
                  Email: privacy@obs-platform.co.uk
                  <br />
                  Address: Nottingham Trent University, Nottingham, NG1 4FQ,
                  United Kingdom
                </p>
              </div>
            </div>

            <div className="text-center mt-4 mb-5">
              <Link to="/" className="btn btn-primary">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;