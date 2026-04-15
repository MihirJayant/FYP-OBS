import React, { createContext, useState, useEffect, useContext } from "react";

var AccessibilityContext = createContext(null);

var STORAGE_KEY = "obs_accessibility_settings";

var defaultSettings = {
  fontSize: "medium",
  highContrast: false,
  darkMode: false,
  reducedMotion: false,
  lineSpacing: "normal",
};

function loadSettings() {
  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    // ignore parse errors
  }
  return defaultSettings;
}

function AccessibilityProvider({ children }) {
  var [settings, setSettings] = useState(loadSettings);

  // Save to localStorage whenever settings change
  useEffect(
    function () {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    },
    [settings]
  );

  // Apply settings to the document body
  useEffect(
    function () {
      var body = document.body;
      var html = document.documentElement;

      // Font size
      body.classList.remove(
        "obs-font-small",
        "obs-font-medium",
        "obs-font-large",
        "obs-font-xlarge"
      );
      body.classList.add("obs-font-" + settings.fontSize);

      // High contrast
      if (settings.highContrast) {
        body.classList.add("obs-high-contrast");
      } else {
        body.classList.remove("obs-high-contrast");
      }

      // Dark mode
      if (settings.darkMode) {
        body.classList.add("obs-dark-mode");
      } else {
        body.classList.remove("obs-dark-mode");
      }

      // Reduced motion
      if (settings.reducedMotion) {
        body.classList.add("obs-reduced-motion");
      } else {
        body.classList.remove("obs-reduced-motion");
      }

      // Line spacing
      body.classList.remove(
        "obs-spacing-normal",
        "obs-spacing-wide",
        "obs-spacing-wider"
      );
      body.classList.add("obs-spacing-" + settings.lineSpacing);

      // Set lang attribute for screen readers
      html.setAttribute("lang", "en");
    },
    [settings]
  );

  var updateSetting = function (key, value) {
    setSettings(function (prev) {
      var updated = {};
      for (var k in prev) {
        updated[k] = prev[k];
      }
      updated[key] = value;
      return updated;
    });
  };

  var resetSettings = function () {
    setSettings(defaultSettings);
  };

  var contextValue = {
    settings: settings,
    updateSetting: updateSetting,
    resetSettings: resetSettings,
  };

  return React.createElement(
    AccessibilityContext.Provider,
    { value: contextValue },
    children
  );
}

function useAccessibility() {
  var context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      "useAccessibility must be used within an AccessibilityProvider"
    );
  }
  return context;
}

export { AccessibilityProvider, useAccessibility };
export default AccessibilityContext;