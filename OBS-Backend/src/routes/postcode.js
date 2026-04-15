const express = require("express");
const router = express.Router();
const {
  lookupPostcode,
  validatePostcode,
  reversePostcodeLookup,
  autocompletePostcode,
} = require("../services/postcode");

router.get("/lookup/:postcode", async (req, res) => {
  const { postcode } = req.params;
  const result = await lookupPostcode(postcode);
  if (result.valid) {
    res.json({ success: true, data: result });
  } else {
    res.status(400).json({ success: false, error: result.error });
  }
});

router.get("/validate/:postcode", async (req, res) => {
  const { postcode } = req.params;
  const isValid = await validatePostcode(postcode);
  res.json({
    success: true,
    valid: isValid,
    postcode: postcode.trim().toUpperCase(),
  });
});

router.get("/reverse", async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) {
    return res
      .status(400)
      .json({ success: false, error: "lat and lng required" });
  }
  const result = await reversePostcodeLookup(parseFloat(lat), parseFloat(lng));
  if (result.success) {
    res.json({ success: true, data: result });
  } else {
    res.status(400).json({ success: false, error: result.error });
  }
});

router.get("/autocomplete/:partial", async (req, res) => {
  const { partial } = req.params;
  const result = await autocompletePostcode(partial);
  res.json({
    success: result.success,
    suggestions: result.suggestions || [],
  });
});

module.exports = router;
