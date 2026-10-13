const { Schema, model } = require("mongoose");

const orderItemSchema = new Schema(
  {
    quantity: {
      type: Number,
      required: true,
      validate: {
        validator: (v) => v >= 1,
        message: "Quantity must be greater than or equal to 1",
      },
    },

    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    variant: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    cost: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // orderItems
    items: [orderItemSchema],

    street: {
      type: String,
      required: [true, "Street address is required"],
      trim: true,
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },

    district: {
      type: String,
      required: [true, "District is required"],
      trim: true,
    },

    // Additional address/location information (optional)
    addressDetails: {
      type: String,
      trim: true,
      default: "",
    },

    phone: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^(\+)?[\d\s-]{10,}$/.test(v);
        },
        message: "Please enter a valid phone number",
      },
    },

    email: {
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    dateOrdered: {
      type: Date,
      default: Date.now,
    },

    totalPrice: {
      type: Number,
      required: true,
      validate: {
        validator: (v) => v >= 0,
        message: "Total price must be greater than or equal to 0",
      },
    },

    shippingRegion: {
      type: String,
      required: true,
      trim: true,
    },

    shippingCost: {
      type: Number,
      default: 0,
      validate: {
        validator: (v) => v >= 0,
        message: "Shipping cost must be greater than or equal to 0",
      },
    },

    freeShipping: {
      type: Boolean,
      default: false,
    },

    coupon: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      default: null, // Null if no coupon is applied
    },

    // Total discount including both product and shipping discounts
    discountAmount: {
      type: Number,
      default: 0,
    },

    // Store the breakdown of discounts for record-keeping
    discountBreakdown: {
      productDiscount: { type: Number, default: 0 },
      shippingDiscount: { type: Number, default: 0 },
    },

    finalPrice: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },

    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      required: false, // Will be null initially
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    paidAt: {
      type: Date,
    },

    // Gift options
    isGift: {
      type: Boolean,
      default: false,
    },

    giftNote: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// User index (MOST CRITICAL - used for getUserOrders)
orderSchema.index({ user: 1 });

// Order status index (for filtering by status)
orderSchema.index({ status: 1 });

// Payment status index (for filtering paid/unpaid orders)
orderSchema.index({ isPaid: 1 });

// Date indexes for sorting and filtering
orderSchema.index({ createdAt: -1 }); // Most recent orders first
orderSchema.index({ dateOrdered: -1 }); // Orders by date ordered

// Gift orders index (for filtering gift orders)
orderSchema.index({ isGift: 1 });

// Product reference in items (for product-based queries)
orderSchema.index({ "items.product": 1 });

// Payment reference index (for payment-order lookups)
orderSchema.index({ payment: 1 });

// Coupon reference index (for coupon analytics)
orderSchema.index({ coupon: 1 });

// Compound indexes for common admin queries
orderSchema.index({ user: 1, createdAt: -1 }); // User orders by date
orderSchema.index({ status: 1, createdAt: -1 }); // Orders by status and date
orderSchema.index({ user: 1, status: 1, createdAt: -1 }); // Get user orders by status and date
orderSchema.index({ isPaid: 1, status: 1 }); // Payment status + order status
orderSchema.index({ user: 1, status: 1 }); // User's orders by status
orderSchema.index({ isGift: 1, createdAt: -1 }); // Gift orders by date

// Price and region indexes for analytics
orderSchema.index({ finalPrice: -1 }); // Orders by value
orderSchema.index({ shippingRegion: 1 }); // Orders by shipping region

const Order = model("Order", orderSchema);

module.exports = { Order };
