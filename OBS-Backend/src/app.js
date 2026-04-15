const express = require("express");
require("express-async-errors");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const { errorHandler } = require("./middleware/errorHandler");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const jobsRoutes = require("./routes/jobs");
const bidsRoutes = require("./routes/bids");
const adminRoutes = require("./routes/admin");
const postcodeRoutes = require("./routes/postcode");
const chatbotRoutes = require("./routes/chatbot");
const aiRoutes = require("./routes/ai");
var { generalLimiter } = require("./middleware/rateLimiter");
var sanitiseInput = require("./middleware/sanitise");

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));

const allowed = process.env.CORS_ORIGINS || "*";
app.use(cors({ origin: allowed === "*" ? "*" : allowed.split(",") }));

app.use(generalLimiter);
app.use(sanitiseInput);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "..", process.env.UPLOAD_DIR || "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/bids", bidsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ratings", require("./routes/ratings"));
app.use("/api/postcode", postcodeRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/ai", aiRoutes);

app.get("/healthz", (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

app.use(errorHandler);
module.exports = app;
