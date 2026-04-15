var { authLimiter, resetLimiter } = require("../middleware/rateLimiter");
const express = require("express");
const router = express.Router();
const validate = require("../middleware/validateRequest");
const {
  registerValidator,
  loginValidator,
  forgotValidator,
  resetValidator,
  refreshValidator,
} = require("../validators/auth.validator");
const authController = require("../controllers/auth.controller");

router.post("/login", authLimiter, loginValidator, validate, authController.login);
router.post("/register", authLimiter, registerValidator, validate, authController.register);
router.post("/forgot", resetLimiter, forgotValidator, validate, authController.forgot);
router.post("/reset", resetValidator, validate, authController.reset);
router.post(
  "/token/refresh",
  refreshValidator,
  validate,
  authController.refreshToken
);
router.post("/logout", authController.logout);
router.post("/google", authController.googleSignIn);

module.exports = router;
