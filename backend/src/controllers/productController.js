const createError = require("http-errors");
const { successResponse } = require("./responseController");
const Product = require("../models/productModel");
const { default: slugify } = require("slugify");
const Category = require("../models/categoryModel");
const Subcategory = require("../models/subcategoryModel");
const { uploadImage, deleteImage } = require("../helper/cloudinaryHelper");
const { validateImage } = require("../validators/image");
const { createPagination } = require("../helper/paginationHelper");
const logger = require("../helper/logger");

const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      variants,
      shipping,
      category,
      subcategory,
    } = req.body;
    const files = req.files;

    // Validate thumbnail
    if (!files?.thumbnail?.[0]) {
      throw createError(400, "Thumbnail image is required");
    }

    const productExist = await Product.exists({ name });
    if (productExist) {
      throw createError(409, "Product with this name already exists");
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      throw createError(404, "Category not found");
    }

    // Validate subcategory if provided
    if (subcategory) {
      const subcategoryExists = await Subcategory.findById(subcategory);
      if (!subcategoryExists) {
        throw createError(404, "Subcategory not found");
      }

      // Check if subcategory belongs to the selected category
      if (subcategoryExists.category.toString() !== category) {
        throw createError(
          400,
          "Subcategory does not belong to the selected category"
        );
      }
    }

    // Upload thumbnail
    const thumbnailImage = files.thumbnail[0];
    validateImage(thumbnailImage);
    const thumbnailUrl = await uploadImage(
      thumbnailImage,
      "product-thumbnail",
      slugify(name).toLowerCase()
    );

    // Process variants
    let parsedVariants = [];
    if (variants) {
      parsedVariants = JSON.parse(variants);

      // Handle variant images
      if (files.variantImages) {
        let processedImageCount = 0;

        for (
          let variantIndex = 0;
          variantIndex < parsedVariants.length;
          variantIndex++
        ) {
          const variant = parsedVariants[variantIndex];
          const variantImages = [];

          if (variant.imageIndices?.length > 0) {
            if (variant.imageIndices.length > 5) {
              throw createError(400, "Maximum 5 images allowed per variant");
            }

            for (let i = 0; i < variant.imageIndices.length; i++) {
              const image = files.variantImages[processedImageCount];
              if (image) {
                validateImage(image);
                const imageUrl = await uploadImage(
                  image,
                  "product-variant",
                  `${slugify(name).toLowerCase()}-variant${variantIndex}-${i}`
                );
                variantImages.push(imageUrl);
                processedImageCount++;
              }
            }
          }
          variant.images = variantImages;
        }
      }
    }

    const productData = {
      name,
      slug: slugify(name),
      description,
      price,
      thumbnailImage: thumbnailUrl,
      variants: parsedVariants,
      shipping,
      category,
    };

    // Add subcategory if provided
    if (subcategory) {
      productData.subcategory = subcategory;
    }

    const product = await Product.create(productData);

    return successResponse(res, {
      statusCode: 201,
      message: "Product created successfully",
      payload: { product },
    });
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    logger.debug("Products API called with query:", req.query); // Debug log

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Search and filtering parameters
    const search = req.query.search || "";
    const categoryId = req.query.category;
    const subcategoryId = req.query.subcategory;
    const minPrice = req.query.minPrice
      ? parseFloat(req.query.minPrice)
      : undefined;
    const maxPrice = req.query.maxPrice
      ? parseFloat(req.query.maxPrice)
      : undefined;
    const inStock = req.query.inStock;

    // Sorting
    const sortField = req.query.sortField || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortField] = sortOrder;

    // Build filter object
    const filter = {};

    // Text search
    if (search) {
      // Use MongoDB text search instead of regex
      filter.$text = { $search: search };
      // Add text score for relevance sorting
      if (!sortField || sortField === "relevance") {
        sortOptions = { score: { $meta: "textScore" } };
      } else {
        // Normal sorting when not searching
        sortOptions[sortField] = sortOrder;
      }
    }

    // Category and subcategory filtering
    if (categoryId) {
      logger.debug("Filtering by category:", categoryId); // Debug log
      filter.category = categoryId;
    }

    if (subcategoryId) {
      logger.debug("Filtering by subcategory:", subcategoryId); // Debug log
      filter.subcategory = subcategoryId;
    }

    // Price range filtering
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    // Stock filtering
    if (inStock !== undefined) {
      // For stock filtering, we need to check if any variant has stock
      if (inStock === "true") {
        filter["variants.quantity"] = { $gt: 0 };
      } else {
        filter["variants.quantity"] = { $lte: 0 };
      }
    }

    logger.debug("Final filter object:", JSON.stringify(filter, null, 2)); // Debug log
    logger.debug("Sort options:", sortOptions); // Debug log

    // Execute query with pagination
    const products = await Product.find(filter)
      .populate("category", "name slug")
      .populate("subcategory", "name slug")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const count = await Product.countDocuments(filter);

    const pagination = createPagination(count, page, limit);

    return successResponse(res, {
      statusCode: 200,
      message:
        products.length > 0
          ? "Products retrieved successfully"
          : "No products found",
      payload: {
        products,
        pagination,
        filters: {
          search,
          category: categoryId,
          subcategory: subcategoryId,
          priceRange:
            minPrice !== undefined || maxPrice !== undefined
              ? { min: minPrice, max: maxPrice }
              : null,
          inStock,
        },
        sort: {
          field: sortField,
          order: sortOrder === 1 ? "asc" : "desc",
        },
      },
    });
  } catch (error) {
    console.error("Error in getProducts:", error); // Debug log
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    // Get product by slug
    const { slug } = req.params;

    // Find product from database
    const product = await Product.findOne({ slug })
      .populate("category")
      .populate("subcategory");

    // Check if product exists
    if (!product) {
      throw createError(404, "Product not found!");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Products were returned succesfully!",
      payload: { product },
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug });

    if (!product) {
      throw createError(404, "Product not found!");
    }

    // Delete thumbnail - pass the full URL
    if (product.thumbnailImage) {
      try {
        await deleteImage(product.thumbnailImage);
        logger.debug("Product thumbnail deleted:", product.thumbnailImage);
      } catch (error) {
        console.error("Error deleting thumbnail:", error);
      }
    }

    // Delete variant images - pass the full URLs
    if (product.variants && product.variants.length > 0) {
      for (const variant of product.variants) {
        if (variant.images && variant.images.length > 0) {
          for (const imageUrl of variant.images) {
            try {
              await deleteImage(imageUrl);
              logger.debug("Variant image deleted:", imageUrl);
            } catch (error) {
              console.error("Error deleting variant image:", error);
            }
          }
        }
      }
    }

    // Delete the product from database
    const deletedProduct = await Product.findOneAndDelete({ slug });

    return successResponse(res, {
      statusCode: 200,
      message: "Product deleted successfully",
      payload: { product: deletedProduct },
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const {
      name,
      description,
      price,
      variants,
      shipping,
      category,
      subcategory,
    } = req.body;
    const files = req.files;

    const product = await Product.findOne({ slug });
    if (!product) {
      throw createError(404, "Product not found!");
    }

    // Initialize updates with existing product data
    let updates = {
      name: name || product.name,
      description: description || product.description,
      price: price || product.price,
      category: category || product.category,
      shipping: shipping !== undefined ? shipping : product.shipping,
      thumbnailImage: product.thumbnailImage,
    };

    // Handle name update and slug generation
    if (name && name !== product.name) {
      const productExists = await Product.exists({
        name,
        _id: { $ne: product._id },
      });
      if (productExists) {
        throw createError(409, "Product with this name already exists");
      }
      updates.slug = slugify(name);
    }

    // Handle thumbnail update
    if (files?.thumbnail?.[0]) {
      // Delete old thumbnail
      if (product.thumbnailImage) {
        await deleteImage(product.thumbnailImage);
      }
      // Upload new thumbnail
      const thumbnailImage = files.thumbnail[0];
      validateImage(thumbnailImage);
      updates.thumbnailImage = await uploadImage(
        thumbnailImage,
        "product-thumbnail",
        slugify(updates.name).toLowerCase()
      );
    }

    // Handle variants update
    if (variants) {
      const parsedVariants = JSON.parse(variants);

      let processedImageCount = 0;

      for (let i = 0; i < parsedVariants.length; i++) {
        const variant = parsedVariants[i];

        // Handle image updates even if no new images are uploaded
        if (variant.removedImageIndices?.length > 0) {
          let variantImages = [...(product.variants[i]?.images || [])];

          // Delete removed images from storage
          for (const index of variant.removedImageIndices) {
            if (variantImages[index]) {
              await deleteImage(variantImages[index]);
            }
          }

          // Filter out removed images
          variantImages = variantImages.filter(
            (_, idx) => !variant.removedImageIndices.includes(idx)
          );

          variant.images = variantImages;
        }

        // Handle new images if any
        if (files?.variantImages && variant.newImageCount > 0) {
          let variantImages = variant.images || [];

          for (let j = 0; j < variant.newImageCount; j++) {
            const image = files.variantImages[processedImageCount];
            if (image) {
              validateImage(image);
              const imageUrl = await uploadImage(
                image,
                "product-variant",
                `${slugify(
                  updates.name || name
                ).toLowerCase()}-variant${i}-${j}`
              );
              variantImages.push(imageUrl);
              processedImageCount++;
            }
          }

          variant.images = variantImages;
        }

        // Cleanup temporary properties
        delete variant.removedImageIndices;
        delete variant.newImageCount;
      }

      updates.variants = parsedVariants;
    }

    // Handle subcategory update
    if (subcategory) {
      const subcategoryExists = await Subcategory.findById(subcategory);
      if (!subcategoryExists) {
        throw createError(404, "Subcategory not found");
      }

      // Check if subcategory belongs to the selected category
      if (subcategoryExists.category.toString() !== category) {
        throw createError(
          400,
          "Subcategory does not belong to the selected category"
        );
      }

      updates.subcategory = subcategory;
    }

    const updatedProduct = await Product.findOneAndUpdate({ slug }, updates, {
      new: true,
      runValidators: true,
    }).populate("category");

    return successResponse(res, {
      statusCode: 200,
      message: "Product updated successfully",
      payload: { product: updatedProduct },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  deleteProduct,
  updateProduct,
};
