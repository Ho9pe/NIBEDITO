const express = require("express");

const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getUserOrders,
  updateOrderPaymentStatus,
  getOrderStats,
  getOrdersByRegion,
  downloadInvoice,
} = require("../controllers/orderController");

const { isLoggedIn, isAdmin } = require("../middlewares/authMiddleware");

const orderRouter = express.Router();

// Get all orders for a specific user (user must be logged in)
orderRouter.get("/user-orders", isLoggedIn, getUserOrders);

// Create a new order (user must be logged in)
orderRouter.post("/", isLoggedIn, createOrder);

// Get all orders (admin only)
orderRouter.get("/", isLoggedIn, isAdmin, getAllOrders);

// Download an order's invoice as a PDF (order owner or admin).
// Responds with application/pdf, not the usual JSON envelope.
orderRouter.get("/:id/invoice", isLoggedIn, downloadInvoice);

// Get a specific order by ID (user must be logged in)
orderRouter.get("/:id", isLoggedIn, getOrderById);

// Update order status (admin only)
orderRouter.put("/:id", isLoggedIn, isAdmin, updateOrderStatus);

// Update order paid status (admin only)
orderRouter.put(
  "/:id/payment-status",
  isLoggedIn,
  isAdmin,
  updateOrderPaymentStatus
);

// Delete an order (admin only)
orderRouter.delete("/:id", isLoggedIn, isAdmin, deleteOrder);

// Analytics
orderRouter.get("/analytics/stats", isLoggedIn, isAdmin, getOrderStats);
orderRouter.get("/analytics/regions", isLoggedIn, isAdmin, getOrdersByRegion);

module.exports = orderRouter;
