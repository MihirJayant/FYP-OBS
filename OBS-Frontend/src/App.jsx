import React, { useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PrivateRoute from "./routes/PrivateRoute";
import { AccessibilityProvider } from "./components/AccessibilityContext";
import AccessibilityToolbar from "./components/AccessibilityToolbar";
import CookieConsent from "./components/CookieConsent";
import Notifications from "./components/Notifications";

var Index = lazy(function () { return import("./pages/Index"); });
var Login = lazy(function () { return import("./pages/Login"); });
var Signup = lazy(function () { return import("./pages/Signup"); });
var ResetPassword = lazy(function () { return import("./pages/ResetPassword"); });
var Jobs = lazy(function () { return import("./pages/Jobs"); });
var PostJob = lazy(function () { return import("./pages/PostJob"); });
var JobDetails = lazy(function () { return import("./pages/JobDetails"); });
var Dashboard = lazy(function () { return import("./pages/Dashboard"); });
var NotFound = lazy(function () { return import("./pages/NotFound"); });
var UpdateJob = lazy(function () { return import("./pages/UpdateJob"); });
var PrivacyPolicy = lazy(function () { return import("./pages/PrivacyPolicy"); });
var TermsOfService = lazy(function () { return import("./pages/TermsOfService"); });
var CookiePolicy = lazy(function () { return import("./pages/CookiePolicy"); });
var UserProfile = lazy(function () { return import("./pages/UserProfile"); });
var ChatBot = lazy(function () { return import("./components/ChatBot"); });

function App() {
  return (
    <AccessibilityProvider>
      <Router>
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>

        <Suspense fallback={<div className="loader">Loading...</div>}>
          <Notifications />
          <AccessibilityToolbar />
          <ChatBot />
          <CookieConsent />
          <div id="main-content">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset" element={<ResetPassword />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route
                path="/profile/:id"
                element={
                  <PrivateRoute>
                    <UserProfile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/jobs"
                element={
                  <PrivateRoute>
                    <Jobs />
                  </PrivateRoute>
                }
              />
              <Route
                path="/jobs/:id"
                element={
                  <PrivateRoute>
                    <JobDetails />
                  </PrivateRoute>
                }
              />
              <Route
                path="/post-job"
                element={
                  <PrivateRoute>
                    <PostJob />
                  </PrivateRoute>
                }
              />
              <Route
                path="/jobs/:id/edit"
                element={
                  <PrivateRoute>
                    <UpdateJob />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Suspense>
      </Router>
      <ToastContainer position="top-center" autoClose={2000} />
    </AccessibilityProvider>
  );
}

export default App;