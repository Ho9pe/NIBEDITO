const { check } = require("express-validator");

const validateBanner = [
  check("title")
    .trim()
    .notEmpty()
    .withMessage("Banner title is required")
    .isLength({ min: 2, max: 150 })
    .withMessage("Title must be between 2-150 characters"),

  check("subtitle")
    .optional()
    .isLength({ max: 300 })
    .withMessage("Subtitle cannot exceed 300 characters"),

  check("badge")
    .optional()
    .isLength({ max: 30 })
    .withMessage("Badge label cannot exceed 30 characters"),

  check("ctaText")
    .optional()
    .isLength({ max: 50 })
    .withMessage("CTA text cannot exceed 50 characters"),

  check("ctaLink")
    .optional()
    .isLength({ max: 500 })
    .withMessage("CTA link cannot exceed 500 characters"),

  check("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Order must be a non-negative integer"),

  check("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

const validateBannerReorder = [
  check("banners")
    .isArray({ min: 1 })
    .withMessage("banners must be a non-empty array"),

  check("banners.*.id")
    .notEmpty()
    .withMessage("Each banner must have a valid id"),

  check("banners.*.order")
    .isInt({ min: 0 })
    .withMessage("Each order value must be a non-negative integer"),
];

module.exports = { validateBanner, validateBannerReorder };
