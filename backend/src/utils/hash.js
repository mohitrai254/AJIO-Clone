// backend/src/utils/hash.js
const crypto = require("crypto");

function sha512(str) {
  return crypto.createHash("sha512").update(String(str), "utf8").digest("hex");
}

module.exports = { sha512 };
