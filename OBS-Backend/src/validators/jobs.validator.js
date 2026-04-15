const { body, query } = require("express-validator");

const createJobValidator = [
  body("title").notEmpty().withMessage("Title required"),
  body("budget").optional().isNumeric().withMessage("Budget must be numeric"),
];

const listJobsValidator = [
  query("minBudget").optional().isNumeric(),
  query("maxBudget").optional().isNumeric(),
  query("distanceKm").optional().isNumeric(),
  query("lat").optional().isFloat(),
  query("lng").optional().isFloat(),
];

module.exports = { createJobValidator, listJobsValidator };
