const { check } = require("express-validator");

// Validates body.productId when adding to wishlist
const validateAddToWishlist = [
  check("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID"),
];

// Validates body.itemId when removing a single item from wishlist
const validateRemoveFromWishlist = [
  check("itemId")
    .notEmpty()
    .withMessage("Item ID is required")
    .isMongoId()
    .withMessage("Invalid item ID"),
];

module.exports = {
  validateAddToWishlist,
  validateRemoveFromWishlist,
};
