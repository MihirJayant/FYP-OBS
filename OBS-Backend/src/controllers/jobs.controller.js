// @ts-nocheck
var pool = require("../db");
var { ApiError } = require("../utils/errors");
var { geocodeAddress } = require("../services/geocode");
var { lookupPostcode } = require("../services/postcode");
var { parseDate } = require("../utils/constent");
var { sendJobCompletedEmail } = require("../services/email");

async function createJob(req, res) {
  var {
    title,
    description,
    category,
    budget,
    deadline,
    address,
    postcode,
    latitude,
    longitude,
  } = req.body;

  var lat = latitude || null;
  var lng = longitude || null;
  var date = parseDate(deadline);
  var disp = address || null;

  if (postcode && !lat && !lng) {
    var postcodeResult = await lookupPostcode(postcode);
    if (postcodeResult.valid) {
      lat = postcodeResult.latitude;
      lng = postcodeResult.longitude;
      if (!disp) {
        disp = postcodeResult.displayAddress;
      } else {
        disp = disp + ", " + postcodeResult.formatted;
      }
    }
  } else if (address && !lat && !lng) {
    var g = await geocodeAddress(address);
    if (g) {
      lat = g.latitude;
      lng = g.longitude;
      disp = g.display_name || address;
    }
  }

  var imageUrls = (req.files || []).map(function (f) {
    return "/uploads/" + f.filename;
  });
  var url = imageUrls[0] || null;

  var q =
    "INSERT INTO jobs (poster_id,title,description,category,budget,deadline,address,latitude,longitude,url,status) " +
    "VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *";
  var vals = [
    req.user.id,
    title,
    description || null,
    category || null,
    budget || null,
    date || null,
    disp,
    lat,
    lng,
    url,
    "open",
  ];
  var { rows } = await pool.query(q, vals);
  res.json(rows[0]);
}

async function updateJob(req, res) {
  var id = req.params.id;
  var { rows: jobRows } = await pool.query("SELECT * FROM jobs WHERE id=$1", [
    id,
  ]);
  var job = jobRows[0];
  if (!job) throw new ApiError(404, "Job not found");
  if (job.poster_id !== req.user.id) throw new ApiError(403, "Not allowed");

  var imageUrls = (req.files || []).map(function (f) {
    return "/uploads/" + f.filename;
  });
  var url = imageUrls[0] || null;

  var {
    title,
    description,
    category,
    budget,
    deadline,
    address,
    postcode,
    latitude,
    longitude,
    status,
  } = req.body;

  var lat = latitude || null;
  var lng = longitude || null;
  var disp = address || null;

  if (postcode) {
    var postcodeResult = await lookupPostcode(postcode);
    if (postcodeResult.valid) {
      lat = postcodeResult.latitude;
      lng = postcodeResult.longitude;
      if (!disp) {
        disp = postcodeResult.displayAddress;
      } else {
        disp = disp + ", " + postcodeResult.formatted;
      }
    }
  }

  var q =
    "UPDATE jobs SET title=COALESCE($1,title), description=COALESCE($2,description), " +
    "category=COALESCE($3,category), budget=COALESCE($4,budget), deadline=COALESCE($5,deadline), " +
    "address=COALESCE($6,address), latitude=COALESCE($7,latitude), longitude=COALESCE($8,longitude), " +
    "status=COALESCE($9,status), url=COALESCE($11,url), updated_at=now() WHERE id=$10 RETURNING *";
  var vals = [
    title || null,
    description || null,
    category || null,
    budget || null,
    deadline || null,
    disp,
    lat,
    lng,
    status || null,
    id,
    url,
  ];
  var { rows } = await pool.query(q, vals);
  res.json(rows[0]);
}

async function deleteJob(req, res) {
  var id = req.params.id;
  var { rows } = await pool.query("SELECT poster_id FROM jobs WHERE id=$1", [
    id,
  ]);
  if (!rows[0]) throw new ApiError(404, "Job not found");
  if (rows[0].poster_id !== req.user.id) throw new ApiError(403, "Not allowed");
  await pool.query("DELETE FROM jobs WHERE id=$1", [id]);
  res.json({ ok: true });
}

async function listJobs(req, res) {
  var {
    category,
    q,
    minBudget,
    maxBudget,
    lat,
    lng,
    radiusKm,
    limit = 100,
  } = req.query;

  var base =
    "SELECT jobs.*, (SELECT COUNT(*) FROM bids WHERE bids.job_id = jobs.id) as bid_count";

  var conditions = ["status = $1"];
  var params = ["open"];
  var idx = 2;

  if (lat && lng) {
    base +=
      ", (6371 * acos(cos(radians($" +
      idx +
      ")) * cos(radians(latitude)) * cos(radians(longitude) - radians($" +
      (idx + 1) +
      ")) + sin(radians($" +
      idx +
      ")) * sin(radians(latitude)))) AS distance";

    if (radiusKm) {
      conditions.push(
        "(6371 * acos(cos(radians($" +
          idx +
          ")) * cos(radians(latitude)) * cos(radians(longitude) - radians($" +
          (idx + 1) +
          ")) + sin(radians($" +
          idx +
          ")) * sin(radians(latitude)))) <= $" +
          (idx + 2)
      );
      params.push(lat, lng, Number(radiusKm));
      idx += 3;
    } else {
      params.push(lat, lng);
      idx += 2;
    }
  } else {
    base += ", NULL as distance";
  }

  base += " FROM jobs";

  if (category) {
    conditions.push("category = $" + idx);
    params.push(category);
    idx++;
  }
  if (q) {
    conditions.push(
      "(title ILIKE $" + idx + " OR description ILIKE $" + idx + ")"
    );
    params.push("%" + q + "%");
    idx++;
  }
  if (minBudget) {
    conditions.push("budget >= $" + idx);
    params.push(minBudget);
    idx++;
  }
  if (maxBudget) {
    conditions.push("budget <= $" + idx);
    params.push(maxBudget);
    idx++;
  }

  if (conditions.length > 0) {
    base += " WHERE " + conditions.join(" AND ");
  }

  if (req.query.sortBy === "deadline") {
    base += " ORDER BY deadline ASC";
  } else if (req.query.sortBy === "budget") {
    base += " ORDER BY budget DESC";
  } else if ((lat && lng) || req.query.sortBy === "distance") {
    base += " ORDER BY distance ASC NULLS LAST";
  } else {
    base += " ORDER BY created_at DESC";
  }

  base += " LIMIT " + Math.min(Number(limit), 500);

  var { rows } = await pool.query(base, params);
  res.json(rows);
}

async function getJob(req, res) {
  var { id } = req.params;
  var query =
    "SELECT jobs.*, users.name AS poster_name " +
    "FROM jobs JOIN users ON users.id = jobs.poster_id " +
    "WHERE jobs.id = $1";

  var { rows } = await pool.query(query, [id]);
  if (!rows[0]) throw new ApiError(404, "Job not found");
  res.json(rows[0]);
}

async function getJobWithBids(req, res) {
  var { id } = req.params;

  var jobQuery =
    "SELECT jobs.*, users.name AS poster_name " +
    "FROM jobs JOIN users ON users.id = jobs.poster_id " +
    "WHERE jobs.id = $1";

  var { rows: jobRows } = await pool.query(jobQuery, [id]);
  if (!jobRows[0]) throw new ApiError(404, "Job not found");

  var job = jobRows[0];

  var bidsQuery =
    "SELECT bids.id, bids.job_id, bids.provider_id, " +
    "users.name AS provider_name, users.rating AS provider_rating, " +
    "bids.diamonds_used, bids.estimated_days, " +
    "bids.message, bids.status, bids.created_at, bids.updated_at " +
    "FROM bids JOIN users ON users.id = bids.provider_id " +
    "WHERE bids.job_id = $1 ORDER BY bids.created_at DESC";

  var { rows: bids } = await pool.query(bidsQuery, [id]);
  job.bids = bids;

  res.json(job);
}

async function completeJob(req, res) {
  var id = req.params.id;
  var paymentMethod = req.body.payment_method || "cash";

  var { rows: jobRows } = await pool.query("SELECT * FROM jobs WHERE id=$1", [
    id,
  ]);
  var job = jobRows[0];

  if (!job) return res.status(404).json({ error: "Job not found" });
  if (job.poster_id !== req.user.id)
    return res.status(403).json({ error: "Not allowed" });
  if (job.status !== "awarded")
    return res
      .status(400)
      .json({ error: "Only awarded jobs can be completed" });

  var { rows: bidRows } = await pool.query(
    "SELECT * FROM bids WHERE id = $1",
    [job.accepted_bid_id]
  );
  var acceptedBid = bidRows[0];

  if (!acceptedBid)
    return res.status(400).json({ error: "Accepted bid not found" });

  var client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Handle wallet payment
    if (paymentMethod === "wallet") {
      var { rows: balRows } = await client.query(
        "SELECT COALESCE(SUM(CASE WHEN type='credit' THEN diamonds WHEN type='debit' THEN -diamonds ELSE 0 END), 0) as balance " +
          "FROM wallet_ledger WHERE user_id = $1",
        [req.user.id]
      );
      var posterBalance = parseInt(balRows[0].balance) || 0;

      if (posterBalance < acceptedBid.diamonds_used) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error:
            "Insufficient wallet balance. You have " +
            posterBalance +
            " but need " +
            acceptedBid.diamonds_used,
        });
      }

      // Deduct from poster
      await client.query(
        "INSERT INTO wallet_ledger (user_id, type, diamonds, reference_type, reference_id, note) " +
          "VALUES ($1, 'debit', $2, 'job_payment', $3, 'Payment for completed job: " +
          job.title.replace(/'/g, "") +
          "')",
        [req.user.id, acceptedBid.diamonds_used, job.id]
      );

      // Credit to provider
      await client.query(
        "INSERT INTO wallet_ledger (user_id, type, diamonds, reference_type, reference_id, note) " +
          "VALUES ($1, 'credit', $2, 'job_payment', $3, 'Payment received for completed job: " +
          job.title.replace(/'/g, "") +
          "')",
        [acceptedBid.provider_id, acceptedBid.diamonds_used, job.id]
      );
    }

    // Update job status
    await client.query(
      "UPDATE jobs SET status='completed', updated_at=now() WHERE id=$1",
      [id]
    );

    // Log status change
    await client.query(
      "INSERT INTO job_history (job_id, changed_by, old_status, new_status, note) VALUES ($1,$2,$3,$4,$5)",
      [
        id,
        req.user.id,
        "awarded",
        "completed",
        "Job completed - payment method: " + paymentMethod,
      ]
    );

    await client.query("COMMIT");

    // Get poster name for notifications
    var { rows: posterRows } = await pool.query(
      "SELECT name FROM users WHERE id = $1",
      [req.user.id]
    );
    var posterName = posterRows[0] ? posterRows[0].name : "The job poster";

    // Build notification message
    var notifMessage =
      posterName + " marked the job '" + job.title + "' as completed.";
    if (paymentMethod === "wallet") {
      notifMessage +=
        " " +
        acceptedBid.diamonds_used +
        " pounds has been credited to your wallet.";
    } else if (paymentMethod === "cash") {
      notifMessage += " Payment was made in cash.";
    }

    // Send real-time notification to provider
    var io = req.app.get("io");
    var connectedUsers = req.app.get("connectedUsers");
    if (io && connectedUsers && connectedUsers[acceptedBid.provider_id]) {
      io.to(connectedUsers[acceptedBid.provider_id]).emit("notification", {
        type: "job_completed",
        title: "Job Completed",
        message: notifMessage,
        job_id: job.id,
        created_at: new Date().toISOString(),
      });
    }

    // Send email to provider
    var { rows: providerEmailRows } = await pool.query(
      "SELECT email, name FROM users WHERE id = $1",
      [acceptedBid.provider_id]
    );
    if (providerEmailRows[0]) {
      sendJobCompletedEmail(
        providerEmailRows[0].email,
        providerEmailRows[0].name,
        job.title,
        acceptedBid.diamonds_used,
        paymentMethod
      );
    }

    var { rows: updatedJob } = await pool.query(
      "SELECT * FROM jobs WHERE id=$1",
      [id]
    );
    res.json(updatedJob[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  createJob,
  updateJob,
  deleteJob,
  listJobs,
  getJob,
  getJobWithBids,
  completeJob,
};