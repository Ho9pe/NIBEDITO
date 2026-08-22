const { Schema, model } = require("mongoose");

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    // Replace single discount type with discount options
    discountOptions: {
      productDiscount: {
        type: {
          type: String,
          enum: ["fixed", "percentage", "none"],
          default: "none",
        },
        value: {
          type: Number,
          default: 0,
        },
        maxDiscount: {
          type: Number,
          default: null, // Only for percentage-based discounts
        },
      },
      shippingDiscount: {
        type: {
          type: String,
          enum: ["free", "fixed", "percentage", "none"],
          default: "none",
        },
        value: {
          type: Number,
          default: 0, // Used for fixed or percentage shipping discounts
        },
      },
    },

    minOrderAmount: {
      type: Number,
      default: 0, // No minimum by default
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    usageLimit: {
      type: Number,
      default: 1, // How many times a single user can use this coupon
    },

    usedBy: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        timesUsed: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

// Index for quick lookup by code
couponSchema.index({ code: 1 }, { unique: true });

const Coupon = model("Coupon", couponSchema);
module.exports = Coupon;
