// Throwaway verification for the transactional checkout. Not part of the app.
//
//   docker compose run --rm api node scripts/checkout-rollback.js
//
// A cart whose first item is in stock and whose second is not. The first
// item's stock must be exactly where it started once the order is rejected -
// the old loop decremented it, hit the second item, threw, and left the stock
// gone with no order to account for it.

const mongoose = require("mongoose");
const { mongodbURL, defaultUserPassword } = require("../src/secret");
const Product = require("../src/models/productModel");
const User = require("../src/models/userModel");
const Cart = require("../src/models/cartModel");
const { Order } = require("../src/models/orderModel");
const Payment = require("../src/models/paymentModel");
const ShippingRate = require("../src/models/shippingModel");

const API = "http://api:3001";
const REGION = "Inside Dhaka";
const BUYER = {
  name: "Rollback Buyer",
  email: "rollback@example.com",
  phone: "01900000003",
};
const STARTING_STOCK = 5;

(async () => {
  await mongoose.connect(mongodbURL);
  console.log(`connected to ${mongoose.connection.host}\n`);

  await User.deleteMany({ $or: [{ email: BUYER.email }, { phone: BUYER.phone }] });
  const user = await User.create({
    ...BUYER,
    password: defaultUserPassword,
    addresses: [
      { street: "2 Rollback Road", city: "Dhaka", state: "Dhaka", postalCode: "1207", isDefault: true },
    ],
    verificationStatus: { email: true, phone: true },
  });

  // In stock.
  const good = await Product.findOne({ slug: "premium-gift-hamper" });
  const goodVariant = good.variants[0];
  await Product.updateOne(
    { _id: good._id, "variants._id": goodVariant._id },
    { $set: { "variants.$.quantity": STARTING_STOCK, totalSold: 0 } }
  );

  // Seeded with every variant at zero.
  const bad = await Product.findOne({ slug: "out-of-stock-sampler" });
  const badVariant = bad.variants[0];

  console.log(`item 1 : ${good.name} (${goodVariant.color}/${goodVariant.size}) stock ${STARTING_STOCK}`);
  console.log(`item 2 : ${bad.name} (${badVariant.color}/${badVariant.size}) stock 0\n`);

  const rate = await ShippingRate.findByRegion(REGION);

  await Cart.deleteMany({ user: user._id });
  const cart = await Cart.create({
    user: user._id,
    items: [
      {
        product: good._id,
        variant: { _id: goodVariant._id, color: goodVariant.color, size: goodVariant.size },
        quantity: 1,
        cost: good.price,
      },
      {
        product: bad._id,
        variant: { _id: badVariant._id, color: badVariant.color, size: badVariant.size },
        quantity: 1,
        cost: bad.price,
      },
    ],
  });

  const ordersBefore = await Order.countDocuments();
  const paymentsBefore = await Payment.countDocuments();

  const loginRes = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emailOrPhone: user.email, password: defaultUserPassword }),
  });
  const cookie = loginRes.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");

  const res = await fetch(`${API}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      cartId: cart._id.toString(),
      street: "2 Rollback Road",
      city: "Dhaka",
      state: "Dhaka",
      phone: user.phone,
      email: user.email,
      paymentMethod: "Cash on Delivery",
      shippingRegion: REGION,
      finalPrice: good.price + bad.price + parseFloat(rate.cost),
    }),
  });
  const body = await res.json();
  console.log(`checkout -> ${res.status} ${body.message}`);

  const after = await Product.findById(good._id).lean();
  const stock = after.variants.find((v) => v._id.toString() === goodVariant._id.toString()).quantity;
  const ordersAfter = await Order.countDocuments();
  const paymentsAfter = await Payment.countDocuments();
  const cartLeft = await Cart.countDocuments({ _id: cart._id });

  console.log("\n--- after ---");
  console.log(`item 1 stock    : ${stock}          (expect ${STARTING_STOCK}, untouched)`);
  console.log(`item 1 totalSold: ${after.totalSold}          (expect 0)`);
  console.log(`orders created  : ${ordersAfter - ordersBefore}          (expect 0)`);
  console.log(`payments created: ${paymentsAfter - paymentsBefore}          (expect 0)`);
  console.log(`cart survived   : ${cartLeft === 1}       (expect true)`);

  const pass =
    res.status === 400 &&
    stock === STARTING_STOCK &&
    after.totalSold === 0 &&
    ordersAfter - ordersBefore === 0 &&
    paymentsAfter - paymentsBefore === 0 &&
    cartLeft === 1;

  console.log(`\n${pass ? "PASS" : "FAIL"}: nothing from the failed checkout was left behind`);

  await mongoose.disconnect();
  process.exit(pass ? 0 : 1);
})().catch(async (e) => {
  console.error("error:", e.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
