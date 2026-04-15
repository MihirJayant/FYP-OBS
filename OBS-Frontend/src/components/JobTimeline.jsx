import React from "react";

var steps = [
  { key: "open", label: "Posted", icon: "bi-megaphone" },
  { key: "bids_received", label: "Bids Received", icon: "bi-cash-coin" },
  { key: "awarded", label: "Awarded", icon: "bi-trophy" },
  { key: "completed", label: "Completed", icon: "bi-check-circle" },
];

var JobTimeline = function ({ status, bidCount }) {
  // Figure out which step we are on
  var currentIndex = 0;

  if (status === "open" && bidCount > 0) {
    currentIndex = 1; // bids received
  } else if (status === "open") {
    currentIndex = 0; // just posted
  } else if (status === "awarded") {
    currentIndex = 2;
  } else if (status === "completed") {
    currentIndex = 3;
  } else if (status === "cancelled") {
    currentIndex = -1; // special case
  }

  if (status === "cancelled") {
    return (
      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-center p-3 bg-danger bg-opacity-10 rounded">
          <i className="bi bi-x-circle-fill text-danger fs-4 me-2"></i>
          <span className="fw-bold text-danger">This job has been cancelled</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-start position-relative">
        {/* Progress line behind the steps */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "10%",
            right: "10%",
            height: "3px",
            background: "#e0e0e0",
            zIndex: 0,
          }}
        >
          <div
            style={{
              width: (currentIndex / (steps.length - 1)) * 100 + "%",
              height: "100%",
              background: "#e87b1c",
              transition: "width 0.5s ease",
            }}
          ></div>
        </div>

        {steps.map(function (step, index) {
          var isActive = index <= currentIndex;
          var isCurrent = index === currentIndex;

          return (
            <div
              key={step.key}
              className="text-center"
              style={{ flex: 1, position: "relative", zIndex: 1 }}
            >
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: "40px",
                  height: "40px",
                  background: isActive ? "#e87b1c" : "#e0e0e0",
                  color: isActive ? "#fff" : "#999",
                  border: isCurrent ? "3px solid #d06a10" : "3px solid transparent",
                  fontSize: "16px",
                  transition: "all 0.3s ease",
                }}
              >
                <i className={"bi " + step.icon}></i>
              </div>
              <div
                className="mt-1 small"
                style={{
                  fontWeight: isCurrent ? "700" : "400",
                  color: isActive ? "#333" : "#999",
                }}
              >
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JobTimeline;