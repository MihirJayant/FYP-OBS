const { body } = require("express-validator");

const updateProfileValidator = [
  body("name").optional().isString(),
  body("phone").optional().isString(),
  body("location").optional().isString(),
  body("latitude").optional().isFloat(),
  body("longitude").optional().isFloat(),
];

module.exports = { updateProfileValidator };
