const createError = require("http-errors"); // error-handling middleware
const { successResponse } = require("./responseController");
const Product = require("../models/productModel");
const cloudinary = require("../config/cloudinary");
const {
  publicIDfromURL,
  uploadImage,
  deleteImage,
} = require("../helper/cloudinaryHelper");
const Review = require("../models/reviewModel");
const mongoose = require("mongoose");
const { createPagination } = require("../helper/paginationHelper");
const logger = require("../helper/logger");

const createReview = async (req, res, next) => {
  try {
    const { product, rating, comment } = req.body;
    const user = req.user._id;

    // Validate required fields first
    if (!product) {
      throw createError(400, "Product ID is required");
    }
    if (!rating || rating < 1 || rating > 5) {
      throw createError(400, "Rating must be between 1 and 5");
    }

    // Check if user has already reviewed the product
    const existingReview = await Review.findOne({ product, user });
    if (existingReview) {
      throw createError(409, "You have already reviewed this product.");
    }

    // Validate product exists
    const productExist = await Product.findById(product);
    if (!productExist) {
      throw createError(404, "Product not found!");
    }

    // Validate images if provided (but don't upload yet)
    const images = req.files;
    let imageUrls = [];

    if (images && images.length > 0) {
      // Validate image count
      if (images.length > 5) {
        throw createError(400, "Maximum 5 images allowed per review");
      }

      // Validate each image size and type
      for (const image of images) {
        if (image.size > 1024 * 1024 * 2) {
          throw createError(400, "Each image should be less than 2MB");
        }
        if (!image.mimetype.startsWith("image/")) {
          throw createError(400, "Only image files are allowed");
        }
      }

      // Now upload images to Cloudinary (only after all validations pass)
      try {
        for (const image of images) {
          const imageUrl = await uploadImage(
            image,
            "review",
            `review-${user}-${Date.now()}`
          );
          imageUrls.push(imageUrl);
        }
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        throw createError(500, "Failed to upload images to cloud storage");
      }
    }

    // Create review object
    const review = {
      product,
      user,
      rating: Number(rating),
      comment,
      image: imageUrls,
    };

    // Update product ratings
    const currentTotalRating =
      (productExist.ratings || 0) * (productExist.reviewCount || 0);
    const newTotalRating = currentTotalRating + Number(rating);
    const newReviewCount = (productExist.reviewCount || 0) + 1;

    productExist.reviewCount = newReviewCount;
    productExist.ratings = Number((newTotalRating / newReviewCount).toFixed(1));

    // Use transaction to ensure data consistency
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create review
      const newReview = await Review.create([review], { session });
      if (!newReview || newReview.length === 0) {
        throw createError(500, "Failed to create review");
      }

      // Update product
      await productExist.save({ session });

      // Commit transaction
      await session.commitTransaction();

      // Get populated review
      const populatedReview = await Review.findById(newReview[0]._id)
        .populate("user", "name email")
        .populate("product", "name slug");

      return successResponse(res, {
        statusCode: 201,
        message: "Review created successfully",
        payload: { review: populatedReview },
      });
    } catch (transactionError) {
      // Rollback transaction
      await session.abortTransaction();

      // Delete uploaded images if transaction fails
      if (imageUrls.length > 0) {
        for (const imageUrl of imageUrls) {
          try {
            const publicID = await publicIDfromURL(imageUrl);
            await cloudinary.uploader.destroy(publicID);
          } catch (deleteError) {
            console.error("Failed to cleanup image:", deleteError);
          }
        }
      }

      throw transactionError;
    } finally {
      session.endSession();
    }
  } catch (error) {
    next(error);
  }
};

const getReviews = async (req, res, next) => {
  try {
    // Pagination and search query parameters
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.search || "";

    // Build filter object
    const filter = {};
    if (searchQuery) {
      filter.comment = { $regex: searchQuery, $options: "i" }; // Case-insensitive search in comment field
    }

    // Get reviews from database
    const reviews = await Review.find(filter)

      .populate("user", "name email") // user population
      .populate("product", "name slug") // product population
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count of products
    const count = await Review.countDocuments(filter);
    const pagination = createPagination(count, page, limit);
    return successResponse(res, {
      statusCode: 200,
      message: "Reviews were returned successfully!",
      payload: {
        reviews: reviews,
        pagination,
        filters: {
          searchQuery,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError(400, "Invalid review ID");
    }

    // Find review from database
    const review = await Review.findById(id)
      .populate("user", "name email") // user population
      .populate("product", "name slug"); // product population

    // Check if review exists
    if (!review) {
      throw createError(404, "Review not found!");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Review was returned successfully!",
      payload: { review: review },
    });
  } catch (error) {
    next(error);
  }
};

const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      throw createError(400, "Product ID is required");
    }
    // Pagination  parameters
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Filtering parameters
    const rating = req.query.rating; // Filter by specific rating
    const sortBy = req.query.sortBy || "createdAt"; // Sort by: createdAt, rating, helpful
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // Build filter object
    const filter = { product: productId };
    if (rating) {
      filter.rating = Number(rating);
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder;

    // Get reviews from database
    const reviews = await Review.find(filter)
      .populate("user", "name email") // user population
      .populate("product", "name slug") // product population
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count of products
    const count = await Review.countDocuments(filter);
    const pagination = createPagination(count, page, limit);

    return successResponse(res, {
      statusCode: 200,
      message: "Reviews were returned successfully!",
      payload: {
        reviews: reviews,
        pagination,
        filters: {
          rating,
          sortBy,
          sortOrder: sortOrder === 1 ? "asc" : "desc",
        },
      },
    });
  } catch (error) {
    next(error);
  }
};


const getUserReviews = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Pagination / search / sort
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // Build filter: search can match comment OR product name (via product IDs)
    const filter = { user: userId };

    if (search) {
      // Find product IDs that match product name search
      const matchingProducts = await Product.find(
        { name: { $regex: search, $options: "i" } },
        { _id: 1 }
      ).lean();
      const productIds = matchingProducts.map((p) => p._id);

      filter.$or = [{ comment: { $regex: search, $options: "i" } }];
      if (productIds.length) filter.$or.push({ product: { $in: productIds } });
    }

    const sortObj = {};
    sortObj[sortBy] = sortOrder;

    const [reviews, count] = await Promise.all([
      Review.find(filter)
        .populate("product", "name slug thumbnailImage")
        .populate("user", "name email")
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
    ]);

    const pagination = createPagination(count, page, limit);

    return successResponse(res, {
      statusCode: 200,
      message: "Reviews were returned successfully!",
      payload: {
        reviews,
        pagination,
        filters: {
          search,
          sortBy,
          sortOrder: sortOrder === 1 ? "asc" : "desc",
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUserPendingReviews = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { Order } = require("../models/orderModel");

    // Pagination / search / sort
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "orderDate"; // or "product.name"
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // 1) Get delivered orders and populate products on items
    const userOrders = await Order.find({
      user: userId,
      status: "Delivered",
    })
      .populate("items.product", "name slug thumbnailImage")
      .lean();

    // 2) Flatten purchased products (keep order info)
    const purchased = [];
    for (const order of userOrders) {
      for (const item of order.items || []) {
        if (!item.product) continue;
        purchased.push({
          productId: item.product._id.toString(),
          product: item.product,
          orderId: order._id,
          orderDate: order.createdAt,
        });
      }
    }

    if (purchased.length === 0) {
      const pagination = createPagination(0, page, limit);
      return successResponse(res, {
        statusCode: 200,
        message: "Pending reviews retrieved successfully!",
        payload: { products: [], pagination, filters: { search, sortBy, sortOrder: sortOrder === 1 ? "asc" : "desc" } },
      });
    }

    // 3) Get product IDs already reviewed by user
    const reviewedProductIds = await Review.find({ user: userId }).distinct("product");
    const reviewedSet = new Set(reviewedProductIds.map((id) => id.toString()));

    // 4) Filter out already reviewed products
    let pending = purchased.filter((p) => !reviewedSet.has(p.productId));

    // 5) Optional product-name search
    if (search) {
      const term = search.toLowerCase();
      pending = pending.filter((p) => (p.product && p.product.name && p.product.name.toLowerCase().includes(term)));
    }

    // 6) Dedupe products (user might have bought same product multiple times) — keep most recent orderDate
    const dedupMap = new Map();
    for (const p of pending) {
      const existing = dedupMap.get(p.productId);
      if (!existing || new Date(p.orderDate) > new Date(existing.orderDate)) {
        dedupMap.set(p.productId, p);
      }
    }
    let pendingList = Array.from(dedupMap.values());

    // 7) Sort
    pendingList.sort((a, b) => {
      if (sortBy === "product.name") {
        const nameA = (a.product?.name || "").toLowerCase();
        const nameB = (b.product?.name || "").toLowerCase();
        if (nameA < nameB) return -1 * sortOrder;
        if (nameA > nameB) return 1 * sortOrder;
        return 0;
      }
      // default: orderDate
      return (new Date(a.orderDate) - new Date(b.orderDate)) * sortOrder;
    });

    // 8) Paginate
    const total = pendingList.length;
    const paginatedResults = pendingList.slice(skip, skip + limit);
    const pagination = createPagination(total, page, limit);

    return successResponse(res, {
      statusCode: 200,
      message: "Pending reviews retrieved successfully!",
      payload: {
        products: paginatedResults,
        pagination,
        filters: {
          search,
          sortBy,
          sortOrder: sortOrder === 1 ? "asc" : "desc",
        },
      },
    });
  } catch (error) {
    next(error);
  }
};


const deleteReview = async (req, res, next) => {
  try {
    // Get product by slug
    const { id } = req.params;
    const userId = req.user._id;

    // Find review from database
    const reviewExist = await Review.findById(id);

    // Check if review exists
    if (!reviewExist) {
      throw createError(404, "Review not found!");
    }

    // Check if the user is the owner of the review
    if (reviewExist.user.toString() !== userId.toString()) {
      throw createError(403, "You are not authorized to delete this review");
    }

    //Update product ratings before deleting review
    const productExist = await Product.findById(reviewExist.product);
    if (productExist) {
      const currentTotalRating =
        (productExist.ratings || 0) * (productExist.reviewCount || 0);
      const newTotalRating = currentTotalRating - Number(reviewExist.rating);
      const newReviewCount = Math.max(0, (productExist.reviewCount || 0) - 1);

      if (newReviewCount === 0) {
        productExist.ratings = 0;
      } else {
        productExist.ratings = Number(
          (newTotalRating / newReviewCount).toFixed(1)
        );
      }
      productExist.reviewCount = newReviewCount;
      await productExist.save();
    }

    // Delete review images from Cloudinary using the helper
    if (reviewExist.image.length > 0) {
      for (const imageUrl of reviewExist.image) {
        try {
          await deleteImage(imageUrl);
          logger.debug("Review image deleted:", imageUrl);
        } catch (error) {
          console.error("Error deleting review image:", error);
        }
      }
    }

    // Delete review from database
    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      throw createError(404, "Review not found!");
    }
    return successResponse(res, {
      statusCode: 200,
      message: "Review deleted successfully!",
      payload: { review },
    });
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find review from database
    const reviewExist = await Review.findById(id);
    if (!reviewExist) {
      throw createError(404, "Review not found!");
    }

    // Check if the user is the owner of the review
    if (reviewExist.user.toString() !== userId.toString()) {
      throw createError(403, "You are not authorized to update this review");
    }

    // Update fields and allowed fields to update
    let updates = {};
    const allowedFields = ["rating", "comment"];
    for (const key in req.body) {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    }

    // Handle rating update for product
    let productRatingUpdate = null;
    if (updates.rating) {
      const productExist = await Product.findById(reviewExist.product);
      if (!productExist) {
        throw createError(404, "Product not found!");
      }

      const currentTotalRating =
        (productExist.ratings || 0) * (productExist.reviewCount || 0);
      const newTotalRating =
        currentTotalRating -
        Number(reviewExist.rating) +
        Number(updates.rating);

      productExist.ratings = Number(
        (newTotalRating / (productExist.reviewCount || 1)).toFixed(1)
      );
      productRatingUpdate = productExist;
    }

    // Use transaction for consistency
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update review
      const updatedReview = await Review.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true, session }
      );

      if (!updatedReview) {
        throw createError(404, "Review not found!");
      }

      // Update product rating if needed
      if (productRatingUpdate) {
        await productRatingUpdate.save({ session });
      }

      // Commit transaction
      await session.commitTransaction();

      return successResponse(res, {
        statusCode: 200,
        message: "Review was updated successfully!",
        payload: { review: updatedReview },
      });
    } catch (transactionError) {
      // Rollback transaction
      await session.abortTransaction();

      throw transactionError;
    } finally {
      session.endSession();
    }
  } catch (error) {
    next(error);
  }
};

// ===============================
// Add images to a review
// ===============================
const addReviewImages = async (req, res, next) => {
  try {
    const { id } = req.params; // reviewId
    const userId = req.user._id;

    // Find review
    const review = await Review.findById(id);
    if (!review) {
      throw createError(404, "Review not found!");
    }

    // Check if user is the owner
    if (review.user.toString() !== userId.toString()) {
      throw createError(403, "You are not authorized to modify this review");
    }

    const images = req.files;
    if (!images || images.length === 0) {
      throw createError(400, "No images provided");
    }
    logger.debug(`Received ${images.length} images to add`);

    // Validate max image count
    const totalImages = review.image.length + images.length;
    if (totalImages > 5) {
      throw createError(
        400,
        `Maximum 5 images allowed per review. You already have ${review.image.length}`
      );
    }

    // Validate and upload new images
    let newImageUrls = [];
    for (const image of images) {
      if (image.size > 1024 * 1024 * 2) {
        throw createError(400, "Each image should be less than 2MB");
      }
      if (!image.mimetype.startsWith("image/")) {
        throw createError(400, "Only image files are allowed");
      }
    }

    // Now upload images to Cloudinary (only after all validations pass)
    try {
      for (const image of images) {
        const imageUrl = await uploadImage(
          image,
          "review",
          `review-${userId}-${Date.now()}`
        );
        newImageUrls.push(imageUrl);
      }
    } catch (uploadError) {
      console.error("Image upload error:", uploadError);
      throw createError(500, "Failed to upload images to cloud storage");
    }

    // Add new images to review
    review.image.push(...newImageUrls);
    await review.save();

    // Populate the review before returning
    const populatedReview = await Review.findById(review._id)
      .populate("user", "name email")
      .populate("product", "name slug thumbnailImage");

    return successResponse(res, {
      statusCode: 200,
      message: "Images added successfully",
      payload: { review: populatedReview },
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// Delete multiple review images
// ===============================
const deleteReviewImages = async (req, res, next) => {
  try {
    const { id } = req.params; // reviewId
    const userId = req.user._id;
    const { imageIds } = req.body; // Array of image URLs to delete

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      throw createError(400, "Image IDs array is required");
    }

    // Find review
    const review = await Review.findById(id);
    if (!review) {
      throw createError(404, "Review not found!");
    }

    // Check if user is the owner
    if (review.user.toString() !== userId.toString()) {
      throw createError(403, "You are not authorized to modify this review");
    }

    const deletedImages = [];
    const failedDeletions = [];

    // Process each image ID
    for (const imageUrl of imageIds) {
      // Check if image exists in this review
      const imageIndex = review.image.indexOf(imageUrl);
      if (imageIndex === -1) {
        failedDeletions.push({ imageUrl, reason: "Image not found in review" });
        continue;
      }

      // Delete from Cloudinary using the helper
      try {
        await deleteImage(imageUrl);
        logger.debug("Review image deleted:", imageUrl);
        deletedImages.push(imageUrl);
        // Remove from review document
        review.image.splice(imageIndex, 1);
      } catch (deleteError) {
        console.error("Failed to delete image from Cloudinary:", deleteError);
        failedDeletions.push({
          imageUrl,
          reason: "Cloudinary deletion failed",
        });
      }
    }

    // Save the updated review
    await review.save();

    // Populate the review before returning
    const populatedReview = await Review.findById(review._id)
      .populate("user", "name email")
      .populate("product", "name slug thumbnailImage");

    return successResponse(res, {
      statusCode: 200,
      message: `Images processed: ${deletedImages.length} deleted, ${failedDeletions.length} failed`,
      payload: {
        review: populatedReview,
        deletedImages,
        failedDeletions,
      },
    });
  } catch (error) {
    next(error);
  }
};

const markReviewHelpful = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(id);
    if (!review) {
      throw createError(404, "Review not found!");
    }

    // Check if user already marked as helpful
    const alreadyMarked = review.helpfulUsers.includes(userId);

    if (alreadyMarked) {
      // Remove from helpful
      review.helpfulUsers.pull(userId);
      review.helpful = Math.max(0, review.helpful - 1);
    } else {
      // Add to helpful
      review.helpfulUsers.push(userId);
      review.helpful += 1;
    }

    await review.save();

    return successResponse(res, {
      statusCode: 200,
      message: alreadyMarked ? "Removed from helpful" : "Marked as helpful",
      payload: {
        helpful: review.helpful,
        isHelpful: !alreadyMarked,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getReviewStats = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const stats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const totalReviews = await Review.countDocuments({ product: productId });

    // Calculate average rating and percentages
    let totalRatingSum = 0;
    const statsWithPercentage = stats.map((stat) => {
      totalRatingSum += stat._id * stat.count;
      return {
        rating: stat._id,
        count: stat.count,
        percentage: Math.round((stat.count / totalReviews) * 100),
      };
    });

    const averageRating =
      totalReviews > 0 ? (totalRatingSum / totalReviews).toFixed(1) : 0;

    return successResponse(res, {
      statusCode: 200,
      message: "Review statistics retrieved successfully",
      payload: {
        stats: statsWithPercentage,
        totalReviews,
        averageRating: parseFloat(averageRating),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getReviews,
  getReview,
  getProductReviews,
  getUserReviews,
  getUserPendingReviews,
  deleteReview,
  updateReview,
  addReviewImages,
  deleteReviewImages, // Updated export
  markReviewHelpful,
  getReviewStats,
};
