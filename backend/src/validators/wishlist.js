const { check } = require("express-validator");

// Validates body.productId when adding to wishlist
const validateAddToWishlist = [
  check("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID"),
];

// Validates body when removing a single item from wishlist (either itemId or productId)
const validateRemoveFromWishlist = [
  check().custom((value, { req }) => {
    const { itemId, productId } = req.body;
    if (!itemId && !productId) {
      throw new Error("Either itemId or productId is required");
    }
    const idToValidate = itemId || productId;
    if (!/^[0-9a-fA-F]{24}$/.test(idToValidate)) {
      throw new Error("Invalid ID format");
    }
    return true;
  }),
];

module.exports = {
  validateAddToWishlist,
  validateRemoveFromWishlist,
};
