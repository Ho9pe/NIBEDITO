// Copies the product catalogue from the cloud database into the local one, so
// development shows the same products as the deployed site.
//
//   docker compose run --rm api node scripts/sync-catalogue.js
//
// Source is the MONGODB_ATLAS_URL written in backend/.env. Target is whatever
// MONGODB_ATLAS_URL resolves to in the environment, which docker compose points
// at the local mongo container. That split is what lets this run with no
// arguments: the file holds the cloud URL, the environment overrides it locally.
//
// Copies the catalogue and the store configuration that goes with it. Accounts,
// carts, orders, payments, reviews and admins are deliberately left alone: that
// is personal and transactional data, and it has no business being on a
// development machine.
//
// Shipping rates matter more than they look. Checkout cannot proceed without
// one, so a local database with none leaves the "Select Shipping Region"
// dropdown empty and the order un-placeable, which reads like a broken page
// rather than missing data.
//
// The source is opened read-only and never written to, and the script refuses to
// write into anything that looks like a hosted cluster.

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const COLLECTIONS = [
  "categories",
  "subcategories",
  "products",
  "shippingrates",
  "coupons",
  "faqs",
];

const isHosted = (uri) => /mongodb\+srv:|\.mongodb\.net/.test(uri || "");

const readFromEnvFile = (key) => {
  try {
    const raw = fs.readFileSync(path.join(__dirname, "..", ".env"), "utf8");
    const line = raw
      .split(/\r?\n/)
      .find((l) => l.trim().startsWith(key));
    if (!line) return null;
    return line
      .slice(line.indexOf("=") + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");
  } catch {
    return null;
  }
};

const describe = (uri) => {
  try {
    const { host, pathname } = new URL(uri);
    return `${host}${pathname}`;
  } catch {
    return "(unparseable)";
  }
};

(async () => {
  const source = process.env.SOURCE_MONGODB_URL || readFromEnvFile("MONGODB_ATLAS_URL");
  const target = process.env.MONGODB_ATLAS_URL;

  if (!source) {
    console.error("No source. Set SOURCE_MONGODB_URL, or put MONGODB_ATLAS_URL in backend/.env.");
    process.exit(1);
  }
  if (!target) {
    console.error("No target. MONGODB_ATLAS_URL is not set in the environment.");
    process.exit(1);
  }
  if (isHosted(target)) {
    console.error(
      "Refusing to run: the target looks like a hosted cluster.\n" +
        `  target: ${describe(target)}\n` +
        "This script replaces collections. It only ever writes to a local database."
    );
    process.exit(1);
  }
  if (source === target) {
    console.error("Refusing to run: source and target are the same database.");
    process.exit(1);
  }

  console.log("from:", describe(source), "(read-only)");
  console.log("to:  ", describe(target));
  console.log("");

  const from = await mongoose.createConnection(source).asPromise();
  const to = await mongoose.createConnection(target).asPromise();

  try {
    for (const name of COLLECTIONS) {
      // The raw driver, not a model: some documents predate the current schema
      // (ratings held an array before it became a number) and would be rejected
      // by validation on the way in. A copy should reproduce what is there.
      const docs = await from.db.collection(name).find({}).toArray();
      await to.db.collection(name).deleteMany({});
      if (docs.length) await to.db.collection(name).insertMany(docs);
      console.log(`${name.padEnd(15)} ${docs.length} copied`);
    }
  } finally {
    await from.close();
    await to.close();
  }

  console.log("\nDone. Re-run this whenever the cloud catalogue changes.");
})().catch((e) => {
  console.error("sync failed:", e.message);
  process.exit(1);
});
