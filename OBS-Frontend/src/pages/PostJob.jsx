// @ts-nocheck
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createJob } from "../api/jobs";
import { enhanceDescription } from "../api/ai";
import { mockCategories } from "../data/mockData";
import dayjs from "dayjs";
import PostcodeInput from "../components/PostcodeInput";

var PostJob = function () {
  var navigate = useNavigate();
  var [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    budget: "",
    deadline: "",
    address: "",
    postcode: "",
    latitude: null,
    longitude: null,
    image: "",
  });
  var [loading, setLoading] = useState(false);
  var [enhancing, setEnhancing] = useState(false);
  var [postcodeValid, setPostcodeValid] = useState(false);
  var [showOriginal, setShowOriginal] = useState(false);
  var [originalDescription, setOriginalDescription] = useState("");

  var user = JSON.parse(localStorage.getItem("user"));

  var handleChange = function (e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  var handlePostcodeChange = function (postcodeData) {
    setFormData({
      ...formData,
      postcode: postcodeData.postcode,
      latitude: postcodeData.latitude,
      longitude: postcodeData.longitude,
      address: formData.address || postcodeData.address,
    });
    setPostcodeValid(true);
  };

  var handlePostcodeError = function () {
    setPostcodeValid(false);
  };

  var handleEnhanceDescription = async function () {
    if (!formData.description || formData.description.trim().length < 10) {
      toast.error("Please write a rough description first (at least a few words)");
      return;
    }

    setEnhancing(true);
    setOriginalDescription(formData.description);

    var result = await enhanceDescription(formData.description, formData.title);

    setEnhancing(false);

    if (result.success) {
      var updates = {
        ...formData,
        description: result.data.enhanced_description,
      };

      // Auto-fill category if not already selected
      if (!formData.category && result.data.suggested_category) {
        updates.category = result.data.suggested_category;
      }

      // Auto-fill title if empty
      if (!formData.title && result.data.suggested_title) {
        updates.title = result.data.suggested_title;
      }

      setFormData(updates);
      setShowOriginal(true);
      toast.success("Description enhanced by AI");
    } else {
      toast.error(result.error || "Failed to enhance description");
    }
  };

  var handleRevertDescription = function () {
    setFormData({
      ...formData,
      description: originalDescription,
    });
    setShowOriginal(false);
  };

  var handleSubmit = async function (e) {
    e.preventDefault();
    setLoading(true);

    if (parseFloat(formData.budget) <= 0) {
      toast.error("Budget must be greater than 0");
      setLoading(false);
      return;
    }

    if (!postcodeValid) {
      toast.error("Please enter a valid UK postcode");
      setLoading(false);
      return;
    }

    var formattedDeadline = formData.deadline
      ? dayjs(formData.deadline).format("DD-MM-YYYY")
      : null;

    var fd = new FormData();
    fd.append("title", formData.title);
    fd.append("description", formData.description);
    fd.append("category", formData.category);
    fd.append("budget", formData.budget);
    if (formattedDeadline) fd.append("deadline", formattedDeadline);
    fd.append("address", formData.address);
    fd.append("postcode", formData.postcode);
    if (formData.latitude) fd.append("latitude", formData.latitude);
    if (formData.longitude) fd.append("longitude", formData.longitude);
    fd.append("images", formData.image);

    var res = await createJob(fd);
    setLoading(false);

    if (res.success) {
      toast.success("Job posted successfully!");
      navigate("/jobs/" + res.data.id);
    }
  };

  if (!user || user.role !== "poster") return null;

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">
            <i className="bi bi-hammer me-2"></i>OBS
          </Link>
          <div className="ms-auto">
            <Link to="/dashboard" className="btn btn-outline-light btn-sm">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h2 className="fw-bold mb-4">Post a New Job</h2>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., House Deep Cleaning Required"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="form-label fw-semibold mb-0">
                        Description *
                      </label>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                        onClick={handleEnhanceDescription}
                        disabled={enhancing}
                        title="Use AI to improve your description"
                      >
                        {enhancing ? (
                          <>
                            <span className="spinner-border spinner-border-sm"></span>
                            Enhancing...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-stars"></i>
                            Smart Description
                          </>
                        )}
                      </button>
                    </div>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="5"
                      placeholder="Write a rough description of what you need done. You can use the Smart Description button to let AI polish it for you..."
                      required
                    ></textarea>
                    {showOriginal && (
                      <div className="mt-2">
                        <div className="d-flex align-items-center gap-2">
                          <small className="text-success">
                            <i className="bi bi-check-circle me-1"></i>
                            Enhanced by AI
                          </small>
                          <button
                            type="button"
                            className="btn btn-link btn-sm p-0 text-muted"
                            onClick={handleRevertDescription}
                          >
                            Revert to original
                          </button>
                        </div>
                      </div>
                    )}
                    <small className="text-muted">
                      Tip: Write a rough paragraph and click "Smart Description"
                      to let AI create a professional listing for you
                    </small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Category *</label>
                    <select
                      className="form-select"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a category</option>
                      {mockCategories.map(function (cat) {
                        return (
                          <option key={cat.id} value={cat.name}>
                            {cat.icon} {cat.name}
                          </option>
                        );
                      })}
                    </select>
                    {formData.category && showOriginal && (
                      <small className="text-success">
                        <i className="bi bi-check-circle me-1"></i>
                        Category suggested by AI
                      </small>
                    )}
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Budget (GBP) *
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        placeholder="e.g., 2000"
                        required
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Deadline (Optional)
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Upload Image *
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      name="image"
                      accept="image/*"
                      onChange={function (e) {
                        setFormData({
                          ...formData,
                          image: e.target.files[0],
                        });
                      }}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Postcode *
                    </label>
                    <PostcodeInput
                      value={formData.postcode}
                      onChange={handlePostcodeChange}
                      onError={handlePostcodeError}
                      placeholder="Enter UK postcode (e.g., NG1 4BU)"
                      required
                    />
                    <small className="text-muted">
                      Enter a valid UK postcode to set the job location
                    </small>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Address Details (Optional)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="e.g., 123 Main Street, Apartment 5B"
                    />
                    <small className="text-muted">
                      Add specific address details like house number, street name
                    </small>
                  </div>

                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={loading || !postcodeValid}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Posting...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-plus-circle me-2"></i>
                          Post Job
                        </>
                      )}
                    </button>
                    <Link to="/dashboard" className="btn btn-outline-secondary">
                      Cancel
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJob;