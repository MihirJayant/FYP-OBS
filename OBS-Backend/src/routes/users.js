var express = require("express");
var router = express.Router();
var multer = require("multer");
var path = require("path");
var { authenticate, permit } = require("../middleware/auth");
var validate = require("../middleware/validateRequest");
var { updateProfileValidator } = require("../validators/users.validator");
var usersController = require("../controllers/users.controller");

var uploadDir = process.env.UPLOAD_DIR || "uploads";
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "..", uploadDir));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
var upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get("/me", authenticate, usersController.getMe);
router.put(
  "/me",
  authenticate,
  upload.single("profile_image"),
  updateProfileValidator,
  usersController.updateMe
);
router.put("/role", authenticate, usersController.updateRole);
router.get("/check", authenticate, usersController.checkRole);

// Public profile - any logged in user can view another user's profile
router.get("/profile/:id", authenticate, usersController.getPublicProfile);

router.get("/", authenticate, permit("admin"), usersController.listUsers);

router.delete("/me", authenticate, usersController.deleteAccount);

module.exports = router;