// backend/src/controllers/orderController.js
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Order = require("../models/Order");

function normalizeStatus(providerStatus) {
  const s = (providerStatus || "").toString().trim().toLowerCase();
  if (!s) return "pending";
  const successVals = new Set(["success", "ok", "paid", "completed", "done"]);
  const failedVals = new Set([
    "failed",
    "failure",
    "declined",
    "cancelled",
    "cancel",
  ]);
  if (successVals.has(s)) return "placed";
  if (failedVals.has(s)) return "failed";
  return s || "pending";
}

exports.createOrder = async (req, res) => {
  try {
    const payload = req.body || {};

    if (
      !payload.amount ||
      !payload.items ||
      !Array.isArray(payload.items) ||
      payload.items.length === 0
    ) {
      return res.status(400).json({
        message: "Invalid order payload: amount and items are required",
      });
    }

    // Debug logging (temporary — remove in production)
    console.log("createOrder:", {
      ip: req.ip,
      ua: req.get("User-Agent"),
      orderId: payload.orderId || payload.order_id,
      txnId: payload.txnId || payload.txnid || payload.transactionId,
      time: new Date().toISOString(),
    });

    const txnId =
      payload.txnId || payload.txnid || payload.transactionId || null;
    const orderId = payload.orderId || payload.order_id || null;

    // prepare items and normalized fields
    const items = (payload.items || []).map((it) => ({
      productId: it.productId ?? it.id ?? it._id ?? null,
      productObjectId: it.productObjectId || it._id || null,
      name: it.name || it.productName || "",
      brand: it.brand || "",
      price: Number(it.price || 0),
      qty: Number(it.qty || 1),
      imageUrl: it.imageUrl || it.image || "",
    }));

    const providerStatus =
      payload.status || payload.paymentStatus || payload.providerStatus || "";
    const status = normalizeStatus(providerStatus);

    // Normalize user
    let userField = null;
    if (payload.user && typeof payload.user === "object") {
      const u = {
        phone: payload.user.phone || payload.user.mobile || null,
        email: payload.user.email || null,
        name: payload.user.name || null,
      };
      const candidateId = payload.user.id || payload.user._id || null;
      if (candidateId && mongoose.isValidObjectId(candidateId))
        u.id = candidateId;
      else if (candidateId) u.rawId = String(candidateId);
      userField = u;
    }

    // Document fields to set (later calls overwrite these)
    const setFields = {
      amount: Number(payload.amount || 0),
      currency: payload.currency || "INR",
      status,
      paymentMethod: payload.paymentMethod || payload.method || "unknown",
      paymentRaw: payload.paymentRaw || payload.providerResponse || null,
      items,
      user: userField || null,
      shippingAddress: payload.shippingAddress || null,
      meta: payload.meta || null,
      notes: payload.notes || null,
      createdAtProvider: payload.createdAtProvider
        ? new Date(payload.createdAtProvider)
        : undefined,
      // keep orderId/txnId
      orderId: orderId || undefined,
      txnId: txnId || undefined,
    };

    // Build a filter so we update an existing doc that has the same txnId OR the same orderId.
    let filter = null;
    if (txnId && orderId) {
      filter = { $or: [{ txnId }, { orderId }] };
    } else if (txnId) {
      filter = { $or: [{ txnId }, { orderId: { $exists: true, $ne: null } }] };
    } else if (orderId) {
      filter = { orderId };
    }

    if (filter) {
      const opts = { new: true, upsert: true, setDefaultsOnInsert: true };
      const update = {
        $set: setFields,
        $setOnInsert: { createdAt: new Date() },
      };

      const updated = await Order.findOneAndUpdate(filter, update, opts).lean();
      return res.json({ ok: true, order: updated, duplicateHandled: true });
    } else {
      const created = await Order.create({
        orderId: orderId || null,
        txnId: txnId || null,
        ...setFields,
      });
      return res.json({ ok: true, order: created, createdWithoutIdKey: true });
    }
  } catch (err) {
    console.error("createOrder error:", err && err.stack ? err.stack : err);
    if (err && err.code === 11000) {
      try {
        const txn = req.body.txnId || req.body.txnid || req.body.transactionId;
        const ord = req.body.orderId || req.body.order_id;
        const f = txn ? { txnId: txn } : ord ? { orderId: ord } : null;
        if (f) {
          const existing = await Order.findOne(f).lean();
          if (existing)
            return res.json({
              ok: true,
              order: existing,
              duplicateHandled: true,
            });
        }
      } catch (e) {
        console.error("Error fetching existing after 11000:", e);
      }
    }
    return res
      .status(500)
      .json({ ok: false, message: "Server error", error: err.message });
  }
};

/**
 * GET /api/orders
 * Returns orders for the currently authenticated user.
 * Tries req.user first; if not present, parses Authorization header and verifies JWT.
 */
exports.getOrdersForCurrentUser = async (req, res) => {
  try {
    // Debug: log incoming headers and any req.user (remove in prod)
    console.log(
      "getOrdersForCurrentUser called - headers.authorization:",
      req.headers.authorization ? "[present]" : "[missing]"
    );
    if (req.user)
      console.log("req.user present:", {
        id: req.user.id || req.user._id,
        phone: req.user.phone,
      });

    // Try req.user (if auth middleware populated it)
    let userId = null;
    let userPhone = null;

    if (req.user && typeof req.user === "object") {
      // normalize req.user.id to string if present
      if (req.user.id) {
        userId =
          typeof req.user.id === "string" ? req.user.id : String(req.user.id);
      } else if (req.user._id) {
        userId =
          typeof req.user._id === "string"
            ? req.user._id
            : String(req.user._id);
      }
      userPhone = req.user.phone || req.user.mobile || userPhone;
    }

    // If still no userId, try to decode Authorization header
    if (!userId) {
      const authHeader = (req.headers.authorization || "").trim();
      if (!authHeader) {
        return res
          .status(401)
          .json({ ok: false, message: "Authorization token required" });
      }

      const [scheme, token] = authHeader.split(" ");
      if (!token || scheme !== "Bearer") {
        return res
          .status(401)
          .json({ ok: false, message: "Invalid authorization header format" });
      }

      const secret = process.env.JWT_SECRET || "dev_jwt_secret_change_me";
      let payload;
      try {
        payload = jwt.verify(token, secret);
      } catch (err) {
        console.error(
          "JWT verify failed:",
          err && err.message ? err.message : err
        );
        return res
          .status(401)
          .json({ ok: false, message: "Invalid or expired token" });
      }

      // normalize payload id
      if (payload && typeof payload === "object") {
        if (payload.id) userId = String(payload.id);
        else if (payload._id) userId = String(payload._id);
        userPhone = userPhone || payload.phone || payload.mobile || null;
        console.log("token payload:", { id: userId, phone: userPhone });
      }
    }

    // Build query conditions to match orders for this user
    const orConditions = [];

    if (userId) {
      // add string match for user.id and rawId
      orConditions.push({ "user.id": String(userId) });
      orConditions.push({ "user.rawId": String(userId) });

      // also add ObjectId match only when userId is a valid ObjectId string
      if (mongoose.isValidObjectId(userId)) {
        try {
          orConditions.push({ "user.id": mongoose.Types.ObjectId(userId) });
        } catch (err) {
          // ignore invalid ObjectId conversion
          console.warn("Skipping ObjectId conversion for userId:", userId);
        }
      }
    }

    if (userPhone) {
      orConditions.push({ "user.phone": String(userPhone) });
      orConditions.push({ "user.mobile": String(userPhone) });
    }

    if (orConditions.length === 0) {
      // no identity — return empty list rather than server error
      return res.status(200).json({ ok: true, data: [] });
    }

    const query = { $or: orConditions };

    // Debug log query shape
    console.log("getOrdersForCurrentUser - query:", JSON.stringify(query));

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
    return res.json({ ok: true, data: orders });
  } catch (err) {
    console.error(
      "getOrdersForCurrentUser error:",
      err && err.stack ? err.stack : err
    );
    return res
      .status(500)
      .json({ ok: false, message: "Server error", error: err.message });
  }
};
