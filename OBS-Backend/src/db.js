var { Pool } = require("pg");
var { logger } = require("./utils/logger");

var pool = new Pool({
  user: process.env.DB_USER || "postgres",
  password: String(process.env.DB_PASSWORD || "1220"),
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "obs",
});

pool.on("error", function (err) {
  logger.error("Unexpected error on idle client", err);
  process.exit(-1);
});

module.exports = pool;