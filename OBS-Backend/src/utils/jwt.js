var jwt = require("jsonwebtoken");

function signAccessToken(user) {
  var payload = {};
  var opts = {
    subject: user.id,
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  };
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET || "8jCs0G00rZA4eXuPzKvKnHKdSu", opts);
}

function signRefreshToken(user) {
  var payload = {};
  var opts = {
    subject: user.id,
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  };
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || "wCs5uPgd10xDMqGYbkC35PLYIB", opts);
}

module.exports = { signAccessToken, signRefreshToken };