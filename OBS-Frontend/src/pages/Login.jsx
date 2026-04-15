// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import GoogleLoginButton from "../components/GoogleLoginButton";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const user = localStorage.getItem("access_token");

  useEffect(() => {
    if (user) {
      navigate("/jobs");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login({ email, password });
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
                  <p className="text-muted">Sign in to your account</p>
                </div>

                <form onSubmit={handleLogin}>
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
                  <div className="mb-2">
                    <label className="form-label fw-semibold">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <div className="text-end">
                    <p className="text-muted mb-4">
                      <Link to="/reset" className="text-primary fw-semibold">
                        {" "}
                        Forgot your password ?
                      </Link>
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                  <div className="d-flex justify-content-center mb-3">OR</div>

                  <div className="d-flex justify-content-center mb-4">
                    <GoogleLoginButton label="Sign in with Google" />
                  </div>
                </form>

                <div className="text-center">
                  <p className="text-muted mb-0">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-primary fw-semibold">
                      Sign Up
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

export default Login;
