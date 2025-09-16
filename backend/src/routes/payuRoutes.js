// backend/src/routes/payuRoutes.js
const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const Order = require("../models/Order");

const PAYU_KEY = (process.env.PAYU_KEY || "").trim();
const PAYU_SALT = (process.env.PAYU_SALT || "").trim();
const SERVER_BASE = (
  process.env.SERVER_BASE || "http://localhost:5000"
).replace(/\/$/, "");
const CLIENT_URL = (process.env.CLIENT_URL || "http://localhost:5173").replace(
  /\/$/,
  ""
);

// helpers
function generateTxnId() {
  return "T" + Date.now();
}
function generateOrderId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
function sha512(input) {
  return crypto.createHash("sha512").update(input).digest("hex");
}
function formatAmount(a) {
  return Number(a || 0).toFixed(2); // always two decimals
}

/**
 * Build the canonical hash string for the request.
 * We'll produce two variants (5 empties and 6 empties) because PayU docs/accounts sometimes expect different counts.
 */
function buildRequestHashVariants({
  key,
  txnid,
  amountStr,
  productinfo,
  firstname,
  email,
  udf1 = "",
  udf2 = "",
  udf3 = "",
  udf4 = "",
  udf5 = "",
}) {
  // variant A: 5 empty placeholders before SALT (total empties count depends on doc)
  const partsA = [
    key,
    txnid,
    amountStr,
    productinfo,
    firstname,
    email,
    udf1,
    udf2,
    udf3,
    udf4,
    udf5,
    "",
    "",
    "",
    "",
    "", // five empties
    PAYU_SALT,
  ];
  const hashStringA = partsA.join("|");
  const hashA = sha512(hashStringA);

  // variant B: 6 empty placeholders before SALT (older/alternate docs)
  const partsB = [
    key,
    txnid,
    amountStr,
    productinfo,
    firstname,
    email,
    udf1,
    udf2,
    udf3,
    udf4,
    udf5,
    "",
    "",
    "",
    "",
    "",
    "", // six empties
    PAYU_SALT,
  ];
  const hashStringB = partsB.join("|");
  const hashB = sha512(hashStringB);

  return [
    { hashString: hashStringA, hash: hashA, empties: 5 },
    { hashString: hashStringB, hash: hashB, empties: 6 },
  ];
}

/**
 * POST /api/payu/create-payment
 */
router.post("/create-payment", express.json(), async (req, res) => {
  try {
    const {
      amount,
      firstname,
      email,
      phone,
      productinfo,
      udf1,
      udf2,
      udf3,
      udf4,
      udf5,
    } = req.body || {};

    if (!amount || !firstname || !email || !productinfo) {
      return res
        .status(400)
        .json({ ok: false, error: "Missing required fields" });
    }

    const txnid = generateTxnId();
    const amountStr = formatAmount(amount);

    const variants = buildRequestHashVariants({
      key: PAYU_KEY,
      txnid,
      amountStr,
      productinfo,
      firstname,
      email,
      udf1: udf1 || "",
      udf2: udf2 || "",
      udf3: udf3 || "",
      udf4: udf4 || "",
      udf5: udf5 || "",
    });

    // We'll choose variant A by default to send to PayU (most common).
    // If you later find PayU expects the other, flip which one you send.
    const chosen = variants[0];

    // Debug logs (very important for troubleshooting mismatch)
    console.log("[payu] create-payment request body:", req.body);
    console.log("[payu] txnid:", txnid);
    console.log("[payu] amountStr:", amountStr);
    console.log("[payu] Hash variants (A then B):");
    variants.forEach((v, i) => {
      console.log(
        `[payu] variant ${i} empties=${v.empties} hashString:`,
        v.hashString
      );
      console.log(`[payu] variant ${i} hash:`, v.hash);
    });
    console.log("[payu] chosen variant empties:", chosen.empties);

    const data = {
      key: PAYU_KEY,
      txnid,
      amount: amountStr,
      productinfo,
      firstname,
      email,
      phone: phone || "",
      udf1: udf1 || "",
      udf2: udf2 || "",
      udf3: udf3 || "",
      udf4: udf4 || "",
      udf5: udf5 || "",
      surl: `${SERVER_BASE}/api/payu/surl`,
      furl: `${SERVER_BASE}/api/payu/furl`,
      hash: chosen.hash,
      // service_provider: "payu_paisa",
      action: "https://test.payu.in/_payment",
    };

    return res.json({ ok: true, data });
  } catch (err) {
    console.error("[payu] create-payment error:", err);
    return res.status(500).json({ ok: false, error: "server error" });
  }
});

/**
 * POST /api/payu/surl
 * Verify response hash (try a couple of known reverse variants),
 * persist order and redirect to CLIENT_URL/payment-success?...
 */
router.post(
  "/surl",
  express.urlencoded({ extended: true }),
  async (req, res) => {
    try {
      const params = req.body || {};
      console.log("[payu] SURL called with:", params);

      const {
        key = "",
        status = "",
        txnid = "",
        amount = "",
        productinfo = "",
        firstname = "",
        email = "",
        phone = "",
        hash = "",
        udf1 = "",
        udf2 = "",
        udf3 = "",
        udf4 = "",
        udf5 = "",
      } = params;

      const amountStr = formatAmount(amount);

      // Build a couple of reverse hash variants to verify PayU's posted hash.
      // Variant R1 (common): sha512(SALT|status|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
      const rev1 = [
        PAYU_SALT,
        status,
        udf5 || "",
        udf4 || "",
        udf3 || "",
        udf2 || "",
        udf1 || "",
        email || "",
        firstname || "",
        productinfo || "",
        amountStr,
        txnid || "",
        key || "",
      ].join("|");
      const expected1 = sha512(rev1);

      // Variant R2 (if there are extra empty placeholders): sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
      const rev2Parts = [
        PAYU_SALT,
        status,
        "",
        "",
        "",
        "",
        "",
        udf5 || "",
        udf4 || "",
        udf3 || "",
        udf2 || "",
        udf1 || "",
        email || "",
        firstname || "",
        productinfo || "",
        amountStr,
        txnid || "",
        key || "",
      ];
      const expected2 = sha512(rev2Parts.join("|"));

      console.log("[payu] SURL expected1:", expected1);
      console.log("[payu] SURL expected2:", expected2);
      console.log("[payu] SURL received hash:", hash);

      const match = hash === expected1 || hash === expected2;
      if (!match) {
        console.warn("[payu] hash mismatch on SURL - rejecting");
        return res.redirect(
          `${CLIENT_URL}/payment-failed?reason=invalid_signature`
        );
      }

      // create our order record
      const orderId = generateOrderId();
      await Order.create({
        orderId,
        txnid,
        amount: Number(amount || 0),
        status,
        paymentMethod: "PayU",
        customer: { firstname, email, phone },
      });

      const qs = new URLSearchParams({
        orderId,
        txnid,
        amount,
        status,
      }).toString();
      return res.redirect(`${CLIENT_URL}/payment-success?${qs}`);
    } catch (err) {
      console.error("[payu] SURL handler error:", err);
      return res.redirect(`${CLIENT_URL}/payment-failed?reason=server_error`);
    }
  }
);

/**
 * POST /api/payu/furl
 */
router.post("/furl", express.urlencoded({ extended: true }), (req, res) => {
  console.log("[payu] FURL called with:", req.body || {});
  return res.redirect(`${CLIENT_URL}/payment-failed`);
});

module.exports = router;
