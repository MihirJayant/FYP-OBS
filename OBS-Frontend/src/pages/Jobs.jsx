// @ts-nocheck
import React, { useState, useEffect } from "react";
import { getJobs } from "../api/jobs";
import { lookupPostcode } from "../api/postcode";
import { Link, useSearchParams } from "react-router-dom";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [category, setCategory] = useState([]);
  const [budget, setBudget] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [userLocation, setUserLocation] = useState(null);

  const [searchParams] = useSearchParams();
  const [searchPostcode, setSearchPostcode] = useState("");
  const [postcodeSearching, setPostcodeSearching] = useState(false);
  const [postcodeError, setPostcodeError] = useState("");

  // Haversine distance calculation
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const catParam = searchParams.get("category");
  if (catParam) {
    setSelectedCategory(catParam);
  }
  useEffect(() => {
    const fetchJobs = async () => {
      const res = await getJobs();
      if (res.success) {
        setJobs(res.data);
        setFilteredJobs(res.data);
        const uniqueCategories = getUniqueCategories(res.data);
        setCategory(uniqueCategories);
      }
    };
    fetchJobs();
  }, []);

  function getUniqueCategories(jobs) {
    const map = new Map();
    jobs.forEach((job) => {
      if (job.category && !map.has(job.category)) {
        map.set(job.category, {
          id: map.size + 1,
          name: job.category,
        });
      }
    });
    return Array.from(map.values());
  }

  const handlePostcodeSearch = async () => {
    if (!searchPostcode.trim()) {
      setPostcodeError("Please enter a postcode");
      return;
    }
    setPostcodeSearching(true);
    setPostcodeError("");

    const result = await lookupPostcode(searchPostcode);

    if (result.success && result.data.valid) {
      setUserLocation({
        lat: result.data.latitude,
        lng: result.data.longitude,
        postcode: result.data.formatted,
      });
      setSortBy("near_me");
    } else {
      setPostcodeError(result.error || "Invalid postcode");
    }
    setPostcodeSearching(false);
  };

  const handleClearPostcodeSearch = () => {
    setSearchPostcode("");
    setUserLocation(null);
    setPostcodeError("");
    if (sortBy === "near_me") setSortBy("newest");
  };

  useEffect(() => {
    let result = [...jobs];

    if (searchTerm) {
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      result = result.filter((job) => job.category === selectedCategory);
    }

    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === "lowest") {
      result.sort((a, b) => a.budget - b.budget);
    } else if (sortBy === "highest") {
      result.sort((a, b) => b.budget - a.budget);
    } else if (sortBy === "near_me") {
      if (!userLocation) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setUserLocation({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              });
            },
            () => {
              const storedUser = JSON.parse(localStorage.getItem("user"));
              if (
                storedUser &&
                storedUser.latitude &&
                storedUser.longitude
              ) {
                setUserLocation({
                  lat: storedUser.latitude,
                  lng: storedUser.longitude,
                });
              } else {
                alert(
                  "Please enable location services or enter a postcode to use 'Near Me' sort."
                );
                setSortBy("newest");
              }
            }
          );
        }
      } else {
        result.sort((a, b) => {
          const distA = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            a.latitude,
            a.longitude
          );
          const distB = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            b.latitude,
            b.longitude
          );
          return distA - distB;
        });
      }
    }

    setFilteredJobs(result);
  }, [searchTerm, selectedCategory, budget, sortBy, jobs, userLocation]);

  const getStatusBadge = (status) => {
    const badges = {
      open: "success",
      awarded: "warning",
      in_progress: "info",
      completed: "secondary",
      cancelled: "danger",
    };
    return badges[status] || "secondary";
  };

  const getDistanceText = (job) => {
    if (!userLocation || !job.latitude || !job.longitude) return null;
    const dist = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      job.latitude,
      job.longitude
    );
    if (dist === Infinity) return null;
    return dist.toFixed(1) + " km away";
  };

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
        <div className="row mb-4">
          <div className="col">
            <h1 className="fw-bold">Browse Jobs</h1>
            <p className="text-muted">Find service opportunities near you</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label fw-semibold">Search</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label fw-semibold">Category</label>
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {category.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">
                  Search by Postcode
                </label>
                <div className="input-group">
                  <input
                    type="text"
                    className={`form-control ${
                      postcodeError ? "is-invalid" : ""
                    } ${userLocation?.postcode ? "is-valid" : ""}`}
                    placeholder="e.g., NG1 4BU"
                    value={searchPostcode}
                    onChange={(e) =>
                      setSearchPostcode(e.target.value.toUpperCase())
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handlePostcodeSearch();
                      }
                    }}
                  />
                  <button
                    className="btn btn-outline-primary"
                    type="button"
                    onClick={handlePostcodeSearch}
                    disabled={postcodeSearching}
                  >
                    {postcodeSearching ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      <i className="bi bi-search"></i>
                    )}
                  </button>
                  {userLocation?.postcode && (
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={handleClearPostcodeSearch}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  )}
                </div>
                {postcodeError && (
                  <div className="text-danger small mt-1">{postcodeError}</div>
                )}
                {userLocation?.postcode && (
                  <small className="text-success">
                    Showing jobs near {userLocation.postcode}
                  </small>
                )}
              </div>
              <div className="col-md-2">
                <label className="form-label fw-semibold">Sort By</label>
                <select
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="near_me">Near Me</option>
                  <option value="lowest">Lowest Budget</option>
                  <option value="highest">Highest Budget</option>
                </select>
              </div>
              <div className="col-md-1 d-flex align-items-end">
                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("");
                    setBudget("");
                    setSortBy("newest");
                    setSearchPostcode("");
                    setUserLocation(null);
                    setPostcodeError("");
                  }}
                >
                  <i className="bi bi-x-circle"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs count */}
        <div className="row">
          <div className="col">
            <p className="text-muted mb-3">{filteredJobs.length} jobs found</p>
          </div>
        </div>

        {/* Jobs List */}
        <div className="row g-4">
          {filteredJobs.length > 0 &&
            filteredJobs.map((job) => (
              <div key={job.id} className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm hover-card">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span
                        className={`badge bg-${getStatusBadge(job.status)}`}
                      >
                        {job.status.toUpperCase()}
                      </span>
                      <span className="badge bg-light text-dark">
                        {job.category.toUpperCase()}
                      </span>
                    </div>
                    <h5 className="card-title fw-bold mb-2">{job.title}</h5>
                    <p className="card-text text-muted small mb-3">
                      {job.description.substring(0, 100)}...
                    </p>
                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-currency-pound text-primary me-2"></i>
                        <strong>
                          {"\u00A3"}
                          {job.budget.toLocaleString()}
                        </strong>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-geo-alt text-primary me-2"></i>
                        <span className="small">{job.address}</span>
                      </div>
                      {getDistanceText(job) && (
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-signpost text-primary me-2"></i>
                          <span className="small text-info">
                            {getDistanceText(job)}
                          </span>
                        </div>
                      )}
                      {job.deadline && (
                        <div className="d-flex align-items-center">
                          <i className="bi bi-calendar text-primary me-2"></i>
                          <span className="small">
                            Due:{" "}
                            {new Date(job.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="btn btn-primary w-100"
                    >
                      View Details{" "}
                      <i className="bi bi-arrow-right ms-2"></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-5">
            <i
              className="bi bi-inbox"
              style={{ fontSize: "64px", color: "#ccc" }}
            ></i>
            <p className="text-muted mt-3">
              No jobs found matching your criteria
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .hover-card {
          transition: all 0.3s ease;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </div>
  );
};

export default Jobs;