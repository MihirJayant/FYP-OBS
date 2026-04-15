const express = require("express");
const router = express.Router();
const { authenticate, permit } = require("../middleware/auth");
const validate = require("../middleware/validateRequest");
const { createBidValidator } = require("../validators/bids.validator");
const bidsController = require("../controllers/bids.controller");

router.post(
  "/",
  authenticate,
  permit("provider"),
  createBidValidator,
  validate,
  bidsController.createBid
);
router.get("/job/:jobId", authenticate, bidsController.getBidsForJob);
router.post(
  "/accept/:id",
  authenticate,
  permit("poster"),
  bidsController.acceptBid
);
router.post(
  "/cancel/:id",
  authenticate,
  permit("provider"),
  bidsController.cancelBid
);

module.exports = router;
