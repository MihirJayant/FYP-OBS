// Test Setup - loads env and provides shared test utilities

var pool = require("../db");

// unique test emails so we don't clash with real data
var testId = Date.now();

var testPoster = {
  email: "testposter" + testId + "@test.com",
  password: "TestPass123!",
  name: "Test Poster",
  role: "poster",
  postcode: "NG1 4BU",
};

var testProvider = {
  email: "testprovider" + testId + "@test.com",
  password: "TestPass123!",
  name: "Test Provider",
  role: "provider",
  postcode: "NG1 5AA",
};

// store tokens and IDs after registration so other tests can use them
var tokens = {
  posterAccess: null,
  posterRefresh: null,
  posterId: null,
  providerAccess: null,
  providerRefresh: null,
  providerId: null,
};

// remove all test data after the suite finishes
async function cleanup() {
  try {
    await pool.query(
      "DELETE FROM ratings WHERE poster_id = $1 OR provider_id = $1 OR poster_id = $2 OR provider_id = $2",
      [tokens.posterId, tokens.providerId]
    );
    await pool.query(
      "DELETE FROM wallet_ledger WHERE user_id = $1 OR user_id = $2",
      [tokens.posterId, tokens.providerId]
    );
    await pool.query("DELETE FROM bids WHERE provider_id = $1", [
      tokens.providerId,
    ]);
    await pool.query(
      "DELETE FROM job_history WHERE job_id IN (SELECT id FROM jobs WHERE poster_id = $1)",
      [tokens.posterId]
    );
    await pool.query("DELETE FROM jobs WHERE poster_id = $1", [
      tokens.posterId,
    ]);
    await pool.query(
      "DELETE FROM users WHERE email = $1 OR email = $2",
      [testPoster.email, testProvider.email]
    );
  } catch (err) {
    console.error("Cleanup error:", err.message);
  }
}

async function closePool() {
  await pool.end();
}

module.exports = {
  testPoster,
  testProvider,
  tokens,
  cleanup,
  closePool,
  pool,
};