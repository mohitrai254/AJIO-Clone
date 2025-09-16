// backend/src/routes/productsRoutes.js
const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// meta filters
router.get("/_meta/filters", productController.getFilters);

// list / search / filter
router.get("/", productController.getProducts);

// details
router.get("/:id", productController.getProductById);

module.exports = router;
