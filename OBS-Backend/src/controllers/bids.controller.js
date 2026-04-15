var pool = require("../db");
var { ApiError } = require("../utils/errors");
var { sendNewBidEmail, sendBidAcceptedEmail } = require("../services/email");

async function createBid(req, res) {
  var { job_id, diamonds_used = 0, estimated_days, message } = req.body;

  // Check job exists and is open
  var { rows: jobRows } = await pool.query("SELECT * FROM jobs WHERE id=$1", [
    job_id,
  ]);
  var job = jobRows[0];

  if (!job) throw new ApiError(404, "Job not found");
  if (job.status !== "open") throw new ApiError(400, "Job not open for bids");

  // Check provider has not already bid on this job
  var { rows: existingBids } = await pool.query(
    "SELECT id FROM bids WHERE job_id=$1 AND provider_id=$2 AND status='open'",
    [job_id, req.user.id]
  );
  if (existingBids.length > 0) {
    throw new ApiError(400, "You have already placed a bid on this job");
  }

  // Insert bid - diamonds_used is the price quote, NOT a deduction
  var insertBid =
    "INSERT INTO bids (job_id, provider_id, diamonds_used, estimated_days, message) " +
    "VALUES ($1,$2,$3,$4,$5) RETURNING *";
  var { rows } = await pool.query(insertBid, [
    job_id,
    req.user.id,
    diamonds_used,
    estimated_days || null,
    message || null,
  ]);
  var bid = rows[0];
  // Get provider name for notifications
  var { rows: userRows } = await pool.query(
    "SELECT name FROM users WHERE id = $1",
    [req.user.id]
  );
  var providerName = userRows[0] ? userRows[0].name : "Someone";
  // Send real-time notification to job poster
  var io = req.app.get("io");
  var connectedUsers = req.app.get("connectedUsers");
  if (io && connectedUsers && connectedUsers[job.poster_id]) {
    io.to(connectedUsers[job.poster_id]).emit("notification", {
      type: "new_bid",
      title: "New Bid Received",
      message:
        providerName +
        " placed a bid of " +
        diamonds_used +
        " pounds on your job: " +
        job.title,
      job_id: job.id,
      created_at: new Date().toISOString(),
    });
  }
  // Send email notification to poster
  var { rows: posterRows } = await pool.query(
    "SELECT email, name FROM users WHERE id = $1",
    [job.poster_id]
  );
  if (posterRows[0]) {
    sendNewBidEmail(
      posterRows[0].email,
      posterRows[0].name,
      providerName,
      job.title,
      diamonds_used
    );
  }
  res.json(bid);
}

async function getBidsForJob(req, res) {
  var jobId = req.params.jobId;
  var { rows: jobRows } = await pool.query(
    "SELECT poster_id FROM jobs WHERE id=$1",
    [jobId]
  );
  if (!jobRows[0]) throw new ApiError(404, "Job not found");

  var posterId = jobRows[0].poster_id;
  var q, vals;

  if (req.user.id === posterId) {
    q =
      "SELECT bids.*, users.name as provider_name FROM bids LEFT JOIN users ON users.id = bids.provider_id WHERE job_id=$1 ORDER BY created_at DESC";
    vals = [jobId];
  } else {
    q =
      "SELECT * FROM bids WHERE job_id=$1 AND provider_id=$2 ORDER BY created_at DESC";
    vals = [jobId, req.user.id];
  }

  var { rows } = await pool.query(q, vals);
  res.json(rows);
}

async function acceptBid(req, res) {
  var bidId = req.params.id;
  var { rows: bidRows } = await pool.query("SELECT * FROM bids WHERE id=$1", [
    bidId,
  ]);
  var bid = bidRows[0];
  if (!bid) throw new ApiError(404, "Bid not found");

  var { rows: jobRows } = await pool.query("SELECT * FROM jobs WHERE id=$1", [
    bid.job_id,
  ]);
  var job = jobRows[0];
  if (!job) throw new ApiError(404, "Job not found");
  if (job.poster_id !== req.user.id) throw new ApiError(403, "Not allowed");
  if (job.status !== "open") throw new ApiError(400, "Job not open");

  await pool.query("UPDATE bids SET status=$1 WHERE id=$2", [
    "accepted",
    bidId,
  ]);

  // Reject all other open bids on this job
  await pool.query(
    "UPDATE bids SET status='rejected' WHERE job_id=$1 AND id != $2 AND status='open'",
    [job.id, bidId]
  );

  await pool.query(
    "UPDATE jobs SET accepted_bid_id=$1, status=$2 WHERE id=$3",
    [bidId, "awarded", job.id]
  );

  await pool.query(
    "INSERT INTO job_history (job_id, changed_by, old_status, new_status, note) VALUES ($1,$2,$3,$4,$5)",
    [job.id, req.user.id, job.status, "awarded", "Accepted bid " + bidId]
  );

  // Get poster name for notifications
  var { rows: posterNameRows } = await pool.query(
    "SELECT name FROM users WHERE id = $1",
    [req.user.id]
  );
  var posterName = posterNameRows[0] ? posterNameRows[0].name : "The job poster";

  // Send real-time notification to the provider whose bid was accepted
  var io = req.app.get("io");
  var connectedUsers = req.app.get("connectedUsers");
  if (io && connectedUsers && connectedUsers[bid.provider_id]) {
    io.to(connectedUsers[bid.provider_id]).emit("notification", {
      type: "bid_accepted",
      title: "Bid Accepted",
      message: posterName + " accepted your bid on the job: " + job.title,
      job_id: job.id,
      created_at: new Date().toISOString(),
    });
  }

  // Send email to provider
  var { rows: providerRows } = await pool.query(
    "SELECT email, name FROM users WHERE id = $1",
    [bid.provider_id]
  );
  if (providerRows[0]) {
    sendBidAcceptedEmail(
      providerRows[0].email,
      providerRows[0].name,
      job.title,
      bid.diamonds_used
    );
  }

  res.json({ ok: true });
}

async function cancelBid(req, res) {
  var bidId = req.params.id;
  var { rows: bidRows } = await pool.query("SELECT * FROM bids WHERE id=$1", [
    bidId,
  ]);
  var bid = bidRows[0];
  if (!bid) throw new ApiError(404, "Bid not found");
  if (bid.provider_id !== req.user.id)
    throw new ApiError(403, "You can only cancel your bids");
  if (bid.status !== "open")
    throw new ApiError(400, "Bid cannot be cancelled");

  await pool.query("UPDATE bids SET status=$1 WHERE id=$2", [
    "cancelled",
    bidId,
  ]);
  res.json({ ok: true });
}

module.exports = { createBid, getBidsForJob, acceptBid, cancelBid };