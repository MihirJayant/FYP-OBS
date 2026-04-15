// @ts-nocheck
var bcrypt = require("bcrypt");
var pool = require("../db");
var { signAccessToken, signRefreshToken } = require("../utils/jwt");
var { ApiError } = require("../utils/errors");
var fetch = function () {
  return import("node-fetch").then(function (mod) {
    return mod.default.apply(null, arguments);
  });
};
var { lookupPostcode } = require("../services/postcode");
var { sendWelcomeEmail, sendOTPEmail } = require("../services/email");

async function register(req, res) {
  var {
    email,
    password,
    name,
    role,
    phone,
    postcode,
    latitude,
    location,
    longitude,
    profile_image,
    rating,
  } = req.body;

  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ error: "Missing required fields: email, password, name" });
  }

  try {
    var checkQuery = "SELECT id FROM users WHERE email = $1";
    var { rows: existingRows } = await pool.query(checkQuery, [email]);

    if (existingRows.length > 0) {
      return res.status(409).json({
        error:
          "Email already registered. Please use a different email or log in.",
      });
    }

    // handle postcode lookup if provided
    var lat = latitude || null;
    var lng = longitude || null;
    var loc = location || null;

    if (postcode && !lat && !lng) {
      var postcodeResult = await lookupPostcode(postcode);
      if (postcodeResult.valid) {
        lat = postcodeResult.latitude;
        lng = postcodeResult.longitude;
        if (!loc) {
          loc = postcodeResult.displayAddress;
        }
      }
    }

    // hash password and insert new user
    var hashed = await bcrypt.hash(password, 10);
    var insertQuery =
      "INSERT INTO users (email, password_hash, name, role, phone, location, latitude, longitude, profile_image, rating) " +
      "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) " +
      "RETURNING id, email, name, role, location, latitude, longitude, profile_image, rating";

    var { rows } = await pool.query(insertQuery, [
      email,
      hashed,
      name,
      role,
      phone || null,
      loc,
      lat,
      lng,
      profile_image || null,
      rating || null,
    ]);

    var user = rows[0];
    var access = signAccessToken(user);
    var refresh = signRefreshToken(user);

    await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [
      refresh,
      user.id,
    ]);

    // Give new user 500 initial funds
    await pool.query(
      "INSERT INTO wallet_ledger (user_id, type, diamonds, reference_type, reference_id, note) " +
        "VALUES ($1, 'credit', 500, 'signup', $2, 'Welcome bonus - initial funds')",
      [user.id, user.id]
    );

    // Send welcome email
    sendWelcomeEmail(email, name, role);

    var { password_hash, ...safeUser } = user;
    res.status(201).json({ user: safeUser, access, refresh });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === "23505") {
      return res.status(409).json({ error: "Email already in use." });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

async function login(req, res) {
  var { email, password } = req.body;
  var { rows } = await pool.query("SELECT * FROM users WHERE email=$1", [
    email,
  ]);
  var user = rows[0];
  if (!user) throw new ApiError(401, "Invalid credentials");
  if (!user.password_hash)
    throw new ApiError(400, "User registered via social login");

  var ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new ApiError(401, "Invalid credentials");

  var access = signAccessToken(user);
  var refresh = signRefreshToken(user);

  await pool.query(
    "UPDATE users SET refresh_token=$1, updated_at=now() WHERE id=$2",
    [refresh, user.id]
  );

  var { rows: ratingRows } = await pool.query(
    "SELECT COUNT(*)::int AS rating_count FROM ratings WHERE provider_id = $1",
    [user.id]
  );

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      location: user.location,
      latitude: user.latitude,
      longitude: user.longitude,
      profile_image: user.profile_image,
      rating_count: ratingRows[0].rating_count,
      rating: user.rating,
    },
    access,
    refresh,
  });
}

async function forgot(req, res) {
  var { email } = req.body;
  if (!email) throw new ApiError(400, "Email required");

  var { rows } = await pool.query("SELECT id, name FROM users WHERE email=$1", [
    email,
  ]);
  var user = rows[0];
  if (!user) throw new ApiError(404, "No user found with this email");

  var otp = String(Math.floor(100000 + Math.random() * 900000));

  await pool.query(
    "UPDATE users SET reset_otp=$1, reset_otp_expires=now() + interval '10 minutes' WHERE id=$2",
    [otp, user.id]
  );

  // Send OTP via email
  sendOTPEmail(email, user.name, otp);
  console.log("OTP sent to " + email);

  res.json({
    message: "OTP has been sent to your email address.",
  });
}

async function reset(req, res) {
  var { email, otp, new_password } = req.body;

  if (!email || !otp || !new_password)
    throw new ApiError(400, "email, otp and new_password required");

  var { rows } = await pool.query(
    "SELECT id, reset_otp, reset_otp_expires FROM users WHERE email=$1",
    [email]
  );
  var user = rows[0];
  if (!user) throw new ApiError(404, "User not found");
  if (user.reset_otp !== otp) throw new ApiError(400, "Invalid OTP");

  if (new Date() > new Date(user.reset_otp_expires))
    throw new ApiError(400, "OTP expired, request a new one");

  var hash = await bcrypt.hash(new_password, 10);

  await pool.query(
    "UPDATE users SET password_hash=$1, reset_otp=NULL, reset_otp_expires=NULL WHERE id=$2",
    [hash, user.id]
  );

  res.json({ message: "Password reset successful" });
}

async function refreshToken(req, res) {
  var { refresh } = req.body;
  try {
    var payload = require("jsonwebtoken").verify(
      refresh,
      process.env.JWT_REFRESH_SECRET
    );
    var { rows } = await pool.query(
      "SELECT id, refresh_token FROM users WHERE id=$1",
      [payload.sub]
    );
    var user = rows[0];
    if (!user || user.refresh_token !== refresh)
      throw new ApiError(401, "Invalid refresh token");

    var u = { id: payload.sub };
    var access = signAccessToken(u);
    var newRefresh = signRefreshToken(u);

    await pool.query("UPDATE users SET refresh_token=$1 WHERE id=$2", [
      newRefresh,
      payload.sub,
    ]);
    res.json({ access, refresh: newRefresh });
  } catch (err) {
    throw new ApiError(401, "Invalid refresh token");
  }
}

async function logout(req, res) {
  var { refresh } = req.body;
  if (!refresh) throw new ApiError(400, "refresh required");
  try {
    var payload = require("jsonwebtoken").verify(
      refresh,
      process.env.JWT_REFRESH_SECRET
    );
    await pool.query("UPDATE users SET refresh_token = NULL WHERE id = $1", [
      payload.sub,
    ]);
    res.json({ ok: true });
  } catch (err) {
    throw new ApiError(400, "Invalid token");
  }
}

async function googleSignIn(req, res) {
  var { id_token, role } = req.body;
  var allowedRoles = ["provider", "poster", ""];
  var newRole = null;

  if (!id_token) throw new ApiError(400, "id_token required");

  var resp = await fetch(
    "https://oauth2.googleapis.com/tokeninfo?id_token=" +
      encodeURIComponent(id_token)
  );

  if (!resp.ok) throw new ApiError(401, "Invalid Google ID token");

  var payload = await resp.json();

  if (
    process.env.GOOGLE_CLIENT_ID &&
    payload.aud !== process.env.GOOGLE_CLIENT_ID
  )
    throw new ApiError(401, "Token audience mismatch");

  if (payload.email_verified !== "true" && payload.email_verified !== true)
    throw new ApiError(400, "Google account email not verified");

  var { rows } = await pool.query("SELECT * FROM users WHERE email=$1", [
    payload.email,
  ]);

  var user = rows[0];
  var isNewUser = false;

  if (!user) {
    var insertQ =
      "INSERT INTO users (email, name, role, google_id, auth_provider, profile_image, created_at) " +
      "VALUES ($1,$2,$3,$4,$5,$6,now()) RETURNING *";

    var vals = [
      payload.email,
      payload.name || payload.email.split("@")[0],
      newRole,
      payload.sub,
      "google",
      payload.picture || null,
    ];

    var { rows: ins } = await pool.query(insertQ, vals);
    user = ins[0];
    isNewUser = true;
  } else {
    if (!user.google_id) {
      await pool.query(
        "UPDATE users SET google_id=$1, auth_provider=$2, profile_image=COALESCE($3, profile_image) WHERE id=$4",
        [payload.sub, "google", payload.picture || null, user.id]
      );
    }
  }

  var u = { id: user.id };
  var access = signAccessToken(u);
  var refresh = signRefreshToken(u);

  await pool.query(
    "UPDATE users SET refresh_token=$1, updated_at=now() WHERE id=$2",
    [refresh, user.id]
  );

  // Give new Google user 500 initial funds and send welcome email
  if (isNewUser) {
    await pool.query(
      "INSERT INTO wallet_ledger (user_id, type, diamonds, reference_type, reference_id, note) " +
        "VALUES ($1, 'credit', 500, 'signup', $2, 'Welcome bonus - initial funds')",
      [user.id, user.id]
    );
    sendWelcomeEmail(user.email, user.name, user.role || "poster");
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    access,
    refresh,
  });
}

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  googleSignIn,
  forgot,
  reset,
};