// src/pages/CartPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const CART_KEY = "ajio_clone_cart_v1";
const WISHLIST_KEY = "ajio_clone_wishlist_v1";

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}
function write(key, v) {
  localStorage.setItem(key, JSON.stringify(v || []));
}

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, amount }
  const [couponError, setCouponError] = useState("");
  const navigate = useNavigate();

  // fixed convenience fee breakdown (you can later pull from server)
  const DELIVERY_FEE = 99;
  const PLATFORM_FEE = 29;

  useEffect(() => {
    setItems(read(CART_KEY));
    const onStorage = () => setItems(read(CART_KEY));
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onStorage);
    };
  }, []);

  const updateQty = (idx, qty) => {
    const next = [...items];
    next[idx] = { ...next[idx], qty };
    write(CART_KEY, next);
    setItems(next);
  };

  const removeItem = (idx) => {
    const next = items.filter((_, i) => i !== idx);
    write(CART_KEY, next);
    setItems(next);
  };

  const moveToWishlist = (idx) => {
    const next = [...items];
    const [item] = next.splice(idx, 1);
    write(CART_KEY, next);
    setItems(next);

    const wl = read(WISHLIST_KEY);
    wl.push(item);
    write(WISHLIST_KEY, wl);

    // notify other tabs/components (note: native storage event doesn't fire in same tab)
    try {
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      // ignore
    }
  };

  const clearCart = () => {
    write(CART_KEY, []);
    setItems([]);
  };

  const subtotal = items.reduce(
    (s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 1),
    0
  );

  // coupon logic: currently only SPECIAL200 -> ₹200 off
  const handleApplyCoupon = () => {
    const code = (couponInput || "").trim().toUpperCase();
    setCouponError("");
    if (!code) {
      setCouponError("Enter coupon code");
      return;
    }
    if (code === "SPECIAL200") {
      const amount = 200;
      setAppliedCoupon({ code, amount });
      setCouponError("");
    } else {
      setAppliedCoupon(null);
      setCouponError("Invalid coupon");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  const couponAmount = appliedCoupon ? appliedCoupon.amount : 0;
  const convenienceFee = DELIVERY_FEE + PLATFORM_FEE;
  const orderTotal = Math.max(0, subtotal - couponAmount) + convenienceFee;

  // AJIO-like brown/gold color
  const ajioGold = "#8a5a1a";

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">My Bag</h1>

      {items.length === 0 ? (
        <div>
          <p>Your cart is empty.</p>
          <Link
            to="/products"
            className="text-amber-700 underline mt-4 inline-block"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: products list */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((it, idx) => (
              <div
                key={idx}
                className="flex gap-4 border rounded p-3 items-center bg-white"
              >
                <img
                  src={it.imageUrl || ""}
                  alt={it.name || "product"}
                  className="w-28 h-28 object-contain"
                />
                <div className="flex-1">
                  <div className="font-semibold">{it.name}</div>
                  <div className="text-sm text-gray-600">{it.brand}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="text-lg font-semibold">
                      ₹{Math.round(Number(it.price) || 0)}
                    </div>
                    <div className="text-sm line-through text-gray-400">
                      ₹{Math.round((Number(it.price) || 0) * 1.8)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div>
                    <label className="text-sm mr-2">Qty</label>
                    <select
                      value={it.qty || 1}
                      onChange={(e) => updateQty(idx, Number(e.target.value))}
                      className="border px-2 py-1 rounded"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => moveToWishlist(idx)}
                      className="text-sm"
                      style={{ color: ajioGold }}
                    >
                      Move to wishlist
                    </button>
                    <button
                      onClick={() => removeItem(idx)}
                      className="text-sm text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center">
              <button onClick={clearCart} className="text-sm text-red-600">
                Clear Bag
              </button>
              <div className="text-right">
                <div className="text-sm text-gray-600">Subtotal</div>
                <div className="text-xl font-semibold">
                  ₹{Math.round(subtotal)}
                </div>
              </div>
            </div>
          </div>

          {/* Right column: price box + coupon */}
          <aside className="border rounded p-4 bg-white">
            <div className="mb-4">
              <div className="text-sm text-gray-600 font-semibold mb-2">
                Order Details
              </div>

              <div className="mt-2 flex justify-between">
                <div>Bag total</div>
                <div>₹{Math.round(subtotal)}</div>
              </div>

              {couponAmount > 0 && (
                <div className="mt-2 flex justify-between text-green-700">
                  <div>Coupon ({appliedCoupon.code})</div>
                  <div>- ₹{Math.round(couponAmount)}</div>
                </div>
              )}

              <div className="mt-2 flex justify-between">
                <div>
                  Convenience Fee{" "}
                  <span className="text-xs text-gray-400">What's this?</span>
                </div>
                <div>₹{convenienceFee}</div>
              </div>

              <div className="mt-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <div>Delivery Fee</div>
                  <div>₹{DELIVERY_FEE}</div>
                </div>
                <div className="flex justify-between">
                  <div>Platform Fee</div>
                  <div>₹{PLATFORM_FEE}</div>
                </div>
              </div>

              <div className="mt-3 border-t pt-3">
                <div className="text-sm">Order Total</div>
                <div className="text-2xl font-semibold">
                  ₹{Math.round(orderTotal)}
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/delivery")}
              className="w-full py-3 rounded font-semibold flex items-center justify-center gap-2"
              style={{ background: ajioGold, color: "white" }}
            >
              Proceed to Shipping
            </button>

            {/* Coupon sits below price box */}
            <div className="mt-4 border-dashed border rounded p-3">
              <div className="text-sm font-semibold mb-2">Apply Coupon</div>

              {!appliedCoupon ? (
                <>
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Enter coupon code"
                      className="border px-3 py-2 rounded w-full text-sm"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="px-3 py-2 rounded text-sm"
                      style={{ background: ajioGold, color: "white" }}
                    >
                      APPLY
                    </button>
                  </div>
                  <div className="mt-3 text-xs text-gray-600">
                    Use <span className="font-medium">SPECIAL200</span> to get
                    ₹200 off.
                  </div>
                  {couponError && (
                    <div className="text-sm text-red-600 mt-2">
                      {couponError}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Coupon applied</div>
                    <div className="text-sm text-green-700">
                      {appliedCoupon.code} - ₹{appliedCoupon.amount} off
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-sm underline text-gray-600"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Example list area similar to AJIO coupons list (static placeholder) */}
              <div className="mt-3 text-xs text-gray-500 max-h-36 overflow-auto pr-2">
                <div className="mb-2">
                  <div className="font-medium">Non - Applicable Coupons</div>
                  <div className="text-xs text-gray-400">
                    GSTRATEDROP - Get Extra 400 off On cart value of ₹3190 &amp;
                    Above.
                  </div>
                </div>
                <div>
                  <div className="font-medium">ALLSTARSFLASH</div>
                  <div className="text-xs text-gray-400">
                    Get Extra 10% off on selected brands.
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
