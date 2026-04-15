// @ts-nocheck
// src/routes/PrivateRoute.jsx
import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { updateRole, updateProfile } from "../api/user";
import LocationModal from "../components/LocationModal";
import "../components/modal.css";

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem("access_token");
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [showModal, setShowModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [role, setRole] = useState("provider");

  useEffect(() => {
    if (!token) return;

    if (user && !user.role) {
      setShowModal(true);
    } else if (user && (user.latitude === null || user.longitude === null)) {
      setShowLocationModal(true);
    }
    setLoading(false);
  }, [token, user]);

  const handleRoleUpdate = async () => {
    if (!role) return;

    setLoading(true);
    try {
      const res = await updateRole({ role: role });
      if (res.success) {
        const updatedUser = res.data;
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setShowModal(false);
        // After role update, check location again
        if (updatedUser.latitude === null || updatedUser.longitude === null) {
            setShowLocationModal(true);
        } else {
            navigate("/jobs"); 
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSave = async (locationData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("latitude", locationData.latitude);
      formData.append("longitude", locationData.longitude);
      if (locationData.location) formData.append("location", locationData.location);

      const res = await updateProfile(formData);
      if (res.success) {
        const updatedUser = { ...user, ...res.data };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setShowLocationModal(false);
        // If on the generic entry page, redirect to jobs, otherwise stay
        if (location.pathname === "/") navigate("/jobs");
      } else {
          alert("Failed to update location");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating location");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (loading) return <div className="loader">Loading...</div>;

  // Block all routes except /jobs until role is set
  if (!user?.role && location.pathname !== "/jobs") {
    return <Navigate to="/jobs" replace />;
  }

  return (
    <>
      {showModal && (
        <>
          {/* Dark overlay */}
          <div className="modal-backdrop-custom"></div>

          {/* Modal content */}
          <div className="modal-container">
            <div className="mb-4">
              <label className="form-label fw-semibold">I want to:</label>
              <div className="row g-2">
                <div className="col-6">
                  <div
                    className={`card h-100 cursor-pointer ${
                      role === "provider" ? "border-primary" : ""
                    }`}
                    onClick={() => setRole("provider")}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="card-body text-center p-3">
                      <i className="bi bi-tools fs-3 text-primary"></i>
                      <p className="mb-0 mt-2 fw-semibold">Offer Services</p>
                      <small className="text-muted">As Provider</small>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div
                    className={`card h-100 cursor-pointer ${
                      role === "poster" ? "border-primary" : ""
                    }`}
                    onClick={() => setRole("poster")}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="card-body text-center p-3">
                      <i className="bi bi-briefcase fs-3 text-success"></i>
                      <p className="mb-0 mt-2 fw-semibold">Post Jobs</p>
                      <small className="text-muted">As Job Poster</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer mt-4">
              <button
                className="btn btn-primary w-100"
                onClick={handleRoleUpdate}
                disabled={loading || !role}
              >
                {loading ? "Updating..." : "Update Role"}
              </button>
            </div>
          </div>
        </>
      )}

      {showLocationModal && (
        <LocationModal onSave={handleLocationSave} loading={loading} />
      )}

      {children}
    </>
  );
}
