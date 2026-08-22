const express = require("express");

const {
  processPayment,
  getPaymentById,
  getAllPayments,
  getUserPayments,
  updatePaymentStatus,
  cancelPayment,
  getPaymentStats,
  getRefundReports,
} = require("../controllers/paymentController");

const { isLoggedIn, isAdmin } = require("../middlewares/authMiddleware");

const paymentRouter = express.Router();

// Process a new payment (user must be logged in)
paymentRouter.post("/process", isLoggedIn, processPayment);

// Get payments for the logged-in user
paymentRouter.get("/user-payments", isLoggedIn, getUserPayments);

// Get all payments (admin only)
paymentRouter.get("/", isLoggedIn, isAdmin, getAllPayments);

// Get payment by ID (admin only)
paymentRouter.get("/:id", isLoggedIn, isAdmin, getPaymentById);

// Update payment status (admin only)
paymentRouter.put("/:id", isLoggedIn, isAdmin, updatePaymentStatus);

// Cancel/refund payment (admin only)
paymentRouter.put("/:id/cancel", isLoggedIn, isAdmin, cancelPayment);

// Analytics
paymentRouter.get("/analytics/stats", isLoggedIn, isAdmin, getPaymentStats);
paymentRouter.get("/analytics/refunds", isLoggedIn, isAdmin, getRefundReports);

module.exports = paymentRouter;
