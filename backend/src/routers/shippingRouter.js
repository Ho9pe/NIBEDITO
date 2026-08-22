const express = require("express");
const {
  getAllShippingRates,
  createShippingRate,
  initializeDefaultRates,
  updateShippingRate,
  deleteShippingRate,
  getShippingStats,
  getPopularShippingRegions,
} = require("../controllers/shippingController");
const { isLoggedIn, isAdmin } = require("../middlewares/authMiddleware");

const shippingRouter = express.Router();

// Public routes
shippingRouter.get("/rates", getAllShippingRates);

// Admin routes
shippingRouter.post("/rates", isLoggedIn, isAdmin, createShippingRate);

shippingRouter.post(
  "/rates/initialize",
  isLoggedIn,
  isAdmin,
  initializeDefaultRates
);
shippingRouter.put("/rates/:rateId", isLoggedIn, isAdmin, updateShippingRate);
shippingRouter.delete(
  "/rates/:rateId",
  isLoggedIn,
  isAdmin,
  deleteShippingRate
);

// Analytics
shippingRouter.get("/analytics/stats", isLoggedIn, isAdmin, getShippingStats);
shippingRouter.get(
  "/analytics/popular-regions",
  isLoggedIn,
  isAdmin,
  getPopularShippingRegions
);

module.exports = shippingRouter;
