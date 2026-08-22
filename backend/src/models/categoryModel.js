const mongoose = require("mongoose");

// name, slug, description, image, productCount, isActive
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      minlength: [3, "Category name must be at least 3 characters"],
      maxlength: [100, "Category name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
      required: false,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    image: {
      type: String,
      required: false,
    },
    productCount: {
      type: Number,
      default: 0,
    },
    subcategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subcategory",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Add this static method to the category schema
categorySchema.statics.recalculateProductCounts = async function () {
  const categories = await this.find({});
  const Product = mongoose.model("Product");

  for (const category of categories) {
    const count = await Product.countDocuments({ category: category._id });
    await this.findByIdAndUpdate(category._id, { productCount: count });
  }
};

// Slug index (MOST CRITICAL - used for getCategory)
categorySchema.index({ slug: 1 }, { unique: true });

// Name index (for uniqueness and search)
categorySchema.index({ name: 1 }, { unique: true });

// Active status index (for filtering active categories)
categorySchema.index({ isActive: 1 });

// Product count index (for sorting by popularity)
categorySchema.index({ productCount: -1 });

// Text search index for category search
categorySchema.index(
  {
    name: "text",
    description: "text",
  },
  {
    weights: { name: 10, description: 1 },
    name: "category_text_index",
  }
);

// Compound indexes for common queries
categorySchema.index({ isActive: 1, productCount: -1 }); // Active categories sorted by product count
categorySchema.index({ isActive: 1, createdAt: -1 }); // Active categories sorted by newest

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
