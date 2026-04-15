import React, { useState } from "react";

const RatingModal = ({ show, onClose, onSubmit, isSubmitting }) => {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ rating, review });
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1050,
      }}
    >
      <div className="card shadow-lg" style={{ width: "400px", maxWidth: "90%" }}>
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Rate Service</h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={onClose}
          ></button>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3 text-center">
              <label className="form-label d-block fw-bold">Select Rating</label>
              <div className="fs-1 text-warning">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i
                    key={star}
                    className={`bi ${star <= rating ? "bi-star-fill" : "bi-star"}`}
                    style={{ cursor: "pointer", marginRight: "5px" }}
                    onClick={() => setRating(star)}
                  ></i>
                ))}
              </div>
            </div>

            <div className="mb-3">
            <label className="form-label fw-bold">Share your experience (Optional)</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Share your experience..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
              ></textarea>
            </div>

            <div className="d-grid gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
