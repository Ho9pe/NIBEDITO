const { Schema, model } = require("mongoose");

const paymentSchema = new Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["Cash on Delivery"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed", "Refunded"],
      default: "Pending",
    },

    refundedAt: {
      type: Date, // If the payment was refunded
      default: null,
    },
  },
  { timestamps: true }
);

// Order reference index (MOST CRITICAL - used for order-payment lookups)
paymentSchema.index({ order: 1 }, { unique: true });

// Payment status index (for filtering by status)
paymentSchema.index({ status: 1 });

// Amount index (for financial reporting)
paymentSchema.index({ amount: -1 });

// Date indexes for sorting and reporting
paymentSchema.index({ createdAt: -1 }); // Recent payments first
paymentSchema.index({ refundedAt: -1 }); // Recent refunds

// Compound indexes for common queries
paymentSchema.index({ status: 1, createdAt: -1 }); // Payments by status and date
paymentSchema.index({ paymentMethod: 1, status: 1 }); // Method + status filtering
paymentSchema.index({ status: 1, amount: -1 }); // Status + amount for reporting

const Payment = model("Payment", paymentSchema);
module.exports = Payment;
