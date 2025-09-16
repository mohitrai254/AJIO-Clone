// backend/src/controllers/productController.js
const Product = require("../models/Product");

/**
 * price bucket definitions used here as well
 */
const bucketsDef = [
  { id: "0-499", min: 0, max: 499 },
  { id: "500-1000", min: 500, max: 1000 },
  { id: "1001-1500", min: 1001, max: 1500 },
  { id: "1501-2000", min: 1501, max: 2000 },
  { id: "2001-2500", min: 2001, max: 2500 },
  { id: "2501-999999", min: 2501, max: Number.MAX_SAFE_INTEGER },
];

function findBucket(id) {
  return bucketsDef.find((b) => b.id === id);
}

/**
 * GET /api/products/_meta/filters
 */
exports.getFilters = async (req, res) => {
  try {
    const brandAgg = await Product.aggregate([
      { $group: { _id: "$brand", count: { $sum: 1 } } },
      { $project: { brand: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    // replace the categoryAgg block in getFilters with this
    const categoryAgg = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          summary: { $first: "$categorySummary" },
        },
      },
      { $project: { category: "$_id", count: 1, summary: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    const allPrices = await Product.find({}, { price: 1 }).lean();
    const buckets = bucketsDef.map((b) => {
      const count = allPrices.filter(
        (p) => p.price >= b.min && p.price <= b.max
      ).length;
      return { id: b.id, min: b.min, max: b.max, count };
    });

    return res.json({
      brands: brandAgg,
      categories: categoryAgg,
      priceBuckets: buckets,
    });
  } catch (err) {
    console.error("getFilters error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/**
 * GET /api/products
 * supports query params: category, search, brands (csv), minPrice, maxPrice, priceBucket, sort, page, limit
 */
exports.getProducts = async (req, res) => {
  try {
    const {
      category,
      search,
      brands,
      minPrice,
      maxPrice,
      priceBucket,
      sort,
      page = 1,
      limit = 500,
    } = req.query;

    const q = {};

    if (category) {
      // case-insensitive exact-ish
      q.category = { $regex: `^${category}$`, $options: "i" };
    }

    if (search) {
      const s = search.trim();
      q.$or = [
        { name: { $regex: s, $options: "i" } },
        { brand: { $regex: s, $options: "i" } },
        { category: { $regex: s, $options: "i" } },
      ];
    }

    if (brands) {
      const arr = brands
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean);
      if (arr.length) q.brand = { $in: arr };
    }

    let min = typeof minPrice !== "undefined" ? Number(minPrice) : undefined;
    let max = typeof maxPrice !== "undefined" ? Number(maxPrice) : undefined;

    if (
      priceBucket &&
      typeof min === "undefined" &&
      typeof max === "undefined"
    ) {
      const b = findBucket(priceBucket);
      if (b) {
        min = b.min;
        max = b.max;
      }
    }

    if (typeof min === "number" || typeof max === "number") {
      q.price = {};
      if (typeof min === "number") q.price.$gte = min;
      if (typeof max === "number") q.price.$lte = max;
    }

    const sortObj = {};
    if (sort === "price-asc") sortObj.price = 1;
    else if (sort === "price-desc") sortObj.price = -1;
    else if (sort === "rating") sortObj.rating = -1;
    else if (sort === "newest") sortObj.createdAt = -1;
    else sortObj._id = 1;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const perPage = Math.max(1, Math.min(200, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * perPage;

    const [items, total] = await Promise.all([
      Product.find(q).sort(sortObj).skip(skip).limit(perPage).lean(),
      Product.countDocuments(q),
    ]);

    return res.json({
      meta: {
        total,
        page: pageNum,
        limit: perPage,
        pages: Math.ceil(total / perPage),
      },
      data: items,
    });
  } catch (err) {
    console.error("getProducts error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/**
 * GET /api/products/:id
 */
exports.getProductById = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id).lean();
    if (!p) return res.status(404).json({ message: "Product not found" });
    return res.json(p);
  } catch (err) {
    console.error("getProductById error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};
