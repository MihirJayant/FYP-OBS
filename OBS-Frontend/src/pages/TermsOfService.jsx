import React from "react";
import { Link } from "react-router-dom";

var TermsOfService = function () {
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
            <h1 className="fw-bold mb-4">Terms of Service</h1>
            <p className="text-muted mb-4">
              Last updated: April 2026
            </p>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">1. Acceptance of Terms</h4>
                <p>
                  By accessing and using the Online Bidding System ("OBS",
                  "Platform"), you agree to be bound by these Terms of Service.
                  If you do not agree to these terms, please do not use the
                  platform.
                </p>
                <p>
                  OBS is operated as an academic project developed at Nottingham
                  Trent University. It serves as a proof-of-concept
                  demonstrating the feasibility of an inclusive online service
                  marketplace.
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">2. User Accounts</h4>
                <p>
                  <strong>Registration:</strong> You must provide accurate and
                  complete information when creating an account. You are
                  responsible for maintaining the confidentiality of your login
                  credentials.
                </p>
                <p>
                  <strong>Account Types:</strong> The platform supports two user
                  roles: Job Posters who create job listings, and Service
                  Providers who submit bids on available jobs. Users must select
                  their role during registration.
                </p>
                <p>
                  <strong>Account Security:</strong> You must notify us
                  immediately of any unauthorised use of your account. We are
                  not liable for any loss arising from unauthorised access to
                  your account.
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">3. Platform Usage</h4>
                <p>
                  <strong>Job Posting:</strong> Job Posters may create listings
                  describing services they require, including a title,
                  description, budget, postcode, and deadline. All listings must
                  be for lawful services within the United Kingdom.
                </p>
                <p>
                  <strong>Bidding:</strong> Service Providers may submit bids on
                  open job listings. Bids may require the use of platform
                  diamonds (virtual currency). Submitted bids are binding offers
                  and may be accepted by the Job Poster.
                </p>
                <p>
                  <strong>Job Completion:</strong> Once a bid is accepted and
                  the work is completed, the Job Poster should mark the job as
                  complete. Both parties are encouraged to leave reviews to
                  maintain platform trust.
                </p>
                <p>
                  <strong>Prohibited Activities:</strong> Users must not post
                  misleading or fraudulent job listings, submit fake bids, use
                  the platform for any illegal purpose, attempt to circumvent
                  platform security measures, or harass other users.
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">4. Virtual Currency (Diamonds)</h4>
                <p>
                  The platform uses a virtual currency system called "diamonds"
                  for bid submissions. Diamonds have no real-world monetary
                  value and cannot be exchanged for currency. The diamond system
                  is designed to encourage meaningful bid submissions and
                  prevent spam.
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">5. Reviews and Ratings</h4>
                <p>
                  Users may leave reviews and ratings after job completion.
                  Reviews must be honest, fair, and based on genuine experience.
                  We reserve the right to remove reviews that are defamatory,
                  contain offensive language, or appear to be fraudulent.
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">6. AI Chatbot Assistant</h4>
                <p>
                  The platform includes an AI-powered chatbot assistant that
                  uses Google Gemini to help users navigate the platform. The
                  chatbot can assist with job posting, searching, bidding, and
                  general enquiries. Responses generated by the AI are
                  informational and should not be considered professional
                  advice. Chat conversations are stored for context continuity
                  and may be reviewed for platform improvement.
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">7. Accessibility</h4>
                <p>
                  OBS is committed to digital inclusion and accessibility. The
                  platform is designed to comply with the Web Content
                  Accessibility Guidelines (WCAG) 2.1 Level AA standards. We
                  provide features including adjustable font sizes, high
                  contrast mode, dark mode, reduced motion options, and keyboard
                  navigation support. If you experience any accessibility
                  issues, please contact us so we can address them.
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">8. Limitation of Liability</h4>
                <p>
                  OBS is provided "as is" without any warranties, express or
                  implied. As an academic project, we do not guarantee
                  uninterrupted service availability. We are not responsible for
                  the quality of services provided by Service Providers, any
                  disputes between Job Posters and Service Providers, any
                  financial losses arising from the use of the platform, or any
                  data loss due to technical failures.
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">9. Data Protection</h4>
                <p>
                  Your use of the platform is also governed by our{" "}
                  <Link to="/privacy-policy">Privacy Policy</Link>, which
                  explains how we collect, use, and protect your personal data
                  in compliance with the UK GDPR and Data Protection Act 2018.
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">10. Account Termination</h4>
                <p>
                  You may delete your account at any time through the dashboard
                  settings. Upon deletion, all personal data associated with
                  your account will be permanently removed in accordance with
                  our Privacy Policy. We reserve the right to suspend or
                  terminate accounts that violate these Terms of Service.
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">11. Governing Law</h4>
                <p>
                  These Terms of Service are governed by and construed in
                  accordance with the laws of England and Wales. Any disputes
                  arising from the use of this platform shall be subject to the
                  exclusive jurisdiction of the courts of England and Wales.
                </p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">12. Contact</h4>
                <p>
                  For any questions regarding these Terms of Service, please
                  contact us at:
                </p>
                <p>
                  Email: support@obs-platform.co.uk
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

export default TermsOfService;
