// backend/src/routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// create or upsert order
router.post("/", orderController.createOrder);

// get orders for current authenticated user
router.get("/", orderController.getOrdersForCurrentUser);

module.exports = router;
