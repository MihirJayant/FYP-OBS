/**
 * Chatbot Controller
 * Handles AI chatbot requests and executes actions
 * Uses MongoDB for chat history persistence
 */
var pool = require("../db");
var {
  processMessage,
  generateActionResponse,
} = require("../services/ai-chatbot");
var { lookupPostcode } = require("../services/postcode");
var {
  getOrCreateSession,
  addMessage,
  getSessionHistory,
  getUserSessions,
  deleteSession,
  clearUserHistory,
} = require("../services/chat-history");

// Store pending actions for confirmation (in-memory)
var pendingActions = new Map();

/**
 * Main chat endpoint
 */
async function chat(req, res) {
  var message = req.body.message;
  var sessionId = req.body.session_id;
  var userId = req.user.id;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // Get user context from PostgreSQL
    var userQuery = await pool.query(
      "SELECT id, name, role, location, latitude, longitude FROM users WHERE id = $1",
      [userId]
    );
    var user = userQuery.rows[0];

    // Get or create chat session in MongoDB
    var sessionResult = await getOrCreateSession(userId, {
      role: user.role,
      name: user.name,
    });
    var currentSessionId = sessionId || sessionResult.session_id;

    // Get conversation history from MongoDB
    var historyResult = await getSessionHistory(currentSessionId, 10);
    var conversationHistory = historyResult.messages || [];

    // Check if there is a pending action
    var pendingAction = pendingActions.get(userId);

    var userContext = {
      role: user.role,
      name: user.name,
      postcode: user.location,
      pendingAction: pendingAction || null,
    };

    // Process message with AI
    var aiResponse = await processMessage(
      message,
      conversationHistory,
      userContext
    );
    console.log("AI RESPONSE:", JSON.stringify(aiResponse));

    // Save user message to MongoDB
    await addMessage(currentSessionId, "user", message);

    // Handle confirmation of pending action
    if (pendingAction && isConfirmation(message)) {
      var actionResult = await executeAction(
        pendingAction.action,
        pendingAction.params,
        userId,
        user
      );
      pendingActions.delete(userId);

      console.log("CONFIRM ACTION RESULT:", JSON.stringify(actionResult));

      var responseMsg = buildActionMessage(pendingAction.action, actionResult);

      // Save assistant response to MongoDB
      await addMessage(currentSessionId, "assistant", responseMsg, {
        action: pendingAction.action,
        action_result: actionResult,
      });

      return res.json({
        success: true,
        message: responseMsg,
        action_executed: pendingAction.action,
        action_result: actionResult,
        session_id: currentSessionId,
      });
    }

    // Handle cancellation
    if (pendingAction && isCancellation(message)) {
      pendingActions.delete(userId);
      var cancelMsg =
        "No problem, I have cancelled that. What else can I help you with?";

      // Save assistant response to MongoDB
      await addMessage(currentSessionId, "assistant", cancelMsg);

      return res.json({
        success: true,
        message: cancelMsg,
        action_executed: null,
        session_id: currentSessionId,
      });
    }

    // If action needs confirmation, store it
    if (aiResponse.needs_confirmation && aiResponse.action !== "none") {
      pendingActions.set(userId, {
        action: aiResponse.action,
        params: aiResponse.params,
        timestamp: Date.now(),
      });

      // Save assistant response to MongoDB
      await addMessage(currentSessionId, "assistant", aiResponse.message);

      return res.json({
        success: true,
        message: aiResponse.message,
        awaiting_confirmation: true,
        proposed_action: aiResponse.action,
        session_id: currentSessionId,
      });
    }

    // Execute action directly if no confirmation needed
    if (aiResponse.action !== "none" && !aiResponse.needs_confirmation) {
      var directResult = await executeAction(
        aiResponse.action,
        aiResponse.params,
        userId,
        user
      );

      console.log("ACTION RESULT:", JSON.stringify(directResult));

      var finalMessage = buildActionMessage(aiResponse.action, directResult);

      // Save assistant response to MongoDB
      await addMessage(currentSessionId, "assistant", finalMessage, {
        action: aiResponse.action,
        action_result: directResult,
      });

      return res.json({
        success: true,
        message: finalMessage,
        action_executed: aiResponse.action,
        action_result: directResult,
        session_id: currentSessionId,
      });
    }

    // No action, just return the message
    // Save assistant response to MongoDB
    await addMessage(currentSessionId, "assistant", aiResponse.message);

    return res.json({
      success: true,
      message: aiResponse.message,
      action_executed: null,
      session_id: currentSessionId,
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    return res.status(500).json({
      success: false,
      message: "Sorry, something went wrong. Please try again.",
      error: error.message,
    });
  }
}

/**
 * Build a human-readable message from the action result
 */
function buildActionMessage(action, result) {
  if (!result.success) {
    return result.error || "Something went wrong. Please try again.";
  }

  switch (action) {
    case "get_balance":
      return "Your current balance is " + result.balance + " diamonds.";

    case "get_my_jobs":
      if (result.data && result.data.length > 0) {
        var jobList = "You have " + result.data.length + " job(s):\n\n";
        for (var i = 0; i < result.data.length; i++) {
          var job = result.data[i];
          jobList +=
            (i + 1) +
            ". " +
            job.title +
            " - " +
            job.status.toUpperCase() +
            " (" +
            job.bid_count +
            " bids)\n";
        }
        return jobList;
      }
      return "You have not posted any jobs yet.";

    case "get_my_bids":
      if (result.data && result.data.length > 0) {
        var bidList = "You have " + result.data.length + " bid(s):\n\n";
        for (var j = 0; j < result.data.length; j++) {
          var bid = result.data[j];
          bidList +=
            (j + 1) +
            ". " +
            bid.job_title +
            " - " +
            bid.status.toUpperCase() +
            "\n";
        }
        return bidList;
      }
      return "You have not placed any bids yet.";

    case "search_jobs":
      if (result.data && result.data.length > 0) {
        return (
          "I found " + result.data.length + " job(s) matching your search:"
        );
      }
      return "No jobs found matching your search criteria.";

    case "create_job":
      if (result.data) {
        return (
          'Job "' +
          result.data.title +
          '" has been posted successfully!\n\n' +
          "Budget: " +
          result.data.budget +
          " pounds\n" +
          "Location: " +
          result.data.address +
          "\n" +
          "Status: " +
          result.data.status.toUpperCase()
        );
      }
      return result.message || "Job created successfully!";

    case "accept_bid":
      return result.message || "Bid accepted successfully!";

    case "leave_review":
      return result.message || "Review submitted successfully!";

    case "place_bid":
      return result.message || "Bid placed successfully!";

    case "get_job_details":
      if (result.data) {
        return (
          "Job: " +
          result.data.title +
          "\n" +
          "Budget: " +
          result.data.budget +
          " pounds\n" +
          "Status: " +
          result.data.status.toUpperCase() +
          "\n" +
          "Location: " +
          (result.data.address || "Not specified") +
          "\n" +
          "Bids: " +
          result.data.bid_count +
          "\n" +
          "Posted by: " +
          result.data.poster_name
        );
      }
      return "Job not found.";

    default:
      return result.message || "Done!";
  }
}

/**
 * Check if message is a confirmation
 */
function isConfirmation(message) {
  var confirmWords = [
    "yes",
    "yeah",
    "yep",
    "sure",
    "ok",
    "okay",
    "confirm",
    "do it",
    "go ahead",
    "please",
    "post it",
    "create it",
    "submit",
  ];
  var lower = message.toLowerCase().trim();
  for (var i = 0; i < confirmWords.length; i++) {
    if (lower.indexOf(confirmWords[i]) !== -1) {
      return true;
    }
  }
  return false;
}

/**
 * Check if message is a cancellation
 */
function isCancellation(message) {
  var cancelWords = [
    "no",
    "nope",
    "cancel",
    "nevermind",
    "never mind",
    "stop",
    "forget it",
  ];
  var lower = message.toLowerCase().trim();
  for (var i = 0; i < cancelWords.length; i++) {
    if (lower.indexOf(cancelWords[i]) !== -1) {
      return true;
    }
  }
  return false;
}

/**
 * Execute an action based on AI response
 */
async function executeAction(action, params, userId, user) {
  try {
    switch (action) {
      case "create_job":
        return await createJobAction(params, userId);
      case "search_jobs":
        return await searchJobsAction(params, user);
      case "place_bid":
        return await placeBidAction(params, userId);
      case "accept_bid":
        return await acceptBidAction(params, userId);
      case "leave_review":
        return await leaveReviewAction(params, userId);
      case "get_my_jobs":
        return await getMyJobsAction(userId);
      case "get_my_bids":
        return await getMyBidsAction(userId);
      case "get_job_details":
        return await getJobDetailsAction(params.job_id);
      case "get_balance":
        return await getBalanceAction(userId);
      default:
        return { success: false, error: "Unknown action" };
    }
  } catch (error) {
    console.error("Error executing action " + action + ":", error);
    return { success: false, error: error.message };
  }
}

/**
 * Action: Create a new job
 */
async function createJobAction(params, userId) {
  var title = params.title;
  var description = params.description;
  var category = params.category;
  var budget = params.budget;
  var postcode = params.postcode;
  var deadline = params.deadline;

  if (!title || !budget || !postcode) {
    return {
      success: false,
      error: "Missing required fields: title, budget, or postcode",
    };
  }

  var postcodeResult = await lookupPostcode(postcode);
  if (!postcodeResult.valid) {
    return { success: false, error: "Invalid postcode" };
  }

  var query =
    "INSERT INTO jobs (poster_id, title, description, category, budget, deadline, address, latitude, longitude, status) " +
    "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'open') RETURNING *";

  var values = [
    userId,
    title,
    description || (category || "Service") + " required",
    category || "Other",
    budget,
    deadline || null,
    postcodeResult.displayAddress,
    postcodeResult.latitude,
    postcodeResult.longitude,
  ];

  var result = await pool.query(query, values);

  return {
    success: true,
    data: result.rows[0],
    message: 'Job "' + title + '" created successfully!',
  };
}

/**
 * Action: Search for jobs
 */
async function searchJobsAction(params, user) {
  var category = params.category;
  var postcode = params.postcode;
  var radiusKm = params.radius_km || 50;
  var minBudget = params.min_budget;
  var maxBudget = params.max_budget;

  var lat = user.latitude;
  var lng = user.longitude;

  if (postcode) {
    var postcodeResult = await lookupPostcode(postcode);
    if (postcodeResult.valid) {
      lat = postcodeResult.latitude;
      lng = postcodeResult.longitude;
    }
  }

  var query =
    "SELECT jobs.*, users.name as poster_name, " +
    "(SELECT COUNT(*) FROM bids WHERE bids.job_id = jobs.id) as bid_count";

  var conditions = ["status = 'open'"];
  var values = [];
  var paramIndex = 1;

  if (lat && lng) {
    query +=
      ", (6371 * acos(" +
      "cos(radians($" +
      paramIndex +
      ")) * cos(radians(latitude)) * " +
      "cos(radians(longitude) - radians($" +
      (paramIndex + 1) +
      ")) + " +
      "sin(radians($" +
      paramIndex +
      ")) * sin(radians(latitude))" +
      ")) AS distance";

    values.push(lat, lng);
    paramIndex += 2;

    conditions.push(
      "(6371 * acos(" +
        "cos(radians($" +
        paramIndex +
        ")) * cos(radians(latitude)) * " +
        "cos(radians(longitude) - radians($" +
        (paramIndex + 1) +
        ")) + " +
        "sin(radians($" +
        paramIndex +
        ")) * sin(radians(latitude))" +
        ")) <= $" +
        (paramIndex + 2)
    );
    values.push(lat, lng, radiusKm);
    paramIndex += 3;
  }

  query += " FROM jobs JOIN users ON users.id = jobs.poster_id";

  if (category) {
    conditions.push("LOWER(category) = LOWER($" + paramIndex + ")");
    values.push(category);
    paramIndex++;
  }

  if (minBudget) {
    conditions.push("budget >= $" + paramIndex);
    values.push(minBudget);
    paramIndex++;
  }

  if (maxBudget) {
    conditions.push("budget <= $" + paramIndex);
    values.push(maxBudget);
    paramIndex++;
  }

  query += " WHERE " + conditions.join(" AND ");

  if (lat && lng) {
    query += " ORDER BY distance ASC";
  } else {
    query += " ORDER BY created_at DESC";
  }

  query += " LIMIT 10";

  var result = await pool.query(query, values);

  return {
    success: true,
    data: result.rows,
    count: result.rows.length,
  };
}

/**
 * Action: Place a bid on a job
 */
async function placeBidAction(params, userId) {
  var jobId = params.job_id;
  var amount = params.amount || 0;
  var message = params.message;
  var estimatedDays = params.estimated_days;

  if (!jobId) {
    return { success: false, error: "Job ID is required" };
  }

  var jobCheck = await pool.query(
    "SELECT * FROM jobs WHERE id = $1 AND status = 'open'",
    [jobId]
  );

  if (jobCheck.rows.length === 0) {
    return {
      success: false,
      error: "Job not found or no longer accepting bids",
    };
  }

  var balanceCheck = await pool.query(
    "SELECT COALESCE(SUM(CASE WHEN type='credit' THEN diamonds WHEN type='debit' THEN -diamonds ELSE 0 END), 0) as balance " +
      "FROM wallet_ledger WHERE user_id = $1",
    [userId]
  );

  var balance = parseInt(balanceCheck.rows[0].balance) || 0;
  if (balance < amount) {
    return {
      success: false,
      error: "Insufficient balance. You have " + balance + " diamonds.",
    };
  }

  var client = await pool.connect();
  try {
    await client.query("BEGIN");

    var bidResult = await client.query(
      "INSERT INTO bids (job_id, provider_id, diamonds_used, estimated_days, message, status) " +
        "VALUES ($1, $2, $3, $4, $5, 'open') RETURNING *",
      [jobId, userId, amount, estimatedDays || null, message || null]
    );

    if (amount > 0) {
      await client.query(
        "INSERT INTO wallet_ledger (user_id, type, diamonds, reference_type, reference_id, note) " +
          "VALUES ($1, 'debit', $2, 'bid', $3, 'Bid placed on job')",
        [userId, amount, bidResult.rows[0].id]
      );
    }

    await client.query("COMMIT");

    return {
      success: true,
      data: bidResult.rows[0],
      message: "Bid placed successfully!",
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Action: Accept a bid
 */
async function acceptBidAction(params, userId) {
  var bidId = params.bid_id;

  if (!bidId) {
    return { success: false, error: "Bid ID is required" };
  }

  var bidCheck = await pool.query(
    "SELECT bids.*, jobs.poster_id, jobs.status as job_status " +
      "FROM bids JOIN jobs ON jobs.id = bids.job_id " +
      "WHERE bids.id = $1",
    [bidId]
  );

  if (bidCheck.rows.length === 0) {
    return { success: false, error: "Bid not found" };
  }

  var bid = bidCheck.rows[0];

  if (bid.poster_id !== userId) {
    return {
      success: false,
      error: "You can only accept bids on your own jobs",
    };
  }

  if (bid.job_status !== "open") {
    return { success: false, error: "This job is no longer open" };
  }

  await pool.query("UPDATE bids SET status = 'accepted' WHERE id = $1", [
    bidId,
  ]);
  await pool.query(
    "UPDATE jobs SET status = 'awarded', accepted_bid_id = $1 WHERE id = $2",
    [bidId, bid.job_id]
  );

  return {
    success: true,
    message: "Bid accepted! The provider has been notified.",
  };
}

/**
 * Action: Leave a review
 */
async function leaveReviewAction(params, userId) {
  var jobId = params.job_id;
  var rating = params.rating;
  var reviewText = params.review_text;

  if (!jobId || !rating) {
    return { success: false, error: "Job ID and rating are required" };
  }

  if (rating < 1 || rating > 5) {
    return { success: false, error: "Rating must be between 1 and 5" };
  }

  var jobCheck = await pool.query(
    "SELECT jobs.*, bids.provider_id " +
      "FROM jobs " +
      "LEFT JOIN bids ON bids.id = jobs.accepted_bid_id " +
      "WHERE jobs.id = $1",
    [jobId]
  );

  if (jobCheck.rows.length === 0) {
    return { success: false, error: "Job not found" };
  }

  var job = jobCheck.rows[0];

  var revieweeId;
  if (userId === job.poster_id) {
    revieweeId = job.provider_id;
  } else if (userId === job.provider_id) {
    revieweeId = job.poster_id;
  } else {
    return { success: false, error: "You are not associated with this job" };
  }

  var insertResult = await pool.query(
    "INSERT INTO ratings (job_id, poster_id, provider_id, reviewer_id, rating, review) " +
      "VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [jobId, job.poster_id, job.provider_id, userId, rating, reviewText || null]
  );

  return {
    success: true,
    data: insertResult.rows[0],
    message: "Review submitted successfully!",
  };
}

/**
 * Action: Get my jobs
 */
async function getMyJobsAction(userId) {
  var result = await pool.query(
    "SELECT jobs.*, " +
      "(SELECT COUNT(*) FROM bids WHERE bids.job_id = jobs.id) as bid_count " +
      "FROM jobs WHERE poster_id = $1 ORDER BY created_at DESC LIMIT 10",
    [userId]
  );

  return {
    success: true,
    data: result.rows,
    count: result.rows.length,
  };
}

/**
 * Action: Get my bids
 */
async function getMyBidsAction(userId) {
  var result = await pool.query(
    "SELECT bids.*, jobs.title as job_title, jobs.budget as job_budget, jobs.status as job_status " +
      "FROM bids JOIN jobs ON jobs.id = bids.job_id " +
      "WHERE bids.provider_id = $1 ORDER BY bids.created_at DESC LIMIT 10",
    [userId]
  );

  return {
    success: true,
    data: result.rows,
    count: result.rows.length,
  };
}

/**
 * Action: Get job details
 */
async function getJobDetailsAction(jobId) {
  if (!jobId) {
    return { success: false, error: "Job ID is required" };
  }

  var result = await pool.query(
    "SELECT jobs.*, users.name as poster_name, " +
      "(SELECT COUNT(*) FROM bids WHERE bids.job_id = jobs.id) as bid_count " +
      "FROM jobs JOIN users ON users.id = jobs.poster_id " +
      "WHERE jobs.id = $1",
    [jobId]
  );

  if (result.rows.length === 0) {
    return { success: false, error: "Job not found" };
  }

  return {
    success: true,
    data: result.rows[0],
  };
}

/**
 * Action: Get wallet balance
 */
async function getBalanceAction(userId) {
  var result = await pool.query(
    "SELECT COALESCE(SUM(CASE WHEN type='credit' THEN diamonds WHEN type='debit' THEN -diamonds ELSE 0 END), 0) as balance " +
      "FROM wallet_ledger WHERE user_id = $1",
    [userId]
  );

  return {
    success: true,
    balance: parseInt(result.rows[0].balance) || 0,
  };
}

/**
 * Get chat history for current user
 */
async function getChatHistory(req, res) {
  var sessionId = req.params.session_id;
  var userId = req.user.id;

  try {
    if (sessionId) {
      var result = await getSessionHistory(sessionId, 50);
      return res.json({
        success: true,
        messages: result.messages,
      });
    } else {
      var sessionsResult = await getUserSessions(userId, 20);
      return res.json({
        success: true,
        sessions: sessionsResult.sessions,
      });
    }
  } catch (error) {
    console.error("Error getting chat history:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get chat history",
    });
  }
}

/**
 * Delete a chat session
 */
async function deleteChatSession(req, res) {
  var sessionId = req.params.session_id;
  var userId = req.user.id;

  try {
    await deleteSession(sessionId, userId);
    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleting session:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete session",
    });
  }
}

/**
 * Clear all chat history for current user
 */
async function clearAllChatHistory(req, res) {
  var userId = req.user.id;

  try {
    await clearUserHistory(userId);
    return res.json({ success: true });
  } catch (error) {
    console.error("Error clearing history:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to clear history",
    });
  }
}

module.exports = {
  chat,
  getChatHistory,
  deleteChatSession,
  clearAllChatHistory,
};