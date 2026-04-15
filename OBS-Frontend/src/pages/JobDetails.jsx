// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getJobWithBids, completeJob } from "../api/jobs";
import { acceptBid, createBid } from "../api/bids";
import { addRating, getMyRating } from "../api/ratings";
import RatingModal from "../components/RatingModal";
import JobTimeline from "../components/JobTimeline";

var JobDetails = function () {
  var SERVER_URL = import.meta.env.VITE_IMG_URL;
  var { id } = useParams();
  var navigate = useNavigate();

  var [job, setJob] = useState(null);
  var [bids, setBids] = useState([]);
  var [bidAmount, setBidAmount] = useState("");
  var [bidMessage, setBidMessage] = useState("");
  var [estimatedDays, setEstimatedDays] = useState("");
  var [showBidForm, setShowBidForm] = useState(false);
  var [loading, setLoading] = useState(false);
  var [imgUrl, setImgUrl] = useState(null);
  var [showRatingModal, setShowRatingModal] = useState(false);
  var [hasRated, setHasRated] = useState(false);
  var [isRatingSubmitting, setIsRatingSubmitting] = useState(false);
  var [showPaymentModal, setShowPaymentModal] = useState(false);
  var [completing, setCompleting] = useState(false);
  var [bidSortBy, setBidSortBy] = useState("newest");

  var user = JSON.parse(localStorage.getItem("user"));

  function formatDate(isoDate) {
    if (!isoDate) return "";
    var date = new Date(isoDate);
    var day = String(date.getDate()).padStart(2, "0");
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var year = date.getFullYear();
    return day + "-" + month + "-" + year;
  }

  useEffect(function () {
    fetchJobs();
  }, [id]);

  var fetchJobs = async function () {
    try {
      setLoading(true);
      var res = await getJobWithBids(id);

      if (res.success) {
        setJob(res.data);
        setBids(res.data.bids || []);
        if (res.data.url) setImgUrl(SERVER_URL + res.data.url);

        if (user) {
          var ratingRes = await getMyRating(id);
          if (ratingRes.success && ratingRes.data) {
            setHasRated(true);
          }
        }
      } else {
        toast.error(res.error || "Failed to load job details");
      }
    } catch (error) {
      console.error("Error in fetchJobs:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  var handleRatingSubmit = async function (data) {
    setIsRatingSubmitting(true);
    var res = await addRating({ jobId: job.id, ...data });
    setIsRatingSubmitting(false);
    if (res.success) {
      toast.success("Rating submitted successfully!");
      setHasRated(true);
      setShowRatingModal(false);
    } else {
      toast.error(res.error || "Failed to submit rating");
    }
  };

  var handleSubmitBid = async function (e) {
    e.preventDefault();
    if (!user) {
      alert("Please login to submit a bid");
      navigate("/login");
      return;
    }
    if (user.role !== "provider") {
      alert("Only service providers can submit bids");
      return;
    }

    var newBid = {
      job_id: id,
      diamonds_used: parseFloat(bidAmount),
      message: bidMessage,
      estimated_days: estimatedDays ? parseInt(estimatedDays) : null,
    };

    setLoading(true);
    var res = await createBid(newBid);
    setLoading(false);
    if (res.success) {
      toast.success("Bid submitted successfully!");
    }
    setBidAmount("");
    setBidMessage("");
    setEstimatedDays("");
    setShowBidForm(false);
    await fetchJobs();
  };

  var handleAcceptBid = async function (bidId) {
    if (!user || user.id !== job.poster_id) {
      alert("Only the job poster can accept bids");
      return;
    }
    setLoading(true);
    var res = await acceptBid(bidId);
    setLoading(false);
    if (res.success) {
      toast.success("Bid accepted successfully!");
      await fetchJobs();
    }
  };

  var handleCompleteJob = async function (paymentMethod) {
    if (!user || user.id !== job.poster_id) {
      alert("Only the job poster can mark a job as complete");
      return;
    }

    if (paymentMethod === "bank_transfer") {
      toast.info("Bank transfer option is coming soon. Please use Cash or OBS Wallet.");
      return;
    }

    var confirmMsg = paymentMethod === "wallet"
      ? "The bid amount will be deducted from your OBS Wallet and credited to the provider. Continue?"
      : "You are confirming that payment was made in cash. Continue?";

    var confirmed = window.confirm(confirmMsg);
    if (!confirmed) return;

    setCompleting(true);
    var res = await completeJob(job.id, paymentMethod);
    setCompleting(false);

    if (res.success) {
      toast.success("Job marked as completed!");
      setShowPaymentModal(false);
      await fetchJobs();
    } else {
      toast.error(res.error || "Failed to complete job");
    }
  };

  var getStatusBadge = function (status) {
    var badges = {
      open: "success",
      awarded: "warning",
      in_progress: "info",
      completed: "secondary",
      cancelled: "danger",
      pending: "warning",
      accepted: "success",
      rejected: "danger",
    };
    return badges[status] || "secondary";
  };

  var getSortedBids = function () {
    var sorted = [].concat(bids);
    if (bidSortBy === "lowest") {
      sorted.sort(function (a, b) { return a.diamonds_used - b.diamonds_used; });
    } else if (bidSortBy === "highest") {
      sorted.sort(function (a, b) { return b.diamonds_used - a.diamonds_used; });
    } else if (bidSortBy === "fastest") {
      sorted.sort(function (a, b) {
        return (a.estimated_days || 999) - (b.estimated_days || 999);
      });
    } else if (bidSortBy === "rating") {
      sorted.sort(function (a, b) {
        return (b.provider_rating || 0) - (a.provider_rating || 0);
      });
    } else {
      sorted.sort(function (a, b) {
        return new Date(b.created_at) - new Date(a.created_at);
      });
    }
    return sorted;
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

  if (!job) {
    return (
      <div className="text-center mt-5">
        <h3>Job not found or failed to load.</h3>
      </div>
    );
  }

  var isAcceptedProvider = bids.some(function (b) {
    return b.status === "accepted" && b.provider_id === (user ? user.id : null);
  });

  var canComplete = user && user.id === job.poster_id && job.status === "awarded";

  var canRate = user &&
    (job.status === "awarded" || job.status === "completed") &&
    !hasRated &&
    (user.id === job.poster_id || isAcceptedProvider);

  var sortedBids = getSortedBids();

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">
            <i className="bi bi-hammer me-2"></i>OBS
          </Link>
          <div className="ms-auto">
            <Link to="/jobs" className="btn btn-outline-light btn-sm me-2">Browse Jobs</Link>
            <Link to="/dashboard" className="btn btn-outline-light btn-sm">Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="container my-5">
        <div className="row">
          <div className="col-lg-8 mb-4">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <span className={"badge bg-" + getStatusBadge(job.status) + " me-2"}>
                      {job.status.toUpperCase()}
                    </span>
                    <span className="badge bg-light text-dark">{job.category}</span>
                  </div>
                </div>

                <JobTimeline status={job.status} bidCount={bids.length} />

                {canComplete && (
                  <div className="alert alert-info border mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <strong>Job Awarded</strong>
                        <p className="mb-0 small text-muted">
                          Select a payment method to complete this job.
                        </p>
                      </div>
                      <button
                        className="btn btn-success fw-bold"
                        onClick={function () { setShowPaymentModal(!showPaymentModal); }}
                        disabled={completing}
                      >
                        <i className="bi bi-check-circle-fill me-2"></i>Complete Job
                      </button>
                    </div>

                    {showPaymentModal && (
                      <div className="mt-3 p-3 bg-white rounded border">
                        <h6 className="fw-bold mb-3">Choose Payment Method</h6>
                        <div className="d-flex flex-column gap-2">
                          <button
                            className="btn btn-outline-success d-flex align-items-center gap-2"
                            onClick={function () { handleCompleteJob("cash"); }}
                            disabled={completing}
                          >
                            <i className="bi bi-cash-stack fs-5"></i>
                            <div className="text-start">
                              <div className="fw-bold">Cash Payment</div>
                              <small className="text-muted">Payment was made in cash directly</small>
                            </div>
                          </button>

                          <button
                            className="btn btn-outline-primary d-flex align-items-center gap-2"
                            onClick={function () { handleCompleteJob("wallet"); }}
                            disabled={completing}
                          >
                            <i className="bi bi-wallet2 fs-5"></i>
                            <div className="text-start">
                              <div className="fw-bold">OBS Wallet</div>
                              <small className="text-muted">Deduct from your wallet and credit provider</small>
                            </div>
                          </button>

                          <button
                            className="btn btn-outline-secondary d-flex align-items-center gap-2"
                            onClick={function () { handleCompleteJob("bank_transfer"); }}
                            disabled={completing}
                          >
                            <i className="bi bi-bank fs-5"></i>
                            <div className="text-start">
                              <div className="fw-bold">Bank Transfer</div>
                              <small className="text-muted text-warning">Coming soon</small>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {job.status === "completed" && (
                  <div className="alert alert-success border mb-4">
                    <strong>This job has been completed.</strong>
                    {canRate && <span className="ms-2">Please leave a review.</span>}
                  </div>
                )}

                {canRate && (
                  <div className="alert alert-light border d-flex justify-content-between align-items-center mb-4 bg-warning bg-opacity-10">
                    <div>
                      <strong>How was the service?</strong>
                      <p className="mb-0 small text-muted">Rate the service you received and help others make informed decisions.</p>
                    </div>
                    <button className="btn btn-warning text-dark fw-bold" onClick={function () { setShowRatingModal(true); }}>
                      <i className="bi bi-star-fill me-2"></i>Rate Service
                    </button>
                  </div>
                )}

                <h2 className="fw-bold mb-3">{job.title}</h2>

                <div className="mb-4">
                  <ImagePreview imgUrl={imgUrl} />
                </div>

                <div className="mb-4">
                  <h5 className="fw-semibold mb-2">Description</h5>
                  <p className="text-muted">{job.description}</p>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-currency-pound fs-4 text-primary me-2"></i>
                      <div>
                        <small className="text-muted d-block">Max Budget</small>
                        <strong>{"\u00A3"}{job.budget.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-geo-alt fs-4 text-primary me-2"></i>
                      <div>
                        <small className="text-muted d-block">Location</small>
                        <strong>{job.address}</strong>
                      </div>
                    </div>
                  </div>
                  {job.deadline && (
                    <div className="col-md-6">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-calendar fs-4 text-primary me-2"></i>
                        <div>
                          <small className="text-muted d-block">Deadline</small>
                          <strong>{new Date(job.deadline).toLocaleDateString()}</strong>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-person fs-4 text-primary me-2"></i>
                      <div>
                        <small className="text-muted d-block">Posted by</small>
                        <Link to={"/profile/" + job.poster_id} className="fw-bold text-decoration-none">
                          {job.poster_name}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {user && user.role === "provider" && job.status === "open" && (
                  <button
                    className="btn btn-primary btn-lg w-100"
                    onClick={function () {
                      setShowBidForm(!showBidForm);
                      setBidAmount("");
                      setBidMessage("");
                      setEstimatedDays("");
                    }}
                  >
                    <i className="bi bi-cash-coin me-2"></i>
                    {showBidForm ? "Cancel" : "Place Your Bid"}
                  </button>
                )}
              </div>
            </div>

            {showBidForm && (
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <h4 className="fw-bold mb-3">Submit Your Bid</h4>
                  <form onSubmit={handleSubmitBid}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Your Price Quote (GBP) *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={bidAmount}
                        onChange={function (e) { setBidAmount(e.target.value); }}
                        placeholder="How much will you charge for this job?"
                        required
                        min="1"
                      />
                      <small className="text-muted">
                        The poster's maximum budget is {"\u00A3"}{job.budget}
                      </small>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Estimated Days</label>
                      <input
                        type="number"
                        className="form-control"
                        value={estimatedDays}
                        onChange={function (e) { setEstimatedDays(e.target.value); }}
                        placeholder="How many days will it take?"
                        min="1"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Message to Client *</label>
                      <textarea
                        className="form-control"
                        value={bidMessage}
                        onChange={function (e) { setBidMessage(e.target.value); }}
                        rows="4"
                        placeholder="Explain your experience and why you are the best choice..."
                        required
                      ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Submit Bid</button>
                  </form>
                </div>
              </div>
            )}
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="fw-bold mb-0">Bids ({bids.length})</h4>
                </div>

                {bids.length > 1 && (
                  <div className="mb-3">
                    <select
                      className="form-select form-select-sm"
                      value={bidSortBy}
                      onChange={function (e) { setBidSortBy(e.target.value); }}
                    >
                      <option value="newest">Sort: Newest First</option>
                      <option value="lowest">Sort: Lowest Price</option>
                      <option value="highest">Sort: Highest Price</option>
                      <option value="fastest">Sort: Fastest Delivery</option>
                      <option value="rating">Sort: Best Rating</option>
                    </select>
                  </div>
                )}

                {bids.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-inbox" style={{ fontSize: "48px", color: "#ccc" }}></i>
                    <p className="text-muted mt-2">No bids yet</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {sortedBids.map(function (bid) {
                      return (
                        <div key={bid.id} className="border rounded p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <Link
                                to={"/profile/" + bid.provider_id}
                                className="fw-bold text-decoration-none"
                              >
                                {bid.provider_name}
                              </Link>
                              {bid.provider_rating > 0 && (
                                <div className="small">
                                  <i className="bi bi-star-fill text-warning me-1"></i>
                                  <span>{parseFloat(bid.provider_rating).toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                            <span className={"badge bg-" + getStatusBadge(bid.status)}>
                              {bid.status}
                            </span>
                          </div>
                          <div className="mb-2">
                            <div className="text-primary fw-bold fs-5">
                              {"\u00A3"}{bid.diamonds_used.toLocaleString()}
                            </div>
                            {bid.estimated_days && (
                              <small className="text-muted">
                                <i className="bi bi-clock me-1"></i>
                                {bid.estimated_days} days
                              </small>
                            )}
                          </div>
                          <div className="mb-2">
                            {bid.created_at && (
                              <small className="text-muted">
                                <i className="bi bi-calendar me-1"></i>
                                {formatDate(bid.created_at)}
                              </small>
                            )}
                          </div>
                          <p className="text-muted small mb-2">{bid.message}</p>
                          {user && user.id === job.poster_id && bid.status === "open" && (
                            <button
                              className="btn btn-sm btn-success w-100"
                              onClick={function () { handleAcceptBid(bid.id); }}
                            >
                              Accept Bid
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {bids.length > 1 && user && user.id === job.poster_id && job.status === "open" && (
                  <div className="mt-4 p-3 bg-light rounded">
                    <h6 className="fw-bold mb-2">Bid Comparison</h6>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted small">Lowest bid</span>
                      <strong className="text-success small">
                        {"\u00A3"}{Math.min.apply(null, bids.filter(function (b) { return b.status === "open"; }).map(function (b) { return b.diamonds_used; }))}
                      </strong>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted small">Highest bid</span>
                      <strong className="small">
                        {"\u00A3"}{Math.max.apply(null, bids.filter(function (b) { return b.status === "open"; }).map(function (b) { return b.diamonds_used; }))}
                      </strong>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted small">Average bid</span>
                      <strong className="small">
                        {"\u00A3"}{Math.round(
                          bids.filter(function (b) { return b.status === "open"; })
                            .reduce(function (sum, b) { return sum + b.diamonds_used; }, 0) /
                          bids.filter(function (b) { return b.status === "open"; }).length
                        )}
                      </strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted small">Fastest delivery</span>
                      <strong className="small">
                        {Math.min.apply(null, bids
                          .filter(function (b) { return b.status === "open" && b.estimated_days; })
                          .map(function (b) { return b.estimated_days; })
                        ) || "N/A"} days
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <RatingModal
        show={showRatingModal}
        onClose={function () { setShowRatingModal(false); }}
        onSubmit={handleRatingSubmit}
        isSubmitting={isRatingSubmitting}
      />
    </div>
  );
};

export default JobDetails;

export function ImagePreview({ imgUrl }) {
  var [showFull, setShowFull] = useState(false);

  return (
    <>
      <div className="mb-4">
        <div
          style={{
            maxWidth: "100%",
            height: "200px",
            margin: "auto",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "10px",
            cursor: "pointer",
          }}
          onClick={function () { setShowFull(true); }}
        >
          {imgUrl && (
            <img
              src={imgUrl}
              alt="job"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
        </div>
      </div>

      {showFull && (
        <div
          onClick={function () { setShowFull(false); }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            cursor: "zoom-out",
          }}
        >
          <img
            src={imgUrl}
            alt="full"
            style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain", borderRadius: "10px" }}
          />
        </div>
      )}
    </>
  );
}