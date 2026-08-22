const mongoose = require("mongoose");

// name, slug, description, image, category, productCount, isActive
const subcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subcategory name is required"],
      trim: true,
      minlength: [3, "Subcategory name must be at least 3 characters"],
      maxlength: [100, "Subcategory name cannot exceed 100 characters"],
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
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Parent category is required"],
    },
    productCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Add static method to recalculate product counts
subcategorySchema.statics.recalculateProductCounts = async function () {
  const subcategories = await this.find({});
  const Product = mongoose.model("Product");

  for (const subcategory of subcategories) {
    const count = await Product.countDocuments({
      subcategory: subcategory._id,
    });
    await this.findByIdAndUpdate(subcategory._id, { productCount: count });
  }
};

// Add middleware to sync category-subcategory relationships
subcategorySchema.post("save", async function () {
  if (this.isNew) {
    const Category = mongoose.model("Category");
    await Category.findByIdAndUpdate(this.category, {
      $addToSet: { subcategories: this._id },
    });
  }
});

subcategorySchema.pre("findOneAndDelete", async function () {
  const subcategory = await this.model.findOne(this.getQuery());
  if (subcategory) {
    const Category = mongoose.model("Category");
    await Category.findByIdAndUpdate(subcategory.category, {
      $pull: { subcategories: subcategory._id },
    });
  }
});

// Unique within each category only
subcategorySchema.index({ name: 1, category: 1 }, { unique: true });
subcategorySchema.index({ slug: 1, category: 1 }, { unique: true });

// Category index (VERY IMPORTANT - for filtering subcategories by category)
subcategorySchema.index({ category: 1 });

// Active status index (for filtering active subcategories)
subcategorySchema.index({ isActive: 1 });

// Product count index (for sorting by popularity)
subcategorySchema.index({ productCount: -1 });

// Text search index for subcategory search
subcategorySchema.index(
  {
    name: "text",
    description: "text",
  },
  {
    weights: { name: 10, description: 1 },
    name: "subcategory_text_index",
  }
);

// Compound indexes for common queries
subcategorySchema.index({ category: 1, isActive: 1 }); // Active subcategories in a category
subcategorySchema.index({ category: 1, productCount: -1 }); // Subcategories by popularity in category
subcategorySchema.index({ isActive: 1, createdAt: -1 }); // Active subcategories by newest

const Subcategory = mongoose.model("Subcategory", subcategorySchema);
module.exports = Subcategory;
