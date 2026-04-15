// @ts-nocheck
const { validationResult } = require("express-validator");
const { ApiError } = require("../utils/errors");

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  console.log("REQUEST BODY:", JSON.stringify(req.body));
  if (!errors.isEmpty()) {
    console.log("VALIDATION ERRORS:", JSON.stringify(errors.array()));
    const details = errors.array().map((e) => ({ param: e.param, msg: e.msg }));
    throw new ApiError(400, "Validation failed", details);
  }
  next();
}

module.exports = validateRequest;