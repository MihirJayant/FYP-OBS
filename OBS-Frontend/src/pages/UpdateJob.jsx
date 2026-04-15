// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { updateJob, getJobById } from "../api/jobs";
import { mockCategories } from "../data/mockData";

const UpdateJob = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    budget: "",
    deadline: "",
    address: "",
    image: null,
  });

  const user = JSON.parse(localStorage.getItem("user"));

  // Auth check
  useEffect(() => {
    if (!user) navigate("/login");
    else if (user.role !== "poster") navigate("/jobs");
  }, [user, navigate]);

  // Fetch job by ID
  useEffect(() => {
    const fetchJob = async () => {
      const res = await getJobById(id);
      if (res.success) {
        setJob(res.data);

        // Pre-fill form
        setFormData({
          title: res.data.title,
          description: res.data.description,
          category: res.data.category,
          budget: res.data.budget,
          address: res.data.address,
          deadline: res.data.deadline
            ? dayjs(res.data.deadline, "DD-MM-YYYY").format("YYYY-MM-DD")
            : "",
          image: null,
        });
      } else {
        toast.error("Job not found");
        navigate("/jobs");
      }
    };

    fetchJob();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (parseFloat(formData.budget) <= 0) {
      toast.error("Budget must be greater than 0");
      setLoading(false);
      return;
    }

    const formattedDeadline = formData.deadline
      ? dayjs(formData.deadline).format("DD-MM-YYYY")
      : null;

    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("description", formData.description);
    fd.append("category", formData.category);
    fd.append("budget", formData.budget);
    fd.append("address", formData.address);

    if (formattedDeadline) {
      fd.append("deadline", formattedDeadline);
    }

    if (formData.image) {
      fd.append("images", formData.image);
    }

    const res = await updateJob(id, fd);
    setLoading(false);

    if (res.success) {
      toast.success("Job updated successfully!");
      navigate(`/jobs/${id}`);
    }
  };

  if (!job) return <div className="text-center mt-5">Loading...</div>;

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
                <h2 className="fw-bold mb-4">Update Job</h2>

                <form onSubmit={handleSubmit}>
                  {/* TITLE */}
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
                      required
                    />
                  </div>

                  {/* DESCRIPTION */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Description *
                    </label>
                    <textarea
                      className="form-control"
                      rows="5"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>

                  {/* CATEGORY */}
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
                      {mockCategories.map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* BUDGET */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Budget (£) *
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        required
                        min="0"
                      />
                    </div>
                  </div>

                  {/* DEADLINE */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Deadline</label>
                    <input
                      type="date"
                      className="form-control"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                    />
                  </div>

                  {/* IMAGE */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Replace Image
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          image: e.target.files[0],
                        })
                      }
                    />
                    <small className="text-muted">
                      Current image will stay unless you upload a new one.
                    </small>
                  </div>

                  {/* ADDRESS */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Address *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* BUTTONS */}
                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-save me-2"></i>
                          Save Changes
                        </>
                      )}
                    </button>

                    <Link
                      to={`/jobs/${id}`}
                      className="btn btn-outline-secondary"
                    >
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

export default UpdateJob;
