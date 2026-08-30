const { Order } = require("../models/orderModel");
const createError = require("http-errors");
const { successResponse } = require("./responseController");
const Cart = require("../models/cartModel");
const Payment = require("../models/paymentModel");
const Product = require("../models/productModel");
const { default: mongoose } = require("mongoose");
const Coupon = require("../models/couponModel");
const ShippingRate = require("../models/shippingModel");
const { getOrderItemsWithReviewStatus } = require("../helper/orderHelper");
const { createPagination } = require("../helper/paginationHelper");
const logger = require("../helper/logger");
const {
  buildInvoiceData,
  buildInvoiceFilename,
} = require("../helper/invoiceHelper");
const { generateInvoicePdf } = require("../helper/invoicePdf");
const { sendInvoiceEmail } = require("../helper/invoiceEmail");
const Admin = require("../models/adminModel");

// Create a new order
const createOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      cartId,
      street,
      city,
      state,
      addressDetails = "",
      phone,
      email,
      paymentMethod,
      couponId,
      couponCode,
      productDiscountAmount = 0,
      shippingDiscountAmount = 0,
      finalPrice,
      shippingRegion,
      isGift = false,
      giftNote = "",
    } = req.body;

    logger.debug("Cart ID:", cartId);

    const cart = await Cart.findById(cartId);
    if (!cart) {
      throw createError(404, "Cart not found");
    }
    logger.debug(cart);

    if (!cart.items?.length) {
      throw createError(400, "Cart items are required");
    }

    // Get shipping cost for the selected region
    const shippingRateInfo = await ShippingRate.findByRegion(shippingRegion);
    if (!shippingRateInfo) {
      throw createError(400, "Invalid shipping region");
    }

    const shippingCost = parseFloat(shippingRateInfo.cost).toFixed(2);

    // coupon validation
    let verifiedProductDiscount = 0;
    let verifiedShippingDiscount = 0;
    let finalShippingCost = parseFloat(shippingCost);
    let coupon = null;
    let userUsage = null;

    // Revalidate the coupon (if applied)
    if (couponId) {
      coupon = await Coupon.findById(couponId);

      // If we have a couponCode but no valid coupon, try to find it by code
      if (!coupon && couponCode) {
        coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      }

      if (!coupon) {
        throw createError(400, "Invalid coupon");
      }

      if (coupon.expiryDate < new Date()) {
        throw createError(400, "Coupon has expired");
      }

      if (cart.totalPrice < coupon.minOrderAmount) {
        throw createError(
          400,
          `Minimum order amount for this coupon is ${coupon.minOrderAmount}`
        );
      }

      userUsage = coupon.usedBy.find(
        (u) => u.userId.toString() === userId.toString()
      );
      if (userUsage && userUsage.timesUsed >= coupon.usageLimit) {
        throw createError(
          400,
          "You have already used this coupon the maximum number of times"
        );
      }

      // Verify product discount calculation
      const { productDiscount, shippingDiscount } = coupon.discountOptions;

      if (productDiscount.type === "fixed") {
        verifiedProductDiscount = parseFloat(productDiscount.value);
      } else if (productDiscount.type === "percentage") {
        verifiedProductDiscount =
          (parseFloat(cart.totalPrice) * parseFloat(productDiscount.value)) /
          100;
        if (productDiscount.maxDiscount) {
          verifiedProductDiscount = Math.min(
            verifiedProductDiscount,
            parseFloat(productDiscount.maxDiscount)
          );
        }
      }

      // Round to 2 decimal places
      verifiedProductDiscount = parseFloat(verifiedProductDiscount.toFixed(2));

      // Verify shipping discount calculation
      if (shippingDiscount.type === "free") {
        verifiedShippingDiscount = parseFloat(shippingCost);
        finalShippingCost = 0;
      } else if (shippingDiscount.type === "fixed") {
        verifiedShippingDiscount = Math.min(
          parseFloat(shippingDiscount.value),
          parseFloat(shippingCost)
        );
        finalShippingCost = parseFloat(
          (parseFloat(shippingCost) - verifiedShippingDiscount).toFixed(2)
        );
      } else if (shippingDiscount.type === "percentage") {
        verifiedShippingDiscount =
          (parseFloat(shippingCost) * parseFloat(shippingDiscount.value)) / 100;
        finalShippingCost = parseFloat(
          (parseFloat(shippingCost) - verifiedShippingDiscount).toFixed(2)
        );
      }

      // Round shipping discount to 2 decimal places
      verifiedShippingDiscount = parseFloat(
        verifiedShippingDiscount.toFixed(2)
      );

      // Verify the discount amounts match what was sent from client
      if (
        Math.abs(verifiedProductDiscount - parseFloat(productDiscountAmount)) >
          0.01 ||
        Math.abs(
          verifiedShippingDiscount - parseFloat(shippingDiscountAmount)
        ) > 0.01
      ) {
        throw createError(
          400,
          "Discount amount mismatch. Please reapply the coupon."
        );
      }

      // Removed coupon usage update from here
    }

    // Calculate final price with proper rounding
    const totalDiscount = parseFloat(
      (verifiedProductDiscount + verifiedShippingDiscount).toFixed(2)
    );
    const calculatedFinalPrice = parseFloat(
      (
        parseFloat(cart.totalPrice) -
        verifiedProductDiscount +
        finalShippingCost
      ).toFixed(2)
    );

    if (Math.abs(calculatedFinalPrice - parseFloat(finalPrice)) > 0.01) {
      throw createError(
        400,
        "Final price mismatch. Please reapply the coupon."
      );
    }

    // Update the stock of the products and update totalSold count
    logger.debug("Updating product stock and totalSold count...");
    for (let item of cart.items) {
      logger.debug(
        `Processing item: Product ID ${item.product}, Variant ID ${item.variant._id}, Quantity ${item.quantity}`
      );
      const product = await Product.findById(item.product);

      if (!product) {
        logger.debug(`Product not found: ${item.product}`);
        throw createError(404, "Product not found");
      }

      logger.debug(
        `Found product: ${product.name}, Current totalSold: ${product.totalSold}`
      );

      let variantFound = false;

      for (let variant of product.variants) {
        if (variant._id.toString() === item.variant._id.toString()) {
          logger.debug(
            `Found variant: Color ${variant.color}, Size ${variant.size}, Current stock: ${variant.quantity}`
          );

          if (variant.quantity < item.quantity) {
            throw createError(
              400,
              `Not enough stock for ${product.name} (${variant.color}, ${variant.size})`
            );
          }

          logger.debug(
            `Reducing stock from ${variant.quantity} to ${
              variant.quantity - item.quantity
            }`
          );
          variant.quantity -= item.quantity;
          variantFound = true;
        }
      }

      if (!variantFound) {
        logger.debug(`Variant not found: ${item.variant._id}`);
        throw createError(400, `Variant not found for product ${product.name}`);
      }

      // Update totalSold count
      logger.debug(
        `Increasing totalSold from ${product.totalSold || 0} to ${
          (product.totalSold || 0) + item.quantity
        }`
      );
      product.totalSold = (product.totalSold || 0) + item.quantity;

      await product.save();
      logger.debug(
        `Product updated successfully: ${product.name}, New totalSold: ${product.totalSold}`
      );
    }

    // Now that all validations have passed, update coupon usage
    if (coupon && couponId) {
      if (userUsage) {
        userUsage.timesUsed += 1;
      } else {
        coupon.usedBy.push({ userId, timesUsed: 1 });
      }
      await coupon.save();
    }

    // Format cart items costs to 2 decimal places
    const formattedItems = cart.items.map((item) => ({
      product: item.product,
      variant: item.variant._id,
      quantity: item.quantity,
      cost: parseFloat(item.cost.toFixed(2)),
    }));

    const newOrder = new Order({
      user: userId,
      items: formattedItems,
      street,
      city,
      state,
      addressDetails,
      phone,
      email,
      totalPrice: parseFloat(cart.totalPrice.toFixed(2)),
      shippingRegion: shippingRegion,
      shippingCost: parseFloat(shippingCost),
      freeShipping: finalShippingCost === 0,
      coupon: couponId || null,
      discountAmount: totalDiscount,
      discountBreakdown: {
        productDiscount: verifiedProductDiscount,
        shippingDiscount: verifiedShippingDiscount,
      },
      finalPrice: calculatedFinalPrice,
      isGift,
      giftNote,
    });

    const newPayment = new Payment({
      order: newOrder._id,
      paymentMethod: paymentMethod,
      amount: calculatedFinalPrice,
    });

    newOrder.payment = newPayment._id;

    await newOrder.save();
    await newPayment.save();

    // Update cart
    await Cart.findByIdAndDelete(cartId);

    // Email the invoice without blocking the response. Rendering the PDF and
    // handing it to the mail server can take seconds - longer still when SMTP
    // is unreachable and the send has to time out - and none of that should
    // sit between a paying customer and their order confirmation. The promise
    // carries its own catch, so a failure logs rather than surfacing as an
    // unhandled rejection, and the same invoice stays downloadable either way.
    sendInvoiceEmail(newOrder._id).catch((error) =>
      logger.error(
        `Unexpected failure dispatching invoice email for order ${newOrder._id}:`,
        error.message
      )
    );

    return successResponse(res, {
      statusCode: 201,
      message: "Order created successfully",
      payload: newOrder,
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders (admin only)
const getAllOrders = async (req, res, next) => {
  try {
    // Extract query parameters for filtering
    const {
      status,
      userId,
      isGift,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    // Build query object
    const query = {};
    if (status) query.status = status; // Filter by order status
    if (userId) query.user = userId; // Filter by user ID

    // Handle isGift filter differently to account for documents without the field
    if (isGift === "true") {
      query.isGift = true; // Filter gift orders
    } else if (isGift === "false") {
      // For non-gift orders, include both explicit false and cases where field doesn't exist
      query.$or = [{ isGift: false }, { isGift: { $exists: false } }];
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Fetch orders from the database with filtering
    const orders = await Order.find(query)
      .populate({
        path: "user",
        select: "name email phone addresses",
      })
      .populate({
        path: "items.product",
        select: "name slug price",
      })
      .populate({
        path: "coupon",
        select: "code discountOptions",
      })
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const count = await Order.countDocuments(query);

    const pagination = createPagination(count, page, limit);

    // Process orders to include variant details
    const processedOrders = await Promise.all(
      orders.map(async (order) => {
        const orderObj = order.toObject();

        // Process items to include variant details
        orderObj.items = await Promise.all(
          orderObj.items.map(async (item) => {
            const product = await Product.findById(item.product._id);
            const variant = product.variants.find(
              (v) => v._id.toString() === item.variant.toString()
            );

            return {
              ...item,
              productDetails: {
                name: product.name,
                slug: product.slug,
                price: product.price,
              },
              variantDetails: variant
                ? {
                    color: variant.color,
                    size: variant.size,
                  }
                : null,
            };
          })
        );

        // Add user's default address if available
        if (orderObj.user && orderObj.user.addresses) {
          const defaultAddress = orderObj.user.addresses.find(
            (addr) => addr.isDefault
          );
          orderObj.user.defaultAddress = defaultAddress || null;
        }

        // Format coupon information if exists
        if (orderObj.coupon) {
          orderObj.couponDetails = {
            code: orderObj.coupon.code,
            productDiscount: orderObj.discountBreakdown.productDiscount,
            shippingDiscount: orderObj.discountBreakdown.shippingDiscount,
          };
        }

        return orderObj;
      })
    );

    return successResponse(res, {
      statusCode: 200,
      message: "Orders retrieved successfully",
      payload: {
        orders: processedOrders,
        pagination,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Throw unless the requester owns `order`, or is a real admin.
 *
 * An order carries the customer's name, address, phone, email and everything
 * they bought, so "is signed in" is not the bar - order ids are guessable
 * enough that any account could otherwise read another customer's details.
 *
 * Users and admins share one cookie and one signing key, so an admin arrives
 * here as req.user like anyone else; the Admin collection is what settles it,
 * not anything the token claims. Accepts `order.user` either populated or as a
 * bare ObjectId, since callers select it both ways.
 */
const assertOrderAccess = async (req, order) => {
  const requesterId = req.user._id.toString();
  const ownerId = (order.user?._id || order.user)?.toString();

  if (ownerId === requesterId) return;

  const admin = await Admin.findOne({
    _id: requesterId,
    email: req.user.email,
  });
  if (!admin) {
    throw createError(403, "You can only access your own orders");
  }
};

// Get order by ID
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // findById on a malformed id throws a CastError, which surfaces as a 500.
    // A bad id in the URL is the caller's mistake, so answer it as one.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError(400, "Invalid order ID format");
    }

    const order = await Order.findById(id)
      .populate("user", "name")
      .populate("coupon"); // Populate the coupon reference

    if (!order) {
      throw createError(404, "Order not found");
    }

    await assertOrderAccess(req, order);

    const orderDetails = {
      _id: order._id,
      user: order.user,
      items: [...order.items],
      street: order.street,
      city: order.city,
      state: order.state,
      addressDetails: order.addressDetails, // Include additional address details
      phone: order.phone,
      email: order.email,
      totalPrice: order.totalPrice,
      shippingRegion: order.shippingRegion, // Include shipping region
      shippingCost: order.shippingCost, // Include shipping cost
      freeShipping: order.freeShipping, // Include free shipping flag
      coupon: order.coupon, // Include full coupon object
      couponDetails: order.coupon
        ? {
            code: order.coupon.code,
            description: order.coupon.description,
            discountType: order.coupon.discountOptions,
          }
        : null, // Add coupon details
      discountAmount: order.discountAmount, // Include discount amount
      discountBreakdown: order.discountBreakdown, // Include discount breakdown
      finalPrice: order.finalPrice, // Include final price
      status: order.status,
      isPaid: order.isPaid,
      isGift: order.isGift, // Include gift flag
      giftNote: order.giftNote, // Include gift note
      giftMessage: order.giftNote, // Backward compatibility for frontend
      createdAt: order.createdAt,
      dateOrdered: order.dateOrdered,
    };

    for (let i = 0; i < orderDetails.items.length; i++) {
      const item = orderDetails.items[i];
      const product = await Product.findById(item.product);
      const variant = product.variants.find(
        (variant) => variant._id.toString() === item.variant.toString()
      );

      // Construct item details
      const updatedItem = {
        ...item._doc, // Spread the existing item properties
        productDetails: {
          name: product.name,
          price: product.price,
          slug: product.slug, // Include product slug for linking
        },
        variantDetails: {
          color: variant?.color || "N/A",
          size: variant?.size || "N/A",
        },
      };
      logger.debug("Updated item:", updatedItem);

      // Replace the item in order.items
      orderDetails.items[i] = updatedItem;
      logger.debug("Updated item:", order.items[i]);
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Order retrieved successfully",
      payload: orderDetails,
    });
  } catch (error) {
    next(error);
  }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;
    const updates = {};

    if (status) updates.status = status;

    // First get the original order to check its current status
    const originalOrder = await Order.findById(orderId);
    if (!originalOrder) {
      throw createError(404, "Order not found");
    }

    // Special handling for order cancellation
    if (status === "Cancelled" && originalOrder.status !== "Cancelled") {
      logger.debug(
        `Cancelling order ${orderId}, returning stock to inventory...`
      );
      // Return stock for cancelled orders
      for (const item of originalOrder.items) {
        logger.debug(
          `Processing cancelled item: Product ID ${item.product}, Variant ID ${item.variant}, Quantity ${item.quantity}`
        );
        const product = await Product.findById(item.product);
        if (product) {
          logger.debug(
            `Found product: ${product.name}, Current totalSold: ${product.totalSold}`
          );

          // Find the variant to update
          const variant = product.variants.find(
            (v) => v._id.toString() === item.variant.toString()
          );

          if (variant) {
            logger.debug(
              `Found variant: Color ${variant.color}, Size ${variant.size}, Current stock: ${variant.quantity}`
            );
            // Return the quantity to stock
            logger.debug(
              `Increasing stock from ${variant.quantity} to ${
                variant.quantity + item.quantity
              }`
            );
            variant.quantity += item.quantity;
          } else {
            logger.debug(`Variant not found: ${item.variant}`);
          }

          // Reduce the totalSold count
          logger.debug(
            `Decreasing totalSold from ${product.totalSold || 0} to ${Math.max(
              0,
              (product.totalSold || 0) - item.quantity
            )}`
          );
          product.totalSold = Math.max(
            0,
            (product.totalSold || 0) - item.quantity
          );

          await product.save();
          logger.debug(
            `Product updated successfully: ${product.name}, New totalSold: ${product.totalSold}`
          );
        } else {
          logger.debug(`Product not found: ${item.product}`);
        }
      }
    }

    const order = await Order.findByIdAndUpdate(orderId, updates, {
      new: true,
      runValidators: true,
    })
      .populate("user", "name")
      .populate("items.product", "name");

    return successResponse(res, {
      statusCode: 200,
      message: "Order updated successfully",
      payload: order,
    });
  } catch (error) {
    next(error);
  }
};

// Delete order (admin only)
const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      throw createError(404, "Order not found");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Order deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get user orders
const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;
    // Validate user ID
    if (!req.user || !req.user._id) {
      throw createError(400, "User ID is required");
    }

    // Ensure valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
      throw createError(400, "Invalid user ID format");
    }

    const orders = await Order.find({ user: userId })
      .select(
        "user items street city state phone email totalPrice isPaid createdAt dateOrdered status shippingRegion shippingCost freeShipping coupon discountAmount discountBreakdown finalPrice payment isGift giftNote"
      ) // Added isGift and giftNote
      .populate("user", "name email") // Include user details
      .populate("items.product", "name price thumbnailImage") // Include product details with thumbnailImage
      .sort({ createdAt: -1 }); // Sort by most recent orders

    // Check if orders exist
    if (!orders.length) {
      throw createError(404, "No orders found");
    }

    // Add review status to delivered orders
    const ordersWithReviewStatus = await Promise.all(
      orders.map(async (order) => {
        const orderObj = order.toObject ? order.toObject() : order;

        // Only add review status for delivered orders
        if (orderObj.status === "Delivered") {
          orderObj.items = await getOrderItemsWithReviewStatus(
            orderObj.items,
            userId
          );
        }

        return orderObj;
      })
    );

    return successResponse(res, {
      statusCode: 200,
      message: "User orders retrieved successfully",
      payload: ordersWithReviewStatus,
    });
  } catch (error) {
    next(error);
  }
};

// Update order payment status (admin only)
const updateOrderPaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isPaid } = req.body;

    // Validate isPaid is a boolean
    if (typeof isPaid !== "boolean") {
      throw createError(400, "isPaid must be a boolean value");
    }

    const order = await Order.findById(id);
    if (!order) {
      throw createError(404, "Order not found");
    }

    // Update order payment status
    order.isPaid = isPaid;
    order.paidAt = isPaid ? new Date() : null; // Set paidAt to current date if paid, null if unpaid

    // If there's a payment reference, update it too
    if (order.payment) {
      const payment = await Payment.findById(order.payment);
      if (payment) {
        payment.status = isPaid ? "Completed" : "Pending"; // Fixed: Capitalized status values
        await payment.save();
      }
    }

    await order.save();

    return successResponse(res, {
      statusCode: 200,
      message: `Order marked as ${isPaid ? "paid" : "unpaid"} successfully`,
      payload: order,
    });
  } catch (error) {
    next(error);
  }
};

// Add these functions to your orderController.js

const getOrderStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const stats = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$finalPrice" },
          averageOrderValue: { $avg: "$finalPrice" },
          paidOrders: {
            $sum: { $cond: [{ $eq: ["$isPaid", true] }, 1, 0] },
          },
          giftOrders: {
            $sum: { $cond: [{ $eq: ["$isGift", true] }, 1, 0] },
          },
          ordersByStatus: {
            processing: {
              $sum: { $cond: [{ $eq: ["$status", "Processing"] }, 1, 0] },
            },
            shipped: {
              $sum: { $cond: [{ $eq: ["$status", "Shipped"] }, 1, 0] },
            },
            delivered: {
              $sum: { $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0] },
            },
            cancelled: {
              $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] },
            },
          },
        },
      },
    ]);

    // Top products by order count
    const topProducts = await Order.aggregate([
      { $match: dateFilter },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalOrdered: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.cost" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalOrdered: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          productName: "$product.name",
          productSlug: "$product.slug",
          totalOrdered: 1,
          totalRevenue: 1,
          orderCount: 1,
        },
      },
    ]);

    return successResponse(res, {
      statusCode: 200,
      message: "Order statistics retrieved successfully",
      payload: {
        overview: stats[0] || {},
        topProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getOrdersByRegion = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const regionStats = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$shippingRegion",
          orderCount: { $sum: 1 },
          totalRevenue: { $sum: "$finalPrice" },
          averageOrderValue: { $avg: "$finalPrice" },
          totalShippingCost: { $sum: "$shippingCost" },
        },
      },
      { $sort: { orderCount: -1 } },
    ]);

    return successResponse(res, {
      statusCode: 200,
      message: "Orders by region retrieved successfully",
      payload: { regionStats },
    });
  } catch (error) {
    next(error);
  }
};

// Download the invoice for an order as a PDF (order owner, or any admin)
const downloadInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError(400, "Invalid order ID format");
    }

    const order = await Order.findById(id).select("user");
    if (!order) {
      throw createError(404, "Order not found");
    }

    await assertOrderAccess(req, order);

    const invoice = await buildInvoiceData(id);
    const pdf = await generateInvoicePdf(invoice);
    const filename = buildInvoiceFilename(invoice.order);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdf.length);
    // The filename is the only thing the browser needs from the response
    // headers, and CORS hides it by default on a cross-origin request - which
    // a deployed frontend always is.
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    // An invoice is the customer's address, phone and purchase history in one
    // file. Keep it out of any cache that outlives the request: shared caches
    // must not hold it at all, and a browser must not leave it on disk for the
    // next person to use the machine, or re-serve it from history after logout.
    res.setHeader("Cache-Control", "private, no-store, max-age=0");
    res.setHeader("Pragma", "no-cache");
    // The body is attacker-influenced only through product names, but a
    // browser that sniffs its way to text/html would treat those as markup.
    res.setHeader("X-Content-Type-Options", "nosniff");

    return res.send(pdf);
  } catch (error) {
    next(error);
  }
};

// Add to exports
module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getUserOrders,
  updateOrderPaymentStatus,
  getOrderStats,
  getOrdersByRegion,
  downloadInvoice,
};
