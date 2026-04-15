import React, { useState, useEffect } from "react";

var COOKIE_CONSENT_KEY = "obs_cookie_consent";

var CookieConsent = function () {
  var [visible, setVisible] = useState(false);

  useEffect(function () {
    var consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  var handleAccept = function () {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setVisible(false);
  };

  var handleDecline = function () {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "#1a1a2e",
        color: "#e0e0e0",
        padding: "20px 0",
        borderTop: "2px solid #e87b1c",
        boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.3)",
      }}
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-8 mb-3 mb-lg-0">
            <h6 className="fw-bold mb-1" style={{ color: "#fff" }}>
              We value your privacy
            </h6>
            <p className="mb-0 small" style={{ color: "#ccc" }}>
              This website uses essential cookies to ensure its proper
              functioning, including authentication tokens and user preferences.
              We do not use tracking or advertising cookies. By clicking
              "Accept", you consent to the use of essential cookies. For more
              information, please read our{" "}
              <a
                href="/privacy-policy"
                style={{ color: "#e87b1c", textDecoration: "underline" }}
              >
                Privacy Policy
              </a>{" "}
              and{" "}
              <a
                href="/cookie-policy"
                style={{ color: "#e87b1c", textDecoration: "underline" }}
              >
                Cookie Policy
              </a>
              .
            </p>
          </div>
          <div className="col-lg-4 d-flex gap-2 justify-content-lg-end">
            <button
              className="btn btn-outline-light btn-sm"
              onClick={handleDecline}
              aria-label="Decline non-essential cookies"
            >
              Decline
            </button>
            <button
              className="btn btn-sm fw-bold"
              style={{
                backgroundColor: "#e87b1c",
                borderColor: "#e87b1c",
                color: "#fff",
              }}
              onClick={handleAccept}
              aria-label="Accept cookies"
            >
              Accept Cookies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;