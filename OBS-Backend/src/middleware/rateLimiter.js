/**
 * Rate Limiting Middleware
 * Prevents brute force attacks and API abuse
 */
var rateLimit = require("express-rate-limit");

// General API rate limiter - 100 requests per 15 minutes per IP
var generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: {
    error: "Too many requests from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for auth endpoints - 10 requests per 15 minutes per IP
var authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: {
    error: "Too many login attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter for password reset - 5 requests per 15 minutes
var resetLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  message: {
    error: "Too many password reset requests. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter for AI endpoints - 20 requests per 15 minutes
var aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    error: "Too many AI requests. Please try again shortly.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  authLimiter,
  resetLimiter,
  aiLimiter,
};