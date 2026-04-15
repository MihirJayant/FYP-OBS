// @ts-nocheck
const pool = require("../db");
const { success, error } = require("../utils/response");

/* =====================================================
   HELPER: Fill missing dates for charts
===================================================== */
function fillDates(rows, start, end, valueField) {
  const map = {};
  rows.forEach((r) => {
    const key = r.date.toISOString().slice(0, 10);
    map[key] = Number(r[valueField]);
  });

  const result = [];
  const curr = new Date(start);
  const last = new Date(end);

  while (curr <= last) {
    const key = curr.toISOString().slice(0, 10);
    result.push({ date: key, value: map[key] || 0 });
    curr.setDate(curr.getDate() + 1);
  }

  return result;
}

/* =====================================================
   DASHBOARD STATS
===================================================== */
exports.dashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalJobs,
      totalBids,
      diamonds,
      avgBudget,
      avgRating,
      jobStatus,
      activeProviders,
    ] = await Promise.all([
      // Users excluding admin
      pool.query(`
        SELECT COUNT(*) AS count
        FROM users
        WHERE role IS NOT NULL
          AND LOWER(TRIM(role)) <> 'admin'
      `),

      // Total Jobs
      pool.query(`SELECT COUNT(*) AS count FROM jobs`),

      // Total Bids
      pool.query(`SELECT COUNT(*) AS count FROM bids`),

      // Diamonds Purchased & Spent
      pool.query(`
        SELECT 
          COALESCE(SUM(CASE WHEN LOWER(TRIM(type))='credit' THEN diamonds END),0) AS purchased,
          COALESCE(SUM(CASE WHEN LOWER(TRIM(type))='debit' THEN diamonds END),0) AS spent
        FROM wallet_ledger
      `),

      // Average Job Budget
      pool.query(`SELECT COALESCE(AVG(budget),0) AS avgBudget FROM jobs`),

      // Average Rating
      pool.query(`SELECT COALESCE(AVG(rating),0) AS avgRating FROM ratings`),

      // Jobs by Status (for pie chart)
      pool.query(`SELECT status, COUNT(*) AS count FROM jobs GROUP BY status`),

      // Active Providers
      pool.query(`
        SELECT COUNT(DISTINCT provider_id) AS count
        FROM bids
        WHERE provider_id IS NOT NULL
      `),
    ]);

    res.json({
      status: true,
      data: {
        users: Number(totalUsers.rows[0].count),
        jobs: Number(totalJobs.rows[0].count),
        bids: Number(totalBids.rows[0].count),
        diamondsPurchased: Number(diamonds.rows[0].purchased),
        diamondsSpent: Number(diamonds.rows[0].spent),
        avgJobBudget: Number(avgBudget.rows[0].avgbudget),
        avgRating: Number(avgRating.rows[0].avgrating),
        jobStatus: jobStatus.rows,
        activeProviders: Number(activeProviders.rows[0].count),
      },
      msg: "Dashboard stats fetched successfully",
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ status: false, msg: "Failed to fetch dashboard stats" });
  }
};

/* =====================================================
   ANALYTICS OVERVIEW
===================================================== */
exports.analyticsOverview = async (req, res) => {
  try {
    // --- 1️⃣ Totals (same as dashboard) ---
    const [
      usersTotal,
      jobsTotal,
      bidsTotal,
      diamonds,
      avgBudget,
      avgRating,
      jobStatus,
      activeProviders,
    ] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) AS value FROM users WHERE role IS NOT NULL AND LOWER(TRIM(role)) <> 'admin'`
      ),
      pool.query(`SELECT COUNT(*) AS value FROM jobs`),
      pool.query(`SELECT COUNT(*) AS value FROM bids`),
      pool.query(`
        SELECT 
          COALESCE(SUM(CASE WHEN LOWER(TRIM(type))='credit' THEN diamonds END),0) AS purchased,
          COALESCE(SUM(CASE WHEN LOWER(TRIM(type))='debit' THEN diamonds END),0) AS spent
        FROM wallet_ledger
      `),
      pool.query(`SELECT COALESCE(AVG(budget),0) AS value FROM jobs`),
      pool.query(`SELECT COALESCE(AVG(rating),0) AS value FROM ratings`),
      pool.query(`SELECT status, COUNT(*) AS count FROM jobs GROUP BY status`),
      pool.query(
        `SELECT COUNT(DISTINCT provider_id) AS value FROM bids WHERE provider_id IS NOT NULL`
      ),
    ]);

    // --- 2️⃣ Fetch raw time-series separately ---
    const [usersRaw, jobsRaw, bidsRaw, diamondsSpentRaw, diamondsPurchasedRaw] =
      await Promise.all([
        pool.query(
          `SELECT DATE(created_at) AS date, COUNT(*) AS value FROM users WHERE role IS NOT NULL AND LOWER(TRIM(role)) <> 'admin' GROUP BY DATE(created_at) ORDER BY DATE(created_at)`
        ),
        pool.query(
          `SELECT DATE(created_at) AS date, COUNT(*) AS value FROM jobs GROUP BY DATE(created_at) ORDER BY DATE(created_at)`
        ),
        pool.query(
          `SELECT DATE(created_at) AS date, COUNT(*) AS value FROM bids GROUP BY DATE(created_at) ORDER BY DATE(created_at)`
        ),
        pool.query(
          `SELECT DATE(created_at) AS date, SUM(diamonds) AS value FROM wallet_ledger WHERE LOWER(TRIM(type))='debit' GROUP BY DATE(created_at) ORDER BY DATE(created_at)`
        ),
        pool.query(
          `SELECT DATE(created_at) AS date, SUM(diamonds) AS value FROM wallet_ledger WHERE LOWER(TRIM(type))='credit' GROUP BY DATE(created_at) ORDER BY DATE(created_at)`
        ),
      ]);

    // --- 3️⃣ Helper to map raw rows ---
    const mapData = (rows) => {
      const m = {};
      rows.forEach((r) => {
        const key = r.date.toISOString().slice(0, 10);
        m[key] = Number(r.value);
      });
      return m;
    };

    const usersMap = mapData(usersRaw.rows);
    const jobsMap = mapData(jobsRaw.rows);
    const bidsMap = mapData(bidsRaw.rows);
    const diamondsSpentMap = mapData(diamondsSpentRaw.rows);
    const diamondsPurchasedMap = mapData(diamondsPurchasedRaw.rows);

    // --- 4️⃣ Determine chart date range independently per series ---
    const getDatesRange = (map) => {
      const dates = Object.keys(map).sort();
      if (!dates.length) return [new Date(), new Date()];
      return [new Date(dates[0]), new Date(dates[dates.length - 1])];
    };

    const [usersStart, usersEnd] = getDatesRange(usersMap);
    const [jobsStart, jobsEnd] = getDatesRange(jobsMap);
    const [bidsStart, bidsEnd] = getDatesRange(bidsMap);
    const [spentStart, spentEnd] = getDatesRange(diamondsSpentMap);
    const [purchasedStart, purchasedEnd] = getDatesRange(diamondsPurchasedMap);

    const generateAllDates = (start, end) => {
      const arr = [];
      const d = new Date(start);
      while (d <= end) {
        arr.push(d.toISOString().slice(0, 10));
        d.setDate(d.getDate() + 1);
      }
      return arr;
    };

    const fillSeries = (map, start, end) => {
      return generateAllDates(start, end).map((date) => ({
        date,
        value: map[date] || 0,
      }));
    };

    // --- 5️⃣ Build chart arrays ---
    const usersChart = fillSeries(usersMap, usersStart, usersEnd);
    const jobsChart = fillSeries(jobsMap, jobsStart, jobsEnd);
    const bidsChart = fillSeries(bidsMap, bidsStart, bidsEnd);
    const diamondsSpentChart = fillSeries(
      diamondsSpentMap,
      spentStart,
      spentEnd
    );
    const diamondsPurchasedChart = fillSeries(
      diamondsPurchasedMap,
      purchasedStart,
      purchasedEnd
    );

    // --- 6️⃣ Return response ---
    res.json({
      status: true,
      data: {
        totals: {
          users: Number(usersTotal.rows[0].value),
          jobs: Number(jobsTotal.rows[0].value),
          bids: Number(bidsTotal.rows[0].value),
          diamondsPurchased: Number(diamonds.rows[0].purchased),
          diamondsSpent: Number(diamonds.rows[0].spent),
          avgJobBudget: Number(avgBudget.rows[0].value),
          avgRating: Number(avgRating.rows[0].value),
          jobStatus: jobStatus.rows,
          activeProviders: Number(activeProviders.rows[0].value),
        },
        charts: {
          users: usersChart,
          jobs: jobsChart,
          bids: bidsChart,
          diamondsSpent: diamondsSpentChart,
          diamondsPurchased: diamondsPurchasedChart,
        },
      },
      msg: "Analytics overview fetched successfully",
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ status: false, msg: "Failed to fetch analytics overview" });
  }
};

/* =====================================================
   USERS
===================================================== */
exports.listUsers = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, name, email, role, created_at
      FROM users
      WHERE role != 'admin'
      ORDER BY created_at DESC
    `);
    return success(res, rows, "Users fetched successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to fetch users");
  }
};

exports.getUser = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id=$1", [
      req.params.id,
    ]);
    if (!rows.length) return error(res, "User not found");
    return success(res, rows[0], "User fetched successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to fetch user");
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { rows } = await pool.query(
      "UPDATE users SET role=$1 WHERE id=$2 RETURNING *",
      [role, req.params.id]
    );
    return success(res, rows[0], "User role updated successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to update user role");
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id=$1", [req.params.id]);
    return success(res, null, "User deleted successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to delete user");
  }
};

/* =====================================================
   JOBS
===================================================== */
exports.listJobs = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT jobs.*, users.name AS poster_name
      FROM jobs
      LEFT JOIN users ON users.id = jobs.poster_id
      ORDER BY jobs.created_at DESC
    `);
    return success(res, rows, "Jobs fetched successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to fetch jobs");
  }
};

// Get a single job by ID
// Get a single job by ID with poster and bids info
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch job and poster info
    const { rows: jobRows } = await pool.query(
      `
      SELECT jobs.*, 
             users.name AS poster_name,
             users.email AS poster_email,
             users.phone AS poster_phone,
             users.location AS poster_location
      FROM jobs
      LEFT JOIN users ON users.id = jobs.poster_id
      WHERE jobs.id = $1
      `,
      [id]
    );

    if (jobRows.length === 0) {
      return error(res, "Job not found", 404);
    }

    const job = jobRows[0];

    // 2. Fetch bids with provider info
    const { rows: bidRows } = await pool.query(
      `
      SELECT bids.*, 
             users.name AS provider_name,
             users.email AS provider_email,
             users.phone AS provider_phone,
             users.location AS provider_location
      FROM bids
      LEFT JOIN users ON users.id = bids.provider_id
      WHERE bids.job_id = $1
      ORDER BY bids.created_at ASC
      `,
      [id]
    );

    // Attach bids to job
    job.bids = bidRows;

    return success(res, job, "Job fetched successfully with bids");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to fetch job");
  }
};

exports.updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { rows } = await pool.query(
      "UPDATE jobs SET status=$1 WHERE id=$2 RETURNING *",
      [status, req.params.id]
    );
    return success(res, rows[0], "Job status updated successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to update job status");
  }
};

exports.deleteJob = async (req, res) => {
  try {
    await pool.query("DELETE FROM jobs WHERE id=$1", [req.params.id]);
    return success(res, null, "Job deleted successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to delete job");
  }
};

/* =====================================================
   BIDS
===================================================== */
exports.listBids = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT bids.*, users.name AS provider_name
      FROM bids
      LEFT JOIN users ON users.id = bids.provider_id
      ORDER BY bids.created_at DESC
    `);
    return success(res, rows, "Bids fetched successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to fetch bids");
  }
};

/* =====================================================
   PAYMENTS
===================================================== */
exports.listPayments = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT payments.*, users.email
      FROM payments
      LEFT JOIN users ON users.id = payments.user_id
      ORDER BY payments.created_at DESC
    `);
    return success(res, rows, "Payments fetched successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to fetch payments");
  }
};

/* =====================================================
   WALLET LEDGER
===================================================== */
exports.walletLedger = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
          wl.*,
          u.email,
          COALESCE(SUM(
              CASE 
                  WHEN wl2.type = 'credit' THEN wl2.diamonds
                  WHEN wl2.type = 'debit' THEN -wl2.diamonds
                  ELSE 0
              END
          ), 0) AS balance
      FROM wallet_ledger wl
      JOIN users u ON u.id = wl.user_id
      LEFT JOIN wallet_ledger wl2 
             ON wl2.user_id = wl.user_id
            AND wl2.created_at <= wl.created_at
      GROUP BY wl.id, u.email
      ORDER BY wl.created_at DESC
    `);
    return success(
      res,
      rows,
      "Wallet ledger with balance fetched successfully"
    );
  } catch (err) {
    console.error(err);
    return error(res, "Failed to fetch wallet ledger");
  }
};

/* =====================================================
   RATINGS
===================================================== */
exports.listRatings = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        ratings.*,
        u1.name AS reviewer_name,
        u1.email AS reviewer_email,
        u2.name AS provider_name,
        u2.email AS provider_email,
        jobs.title AS review_title,
        ratings.review AS review_detail
      FROM ratings
      LEFT JOIN users u1 ON u1.id = ratings.reviewer_id
      LEFT JOIN users u2 ON u2.id = ratings.provider_id
      LEFT JOIN jobs ON jobs.id = ratings.job_id
      ORDER BY ratings.created_at DESC
    `);

    return success(res, rows, "Ratings fetched successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to fetch ratings");
  }
};
