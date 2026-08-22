const { body } = require("express-validator");

const validateReview = [
  body("product")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID"),

  body("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  body("comment")
    .optional() // CHANGED: Make comment optional
    .isLength({ min: 3, max: 500 }) // CHANGED: Reduced minimum from 10 to 3
    .withMessage("Comment must be between 3 and 500 characters")
    .trim(),
];

const validateReviewUpdate = [
  body("rating")
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  body("comment")
    .optional()
    .isLength({ min: 3, max: 500 }) // CHANGED: Reduced minimum from 10 to 3
    .withMessage("Comment must be between 3 and 500 characters")
    .trim(),
];

module.exports = { validateReview, validateReviewUpdate };
