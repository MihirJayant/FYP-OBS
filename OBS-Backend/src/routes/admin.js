const router = require("express").Router();
const { authenticate, permit } = require("../middleware/auth");
const admin = require("../controllers/admin.controller");

// Dashboard stats
router.get("/dashboard", authenticate, permit("admin"), admin.dashboardStats);

// Analytics charts
router.get("/analytics", authenticate, permit("admin"), admin.analyticsOverview);

// User management
router.get("/users", authenticate, permit("admin"), admin.listUsers);
router.get("/users/:id", authenticate, permit("admin"), admin.getUser);
router.put("/users/:id/role", authenticate, permit("admin"), admin.updateUserRole);
router.delete("/users/:id", authenticate, permit("admin"), admin.deleteUser);

// Job management - fixed: getJobById changed from POST to GET
router.get("/jobs", authenticate, permit("admin"), admin.listJobs);
router.get("/jobs/:id", authenticate, permit("admin"), admin.getJobById);
router.put("/jobs/:id/status", authenticate, permit("admin"), admin.updateJobStatus);
router.delete("/jobs/:id", authenticate, permit("admin"), admin.deleteJob);

// Bids
router.get("/bids", authenticate, permit("admin"), admin.listBids);

// Payments
router.get("/payments", authenticate, permit("admin"), admin.listPayments);

// Wallet ledger
router.get("/wallet-ledger", authenticate, permit("admin"), admin.walletLedger);

// Ratings and reviews
router.get("/ratings", authenticate, permit("admin"), admin.listRatings);

module.exports = router;
