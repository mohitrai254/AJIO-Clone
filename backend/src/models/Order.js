// backend/src/models/Order.js
const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.Mixed }, // numeric productId or ObjectId string
  productObjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: false,
  },
  name: { type: String },
  brand: { type: String },
  price: { type: Number, default: 0 },
  qty: { type: Number, default: 1 },
  imageUrl: { type: String },
});

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String }, // your internal order id (could be PayU orderId or app-generated)
    txnId: { type: String }, // transaction id returned by PayU
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { type: String, default: "pending" }, // pending / success / failed
    paymentMethod: { type: String }, // e.g., card/upi/netbanking/cod
    paymentRaw: { type: Object }, // store provider response if needed

    items: [OrderItemSchema],

    user: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
      phone: { type: String },
      email: { type: String },
      name: { type: String },
    },

    shippingAddress: {
      name: String,
      mobile: String,
      pin: String,
      locality: String,
      flat: String,
      landmark: String,
      city: String,
      state: String,
      tag: String,
    },

    meta: { type: Object }, // any extra fields (udf1 etc)
    notes: { type: String },

    // internal
    createdAtProvider: { type: Date }, // time from provider if present
  },
  { timestamps: true, collection: "orders" }
);

// === Indexes ===
// Partial unique index: only enforces uniqueness when txnId exists and is not null.
// This prevents creating a unique constraint that treats multiple nulls as duplicates.
OrderSchema.index(
  { txnId: 1 },
  {
    unique: true,
    partialFilterExpression: { txnId: { $exists: true, $ne: null } },
  }
);

// Similarly for orderId (if you want to ensure uniqueness there as well)
OrderSchema.index(
  { orderId: 1 },
  {
    unique: true,
    partialFilterExpression: { orderId: { $exists: true, $ne: null } },
  }
);

// Optional: index status / createdAt for queries
OrderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Order", OrderSchema);
