// backend/src/models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // Core fields (existing)
    name: { type: String, required: true },
    brand: { type: String },
    price: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },

    // existing main image (keep for compatibility)
    imageUrl: { type: String },

    // new images (optional)
    sideImageUrl: { type: String },
    backImageUrl: { type: String },

    // new inventory & identifiers
    productId: { type: String, index: true, unique: true, sparse: true }, // unique recommended but left non-unique to avoid migration collisions; see note
    stockQuantity: { type: Number, default: 0 },

    // category info
    category: { type: String },
    categorySummary: { type: String, default: "" },

    // you can later replace categorySummary with a Category collection and reference
  },
  { timestamps: true, collection: "products" }
);

// If you later want productId to be unique, set unique: true after migration
module.exports = mongoose.model("Product", productSchema);
