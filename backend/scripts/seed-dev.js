// Puts a handful of products into the local development database so the
// storefront has something to show. Refuses to run against anything that
// looks like a hosted cluster.
//
//   docker compose run --rm api node scripts/seed-dev.js

const mongoose = require("mongoose");
const Category = require("../src/models/categoryModel");
const Subcategory = require("../src/models/subcategoryModel");
const Product = require("../src/models/productModel");

const IMG = "/images/frontpage.jpg";

const uri = process.env.MONGODB_ATLAS_URL || "";

if (/mongodb\+srv:|\.mongodb\.net/.test(uri)) {
  console.error(
    "Refusing to run: MONGODB_ATLAS_URL points at a hosted cluster.\n" +
      "This script deletes all categories, subcategories and products.\n" +
      "Point it at the local mongo service before running it."
  );
  process.exit(1);
}

(async () => {
  await mongoose.connect(uri);
  console.log("connected to", mongoose.connection.host);

  await Promise.all([
    Category.deleteMany({}),
    Subcategory.deleteMany({}),
    Product.deleteMany({}),
  ]);

  const category = await Category.create({
    name: "Gift Hampers",
    slug: "gift-hampers",
    description: "Curated hampers",
    isActive: true,
  });

  const subcategory = await Subcategory.create({
    name: "Luxury Hampers",
    slug: "luxury-hampers",
    description: "Premium range",
    category: category._id,
    isActive: true,
  });

  const base = {
    category: category._id,
    subcategory: subcategory._id,
    thumbnailImage: IMG,
    isActive: true,
  };

  await Product.create([
    {
      ...base,
      name: "Premium Gift Hamper",
      slug: "premium-gift-hamper",
      description: "Luxury hamper with gourmet treats and premium accessories.",
      price: 2499,
      shipping: true,
      totalSold: 12,
      ratings: 4,
      reviewCount: 3,
      variants: [
        { color: "Red", size: "Large", quantity: 25, images: [IMG] },
        { color: "Gold", size: "Medium", quantity: 10, images: [IMG] },
      ],
    },
    {
      ...base,
      name: "Personalised Stationery Set",
      slug: "personalised-stationery-set",
      description: "Custom leather journal with fountain pen and accessories.",
      price: 899.5,
      shipping: true,
      totalSold: 5,
      ratings: 0,
      variants: [
        { color: "Brown", size: "One Size", quantity: 3, images: [IMG] },
      ],
    },
    {
      ...base,
      name: "Out Of Stock Sampler",
      slug: "out-of-stock-sampler",
      description: "Everything sold out, for exercising the out-of-stock path.",
      price: 150,
      shipping: false,
      totalSold: 0,
      ratings: 0,
      variants: [{ color: "Plain", size: "Small", quantity: 0, images: [IMG] }],
    },
  ]);

  // Reproduces the legacy document shape still present in older data, where
  // `ratings` is an array rather than a number. The schema types it as Number
  // and rejects it, so it has to go in through the raw driver -- which is how
  // those documents came to exist in the first place.
  await Product.collection.updateOne(
    { slug: "personalised-stationery-set" },
    { $set: { ratings: [] } }
  );

  const count = await Product.countDocuments();
  console.log(`seeded ${count} products in 1 category / 1 subcategory`);
  await mongoose.disconnect();
})().catch((e) => {
  console.error("seed failed:", e.message);
  process.exit(1);
});
