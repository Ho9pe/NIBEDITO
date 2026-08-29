// Brings a fresh local database up to something you can actually sign into and
// shop in: a small catalogue, a superadmin, and one verified customer. Refuses
// to run against anything that looks like a hosted cluster.
//
//   docker compose run --rm api node scripts/seed-dev.js
//
// The two accounts are the same ones src/scripts/createDefaultAdmin.js and
// src/scripts/seed/seedTestUsers.js create, from the same environment
// variables, so running those afterwards replaces rather than duplicates.
// Neither is created here with a deleteMany({}) over the whole collection -
// only the matching email and phone are replaced. See the comment in
// seedTestUsers.js for why that distinction has teeth.

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Also loads ../.env, so this script works when run straight from backend/ and
// not only under `docker compose run`, where compose supplies the environment.
// dotenv does not overwrite variables that are already set, so compose still
// wins where both provide a value.
const {
  mongodbURL,
  superAdminEmail,
  superAdminPassword,
  superAdminPhone,
  defaultUserPassword,
} = require("../src/secret");

const Category = require("../src/models/categoryModel");
const Subcategory = require("../src/models/subcategoryModel");
const Product = require("../src/models/productModel");
const User = require("../src/models/userModel");
const Admin = require("../src/models/adminModel");
const ShippingRate = require("../src/models/shippingModel");

// The full catalogue and the shipping regions come from the same lists the
// standalone scripts and the admin "initialize rates" endpoint use. Imported
// rather than restated: a second copy of this data here is exactly how the
// category names in seedProducts.js drifted away from seedCategories.js and
// silently dropped six of thirteen products.
const slugify = require("slugify");
const { categories } = require("../src/scripts/seed/seedCategories");
const { products } = require("../src/scripts/seed/seedProducts");
const {
  DEFAULT_SHIPPING_RATES,
} = require("../src/constants/shippingDefaults");

const IMG = "/images/frontpage.jpg";

// Matches seedTestUsers.js, so the two scripts converge on one account rather
// than fighting over the unique indexes on email and phone.
const USER_EMAIL = process.env.TEST_VERIFIED_EMAIL || "verified@example.com";
const USER_PHONE = "01801234567";

const uri = mongodbURL || "";

if (/mongodb\+srv:|\.mongodb\.net/.test(uri)) {
  console.error(
    "Refusing to run: MONGODB_ATLAS_URL points at a hosted cluster.\n" +
      "This script deletes all categories, subcategories, products and\n" +
      "shipping rates, and replaces the seeded admin and customer accounts.\n" +
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

  // --- full catalogue -----------------------------------------------------
  await Category.insertMany(
    categories.map((c) => ({
      ...c,
      slug: slugify(c.name.toLowerCase()),
      productCount: 0,
    }))
  );

  const categoryIdByName = new Map(
    (await Category.find().select("name")).map((c) => [c.name, c._id])
  );

  const dropped = [];
  const catalogue = products.flatMap((p) => {
    const categoryId = categoryIdByName.get(p.categoryName);
    if (!categoryId) {
      dropped.push(`${p.name} (no category "${p.categoryName}")`);
      return [];
    }
    return [
      {
        name: p.name,
        slug: slugify(p.name.toLowerCase()),
        description: p.description,
        price: p.price,
        thumbnailImage: p.thumbnailImage,
        category: categoryId,
        variants: p.variants,
        shipping: true,
        isActive: true,
      },
    ];
  });

  await Product.insertMany(catalogue);

  if (dropped.length) {
    console.warn(
      `WARNING: ${dropped.length} catalogue product(s) dropped - a categoryName ` +
        `in seedProducts.js has no match in seedCategories.js:\n` +
        dropped.map((d) => `  - ${d}`).join("\n")
    );
  }

  // --- edge-case products -------------------------------------------------
  //
  // Kept alongside the catalogue rather than replaced by it. These three exist
  // to exercise paths the real products do not: an out-of-stock variant, and a
  // document carrying the legacy array-shaped `ratings` field.
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

  const [productCount, categoryCount] = await Promise.all([
    Product.countDocuments(),
    Category.countDocuments(),
  ]);
  console.log(
    `seeded ${productCount} products across ${categoryCount} categories`
  );

  // --- shipping regions ---------------------------------------------------
  //
  // Without these the checkout region dropdown is empty and createOrder
  // rejects every attempt with "Invalid shipping region", so a seeded store
  // that cannot take an order is not much of a store.
  await ShippingRate.deleteMany({});
  await ShippingRate.insertMany(DEFAULT_SHIPPING_RATES);
  console.log(
    `seeded ${DEFAULT_SHIPPING_RATES.length} shipping regions: ` +
      DEFAULT_SHIPPING_RATES.map((r) => `${r.region} (${r.cost})`).join(", ")
  );

  // --- superadmin ---------------------------------------------------------
  //
  // Skipped rather than fatal when unconfigured: someone who has just copied
  // .env.example should still end up with a catalogue to look at, and be told
  // plainly why they cannot sign in yet.
  if (!superAdminEmail || !superAdminPassword || !superAdminPhone) {
    console.log(
      "skipped admin: set SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD and " +
        "SUPER_ADMIN_PHONE in backend/.env"
    );
  } else {
    await Admin.deleteMany({
      $or: [{ email: superAdminEmail }, { phone: superAdminPhone }],
    });

    // Admin passwords are hashed by the caller. adminModel's pre-save hook
    // only validates the composition rule, it never hashes - passing plaintext
    // here would store it in the clear and login would then fail against it.
    const salt = await bcrypt.genSalt(10);
    await Admin.create({
      name: "Super Admin",
      email: superAdminEmail,
      password: await bcrypt.hash(superAdminPassword, salt),
      phone: superAdminPhone,
      role: "superadmin",
    });

    console.log(`seeded admin: ${superAdminEmail} (password: SUPER_ADMIN_PASSWORD in backend/.env)`);
  }

  // --- verified customer --------------------------------------------------
  if (!defaultUserPassword) {
    console.log(
      "skipped customer: set DEFAULT_USER_PASSWORD in backend/.env"
    );
  } else {
    await User.deleteMany({
      $or: [{ email: USER_EMAIL }, { phone: USER_PHONE }],
    });

    try {
      // Plaintext on purpose here: userModel's pre-save hook does the hashing,
      // and passing an already-hashed value would double-hash it.
      await User.create({
        name: "Verified User",
        email: USER_EMAIL,
        password: defaultUserPassword,
        phone: USER_PHONE,
        addresses: [
          {
            street: "Test Street 1",
            city: "Test City",
            state: "Test State",
            postalCode: "12345",
            isDefault: true,
          },
        ],
        verificationStatus: { email: true, phone: true },
      });

      console.log(`seeded customer: ${USER_EMAIL} (password: DEFAULT_USER_PASSWORD in backend/.env)`);
    } catch (error) {
      // The schema enforces the shared password rule, so a DEFAULT_USER_PASSWORD
      // that does not meet it fails here with a Mongoose validation message that
      // does not say which variable is at fault. Name it.
      if (error.name === "ValidationError" && error.errors?.password) {
        console.log(
          "skipped customer: DEFAULT_USER_PASSWORD does not meet the password " +
            "rule (8+ characters with an uppercase letter, a lowercase letter " +
            "and a number). Products and the admin account were still seeded."
        );
      } else {
        throw error;
      }
    }
  }

  await mongoose.disconnect();
})().catch((e) => {
  console.error("seed failed:", e.message);
  process.exit(1);
});
