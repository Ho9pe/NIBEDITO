const { Schema, model } = require("mongoose");

const reviewSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
      validate: {
        validator: function (value) {
          // Check if the number has at most 1 decimal place
          return Number.isInteger(value * 10);
        },
        message: "Rating must have at most 1 decimal place",
      },
    },

    comment: {
      type: String,
      required: false,
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
      minlength: [3, "Comment must be at least 3 characters"],
    },

    image: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 5; // Limit to 5 images max
        },
        message: "Maximum 5 images allowed per review",
      },
    },

    helpful: {
      type: Number,
      default: 0,
    },

    helpfulUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Ensure one review per user per product (also improves lookup speed)
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Optimize product reviews with pagination and sorting
reviewSchema.index({ product: 1, createdAt: -1 });

// Optimize user reviews with pagination
reviewSchema.index({ user: 1, createdAt: -1 });

// Optimize rating filtering
reviewSchema.index({ rating: 1 });

// Optimize sorting by helpfulness
reviewSchema.index({ helpful: -1 });

const Review = model("Review", reviewSchema);
module.exports = Review;
