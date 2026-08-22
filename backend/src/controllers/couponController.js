const Coupon = require("../models/couponModel");
const createError = require("http-errors");
const { successResponse } = require("./responseController");
const ShippingRate = require("../models/shippingModel");

// Add a new coupon (admin only)
const addCoupon = async (req, res, next) => {
  try {
    const {
      code,
      productDiscountType,
      productDiscountValue,
      shippingDiscountType,
      shippingDiscountValue,
      expiryDate,
      minOrderAmount,
      maxDiscount,
      usageLimit,
    } = req.body;

    if (!code || !expiryDate) {
      throw createError(400, "Coupon code and expiry date are required.");
    }

    // At least one discount type must be provided
    if (
      (productDiscountType === "none" || !productDiscountType) &&
      (shippingDiscountType === "none" || !shippingDiscountType)
    ) {
      throw createError(
        400,
        "At least one discount type (product or shipping) must be provided."
      );
    }

    // Convert code to uppercase to avoid case-sensitive duplicates
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      throw createError(400, "Coupon code already exists.");
    }

    // Validate product discount
    if (productDiscountType && productDiscountType !== "none") {
      if (!productDiscountValue || productDiscountValue <= 0) {
        throw createError(
          400,
          "Product discount value must be greater than 0."
        );
      }

      if (productDiscountType === "percentage" && !maxDiscount) {
        throw createError(
          400,
          "Max discount is required for percentage product discount."
        );
      }
    }

    // Validate shipping discount
    if (
      shippingDiscountType &&
      shippingDiscountType !== "none" &&
      shippingDiscountType !== "free"
    ) {
      if (!shippingDiscountValue || shippingDiscountValue <= 0) {
        throw createError(
          400,
          "Shipping discount value must be greater than 0."
        );
      }
    }

    const newCoupon = new Coupon({
      code: code.toUpperCase(),
      discountOptions: {
        productDiscount: {
          type: productDiscountType || "none",
          value: productDiscountValue || 0,
          maxDiscount: maxDiscount || null,
        },
        shippingDiscount: {
          type: shippingDiscountType || "none",
          value: shippingDiscountValue || 0,
        },
      },
      expiryDate,
      minOrderAmount: minOrderAmount || 0,
      usageLimit: usageLimit || 1,
      usedBy: [],
    });

    await newCoupon.save();

    successResponse(res, {
      statusCode: 201,
      message: "Coupon created successfully",
      payload: newCoupon,
    });
  } catch (error) {
    next(error);
  }
};

// Remove a coupon (admin only)
const removeCoupon = async (req, res, next) => {
  try {
    const { couponId } = req.params;

    const deletedCoupon = await Coupon.findByIdAndDelete(couponId);
    if (!deletedCoupon) {
      throw createError(404, "Coupon not found.");
    }

    successResponse(res, {
      message: "Coupon deleted successfully",
      payload: deletedCoupon,
    });
  } catch (error) {
    next(error);
  }
};

// Preview a coupon (does not affect usage count)
const previewCoupon = async (req, res, next) => {
  try {
    const { couponCode, shippingRegion } = req.body;
    const userId = req.user._id;

    if (!couponCode) {
      throw createError(400, "Coupon code is required.");
    }

    if (!shippingRegion) {
      throw createError(400, "Shipping region is required.");
    }

    // Find user's active cart
    const Cart = require("../models/cartModel");
    const userCart = await Cart.findOne({
      user: userId,
      status: "active",
    })
      .populate({
        path: "items.product",
        select: "name price",
      })
      .lean(); // Use lean() for faster read-only query

    if (!userCart || !userCart.items || userCart.items.length === 0) {
      throw createError(400, "No active cart found or cart is empty.");
    }

    const totalPrice = userCart.totalPrice;

    // Get shipping cost for the selected region
    const ShippingRate = require("../models/shippingRateModel");
    const shippingRateInfo = await ShippingRate.findOne({
      region: shippingRegion,
    }).lean();

    if (!shippingRateInfo) {
      throw createError(400, "Invalid shipping region");
    }

    const shippingCost = shippingRateInfo.cost;

    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
    }).lean();

    if (!coupon) {
      throw createError(404, "Coupon not found.");
    }

    if (coupon.expiryDate < new Date()) {
      throw createError(400, "Coupon has expired.");
    }

    if (totalPrice < coupon.minOrderAmount) {
      throw createError(
        400,
        `Minimum order amount for this coupon is $${coupon.minOrderAmount}.`
      );
    }

    const userUsage = coupon.usedBy.find(
      (u) => u.userId.toString() === userId.toString()
    );
    if (userUsage && userUsage.timesUsed >= coupon.usageLimit) {
      throw createError(
        400,
        "You have reached the maximum usage limit for this coupon."
      );
    }

    // Calculate product discount
    let productDiscountAmount = 0;
    const { productDiscount } = coupon.discountOptions;

    if (productDiscount.type === "fixed") {
      productDiscountAmount = parseFloat(productDiscount.value);
    } else if (productDiscount.type === "percentage") {
      productDiscountAmount =
        (parseFloat(totalPrice) * parseFloat(productDiscount.value)) / 100;
      if (productDiscount.maxDiscount) {
        productDiscountAmount = Math.min(
          productDiscountAmount,
          parseFloat(productDiscount.maxDiscount)
        );
      }
    }

    // Round to 2 decimal places
    productDiscountAmount = parseFloat(productDiscountAmount.toFixed(2));

    // Calculate shipping discount
    let shippingDiscountAmount = 0;
    let finalShippingCost = parseFloat(shippingCost);
    const { shippingDiscount } = coupon.discountOptions;

    if (shippingDiscount.type === "free") {
      shippingDiscountAmount = parseFloat(shippingCost);
      finalShippingCost = 0;
    } else if (shippingDiscount.type === "fixed") {
      shippingDiscountAmount = Math.min(
        parseFloat(shippingDiscount.value),
        parseFloat(shippingCost)
      );
      finalShippingCost = parseFloat(shippingCost) - shippingDiscountAmount;
    } else if (shippingDiscount.type === "percentage") {
      shippingDiscountAmount =
        (parseFloat(shippingCost) * parseFloat(shippingDiscount.value)) / 100;
      finalShippingCost = parseFloat(shippingCost) - shippingDiscountAmount;
    }

    // Round shipping discount and final shipping cost to 2 decimal places
    shippingDiscountAmount = parseFloat(shippingDiscountAmount.toFixed(2));
    finalShippingCost = parseFloat(finalShippingCost.toFixed(2));

    const totalDiscount = parseFloat(
      (productDiscountAmount + shippingDiscountAmount).toFixed(2)
    );
    const finalPrice = parseFloat(
      (
        parseFloat(totalPrice) -
        productDiscountAmount +
        finalShippingCost
      ).toFixed(2)
    );

    successResponse(res, {
      message: "Coupon preview calculated successfully",
      payload: {
        couponId: coupon._id,
        productDiscountAmount,
        shippingDiscountAmount,
        totalDiscount,
        originalShippingCost: parseFloat(shippingCost),
        finalShippingCost,
        finalPrice,
        discountDetails: coupon.discountOptions,
        shippingRegion,
        cartTotal: parseFloat(totalPrice.toFixed(2)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Apply a coupon (updates usage count)
const applyCoupon = async (req, res, next) => {
  try {
    const { couponCode, shippingRegion } = req.body;
    const userId = req.user._id; // Get userId from authenticated user

    if (!couponCode) {
      throw createError(400, "Coupon code is required.");
    }

    if (!shippingRegion) {
      throw createError(400, "Shipping region is required.");
    }

    // Find user's active cart
    const Cart = require("../models/cartModel");
    const userCart = await Cart.findOne({
      user: userId,
      status: "active",
    }).populate({
      path: "items.product",
      select: "name price",
    });

    if (!userCart || !userCart.items || userCart.items.length === 0) {
      throw createError(400, "No active cart found or cart is empty.");
    }

    const totalPrice = userCart.totalPrice;

    // Get shipping cost for the selected region
    const shippingRateInfo = await ShippingRate.findByRegion(shippingRegion);
    if (!shippingRateInfo) {
      throw createError(400, "Invalid shipping region");
    }

    const shippingCost = shippingRateInfo.cost;

    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!coupon) {
      throw createError(404, "Coupon not found.");
    }

    if (coupon.expiryDate < new Date()) {
      throw createError(400, "Coupon has expired.");
    }

    if (totalPrice < coupon.minOrderAmount) {
      throw createError(
        400,
        `Minimum order amount for this coupon is $${coupon.minOrderAmount}.`
      );
    }

    const userUsageIndex = coupon.usedBy.findIndex(
      (u) => u.userId.toString() === userId.toString()
    );

    if (
      userUsageIndex !== -1 &&
      coupon.usedBy[userUsageIndex].timesUsed >= coupon.usageLimit
    ) {
      throw createError(
        400,
        "You have reached the maximum usage limit for this coupon."
      );
    }

    // Calculate product discount
    let productDiscountAmount = 0;
    const { productDiscount } = coupon.discountOptions;

    if (productDiscount.type === "fixed") {
      productDiscountAmount = parseFloat(productDiscount.value);
    } else if (productDiscount.type === "percentage") {
      productDiscountAmount =
        (parseFloat(totalPrice) * parseFloat(productDiscount.value)) / 100;
      if (productDiscount.maxDiscount) {
        productDiscountAmount = Math.min(
          productDiscountAmount,
          parseFloat(productDiscount.maxDiscount)
        );
      }
    }

    // Round to 2 decimal places
    productDiscountAmount = parseFloat(productDiscountAmount.toFixed(2));

    // Calculate shipping discount
    let shippingDiscountAmount = 0;
    let finalShippingCost = parseFloat(shippingCost);
    const { shippingDiscount } = coupon.discountOptions;

    if (shippingDiscount.type === "free") {
      shippingDiscountAmount = parseFloat(shippingCost);
      finalShippingCost = 0;
    } else if (shippingDiscount.type === "fixed") {
      shippingDiscountAmount = Math.min(
        parseFloat(shippingDiscount.value),
        parseFloat(shippingCost)
      );
      finalShippingCost = parseFloat(shippingCost) - shippingDiscountAmount;
    } else if (shippingDiscount.type === "percentage") {
      shippingDiscountAmount =
        (parseFloat(shippingCost) * parseFloat(shippingDiscount.value)) / 100;
      finalShippingCost = parseFloat(shippingCost) - shippingDiscountAmount;
    }

    // Round shipping discount and final shipping cost to 2 decimal places
    shippingDiscountAmount = parseFloat(shippingDiscountAmount.toFixed(2));
    finalShippingCost = parseFloat(finalShippingCost.toFixed(2));

    const totalDiscount = parseFloat(
      (productDiscountAmount + shippingDiscountAmount).toFixed(2)
    );
    const finalPrice = parseFloat(
      (
        parseFloat(totalPrice) -
        productDiscountAmount +
        finalShippingCost
      ).toFixed(2)
    );

    // Update coupon usage
    if (userUsageIndex === -1) {
      coupon.usedBy.push({ userId, timesUsed: 1 });
    } else {
      coupon.usedBy[userUsageIndex].timesUsed += 1;
    }

    await coupon.save();

    // Return success response
    successResponse(res, {
      message: "Coupon applied successfully",
      payload: {
        couponId: coupon._id,
        productDiscountAmount,
        shippingDiscountAmount,
        totalDiscount,
        originalShippingCost: parseFloat(shippingCost),
        finalShippingCost,
        finalPrice,
        discountDetails: coupon.discountOptions,
        shippingRegion,
        cartTotal: parseFloat(totalPrice.toFixed(2)),
        applied: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all coupons
const getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ expiryDate: 1 });
    if (!coupons) {
      throw createError(404, "No coupons found.");
    }

    successResponse(res, {
      message: "Coupons retrieved successfully",
      payload: coupons,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single coupon by ID (admin only)
const getCouponById = async (req, res, next) => {
  try {
    const { couponId } = req.params;

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      throw createError(404, "Coupon not found.");
    }

    successResponse(res, {
      message: "Coupon retrieved successfully",
      payload: coupon,
    });
  } catch (error) {
    next(error);
  }
};

// Update a coupon (admin only)
const updateCoupon = async (req, res, next) => {
  try {
    const { couponId } = req.params;
    const {
      productDiscountType,
      productDiscountValue,
      shippingDiscountType,
      shippingDiscountValue,
      expiryDate,
      minOrderAmount,
      maxDiscount,
      usageLimit,
    } = req.body;

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      throw createError(404, "Coupon not found.");
    }

    // At least one discount type must be provided
    if (
      (productDiscountType === "none" || !productDiscountType) &&
      (shippingDiscountType === "none" || !shippingDiscountType)
    ) {
      throw createError(
        400,
        "At least one discount type (product or shipping) must be provided."
      );
    }

    // Validate product discount
    if (productDiscountType && productDiscountType !== "none") {
      if (!productDiscountValue || productDiscountValue <= 0) {
        throw createError(
          400,
          "Product discount value must be greater than 0."
        );
      }

      if (productDiscountType === "percentage" && !maxDiscount) {
        throw createError(
          400,
          "Max discount is required for percentage product discount."
        );
      }
    }

    // Validate shipping discount
    if (
      shippingDiscountType &&
      shippingDiscountType !== "none" &&
      shippingDiscountType !== "free"
    ) {
      if (!shippingDiscountValue || shippingDiscountValue <= 0) {
        throw createError(
          400,
          "Shipping discount value must be greater than 0."
        );
      }
    }

    // Update the coupon
    coupon.discountOptions = {
      productDiscount: {
        type:
          productDiscountType || coupon.discountOptions.productDiscount.type,
        value:
          productDiscountValue || coupon.discountOptions.productDiscount.value,
        maxDiscount:
          maxDiscount || coupon.discountOptions.productDiscount.maxDiscount,
      },
      shippingDiscount: {
        type:
          shippingDiscountType || coupon.discountOptions.shippingDiscount.type,
        value:
          shippingDiscountValue ||
          coupon.discountOptions.shippingDiscount.value,
      },
    };

    if (expiryDate) coupon.expiryDate = expiryDate;
    if (minOrderAmount !== undefined) coupon.minOrderAmount = minOrderAmount;
    if (usageLimit) coupon.usageLimit = usageLimit;

    await coupon.save();

    successResponse(res, {
      message: "Coupon updated successfully",
      payload: coupon,
    });
  } catch (error) {
    next(error);
  }
};

const getCouponStats = async (req, res, next) => {
  try {
    const now = new Date();

    const stats = await Coupon.aggregate([
      {
        $group: {
          _id: null,
          totalCoupons: { $sum: 1 },
          activeCoupons: {
            $sum: { $cond: [{ $gt: ["$expiryDate", now] }, 1, 0] },
          },
          expiredCoupons: {
            $sum: { $cond: [{ $lte: ["$expiryDate", now] }, 1, 0] },
          },
          productDiscountCoupons: {
            $sum: {
              $cond: [
                { $ne: ["$discountOptions.productDiscount.type", "none"] },
                1,
                0,
              ],
            },
          },
          shippingDiscountCoupons: {
            $sum: {
              $cond: [
                { $ne: ["$discountOptions.shippingDiscount.type", "none"] },
                1,
                0,
              ],
            },
          },
          totalUsage: {
            $sum: {
              $reduce: {
                input: "$usedBy",
                initialValue: 0,
                in: { $add: ["$$value", "$$this.timesUsed"] },
              },
            },
          },
        },
      },
    ]);

    // Get most used coupons
    const mostUsedCoupons = await Coupon.aggregate([
      {
        $addFields: {
          totalUsage: {
            $reduce: {
              input: "$usedBy",
              initialValue: 0,
              in: { $add: ["$$value", "$$this.timesUsed"] },
            },
          },
        },
      },
      { $sort: { totalUsage: -1 } },
      { $limit: 10 },
      {
        $project: {
          code: 1,
          totalUsage: 1,
          usageLimit: 1,
          expiryDate: 1,
          discountOptions: 1,
        },
      },
    ]);

    return successResponse(res, {
      statusCode: 200,
      message: "Coupon statistics retrieved successfully",
      payload: {
        overview: stats[0] || {},
        mostUsedCoupons,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCouponUsageAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter for orders
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const Order = require("../models/orderModel");

    // Get coupon usage in orders
    const couponUsage = await Order.aggregate([
      { $match: { ...dateFilter, coupon: { $exists: true } } },
      {
        $lookup: {
          from: "coupons",
          localField: "coupon",
          foreignField: "_id",
          as: "couponDetails",
        },
      },
      { $unwind: "$couponDetails" },
      {
        $group: {
          _id: "$coupon",
          couponCode: { $first: "$couponDetails.code" },
          usageCount: { $sum: 1 },
          totalDiscountGiven: { $sum: "$discountAmount" },
          averageDiscount: { $avg: "$discountAmount" },
          totalOrderValue: { $sum: "$finalPrice" },
        },
      },
      { $sort: { usageCount: -1 } },
    ]);

    return successResponse(res, {
      statusCode: 200,
      message: "Coupon usage analytics retrieved successfully",
      payload: { couponUsage },
    });
  } catch (error) {
    next(error);
  }
};

// Add to exports
module.exports = {
  addCoupon,
  removeCoupon,
  applyCoupon,
  getAllCoupons,
  getCouponById,
  previewCoupon,
  updateCoupon,
  getCouponStats,
  getCouponUsageAnalytics,
};
