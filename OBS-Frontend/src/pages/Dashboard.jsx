// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { logout } from "../api/auth";
import { cancelBid } from "../api/bids";
import { getProfile, updateProfile, deleteAccount } from "../api/user";
import { getUserRatings } from "../api/ratings";
import LocationModal from "../components/LocationModal";
import "./Dashboard.css";

var Dashboard = function () {
  var navigate = useNavigate();
  var [user, setUser] = useState({ jobs_posted: [], bids_made: [] });
  var [reviews, setReviews] = useState([]);
  var [loading, setLoading] = useState(true);
  var [activeTab, setActiveTab] = useState("overview");

  var [showModal, setShowModal] = useState({ status: false, id: 0 });
  var [showLocationModal, setShowLocationModal] = useState(false);
  var [showReviewsModal, setShowReviewsModal] = useState(false);

  // account deletion states
  var [showDeleteModal, setShowDeleteModal] = useState(false);
  var [deletePassword, setDeletePassword] = useState("");
  var [deleting, setDeleting] = useState(false);

  var fetchData = async function () {
    setLoading(true);
    var res = await getProfile();
    if (res.success) {
      setUser(res.data);
      var reviewsRes = await getUserRatings(res.data.id);
      if (reviewsRes.success) setReviews(reviewsRes.data);
    }
    setLoading(false);
  };

  useEffect(function () {
    fetchData();
  }, []);

  var handleConfirmCancel = async function () {
    setLoading(true);
    var res = await cancelBid(showModal.id);
    setShowModal({ status: false, id: 0 });
    if (res.success) {
      toast.success("Bid cancelled successfully!");
      fetchData();
    }
    setLoading(false);
  };

  var handleLocationSave = async function (locationData) {
    setLoading(true);
    try {
      var formData = new FormData();
      formData.append("latitude", locationData.latitude);
      formData.append("longitude", locationData.longitude);
      if (locationData.location) formData.append("location", locationData.location);
      var res = await updateProfile(formData);
      if (res.success) {
        toast.success("Location updated!");
        var updatedUser = Object.assign({}, user, res.data);
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setShowLocationModal(false);
      }
    } catch (err) {
      toast.error("Error updating location");
    } finally {
      setLoading(false);
    }
  };

  var handleLogout = async function () {
    setLoading(true);
    var res = await logout();
    setLoading(false);
    if (res.success) navigate("/login");
  };

  var handleDeleteAccount = async function () {
    if (!deletePassword) {
      toast.error("Please enter your password to confirm deletion");
      return;
    }
    var confirmed = window.confirm(
      "This will permanently delete your account and all your data. This action CANNOT be undone. Are you absolutely sure?"
    );
    if (!confirmed) return;

    setDeleting(true);
    var res = await deleteAccount(deletePassword);
    setDeleting(false);

    if (res.success) {
      toast.success("Account deleted successfully");
      localStorage.clear();
      navigate("/");
    } else {
      toast.error(res.error || "Failed to delete account");
    }
  };

  var getStatusBadge = function (status) {
    var badges = {
      open: "success", awarded: "warning", in_progress: "info",
      completed: "secondary", cancelled: "danger", pending: "warning",
      accepted: "success", rejected: "danger",
    };
    return badges[status] || "secondary";
  };

  // figure out completed job stats for both roles
  var getCompletedStats = function () {
    if (user.role === "poster") {
      var jobs = user.jobs_posted || [];
      var completedJobs = jobs.filter(function (j) { return j.status === "completed"; });
      var totalSpent = completedJobs.reduce(function (sum, j) { return sum + (Number(j.budget) || 0); }, 0);
      return {
        completedCount: completedJobs.length,
        totalAmount: totalSpent,
        label: "Total Spent",
        icon: "bi-cash-stack",
      };
    } else {
      var bids = user.bids_made || [];
      var acceptedBids = bids.filter(function (b) { return b.bid_status === "accepted" && b.job_status === "completed"; });
      var totalEarned = acceptedBids.reduce(function (sum, b) { return sum + (Number(b.diamonds_used) || 0); }, 0);
      return {
        completedCount: acceptedBids.length,
        totalAmount: totalEarned,
        label: "Total Earned",
        icon: "bi-graph-up-arrow",
      };
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  var completedStats = getCompletedStats();

  return (
    <div className="dashboard-page">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">
            <i className="bi bi-hammer me-2"></i>OBS
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/jobs">Browse Jobs</Link>
              </li>
              {user.role === "poster" && (
                <li className="nav-item">
                  <Link className="nav-link" to="/post-job">Post Job</Link>
                </li>
              )}
              <li className="nav-item">
                <button className="btn btn-outline-light btn-sm ms-0 ms-lg-2" onClick={handleLogout}>Logout</button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container my-4">
        {/* Profile Header Card */}
        <div className="card border-0 shadow-sm mb-4 dash-card fade-in">
          <div className="card-body p-4">
            <div className="row align-items-center">
              <div className="col-auto">
                <div className="profile-avatar">
                  {user.profile_image ? (
                    <img src={user.profile_image} alt="Profile" className="rounded-circle" style={{ width: "80px", height: "80px", objectFit: "cover" }} />
                  ) : (
                    <div className="avatar-placeholder">
                      <i className="bi bi-person"></i>
                    </div>
                  )}
                </div>
              </div>
              <div className="col">
                <h4 className="fw-bold mb-1">{user.name || user.full_name}</h4>
                <p className="text-muted mb-1">{user.email}</p>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className={"badge " + (user.role === "poster" ? "bg-success" : "bg-primary")}>
                    {user.role === "poster" ? "Job Poster" : "Service Provider"}
                  </span>
                  <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={function () { setShowLocationModal(true); }} style={{ fontSize: "0.75rem" }}>
                    <i className="bi bi-geo-alt-fill me-1"></i>
                    {user.latitude ? "Update Location" : "Set Location"}
                  </button>
                  {user.location && (
                    <small className="text-muted">
                      <i className="bi bi-geo-alt me-1"></i>{user.location}
                    </small>
                  )}
                </div>
              </div>
              <div className="col-auto text-end d-none d-md-block">
                <div className="d-flex align-items-center gap-3">
                  <div className="text-center">
                    <div className="fs-5 fw-bold text-warning">
                      <i className="bi bi-star-fill me-1"></i>{user.rating_avg || 0}
                    </div>
                    <small className="text-muted">{user.rating_count || 0} reviews</small>
                  </div>
                  <div className="vr"></div>
                  <div className="text-center">
                    <div className="fs-4 fw-bold text-success">
                      {"\u00A3"}{user.wallet_balance || 0}
                    </div>
                    <small className="text-muted">Wallet</small>
                  </div>
                </div>
              </div>
            </div>
            {/* mobile-only wallet and rating display */}
            <div className="d-md-none mt-3 d-flex justify-content-around">
              <div className="text-center">
                <div className="fw-bold text-warning"><i className="bi bi-star-fill"></i> {user.rating_avg || 0}</div>
                <small className="text-muted">{user.rating_count || 0} reviews</small>
              </div>
              <div className="text-center">
                <div className="fw-bold text-success">{"\u00A3"}{user.wallet_balance || 0}</div>
                <small className="text-muted">Wallet</small>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center p-3 dash-card slide-up" style={{ animationDelay: "0.1s" }}>
              <i className="bi bi-briefcase fs-2 text-primary mb-1"></i>
              <h4 className="fw-bold mb-0">
                {user.role === "poster" ? (user.jobs_posted ? user.jobs_posted.length : 0) : (user.total_jobs_bid_on || 0)}
              </h4>
              <small className="text-muted">{user.role === "poster" ? "Jobs Posted" : "Jobs Bid On"}</small>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center p-3 dash-card slide-up" style={{ animationDelay: "0.2s" }}>
              <i className="bi bi-check-circle fs-2 text-success mb-1"></i>
              <h4 className="fw-bold mb-0">{completedStats.completedCount}</h4>
              <small className="text-muted">Completed</small>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center p-3 dash-card slide-up" style={{ animationDelay: "0.3s" }}>
              <i className={"bi " + completedStats.icon + " fs-2 text-info mb-1"}></i>
              <h4 className="fw-bold mb-0">{"\u00A3"}{completedStats.totalAmount}</h4>
              <small className="text-muted">{completedStats.label}</small>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center p-3 dash-card slide-up" style={{ animationDelay: "0.4s" }}>
              <i className="bi bi-star fs-2 text-warning mb-1"></i>
              <h4 className="fw-bold mb-0">{user.rating_avg || 0}</h4>
              <small className="text-muted">Rating</small>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card border-0 shadow-sm mb-4 dash-card">
          <div className="card-header bg-white border-bottom">
            <ul className="nav nav-tabs card-header-tabs">
              <li className="nav-item">
                <button className={"nav-link " + (activeTab === "overview" ? "active" : "")} onClick={function () { setActiveTab("overview"); }}>
                  <i className="bi bi-grid me-1"></i>Overview
                </button>
              </li>
              <li className="nav-item">
                <button className={"nav-link " + (activeTab === "completed" ? "active" : "")} onClick={function () { setActiveTab("completed"); }}>
                  <i className="bi bi-check2-all me-1"></i>Completed
                </button>
              </li>
              <li className="nav-item">
                <button className={"nav-link " + (activeTab === "reviews" ? "active" : "")} onClick={function () { setActiveTab("reviews"); }}>
                  <i className="bi bi-chat-quote me-1"></i>Reviews ({reviews.length})
                </button>
              </li>
            </ul>
          </div>

          <div className="card-body p-4">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div>
                <h5 className="fw-bold mb-3">
                  {user.role === "poster" ? "My Posted Jobs" : "My Bids"}
                </h5>

                {user.role === "poster" ? (
                  !user.jobs_posted || user.jobs_posted.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-inbox" style={{ fontSize: "48px", color: "#ccc" }}></i>
                      <p className="text-muted mt-2">No jobs posted yet</p>
                      <Link to="/post-job" className="btn btn-primary">Post Your First Job</Link>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Job</th>
                            <th>Category</th>
                            <th>Budget</th>
                            <th>Bids</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {user.jobs_posted.map(function (job) {
                            return (
                              <tr key={job.id}>
                                <td>
                                  <strong>{job.title}</strong>
                                  <br />
                                  <small className="text-muted">{job.address}</small>
                                </td>
                                <td><span className="badge bg-light text-dark">{job.category}</span></td>
                                <td className="fw-bold">{"\u00A3"}{job.budget}</td>
                                <td>{job.total_bids || 0}</td>
                                <td><span className={"badge bg-" + getStatusBadge(job.status)}>{job.status}</span></td>
                                <td>
                                  <div className="d-flex gap-1">
                                    <Link to={"/jobs/" + job.id} className="btn btn-sm btn-outline-primary">View</Link>
                                    {job.status === "open" && (
                                      <Link to={"/jobs/" + job.id + "/edit"} className="btn btn-sm btn-outline-secondary">Edit</Link>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )
                ) : (
                  !user.bids_made || user.bids_made.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-inbox" style={{ fontSize: "48px", color: "#ccc" }}></i>
                      <p className="text-muted mt-2">No bids placed yet</p>
                      <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Job</th>
                            <th>My Bid</th>
                            <th>Job Status</th>
                            <th>Bid Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {user.bids_made.map(function (bid) {
                            return (
                              <tr key={bid.bid_id}>
                                <td>
                                  <strong>{bid.job_title}</strong>
                                  <br />
                                  <small className="text-muted">Budget: {"\u00A3"}{bid.job_budget}</small>
                                </td>
                                <td className="fw-bold text-primary">{"\u00A3"}{bid.diamonds_used}</td>
                                <td><span className={"badge bg-" + getStatusBadge(bid.job_status)}>{bid.job_status}</span></td>
                                <td><span className={"badge bg-" + getStatusBadge(bid.bid_status)}>{bid.bid_status}</span></td>
                                <td>
                                  <div className="d-flex gap-1">
                                    <Link to={"/jobs/" + bid.job_id} className="btn btn-sm btn-outline-primary">View</Link>
                                    {bid.bid_status === "open" && (
                                      <button className="btn btn-sm btn-outline-danger" onClick={function () { setShowModal({ status: true, id: bid.bid_id }); }}>Cancel</button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Completed Tab */}
            {activeTab === "completed" && (
              <div>
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded text-center">
                      <h5 className="fw-bold text-success mb-0">{completedStats.completedCount}</h5>
                      <small className="text-muted">Completed Jobs</small>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded text-center">
                      <h5 className="fw-bold text-primary mb-0">{"\u00A3"}{completedStats.totalAmount}</h5>
                      <small className="text-muted">{completedStats.label}</small>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded text-center">
                      <h5 className="fw-bold text-warning mb-0">{user.rating_avg || 0}/5</h5>
                      <small className="text-muted">Average Rating</small>
                    </div>
                  </div>
                </div>

                <h5 className="fw-bold mb-3">Completed Jobs History</h5>

                {user.role === "poster" ? (
                  (function () {
                    var completed = (user.jobs_posted || []).filter(function (j) { return j.status === "completed"; });
                    if (completed.length === 0) {
                      return (
                        <div className="text-center py-4">
                          <i className="bi bi-clipboard-check" style={{ fontSize: "48px", color: "#ccc" }}></i>
                          <p className="text-muted mt-2">No completed jobs yet</p>
                        </div>
                      );
                    }
                    return (
                      <div className="d-flex flex-column gap-3">
                        {completed.map(function (job) {
                          return (
                            <div key={job.id} className="card border-0 bg-light">
                              <div className="card-body p-3">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <strong>{job.title}</strong>
                                    <div className="small text-muted">{job.category} - {job.address}</div>
                                  </div>
                                  <div className="text-end">
                                    <div className="fw-bold">{"\u00A3"}{job.budget}</div>
                                    <span className="badge bg-secondary">Completed</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()
                ) : (
                  (function () {
                    var completed = (user.bids_made || []).filter(function (b) { return b.bid_status === "accepted" && b.job_status === "completed"; });
                    if (completed.length === 0) {
                      return (
                        <div className="text-center py-4">
                          <i className="bi bi-clipboard-check" style={{ fontSize: "48px", color: "#ccc" }}></i>
                          <p className="text-muted mt-2">No completed jobs yet</p>
                        </div>
                      );
                    }
                    return (
                      <div className="d-flex flex-column gap-3">
                        {completed.map(function (bid) {
                          return (
                            <div key={bid.bid_id} className="card border-0 bg-light">
                              <div className="card-body p-3">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <strong>{bid.job_title}</strong>
                                    <div className="small text-muted">{bid.job_category}</div>
                                  </div>
                                  <div className="text-end">
                                    <div className="fw-bold text-success">{"\u00A3"}{bid.diamonds_used} earned</div>
                                    <span className="badge bg-secondary">Completed</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div>
                {reviews.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-chat-square-text" style={{ fontSize: "48px", color: "#ccc" }}></i>
                    <p className="text-muted mt-2">No reviews yet</p>
                  </div>
                ) : (
                  <div className="row g-3">
                    {reviews.map(function (rev) {
                      return (
                        <div key={rev.id} className="col-md-6">
                          <div className="card h-100 border bg-light">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <h6 className="fw-bold mb-0">{rev.reviewer_name}</h6>
                                  <small className="text-muted">Job: {rev.job_title}</small>
                                </div>
                                <div className="text-warning text-nowrap">
                                  {[1, 2, 3, 4, 5].map(function (i) {
                                    return (
                                      <i key={i} className={"bi " + (i <= Math.round(rev.rating) ? "bi-star-fill" : "bi-star")}></i>
                                    );
                                  })}
                                  <span className="ms-2 text-dark small fw-bold">{Number(rev.rating).toFixed(1)}</span>
                                </div>
                              </div>
                              <p className="mb-2 text-secondary small">{rev.review || "No written review."}</p>
                              <small className="text-muted">{new Date(rev.created_at).toLocaleDateString()}</small>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Delete Account - GDPR compliance */}
        <div className="card border-danger mt-4 mb-5">
          <div className="card-body p-4">
            <h5 className="text-danger fw-bold">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Delete Account
            </h5>
            <p className="text-muted small">
              Permanently delete your account and all associated data including jobs, bids, reviews,
              chat history, and wallet transactions. This action cannot be undone and is in compliance
              with GDPR Article 17 (Right to Erasure).
            </p>
            {!showDeleteModal ? (
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={function () { setShowDeleteModal(true); }}
              >
                I want to delete my account
              </button>
            ) : (
              <div className="mt-3">
                <label className="form-label fw-semibold">Enter your password to confirm:</label>
                <input
                  type="password"
                  className="form-control mb-3"
                  style={{ maxWidth: "350px" }}
                  value={deletePassword}
                  onChange={function (e) { setDeletePassword(e.target.value); }}
                  placeholder="Enter your password"
                />
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-danger"
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Deleting...
                      </>
                    ) : (
                      "Permanently Delete My Account"
                    )}
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={function () { setShowDeleteModal(false); setDeletePassword(""); }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Bid Modal */}
      {showModal.status && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cancel Bid</h5>
                <button type="button" className="btn-close" onClick={function () { setShowModal({ status: false, id: 0 }); }}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to cancel this bid?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={function () { setShowModal({ status: false, id: 0 }); }}>Close</button>
                <button className="btn btn-danger" onClick={handleConfirmCancel} disabled={loading}>
                  {loading ? "Cancelling..." : "Confirm Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {showLocationModal && (
        <LocationModal
          loading={loading}
          onSave={handleLocationSave}
          onClose={function () { setShowLocationModal(false); }}
          initialLat={user.latitude}
          initialLng={user.longitude}
        />
      )}
    </div>
  );
};

export default Dashboard;
