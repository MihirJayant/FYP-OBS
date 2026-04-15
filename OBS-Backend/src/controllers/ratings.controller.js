const pool = require("../db");
const { ApiError } = require("../utils/errors");

async function addRating(req, res) {
    const { jobId, rating, review } = req.body;
    const reviewerId = req.user.id;

    // 1. Fetch Job and check status
    const jobQuery = `
    SELECT j.*, b.provider_id 
    FROM jobs j
    LEFT JOIN bids b ON j.accepted_bid_id = b.id
    WHERE j.id = $1
  `;
    const { rows: jobRows } = await pool.query(jobQuery, [jobId]);
    const job = jobRows[0];

    if (!job) throw new ApiError(404, "Job not found");

    // Status check: must be awarded or completed
    if (!['awarded', 'completed'].includes(job.status)) {
        throw new ApiError(400, "Job must be awarded or completed to leave a review");
    }

    // 2. Identify Role
    let posterId = job.poster_id;
    let providerId = job.provider_id;

    if (reviewerId !== posterId && reviewerId !== providerId) {
        throw new ApiError(403, "You are not a participant in this job");
    }

    // Determine Target User (Reviewee)
    const targetUserId = (reviewerId === posterId) ? providerId : posterId;
    if (!targetUserId) throw new ApiError(400, "Target user not found (job might have no provider)");

    // 3. Check for existing rating by this reviewer for this job
    const existingCheck = await pool.query(
        "SELECT id FROM ratings WHERE job_id = $1 AND reviewer_id = $2",
        [jobId, reviewerId]
    );
    if (existingCheck.rows.length > 0) {
        throw new ApiError(400, "You have already rated this job");
    }

    // 4. Insert Rating
    const insertQuery = `
    INSERT INTO ratings (job_id, poster_id, provider_id, rating, review, reviewer_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

    const { rows: newRating } = await pool.query(insertQuery, [
        jobId,
        posterId,
        providerId,
        rating,
        review,
        reviewerId
    ]);

    // 5. Update Target User's Average Rating
    // We fetch all ratings where target was the reviewee
    // Reviewee logic: 
    //   If row.poster_id == target AND row.reviewer_id != target
    //   OR row.provider_id == target AND row.reviewer_id != target

    const avgQuery = `
    SELECT AVG(rating) as avg_rating
    FROM ratings
    WHERE 
      (poster_id = $1 AND reviewer_id != $1)
      OR
      (provider_id = $1 AND reviewer_id != $1)
  `;
    const { rows: avgRows } = await pool.query(avgQuery, [targetUserId]);
    const newAvg = parseFloat(avgRows[0].avg_rating).toFixed(2);

    await pool.query("UPDATE users SET rating = $1 WHERE id = $2", [newAvg, targetUserId]);

    res.json(newRating[0]);
}

async function getJobRatings(req, res) {
    const { jobId } = req.params;

    const query = `
    SELECT r.*, u.name as reviewer_name 
    FROM ratings r
    JOIN users u ON r.reviewer_id = u.id
    WHERE r.job_id = $1
  `;
    const { rows } = await pool.query(query, [jobId]);
    res.json(rows);
}

// Get ratings RECEIVED by user
async function getUserRatings(req, res) {
    const { userId } = req.params;

    const query = `
    SELECT r.*, u.name as reviewer_name, j.title as job_title
    FROM ratings r
    JOIN users u ON r.reviewer_id = u.id
    JOIN jobs j ON r.job_id = j.id
    WHERE 
      (r.poster_id = $1 AND r.reviewer_id != $1) -- User is poster, reviews from provider
      OR
      (r.provider_id = $1 AND r.reviewer_id != $1) -- User is provider, reviews from poster
    ORDER BY r.created_at DESC
  `;

    const { rows } = await pool.query(query, [userId]);
    res.json(rows);
}

async function getMyRating(req, res) {
    const { jobId } = req.params;
    const userId = req.user.id;

    const query = `
        SELECT * FROM ratings WHERE job_id = $1 AND reviewer_id = $2
    `;
    const { rows } = await pool.query(query, [jobId, userId]);
    res.json(rows[0] || null);
}

module.exports = {
    addRating,
    getJobRatings,
    getUserRatings,
    getMyRating
};
