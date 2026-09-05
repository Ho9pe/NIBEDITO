const { Schema, model } = require("mongoose");

const wishlistItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Snapshot of price when item was wishlisted.
    // Used for price-drop detection: if product.price < priceAtTimeOfWishlisting
    // we can notify the user that the price dropped on their wishlisted item.
    priceAtTimeOfWishlisting: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },

    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const wishlistSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [wishlistItemSchema],
  },
  { timestamps: true }
);

// One wishlist document per user
wishlistSchema.index({ user: 1 }, { unique: true });

// Reverse lookup: "which users have wishlisted product X?"
// Critical for price-drop notifications and wishlist analytics
wishlistSchema.index({ "items.product": 1 });

// Compound: price-drop query — find wishlists containing a product,
// sorted by when it was added (useful for notification batching)
wishlistSchema.index({ "items.product": 1, "items.addedAt": -1 });

const Wishlist = model("Wishlist", wishlistSchema);
module.exports = Wishlist;
