// Assembles everything an invoice needs from a single order id.
//
// The PDF endpoint and the invoice email must not build this separately: the
// invoice a customer downloads and the one that arrived in their inbox have to
// be the same document, and that only holds if there is one place that decides
// what goes on it.

const createError = require("http-errors");

const { Order } = require("../models/orderModel");
const Product = require("../models/productModel");
const {
  storeName,
  storeAddress,
  storeEmail,
  storePhone,
} = require("../secret");

/**
 * Human-readable invoice number, derived rather than stored.
 *
 * Deriving it from data the order already carries keeps existing orders
 * invoiceable with no migration and no counter to keep in sync, and the same
 * order always produces the same number.
 *
 * Shape: INV-20250828-A1B2C3D4 — order date, then the tail of the ObjectId,
 * which is unique enough to identify one order in a support conversation.
 */
const buildInvoiceNumber = (order) => {
  const date = new Date(order.dateOrdered || order.createdAt);
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
  const suffix = order._id.toString().slice(-8).toUpperCase();
  return `INV-${stamp}-${suffix}`;
};

/** The filename the browser saves, and the name of the email attachment. */
const buildInvoiceFilename = (order) => `${buildInvoiceNumber(order)}.pdf`;

/**
 * Load one order and flatten it into the shape the renderer wants.
 *
 * Variants are subdocuments of Product rather than of the order, so each line
 * needs its product fetched to name the colour and size. The order stores its
 * own copy of the price paid, and that copy is what the invoice shows: a
 * product repriced after the fact must not change what a past invoice says.
 *
 * @returns {Promise<object>} invoice data, ready to render
 */
const buildInvoiceData = async (orderId) => {
  const order = await Order.findById(orderId)
    .populate("user", "name email")
    .populate("items.product", "name slug price")
    .populate("coupon", "code")
    .populate("payment", "paymentMethod status");

  if (!order) {
    throw createError(404, "Order not found");
  }

  const productsWithIds = order.items
    .map((item) => item.product)
    .filter((p) => p?._id);

  const variantsByProductId = new Map(
    (
      await Product.find({
        _id: { $in: productsWithIds.map((p) => p._id) },
      })
        .select("variants")
        .lean()
    ).map((p) => [p._id.toString(), p.variants || []])
  );

  const items = await Promise.all(
    order.items.map(async (item) => {
      // Products are populated above, but a product deleted since the order was
      // placed leaves the reference dangling. The line still has to appear on
      // the invoice - it was paid for - so fall back to a placeholder name
      // rather than dropping it or throwing.
      const product = item.product || null;
      const quantity = item.quantity || 0;

      let variantLabel = "";
      if (product?._id) {
        const variants = variantsByProductId.get(product._id.toString()) || [];
        const variant = variants.find(
          (v) => v._id.toString() === item.variant.toString()
        );
        if (variant) {
          variantLabel = [variant.color, variant.size]
            .filter(Boolean)
            .join(" / ");
        }
      }

      return {
        name: product?.name || "Product no longer available",
        variantLabel,
        quantity,
        // Line totals are stored; the per-unit figure is derived so the two can
        // never disagree by a rounding step.
        unitPrice: quantity > 0 ? item.cost / quantity : 0,
        lineTotal: item.cost || 0,
      };
    })
  );

  return {
    order,
    invoiceNumber: buildInvoiceNumber(order),
    issuedAt: new Date(order.dateOrdered || order.createdAt),
    store: {
      name: storeName,
      address: storeAddress,
      email: storeEmail,
      phone: storePhone,
    },
    customer: {
      name: order.user?.name || "Customer",
      email: order.email,
      phone: order.phone,
      address: [order.street, order.city, order.district]
        .filter(Boolean)
        .join(", "),
      addressDetails: order.addressDetails || "",
    },
    items,
    totals: {
      subtotal: order.totalPrice || 0,
      shipping: order.shippingCost || 0,
      productDiscount: order.discountBreakdown?.productDiscount || 0,
      shippingDiscount: order.discountBreakdown?.shippingDiscount || 0,
      discount: order.discountAmount || 0,
      total: order.finalPrice || 0,
    },
    couponCode: order.coupon?.code || null,
    paymentMethod: order.payment?.paymentMethod || "Cash on Delivery",
    isPaid: order.isPaid,
    status: order.status || "Processing",
    isGift: order.isGift === true,
    giftNote: order.giftNote || "",
  };
};

module.exports = {
  buildInvoiceData,
  buildInvoiceNumber,
  buildInvoiceFilename,
};
