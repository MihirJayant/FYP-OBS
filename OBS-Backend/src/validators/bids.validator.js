const { body } = require("express-validator");

const createBidValidator = [
  body("job_id").notEmpty().withMessage("job_id required"),
  body("diamonds_used")
    .isNumeric()
    .withMessage("diamonds_used must be a number"),
  body("estimated_days").optional().isInt({ min: 0 }),
];

module.exports = { createBidValidator };