const ShippingRate = require("../models/shippingModel");
const createError = require("http-errors");
const { successResponse } = require("./responseController");
const { DEFAULT_SHIPPING_RATES } = require("../constants/shippingDefaults");

// Get all shipping rates for customers
const getAllShippingRates = async (req, res, next) => {
  try {
    const rates = await ShippingRate.find().sort({ cost: 1 });

    return successResponse(res, {
      statusCode: 200,
      message: "Shipping rates retrieved successfully",
      payload: rates,
    });
  } catch (error) {
    next(error);
  }
};

// Create new shipping rate (admin only)
const createShippingRate = async (req, res, next) => {
  try {
    const { region, cost, description } = req.body;

    if (!region) {
      throw createError(400, "Region name is required");
    }

    if (cost === undefined || cost < 0) {
      throw createError(400, "Valid shipping cost is required");
    }

    const existingRate = await ShippingRate.findOne({
      region: { $regex: new RegExp("^" + region + "$", "i") },
    });

    if (existingRate) {
      throw createError(400, "A shipping rate for this region already exists");
    }

    const newShippingRate = new ShippingRate({
      region,
      cost,
      description: description || "",
    });

    await newShippingRate.save();

    return successResponse(res, {
      statusCode: 201,
      message: "Shipping rate created successfully",
      payload: newShippingRate,
    });
  } catch (error) {
    next(error);
  }
};

// Initialize default shipping rates (admin only)
const initializeDefaultRates = async (req, res, next) => {
  try {
    const existingRates = await ShippingRate.countDocuments();
    if (existingRates > 0) {
      throw createError(
        400,
        "Shipping rates already exist. Use update instead."
      );
    }

    await ShippingRate.insertMany(DEFAULT_SHIPPING_RATES);

    return successResponse(res, {
      statusCode: 201,
      message: "Default shipping rates initialized successfully",
      payload: await ShippingRate.find().sort({ cost: 1 }),
    });
  } catch (error) {
    next(error);
  }
};

// Update a shipping rate (admin only)
const updateShippingRate = async (req, res, next) => {
  try {
    const { rateId } = req.params;
    const { cost, description } = req.body;

    if (!cost && !description) {
      throw createError(400, "Nothing to update");
    }

    const updates = {};
    if (cost !== undefined) updates.cost = cost;
    if (description !== undefined) updates.description = description;

    const updatedRate = await ShippingRate.findByIdAndUpdate(rateId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedRate) {
      throw createError(404, "Shipping rate not found");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Shipping rate updated successfully",
      payload: updatedRate,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a shipping rate (admin only)
const deleteShippingRate = async (req, res, next) => {
  try {
    const { rateId } = req.params;

    const deletedRate = await ShippingRate.findByIdAndDelete(rateId);
    if (!deletedRate) {
      throw createError(404, "Shipping rate not found");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Shipping rate deleted successfully",
      payload: deletedRate,
    });
  } catch (error) {
    next(error);
  }
};

// Add these functions to your shippingController.js

const getShippingStats = async (req, res, next) => {
  try {
    const stats = await ShippingRate.aggregate([
      {
        $group: {
          _id: null,
          totalRegions: { $sum: 1 },
          averageCost: { $avg: "$cost" },
          minCost: { $min: "$cost" },
          maxCost: { $max: "$cost" },
        },
      },
    ]);

    // Get order distribution by shipping region
    const Order = require("../models/orderModel");
    const regionDistribution = await Order.aggregate([
      {
        $group: {
          _id: "$shippingRegion",
          orderCount: { $sum: 1 },
          totalRevenue: { $sum: "$finalPrice" },
          totalShippingRevenue: { $sum: "$shippingCost" },
        },
      },
      { $sort: { orderCount: -1 } },
    ]);

    return successResponse(res, {
      statusCode: 200,
      message: "Shipping statistics retrieved successfully",
      payload: {
        overview: stats[0] || {},
        regionDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getPopularShippingRegions = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const Order = require("../models/orderModel");
    const popularRegions = await Order.aggregate([
      { $match: { createdAt: { $gte: daysAgo } } },
      {
        $group: {
          _id: "$shippingRegion",
          orderCount: { $sum: 1 },
          totalShippingCost: { $sum: "$shippingCost" },
          averageOrderValue: { $avg: "$finalPrice" },
        },
      },
      { $sort: { orderCount: -1 } },
      { $limit: 10 },
    ]);

    return successResponse(res, {
      statusCode: 200,
      message: "Popular shipping regions retrieved successfully",
      payload: {
        regions: popularRegions,
        period: `Last ${days} days`,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Add to exports
module.exports = {
  createShippingRate,
  getAllShippingRates,
  updateShippingRate,
  deleteShippingRate,
  initializeDefaultRates,
  getShippingStats,
  getPopularShippingRegions,
};
