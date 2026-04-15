import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getPublicProfile } from "../api/user";

var UserProfile = function () {
  var { id } = useParams();
  var [profile, setProfile] = useState(null);
  var [loading, setLoading] = useState(true);

  var SERVER_URL = import.meta.env.VITE_IMG_URL;

  useEffect(function () {
    var fetchProfile = async function () {
      setLoading(true);
      var res = await getPublicProfile(id);
      if (res.success) {
        setProfile(res.data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [id]);

  var formatDate = function (dateStr) {
    if (!dateStr) return "";
    var date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  var getMemberDuration = function (dateStr) {
    if (!dateStr) return "";
    var now = new Date();
    var joined = new Date(dateStr);
    var months = (now.getFullYear() - joined.getFullYear()) * 12 + (now.getMonth() - joined.getMonth());
    if (months < 1) return "Less than a month";
    if (months === 1) return "1 month";
    if (months < 12) return months + " months";
    var years = Math.floor(months / 12);
    return years === 1 ? "1 year" : years + " years";
  };

  var renderStars = function (rating) {
    var stars = [];
    for (var i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(
          <i key={i} className="bi bi-star-fill text-warning"></i>
        );
      } else if (i - 0.5 <= rating) {
        stars.push(
          <i key={i} className="bi bi-star-half text-warning"></i>
        );
      } else {
        stars.push(
          <i key={i} className="bi bi-star text-warning"></i>
        );
      }
    }
    return stars;
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

  if (!profile) {
    return (
      <div className="text-center mt-5">
        <h3>User not found</h3>
        <Link to="/jobs" className="btn btn-primary mt-3">Browse Jobs</Link>
      </div>
    );
  }

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
          {/* Profile Card */}
          <div className="col-lg-4 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 text-center">
                <div className="mb-3">
                  {profile.profile_image ? (
                    <img
                      src={SERVER_URL + profile.profile_image}
                      alt={profile.name}
                      className="rounded-circle"
                      style={{ width: "100px", height: "100px", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                      style={{ width: "100px", height: "100px", fontSize: "40px" }}
                    >
                      <i className="bi bi-person"></i>
                    </div>
                  )}
                </div>

                <h4 className="fw-bold mb-1">{profile.name}</h4>
                <span className={"badge " + (profile.role === "provider" ? "bg-primary" : "bg-success") + " mb-2"}>
                  {profile.role === "provider" ? "Service Provider" : "Job Poster"}
                </span>

                <div className="mb-3">
                  {renderStars(profile.rating)}
                  <span className="ms-2 text-muted">
                    {profile.rating} ({profile.total_reviews} reviews)
                  </span>
                </div>

                {profile.location && (
                  <p className="text-muted small mb-2">
                    <i className="bi bi-geo-alt me-1"></i>
                    {profile.location}
                  </p>
                )}

                <p className="text-muted small mb-0">
                  <i className="bi bi-calendar me-1"></i>
                  Member for {getMemberDuration(profile.member_since)}
                </p>
              </div>
            </div>

            {/* Stats Card */}
            <div className="card border-0 shadow-sm mt-3">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3">Statistics</h5>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Completed Jobs</span>
                  <strong>{profile.completed_jobs}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Total Reviews</span>
                  <strong>{profile.total_reviews}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Average Rating</span>
                  <strong>{profile.rating}/5</strong>
                </div>
                {profile.total_earnings > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Total Earned</span>
                    <strong className="text-success">{"\u00A3"}{profile.total_earnings}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="card border-0 shadow-sm mt-3">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3">Skills</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {profile.skills.map(function (skill, index) {
                      return (
                        <span key={index} className="badge bg-light text-dark border">
                          {skill}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-4">Reviews ({profile.total_reviews})</h4>

                {profile.reviews && profile.reviews.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {profile.reviews.map(function (review, index) {
                      return (
                        <div key={index} className="border rounded p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <strong>{review.reviewer_name}</strong>
                              <div className="small text-muted">{review.job_title}</div>
                            </div>
                            <div>{renderStars(review.rating)}</div>
                          </div>
                          {review.review && (
                            <p className="text-muted mb-1">{review.review}</p>
                          )}
                          <small className="text-muted">{formatDate(review.created_at)}</small>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-chat-square-text" style={{ fontSize: "48px", color: "#ccc" }}></i>
                    <p className="text-muted mt-2">No reviews yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;