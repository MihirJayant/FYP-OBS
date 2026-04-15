// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getOtp, resetPassword } from "../api/auth";

const ResetPassword = () => {
  const [step, setStep] = useState(1); // 1 = email, 2 = otp, 3 = new password
  const [email, setEmail] = useState("");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // 6 digit OTP
  const [password, setPassword] = useState("");

  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    if (step !== 2) return;

    const int = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);

    return () => clearInterval(int);
  }, [step]);

  const handleSendOtp = async () => {
    if (!email) return;
    setLoading(true);
    const res = await getOtp(email);
    setLoading(false);
    if (res?.data?.message) {
      toast.success("OTP sent to your email!");
      setStep(2);
      setTimer(30);
    }
  };

  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp${index + 1}`).focus();
    }
  };

  const handleResendOtp = async () => {
    if (timer !== 0) return;
    setLoading(true);
    const res = await getOtp(email);
    setLoading(false);
    if (res?.data?.message) {
      toast.success("New OTP sent to your email!");
    }
    setTimer(30);
  };

  const handleResetPassword = async () => {
    const code = otp.join("");

    if (code.length !== 6) return alert("Enter valid 6-digit OTP");
    if (!password) return alert("Enter new password");

    setLoading(true);

    const res = await resetPassword({
      email,
      otp: code,
      new_password: password,
    });

    setLoading(false);

    if (res.success) {
      toast.success("Password updated successfully!");
      setTimeout(() => {
        navigate("/login");
      }, 500);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-5">
            <div className="card shadow-sm border-0">
              <div className="card-body p-md-5 p-4">
                <h3 className="text-center mb-4 fw-bold text-primary">
                  Reset Password
                </h3>

                {step === 1 && (
                  <>
                    <label className="form-label fw-semibold">
                      Enter Email
                    </label>
                    <input
                      type="email"
                      className="form-control mb-3"
                      placeholder="example@mail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />

                    <button
                      className="btn btn-primary w-100"
                      onClick={handleSendOtp}
                      disabled={loading || !email}
                    >
                      {loading ? "Sending OTP..." : "Get OTP"}
                    </button>

                    <button
                      className="btn btn-secondary w-100 mt-3"
                      onClick={() => navigate("/login")}
                    >
                      Back
                    </button>
                  </>
                )}

                {step === 2 && (
                  <>
                    <p className="fw-semibold">OTP sent to {email}</p>

                    <div className="d-flex justify-content-between mb-3">
                      {otp.map((v, i) => (
                        <input
                          key={i}
                          id={`otp${i}`}
                          className="form-control text-center"
                          style={{ width: "40px", fontSize: "1.1rem" }}
                          maxLength={1}
                          value={v}
                          onChange={(e) => handleOtpChange(e.target.value, i)}
                        />
                      ))}
                    </div>

                    <div className="text-end mt-3">
                      {timer > 0 ? (
                        <span className="text-muted">
                          Resend OTP in {timer}s
                        </span>
                      ) : (
                        <button
                          className="btn btn-link"
                          onClick={handleResendOtp}
                          disabled={loading}
                        >
                          {loading ? "Resending..." : "Resend OTP"}
                        </button>
                      )}
                    </div>

                    <label className="form-label fw-semibold">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="form-control mb-3"
                      placeholder="New password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                      className="btn btn-primary w-100"
                      onClick={handleResetPassword}
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Reset Password"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
