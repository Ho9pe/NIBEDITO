const express = require("express");

const { isLoggedIn } = require("../middlewares/authMiddleware");
const { validateRequest } = require("../middlewares/validateRequest");
const {
  validateAddToWishlist,
  validateRemoveFromWishlist,
} = require("../validators/wishlist");
const {
  getWishlist,
  getWishlistIds,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} = require("../controllers/wishlistController");

const wishlistRouter = express.Router();

// /api/wishlist common path — all routes require authentication

// Full wishlist with populated product data (Wishlist page)
wishlistRouter.get("/", isLoggedIn, getWishlist);

// Lightweight: returns only wishlisted product IDs — call once on login,
// use client-side for heart-icon state across the app
wishlistRouter.get("/ids", isLoggedIn, getWishlistIds);

// Add a product to the wishlist
wishlistRouter.post(
  "/add",
  isLoggedIn,
  validateAddToWishlist,
  validateRequest,
  addToWishlist
);

// Remove a single item from the wishlist
wishlistRouter.delete(
  "/remove",
  isLoggedIn,
  validateRemoveFromWishlist,
  validateRequest,
  removeFromWishlist
);

// Clear entire wishlist
wishlistRouter.delete("/clear", isLoggedIn, clearWishlist);

module.exports = wishlistRouter;
