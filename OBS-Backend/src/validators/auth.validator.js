const { body } = require("express-validator");

const registerValidator = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
  body("name").notEmpty().withMessage("Name required"),
  body("role")
    .isIn(["poster", "provider"])
    .withMessage("Role must be poster or provider"),
];

const loginValidator = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password required"),
];

const forgotValidator = [
  body("email").isEmail().withMessage("Valid email required"),
];

const resetValidator = [
  body("email").isEmail().withMessage("Valid email required"),
  body("otp").isLength(6).withMessage("Valid OTP required"),
  body("new_password").notEmpty().withMessage("Password required"),
];

const refreshValidator = [
  body("refresh").notEmpty().withMessage("Refresh token required"),
];

module.exports = {
  registerValidator,
  loginValidator,
  refreshValidator,
  forgotValidator,
  resetValidator,
};
