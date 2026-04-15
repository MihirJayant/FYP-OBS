import React, { useState } from "react";
import { useAccessibility } from "./AccessibilityContext";
import "./AccessibilityToolbar.css";

var AccessibilityToolbar = function () {
  var [isOpen, setIsOpen] = useState(false);
  var { settings, updateSetting, resetSettings } = useAccessibility();

  var fontSizes = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
    { value: "xlarge", label: "Extra Large" },
  ];

  var spacingOptions = [
    { value: "normal", label: "Normal" },
    { value: "wide", label: "Wide" },
    { value: "wider", label: "Wider" },
  ];

  var handleToggle = function () {
    setIsOpen(!isOpen);
  };

  var handleKeyDown = function (e) {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="accessibility-toolbar-container" onKeyDown={handleKeyDown}>
      {/* Toggle button */}
      <button
        className="accessibility-toggle-btn"
        onClick={handleToggle}
        aria-label="Accessibility Settings"
        aria-expanded={isOpen}
        title="Accessibility Settings"
      >
        <i className="bi bi-universal-access"></i>
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          className="accessibility-panel"
          role="dialog"
          aria-label="Accessibility Settings Panel"
        >
          <div className="accessibility-panel-header">
            <h6 className="mb-0 fw-bold">Accessibility</h6>
            <button
              className="btn-close btn-close-sm"
              onClick={function () {
                setIsOpen(false);
              }}
              aria-label="Close accessibility panel"
            ></button>
          </div>

          <div className="accessibility-panel-body">
            {/* Font Size */}
            <div className="accessibility-section">
              <label className="accessibility-label" id="font-size-label">
                Font Size
              </label>
              <div
                className="accessibility-btn-group"
                role="radiogroup"
                aria-labelledby="font-size-label"
              >
                {fontSizes.map(function (size) {
                  var isActive = settings.fontSize === size.value;
                  return (
                    <button
                      key={size.value}
                      className={
                        "accessibility-option-btn" + (isActive ? " active" : "")
                      }
                      onClick={function () {
                        updateSetting("fontSize", size.value);
                      }}
                      role="radio"
                      aria-checked={isActive}
                    >
                      {size.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* High Contrast */}
            <div className="accessibility-section">
              <div className="accessibility-toggle-row">
                <label
                  className="accessibility-label"
                  htmlFor="high-contrast-toggle"
                >
                  High Contrast
                </label>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="high-contrast-toggle"
                    checked={settings.highContrast}
                    onChange={function (e) {
                      updateSetting("highContrast", e.target.checked);
                    }}
                    role="switch"
                    aria-label="Toggle high contrast mode"
                  />
                </div>
              </div>
            </div>

            {/* Dark Mode */}
            <div className="accessibility-section">
              <div className="accessibility-toggle-row">
                <label
                  className="accessibility-label"
                  htmlFor="dark-mode-toggle"
                >
                  Dark Mode
                </label>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="dark-mode-toggle"
                    checked={settings.darkMode}
                    onChange={function (e) {
                      updateSetting("darkMode", e.target.checked);
                    }}
                    role="switch"
                    aria-label="Toggle dark mode"
                  />
                </div>
              </div>
            </div>

            {/* Reduced Motion */}
            <div className="accessibility-section">
              <div className="accessibility-toggle-row">
                <label
                  className="accessibility-label"
                  htmlFor="reduced-motion-toggle"
                >
                  Reduce Motion
                </label>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="reduced-motion-toggle"
                    checked={settings.reducedMotion}
                    onChange={function (e) {
                      updateSetting("reducedMotion", e.target.checked);
                    }}
                    role="switch"
                    aria-label="Toggle reduced motion"
                  />
                </div>
              </div>
            </div>

            {/* Line Spacing */}
            <div className="accessibility-section">
              <label className="accessibility-label" id="line-spacing-label">
                Line Spacing
              </label>
              <div
                className="accessibility-btn-group"
                role="radiogroup"
                aria-labelledby="line-spacing-label"
              >
                {spacingOptions.map(function (option) {
                  var isActive = settings.lineSpacing === option.value;
                  return (
                    <button
                      key={option.value}
                      className={
                        "accessibility-option-btn" + (isActive ? " active" : "")
                      }
                      onClick={function () {
                        updateSetting("lineSpacing", option.value);
                      }}
                      role="radio"
                      aria-checked={isActive}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reset */}
            <div className="accessibility-section">
              <button
                className="btn btn-outline-secondary btn-sm w-100"
                onClick={resetSettings}
                aria-label="Reset all accessibility settings to default"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilityToolbar;