const express = require("express");
const {
  addCoupon,
  removeCoupon,
  applyCoupon,
  getAllCoupons,
  getCouponById,
  previewCoupon,
  updateCoupon,
  getCouponStats,
  getCouponUsageAnalytics,
} = require("../controllers/couponController");

const { isLoggedIn, isAdmin } = require("../middlewares/authMiddleware");

const couponRouter = express.Router();

// Get all coupons
couponRouter.get("/", isLoggedIn, isAdmin, getAllCoupons);

// Get a coupon by ID (admin only)
couponRouter.get("/:couponId", isLoggedIn, isAdmin, getCouponById);

// Add a new coupon (admin only)
couponRouter.post("/", isLoggedIn, isAdmin, addCoupon);

// Update a coupon (admin only)
couponRouter.put("/:couponId", isLoggedIn, isAdmin, updateCoupon);

// Remove a coupon (admin only)
couponRouter.delete("/:couponId", isLoggedIn, isAdmin, removeCoupon);

// Preview a coupon (does not affect usage count)
couponRouter.post("/preview", isLoggedIn, previewCoupon);

// Apply a coupon (affects usage count)
couponRouter.post("/apply", isLoggedIn, applyCoupon);

// Analytics routes (admin only)
couponRouter.get("/analytics/stats", isLoggedIn, isAdmin, getCouponStats);
couponRouter.get(
  "/analytics/usage",
  isLoggedIn,
  isAdmin,
  getCouponUsageAnalytics
);

module.exports = couponRouter;
