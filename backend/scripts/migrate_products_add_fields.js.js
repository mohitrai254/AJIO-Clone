// backend/scripts/migrate_products_add_fields.js
/**
 * One-time migration:
 * node migrate_products_add_fields.js
 *
 * Ensure MONGO_URI is set (or edit the fallback below).
 */

const mongoose = require("mongoose");
const Product = require("../src/models/Product"); // adjust path if run from different CWD
require("dotenv").config();

const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGO_URL ||
  "mongodb://127.0.0.1:27017/ajio";

function generateProductId(doc) {
  // safe simple id: category prefix + timestamp + random
  const cat = (doc.category || "P")
    .replace(/\s+/g, "")
    .slice(0, 6)
    .toUpperCase();
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 7);
  return `${cat}-${t}-${r}`;
}

/**
 * Provide default short category summaries here.
 * Edit/extend this mapping to suit your categories.
 * Each summary should be ~ 1-3 lines.
 */
const categorySummaries = {
  "Jackets & Coats":
    "Warm and stylish jackets & coats for seasonal layering. Durable fabrics and modern fits suitable for everyday wear.",
  "T-Shirts":
    "Comfortable cotton and blended tees in multiple fits and colours. Perfect for casual daily looks and layering.",
  Shoes:
    "Comfortable and durable footwear across sports and casual categories. Quality soles and good grip for everyday use.",
  // add more categories as needed
};

async function run() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to DB:", MONGO_URI);

    // Using a cursor to avoid loading entire collection to memory
    const cursor = Product.find().cursor();
    let updated = 0;
    for (
      let doc = await cursor.next();
      doc != null;
      doc = await cursor.next()
    ) {
      let changed = false;

      if (!doc.productId) {
        doc.productId = generateProductId(doc);
        changed = true;
      }

      if (
        typeof doc.stockQuantity === "undefined" ||
        doc.stockQuantity === null
      ) {
        doc.stockQuantity = 0;
        changed = true;
      }

      if (!doc.sideImageUrl && doc.imageUrl) {
        doc.sideImageUrl = doc.imageUrl;
        changed = true;
      }

      if (!doc.backImageUrl && doc.imageUrl) {
        doc.backImageUrl = doc.imageUrl;
        changed = true;
      }

      if (
        (!doc.categorySummary || doc.categorySummary.trim() === "") &&
        doc.category
      ) {
        const key = Object.keys(categorySummaries).find(
          (k) => k.toLowerCase() === (doc.category || "").toLowerCase()
        );
        if (key) {
          doc.categorySummary = categorySummaries[key];
        } else {
          // fallback short summary
          doc.categorySummary = `${doc.category} - high quality items across multiple styles.`;
        }
        changed = true;
      }

      if (changed) {
        await doc.save();
        updated++;
        if (updated % 100 === 0) console.log("Updated:", updated);
      }
    }

    console.log("Done. Total updated:", updated);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

run();
