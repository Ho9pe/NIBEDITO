const createError = require("http-errors");

const Wishlist = require("../models/wishlistModel");
const Product = require("../models/productModel");
const { successResponse } = require("./responseController");

// Fields to populate on each wishlisted product
const PRODUCT_SELECT = "name slug price thumbnailImage ratings reviewCount isActive";

// ─── GET /api/wishlist/ ────────────────────────────────────────────────────
// Full wishlist with populated product data — used for the Wishlist page
const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const wishlist = await Wishlist.findOne({ user: userId }).populate({
      path: "items.product",
      select: PRODUCT_SELECT,
    });

    if (!wishlist) {
      return successResponse(res, {
        statusCode: 200,
        message: "Wishlist is empty",
        payload: { wishlist: null },
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Wishlist fetched successfully",
      payload: { wishlist },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/wishlist/ids ─────────────────────────────────────────────────
// Returns ONLY the array of wishlisted product IDs — lightweight, called once
// on app load so the frontend can manage heart-icon state client-side without
// firing a separate HTTP request per product card.
const getWishlistIds = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const wishlist = await Wishlist.findOne({ user: userId }).select("items.product");

    const wishlistedIds = wishlist
      ? wishlist.items.map((item) => item.product.toString())
      : [];

    return successResponse(res, {
      statusCode: 200,
      message: "Wishlisted product IDs fetched successfully",
      payload: { wishlistedIds },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/wishlist/add ────────────────────────────────────────────────
// Add a product to the wishlist.
// Prevents duplicates. Snapshots price at time of wishlisting for future
// price-drop notification queries.
const addToWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    // Validate product exists and is active
    const product = await Product.findById(productId).select("price isActive");
    if (!product) {
      throw createError(404, "Product not found");
    }
    if (!product.isActive) {
      throw createError(400, "This product is currently unavailable");
    }

    // Find or create wishlist document for this user
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, items: [] });
    }

    // Prevent duplicates
    const alreadyInWishlist = wishlist.items.some(
      (item) => item.product.toString() === productId
    );
    if (alreadyInWishlist) {
      throw createError(409, "Product is already in your wishlist");
    }

    wishlist.items.push({
      product: productId,
      priceAtTimeOfWishlisting: product.price,
      addedAt: new Date(),
    });

    await wishlist.save();

    // Populate and return so the frontend can immediately render the new item
    await wishlist.populate({
      path: "items.product",
      select: PRODUCT_SELECT,
    });

    return successResponse(res, {
      statusCode: 201,
      message: "Product added to wishlist",
      payload: { wishlist },
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/wishlist/remove ───────────────────────────────────────────
// Remove a single item from the wishlist by its item._id
const removeFromWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.body;

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      throw createError(404, "Wishlist not found");
    }

    const itemIndex = wishlist.items.findIndex(
      (item) => item._id.toString() === itemId
    );
    if (itemIndex === -1) {
      throw createError(404, "Item not found in wishlist");
    }

    wishlist.items.splice(itemIndex, 1);
    await wishlist.save();

    await wishlist.populate({
      path: "items.product",
      select: PRODUCT_SELECT,
    });

    return successResponse(res, {
      statusCode: 200,
      message: "Product removed from wishlist",
      payload: { wishlist },
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/wishlist/clear ────────────────────────────────────────────
// Remove all items from the wishlist (keeps the document for future adds)
const clearWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      { $set: { items: [] } },
      { new: true }
    );

    return successResponse(res, {
      statusCode: 200,
      message: "Wishlist cleared successfully",
      payload: { wishlist },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  getWishlistIds,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
};
