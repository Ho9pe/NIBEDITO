const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Banner title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [300, "Subtitle cannot exceed 300 characters"],
      default: "",
    },
    imageUrl: {
      type: String,
      required: [true, "Banner image is required"],
    },
    badge: {
      type: String,
      trim: true,
      maxlength: [30, "Badge label cannot exceed 30 characters"],
      default: "",
    },
    ctaText: {
      type: String,
      trim: true,
      maxlength: [50, "CTA text cannot exceed 50 characters"],
      default: "Shop Now",
    },
    ctaLink: {
      type: String,
      trim: true,
      default: "/products",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for fast public query: active banners sorted by order
bannerSchema.index({ isActive: 1, order: 1 });

const Banner = mongoose.model("Banner", bannerSchema);
module.exports = Banner;
