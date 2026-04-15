var pool = require("../db");
var { ApiError } = require("../utils/errors");
var { lookupPostcode } = require("../services/postcode");

async function getMe(req, res) {
  var { rows } = await pool.query(
    "SELECT " +
      "u.id, u.email, u.name, u.role, u.phone, u.location, " +
      "u.latitude, u.longitude, u.profile_image, " +
      "(SELECT COALESCE(ROUND(AVG(r.rating), 1), 0) FROM ratings r WHERE " +
      "(u.role = 'provider' AND r.provider_id = u.id AND r.reviewer_id != u.id) OR " +
      "(u.role = 'poster' AND r.poster_id = u.id AND r.reviewer_id != u.id)) AS rating_avg, " +
      "(SELECT COUNT(*) FROM ratings r WHERE " +
      "(u.role = 'provider' AND r.provider_id = u.id AND r.reviewer_id != u.id) OR " +
      "(u.role = 'poster' AND r.poster_id = u.id AND r.reviewer_id != u.id)) AS rating_count, " +
      "(SELECT COALESCE(SUM(CASE WHEN wl.type = 'credit' THEN wl.diamonds WHEN wl.type = 'debit' THEN -wl.diamonds ELSE 0 END), 0) " +
      "FROM wallet_ledger wl WHERE wl.user_id = u.id) AS wallet_balance, " +
      "CASE WHEN u.role = 'poster' THEN COALESCE((SELECT json_agg(json_build_object(" +
      "'id', j.id, 'title', j.title, 'description', j.description, 'category', j.category, " +
      "'budget', j.budget, 'deadline', j.deadline, 'address', j.address, 'status', j.status, " +
      "'accepted_bid_id', j.accepted_bid_id, 'url', j.url, 'created_at', j.created_at, " +
      "'total_bids', (SELECT COUNT(*) FROM bids b WHERE b.job_id = j.id), " +
      "'total_accepted_bids', (SELECT COUNT(*) FROM bids b WHERE b.job_id = j.id AND b.status = 'accepted')" +
      ")) FROM jobs j WHERE j.poster_id = u.id), '[]'::json) END AS jobs_posted, " +
      "CASE WHEN u.role = 'poster' THEN (SELECT COUNT(*) FROM bids b JOIN jobs j ON b.job_id = j.id WHERE j.poster_id = u.id) END AS total_bids_on_jobs, " +
      "CASE WHEN u.role = 'poster' THEN (SELECT COUNT(*) FROM bids b JOIN jobs j ON b.job_id = j.id WHERE j.poster_id = u.id AND b.status = 'accepted') END AS total_accepted_bids_on_jobs, " +
      "CASE WHEN u.role = 'provider' THEN COALESCE((SELECT json_agg(json_build_object(" +
      "'bid_id', b.id, 'job_id', j.id, 'job_title', j.title, 'job_description', j.description, " +
      "'job_category', j.category, 'job_budget', j.budget, 'job_status', j.status, " +
      "'bid_status', b.status, 'diamonds_used', b.diamonds_used, 'estimated_days', b.estimated_days, " +
      "'message', b.message, 'created_at', b.created_at" +
      ")) FROM bids b JOIN jobs j ON b.job_id = j.id WHERE b.provider_id = u.id), '[]'::json) END AS bids_made, " +
      "CASE WHEN u.role = 'provider' THEN (SELECT COUNT(DISTINCT b.job_id) FROM bids b WHERE b.provider_id = u.id) END AS total_jobs_bid_on, " +
      "CASE WHEN u.role = 'provider' THEN (SELECT COALESCE(SUM(b.diamonds_used),0) FROM bids b JOIN jobs j ON b.job_id = j.id WHERE b.provider_id = u.id) END AS total_bid_amount, " +
      "CASE WHEN u.role = 'provider' THEN (SELECT COUNT(*) FROM bids b WHERE b.provider_id = u.id AND b.status = 'accepted') END AS total_accepted_bids_by_provider " +
      "FROM users u WHERE u.id = $1",
    [req.user.id]
  );

  res.json(rows[0]);
}

// Public profile - viewable by anyone logged in
async function getPublicProfile(req, res) {
  var userId = req.params.id;

  var { rows: userRows } = await pool.query(
    "SELECT id, name, role, location, profile_image, created_at FROM users WHERE id = $1",
    [userId]
  );

  if (userRows.length === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  var user = userRows[0];

  // Get rating
  var { rows: ratingRows } = await pool.query(
    "SELECT COALESCE(ROUND(AVG(rating), 1), 0) as avg_rating, COUNT(*) as total_reviews " +
      "FROM ratings WHERE (provider_id = $1 AND reviewer_id != $1) OR (poster_id = $1 AND reviewer_id != $1)",
    [userId]
  );

  // Get recent reviews
  var { rows: reviews } = await pool.query(
    "SELECT r.rating, r.review, r.created_at, u.name as reviewer_name, j.title as job_title " +
      "FROM ratings r " +
      "JOIN users u ON r.reviewer_id = u.id " +
      "JOIN jobs j ON r.job_id = j.id " +
      "WHERE (r.provider_id = $1 AND r.reviewer_id != $1) OR (r.poster_id = $1 AND r.reviewer_id != $1) " +
      "ORDER BY r.created_at DESC LIMIT 10",
    [userId]
  );

  // Get completed jobs count
  var { rows: completedRows } = await pool.query(
    "SELECT COUNT(*) as completed_jobs FROM jobs j " +
      "JOIN bids b ON j.accepted_bid_id = b.id " +
      "WHERE b.provider_id = $1 AND j.status = 'completed'",
    [userId]
  );

  // Get total earnings
  var { rows: earningsRows } = await pool.query(
    "SELECT COALESCE(SUM(wl.diamonds), 0) as total_earnings " +
      "FROM wallet_ledger wl WHERE wl.user_id = $1 AND wl.type = 'credit' AND wl.reference_type = 'job_payment'",
    [userId]
  );

  // Get categories worked in
  var { rows: categoryRows } = await pool.query(
    "SELECT DISTINCT j.category FROM jobs j " +
      "JOIN bids b ON j.accepted_bid_id = b.id " +
      "WHERE b.provider_id = $1 AND j.status = 'completed' AND j.category IS NOT NULL",
    [userId]
  );

  // Get member since duration
  var memberSince = user.created_at;

  res.json({
    id: user.id,
    name: user.name,
    role: user.role,
    location: user.location,
    profile_image: user.profile_image,
    member_since: memberSince,
    rating: parseFloat(ratingRows[0].avg_rating) || 0,
    total_reviews: parseInt(ratingRows[0].total_reviews) || 0,
    completed_jobs: parseInt(completedRows[0].completed_jobs) || 0,
    total_earnings: parseInt(earningsRows[0].total_earnings) || 0,
    skills: categoryRows.map(function (r) { return r.category; }),
    reviews: reviews,
  });
}

async function updateMe(req, res) {
  var { name, phone, location, postcode, latitude, longitude } = req.body;

  var lat = latitude || null;
  var lng = longitude || null;
  var loc = location || null;

  if (postcode) {
    var postcodeResult = await lookupPostcode(postcode);
    if (postcodeResult.valid) {
      lat = postcodeResult.latitude;
      lng = postcodeResult.longitude;
      if (!loc) {
        loc = postcodeResult.displayAddress;
      } else {
        loc = loc + ", " + postcodeResult.formatted;
      }
    } else {
      return res.status(400).json({ error: postcodeResult.error || "Invalid postcode" });
    }
  }

  var profile_image;
  if (req.file) profile_image = "/uploads/" + req.file.filename;

  var q =
    "UPDATE users SET name = COALESCE($1,name), phone = COALESCE($2,phone), " +
    "location = COALESCE($3,location), latitude = COALESCE($4,latitude), " +
    "longitude = COALESCE($5,longitude), profile_image = COALESCE($6, profile_image), " +
    "updated_at = now() WHERE id=$7 RETURNING id,email,name,role,phone,location,latitude,longitude,profile_image";
  var values = [
    name || null,
    phone || null,
    loc,
    lat,
    lng,
    profile_image || null,
    req.user.id,
  ];
  var { rows } = await pool.query(q, values);
  res.json(rows[0]);
}

async function updateRole(req, res) {
  try {
    var { role } = req.body;
    if (!role) {
      return res.status(200).json({ error: "Role is required." });
    }
    var allowedRoles = ["provider", "poster"];
    if (allowedRoles.indexOf(role) === -1) {
      return res.status(200).json({ error: "Invalid role." });
    }
    var q =
      "UPDATE users SET role = $1, updated_at = NOW() " +
      "WHERE id = $2 AND role IS NULL " +
      "RETURNING id, email, name, role, phone, location, latitude, longitude, profile_image";
    var { rows } = await pool.query(q, [role, req.user.id]);
    if (rows.length === 0) {
      return res.status(200).json({ error: "Role cannot be updated." });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  }
}

async function checkRole(req, res) {
  try {
    var { rows } = await pool.query("SELECT role FROM users WHERE id = $1", [req.user.id]);
    if (rows.length === 0) {
      return res.status(200).json({ error: "User not found." });
    }
    var userRole = rows[0].role;
    res.json({ role: userRole, isRoleNull: userRole == null || userRole == "" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  }
}

async function listUsers(req, res) {
  var { rows } = await pool.query(
    "SELECT id,email,name,role,phone,created_at FROM users WHERE role != 'admin' ORDER BY created_at DESC LIMIT 500"
  );
  res.json(rows);
}
async function deleteAccount(req, res) {
  var userId = req.user.id;
  var { password } = req.body;

  // Verify password before deleting
  var { rows: userRows } = await pool.query(
    "SELECT password_hash, email, auth_provider FROM users WHERE id = $1",
    [userId]
  );
  var user = userRows[0];

  if (!user) return res.status(404).json({ error: "User not found" });

  // If not a Google user, require password confirmation
  if (user.auth_provider !== "google") {
    if (!password) {
      return res.status(400).json({ error: "Password is required to delete your account" });
    }
    var bcrypt = require("bcrypt");
    var passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }
  }

  var client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Delete user's ratings
    await client.query("DELETE FROM ratings WHERE reviewer_id = $1 OR poster_id = $1 OR provider_id = $1", [userId]);

    // Delete user's bids
    await client.query("DELETE FROM bids WHERE provider_id = $1", [userId]);

    // Delete wallet ledger entries
    await client.query("DELETE FROM wallet_ledger WHERE user_id = $1", [userId]);

    // Delete job history for user's jobs
    await client.query(
      "DELETE FROM job_history WHERE job_id IN (SELECT id FROM jobs WHERE poster_id = $1)",
      [userId]
    );

    // Delete bids on user's jobs
    await client.query(
      "DELETE FROM bids WHERE job_id IN (SELECT id FROM jobs WHERE poster_id = $1)",
      [userId]
    );

    // Delete user's jobs
    await client.query("DELETE FROM jobs WHERE poster_id = $1", [userId]);

    // Delete chat history from MongoDB
    var { clearUserHistory } = require("../services/chat-history");
    await clearUserHistory(userId);

    // Delete the user
    await client.query("DELETE FROM users WHERE id = $1", [userId]);

    await client.query("COMMIT");

    console.log("Account deleted: " + user.email);
    res.json({ ok: true, message: "Account and all associated data have been permanently deleted" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Account deletion error:", err);
    res.status(500).json({ error: "Failed to delete account" });
  } finally {
    client.release();
  }
}

module.exports = { getMe, getPublicProfile, updateMe, updateRole, checkRole, listUsers, deleteAccount };