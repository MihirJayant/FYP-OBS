/**
 * Input Sanitisation Middleware
 * Strips HTML tags and script content from request body, query, and params
 * Prevents XSS (Cross-Site Scripting) attacks
 */

function sanitiseString(value) {
    if (typeof value !== "string") return value;
    // Remove HTML tags
    var cleaned = value.replace(/<[^>]*>/g, "");
    // Remove common XSS patterns
    cleaned = cleaned.replace(/javascript:/gi, "");
    cleaned = cleaned.replace(/on\w+\s*=/gi, "");
    return cleaned;
  }
  
  function sanitiseObject(obj) {
    if (!obj || typeof obj !== "object") return obj;
  
    var sanitised = {};
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        var value = obj[key];
        if (typeof value === "string") {
          sanitised[key] = sanitiseString(value);
        } else if (typeof value === "object" && value !== null) {
          sanitised[key] = sanitiseObject(value);
        } else {
          sanitised[key] = value;
        }
      }
    }
    return sanitised;
  }
  
  function sanitiseInput(req, res, next) {
    if (req.body) {
      req.body = sanitiseObject(req.body);
    }
    if (req.query) {
      req.query = sanitiseObject(req.query);
    }
    if (req.params) {
      req.params = sanitiseObject(req.params);
    }
    next();
  }
  
  module.exports = sanitiseInput;