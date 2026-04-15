const { ApiError } = require("../utils/errors");

function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .json({ error: err.message, details: err.details || undefined });
  }
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
}

module.exports = { errorHandler };
