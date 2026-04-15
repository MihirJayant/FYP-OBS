const express = require("express");
const router = express.Router();
const { addRating, getJobRatings, getUserRatings, getMyRating } = require("../controllers/ratings.controller");
const { authenticate } = require("../middleware/auth");

router.post("/", authenticate, addRating);
router.get("/job/:jobId", getJobRatings);
router.get("/job/:jobId/my-rating", authenticate, getMyRating);
router.get("/user/:userId", getUserRatings);

module.exports = router;
