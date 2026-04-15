var express = require("express");
var router = express.Router();
var { authenticate } = require("../middleware/auth");
var { enhanceDescription } = require("../services/ai-description");

// POST /api/ai/enhance-description
router.post("/enhance-description", authenticate, async function (req, res) {
  var roughText = req.body.description;
  var currentTitle = req.body.title;

  if (!roughText || !roughText.trim()) {
    return res.status(400).json({
      success: false,
      error: "Description text is required",
    });
  }

  var result = await enhanceDescription(roughText, currentTitle);

  if (result.success) {
    return res.json({
      success: true,
      data: {
        enhanced_description: result.enhanced_description,
        suggested_category: result.suggested_category,
        suggested_title: result.suggested_title,
      },
    });
  } else {
    return res.status(400).json({
      success: false,
      error: result.error,
    });
  }
});

module.exports = router;