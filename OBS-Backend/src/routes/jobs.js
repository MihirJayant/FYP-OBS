const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { authenticate, permit } = require("../middleware/auth");
const validate = require("../middleware/validateRequest");
const {
  createJobValidator,
  listJobsValidator,
} = require("../validators/jobs.validator");
const jobsController = require("../controllers/jobs.controller");

const uploadDir = process.env.UPLOAD_DIR || "uploads";
const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, "..", "..", uploadDir)),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post(
  "/",
  authenticate,
  permit("poster"),
  upload.array("images", 6),
  createJobValidator,
  validate,
  jobsController.createJob
);
router.put(
  "/:id",
  authenticate,
  permit("poster"),
  upload.array("images", 6),
  jobsController.updateJob
);
router.delete("/:id", authenticate, permit("poster"), jobsController.deleteJob);
router.get("/", listJobsValidator, validate, jobsController.listJobs);
router.get("/:id", jobsController.getJob);
router.get("/job-bids/:id", jobsController.getJobWithBids);
router.put("/:id/complete", authenticate, permit("poster"), jobsController.completeJob);

module.exports = router;
