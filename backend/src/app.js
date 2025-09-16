// backend/src/app.js
require("dotenv").config(); // ensure env loaded if app.js is entry or required by entry
const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const payuRoutes = require("./routes/payuRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

// Basic request logger for debugging
app.use((req, res, next) => {
  console.log(`[HTTP] ${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/payu", payuRoutes);
// inside server startup file, after you set app and middlewares and existing routes
// e.g. app.use('/api/products', require('./src/routes/productsRoutes'));

app.use("/api/orders", orderRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

// If request is API and not found -> 404 JSON
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ message: "API route not found" });
  }
  next();
});

module.exports = app;
