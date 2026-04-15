import React from "react";
import { Link } from "react-router-dom";

var PrivacyPolicy = function () {
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
            <h1 className="fw-bold mb-4">Privacy Policy</h1>
            <p className="text-muted mb-4">
              Last updated: April 2026
            </p>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">1. Introduction</h4>
                <p>
                  The Online Bidding System ("OBS", "we", "our", "us") is
                  committed to protecting your personal data and respecting your
                  privacy. This Privacy Policy explains how we collect, use,
                  store, and protect your information when you use our platform.
                </p>
                <p>
                  This policy is compliant with the UK General Data Protection
                  Regulation (UK GDPR) and the Data Protection Act 2018.
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">2. Data We Collect</h4>
                <p>We collect the following personal data when you use our platform:</p>
                <p>
                  <strong>Account Information:</strong> Name, email address,
                  password (stored as a bcrypt hash, never in plain text), and
                  role (job poster or service provider).
                </p>
                <p>
                  <strong>Location Data:</strong> UK postcode and derived
                  coordinates (latitude and longitude) to match you with nearby
                  jobs and service providers. This data is obtained through the
                  Postcodes.io API.
                </p>
                <p>
                  <strong>Job and Bid Data:</strong> Job listings you create,
                  bids you submit, and reviews you leave. This data is necessary
                  for the core functionality of the platform.
                </p>
                <p>
                  <strong>Chat History:</strong> Conversations with our AI
                  chatbot assistant are stored to maintain context and improve
                  user experience. This data is stored in MongoDB Atlas cloud
                  database.
                </p>
                <p>
                  <strong>Authentication Tokens:</strong> JSON Web Tokens (JWT)
                  stored in your browser's local storage for session management.
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">3. How We Use Your Data</h4>
                <p>Your personal data is used for the following purposes:</p>
                <p>
                  <strong>Account Management:</strong> To create and manage your
                  account, authenticate your identity, and provide role-based
                  access to platform features.
                </p>
                <p>
                  <strong>Service Matching:</strong> To connect job posters with
                  service providers based on location, category, and budget
                  preferences.
                </p>
                <p>
                  <strong>Communication:</strong> To facilitate the bidding
                  process and notify you of relevant activities on your jobs or
                  bids.
                </p>
                <p>
                  <strong>Platform Improvement:</strong> To analyse usage
                  patterns and improve the platform's functionality and user
                  experience.
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">4. Legal Basis for Processing</h4>
                <p>
                  We process your personal data under the following legal bases
                  as defined by the UK GDPR:
                </p>
                <p>
                  <strong>Consent (Article 6(1)(a)):</strong> You provide
                  consent when you create an account and agree to our terms.
                </p>
                <p>
                  <strong>Contract Performance (Article 6(1)(b)):</strong>{" "}
                  Processing is necessary to provide you with the platform's
                  services, including job posting, bidding, and matching.
                </p>
                <p>
                  <strong>Legitimate Interest (Article 6(1)(f)):</strong> We
                  have a legitimate interest in improving our platform and
                  ensuring security.
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">5. Data Storage and Security</h4>
                <p>
                  <strong>PostgreSQL Database:</strong> Core application data
                  (users, jobs, bids, ratings) is stored in a PostgreSQL
                  database with parameterised queries to prevent SQL injection.
                </p>
                <p>
                  <strong>MongoDB Atlas:</strong> Chat history is stored in
                  MongoDB Atlas cloud database with encryption at rest and in
                  transit.
                </p>
                <p>
                  <strong>Password Security:</strong> All passwords are hashed
                  using bcrypt with a cost factor of 10 before storage. We never
                  store plain text passwords.
                </p>
                <p>
                  <strong>Authentication:</strong> JWT tokens with expiration
                  times are used for session management. Refresh tokens are
                  stored securely in the database.
                </p>
                <p>
                  <strong>Transport Security:</strong> All API communications
                  use secure protocols. Helmet.js is employed for HTTP security
                  headers.
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">6. Your Rights</h4>
                <p>
                  Under the UK GDPR and Data Protection Act 2018, you have the
                  following rights:
                </p>
                <p>
                  <strong>Right of Access (Article 15):</strong> You can request
                  a copy of the personal data we hold about you.
                </p>
                <p>
                  <strong>Right to Rectification (Article 16):</strong> You can
                  update your personal information through your account settings.
                </p>
                <p>
                  <strong>Right to Erasure (Article 17):</strong> You can
                  request deletion of your account and all associated data
                  through the account deletion feature in your dashboard.
                </p>
                <p>
                  <strong>Right to Data Portability (Article 20):</strong> You
                  can request your data in a machine-readable format.
                </p>
                <p>
                  <strong>Right to Object (Article 21):</strong> You can object
                  to processing based on legitimate interest.
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">7. Third-Party Services</h4>
                <p>We use the following third-party services:</p>
                <p>
                  <strong>Postcodes.io:</strong> Free UK postcode lookup API
                  used to convert postcodes to coordinates. No personal data is
                  shared with this service beyond the postcode entered.
                </p>
                <p>
                  <strong>Google Gemini AI:</strong> Used to power the chatbot
                  assistant. Chat messages are sent to Google's API for
                  processing. Google's privacy policy applies to this data
                  processing.
                </p>
                <p>
                  <strong>Google OAuth:</strong> If you sign in with Google, we
                  receive your name, email, and profile picture from Google. We
                  do not access any other Google account data.
                </p>
                <p>
                  <strong>MongoDB Atlas:</strong> Cloud database service used for
                  storing chat history. Data is stored in EU data centres with
                  encryption at rest.
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">8. Data Retention</h4>
                <p>
                  Account data is retained for as long as your account is
                  active. Chat history sessions expire after 24 hours of
                  inactivity. Upon account deletion, all associated data is
                  permanently removed from our systems within 30 days.
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">9. Contact</h4>
                <p>
                  If you have any questions about this Privacy Policy or wish to
                  exercise your data rights, please contact us at:
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

export default PrivacyPolicy;
