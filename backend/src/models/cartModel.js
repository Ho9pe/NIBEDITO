const { Schema, model } = require("mongoose");

const cartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  variant: {
    _id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    color: String,
    size: String,
  },

  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity cannot be less than 1"],
    validate: {
      validator: Number.isInteger,
      message: "Quantity must be an integer",
    },
  },

  cost: {
    type: Number,
    required: true,
    min: [0, "Cost cannot be negative"],
  },
});

// Add a method to calculate item cost
cartItemSchema.methods.calculateCost = async function () {
  if (!this.cached_price) {
    const product = await model("Product").findById(this.product);
    this.cached_price = product.price;
  }
  return this.quantity * this.cached_price;
};

const cartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [cartItemSchema],

    totalPrice: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Total price cannot be negative"],
    },

    status: {
      type: String,
      enum: ["active", "checkedOut"],
      default: "active",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add middleware to calculate total price
cartSchema.pre("save", async function (next) {
  this.totalPrice = this.items.reduce((total, item) => total + item.cost, 0);
  next();
});

// User index (MOST CRITICAL - used for all cart operations)
cartSchema.index({ user: 1 }, { unique: true });

// Product reference in items (for product updates and cart cleanup)
cartSchema.index({ "items.product": 1 });

const Cart = model("Cart", cartSchema);
module.exports = Cart;
