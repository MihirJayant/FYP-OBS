// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import GoogleLoginButton from "../components/GoogleLoginButton";
import PostcodeInput from "../components/PostcodeInput";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("provider");
  const [loading, setLoading] = useState(false);

  const [postcode, setPostcode] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [location, setLocation] = useState("");
  const [postcodeValid, setPostcodeValid] = useState(false);

  const navigate = useNavigate();
  const user = localStorage.getItem("access_token");

  useEffect(() => {
    if (user) {
      navigate("/jobs");
    }
  }, [navigate]);

  const handlePostcodeChange = (postcodeData) => {
    setPostcode(postcodeData.postcode);
    setLatitude(postcodeData.latitude);
    setLongitude(postcodeData.longitude);
    setLocation(postcodeData.address);
    setPostcodeValid(true);
  };

  const handlePostcodeError = () => {
    setPostcodeValid(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!postcodeValid) {
      alert("Please enter a valid UK postcode");
      return;
    }

    setLoading(true);
    const res = await register({
      email,
      password,
      name,
      role,
      postcode,
      latitude,
      longitude,
      location,
    });
    setLoading(false);
    if (res.success) {
      navigate("/jobs");
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-sm border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <Link to="/" className="text-decoration-none">
                    <h1 className="h3 fw-bold text-primary">
                      <i className="bi bi-hammer me-2"></i>OBS
                    </h1>
                  </Link>
                  <p className="text-muted">Create your account</p>
                </div>

                <form onSubmit={handleRegister}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Your Postcode
                    </label>
                    <PostcodeInput
                      value={postcode}
                      onChange={handlePostcodeChange}
                      onError={handlePostcodeError}
                      placeholder="e.g., NG1 4BU"
                      required
                    />
                    <small className="text-muted">
                      This helps us show you relevant jobs in your area
                    </small>
                  </div>

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
                            <p className="mb-0 mt-2 fw-semibold">
                              Offer Services
                            </p>
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

                  <button
                    type="submit"
                    className="btn btn-primary w-100 mb-3"
                    disabled={loading || !postcodeValid}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>

                  <div className="d-flex justify-content-center mb-3">OR</div>

                  <div className="d-flex justify-content-center mb-4">
                    <GoogleLoginButton />
                  </div>
                </form>

                <div className="text-center">
                  <p className="text-muted mb-0">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary fw-semibold">
                      Sign In
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;