// Throwaway verification for the transactional checkout. Not part of the app.
//
//   docker compose run --rm --no-deps \
//     -v "${PWD}/backend/scripts/checkout-race.js:/app/scripts/checkout-race.js:ro" \
//     api node scripts/checkout-race.js
//
// Puts exactly one unit of one variant in stock, gives two different customers
// a cart holding that unit, then fires both checkouts at the same moment.
// Exactly one must win.

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

const BUYERS = [
  { name: "Race Buyer A", email: "race-a@example.com", phone: "01900000001" },
  { name: "Race Buyer B", email: "race-b@example.com", phone: "01900000002" },
];

const login = async (email) => {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emailOrPhone: email, password: defaultUserPassword }),
  });
  if (!res.ok) {
    throw new Error(`login failed for ${email}: ${res.status} ${await res.text()}`);
  }
  return res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
};

const placeOrder = async (cookie, body) => {
  const res = await fetch(`${API}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
};

(async () => {
  await mongoose.connect(mongodbURL);
  console.log(`connected to ${mongoose.connection.host}\n`);

  // Two customers, each verified so login works without the activation mail.
  const emails = BUYERS.map((b) => b.email);
  const phones = BUYERS.map((b) => b.phone);
  await User.deleteMany({ $or: [{ email: { $in: emails } }, { phone: { $in: phones } }] });
  const users = [];
  for (const b of BUYERS) {
    users.push(
      await User.create({
        ...b,
        password: defaultUserPassword,
        addresses: [
          { street: "1 Race Road", city: "Dhaka", state: "Dhaka", postalCode: "1207", isDefault: true },
        ],
        verificationStatus: { email: true, phone: true },
      })
    );
  }

  // One unit, one variant.
  const product = await Product.findOne({ "variants.0": { $exists: true } });
  const variant = product.variants[0];
  await Product.updateOne(
    { _id: product._id, "variants._id": variant._id },
    { $set: { "variants.$.quantity": 1, totalSold: 0 } }
  );
  console.log(`product : ${product.name}`);
  console.log(`variant : ${variant.color}/${variant.size} -> stock set to 1\n`);

  const rate = await ShippingRate.findByRegion(REGION);
  const shippingCost = parseFloat(rate.cost);

  // A cart each, both holding that same last unit.
  await Cart.deleteMany({ user: { $in: users.map((u) => u._id) } });
  const carts = [];
  for (const user of users) {
    carts.push(
      await Cart.create({
        user: user._id,
        items: [
          {
            product: product._id,
            variant: { _id: variant._id, color: variant.color, size: variant.size },
            quantity: 1,
            cost: product.price,
          },
        ],
      })
    );
  }

  const ordersBefore = await Order.countDocuments();
  const paymentsBefore = await Payment.countDocuments();

  const cookies = await Promise.all(users.map((u) => login(u.email)));

  // Both requests leave together. This is the case the old read-compare-save
  // version let through twice.
  const results = await Promise.all(
    users.map((user, i) =>
      placeOrder(cookies[i], {
        cartId: carts[i]._id.toString(),
        street: "1 Race Road",
        city: "Dhaka",
        state: "Dhaka",
        phone: user.phone,
        email: user.email,
        paymentMethod: "Cash on Delivery",
        shippingRegion: REGION,
        finalPrice: product.price + shippingCost,
      })
    )
  );

  results.forEach((r, i) =>
    console.log(`buyer ${i === 0 ? "A" : "B"} -> ${r.status} ${r.body.message}`)
  );

  const after = await Product.findById(product._id).lean();
  const stock = after.variants.find((v) => v._id.toString() === variant._id.toString()).quantity;
  const ordersAfter = await Order.countDocuments();
  const paymentsAfter = await Payment.countDocuments();
  const cartsLeft = await Cart.countDocuments({ user: { $in: users.map((u) => u._id) } });

  const created = results.filter((r) => r.status === 201).length;
  const rejected = results.filter((r) => r.status === 400).length;

  console.log("\n--- after ---");
  console.log(`stock remaining : ${stock}          (expect 0)`);
  console.log(`totalSold       : ${after.totalSold}          (expect 1)`);
  console.log(`orders created  : ${ordersAfter - ordersBefore}          (expect 1)`);
  console.log(`payments created: ${paymentsAfter - paymentsBefore}          (expect 1)`);
  console.log(`carts remaining : ${cartsLeft}          (expect 1, the loser keeps theirs)`);

  const pass =
    created === 1 &&
    rejected === 1 &&
    stock === 0 &&
    after.totalSold === 1 &&
    ordersAfter - ordersBefore === 1 &&
    paymentsAfter - paymentsBefore === 1 &&
    cartsLeft === 1;

  console.log(`\n${pass ? "PASS" : "FAIL"}: ${created} accepted, ${rejected} rejected`);

  await mongoose.disconnect();
  process.exit(pass ? 0 : 1);
})().catch(async (e) => {
  console.error("error:", e.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
