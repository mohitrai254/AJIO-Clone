// src/pages/PaymentPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api"; // your axios instance

const CART_KEY = "ajio_clone_cart_v1";
const DELIVERY_FEE = 99;
const PLATFORM_FEE = 29;

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

const BACKEND_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * call backend to create PayU payment, then build+submit form to PayU test endpoint
 */
async function submitPayU({
  amount,
  firstname,
  email,
  phone,
  productinfo,
  extra = {},
}) {
  const url = `${BACKEND_BASE.replace(/\/$/, "")}/payu/create-payment`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount,
      firstname,
      email,
      phone,
      productinfo,
      ...extra,
    }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(
      err.error || `Failed to create PayU payment (${resp.status})`
    );
  }

  const json = await resp.json();
  if (!json.ok || !json.data)
    throw new Error("Invalid response from payment server");

  const { data } = json;
  const { action, ...fields } = data;

  const form = document.createElement("form");
  form.method = "POST";
  form.action = action;
  form.style.display = "none";

  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value ?? "";
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [active, setActive] = useState("card"); // card | netbanking | wallet | upi | emi | cod
  const [loadingPayment, setLoadingPayment] = useState(false);

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

  const subtotal = useMemo(
    () =>
      items.reduce(
        (s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 1),
        0
      ),
    [items]
  );
  const convenienceFee = DELIVERY_FEE + PLATFORM_FEE;
  const orderTotal = Math.max(0, subtotal) + convenienceFee;

  // visual-only local state (users cannot change these because inputs are disabled)
  const [card, setCard] = useState({
    number: "",
    name: "",
    month: "",
    year: "",
    cvv: "",
  });
  const [upiId] = useState("");
  const [selectedBank] = useState(null);
  const [selectedWallet] = useState(null);
  const [selectedEmiBank] = useState(null);

  // handle Pay / Place order button
  const handlePayClick = async () => {
    if (loadingPayment) return;

    if (active === "cod") {
      // COD flow: create order on backend, clear cart, navigate to success page
      try {
        setLoadingPayment(true);

        const itemsPayload = items.map((it) => ({
          productId: it.productId ?? it.id ?? it._id ?? null,
          productObjectId: it._id || null,
          name: it.name,
          brand: it.brand,
          price: Number(it.price || 0),
          qty: Number(it.qty || 1),
          imageUrl: it.imageUrl || it.sideImageUrl || it.backImageUrl || "",
        }));

        const shippingAddress = JSON.parse(
          localStorage.getItem("ajio_clone_address_v1") || "null"
        );
        const user = JSON.parse(localStorage.getItem("ajioUser") || "null");

        const clientOrderId = `COD-${Date.now()}`;

        const payload = {
          orderId: clientOrderId,
          txnId: null,
          amount: orderTotal,
          status: "placed",
          paymentMethod: "cod",
          paymentRaw: { source: "frontend-cod" },
          items: itemsPayload,
          user: user
            ? {
                id: user.id || user._id || null,
                phone: user.phone || user.mobile || null,
                email: user.email || null,
                name: user.name || null,
              }
            : null,
          shippingAddress: shippingAddress || null,
          meta: { savedFrom: "frontend/payment-page-cod" },
        };

        const resp = await api.post("/orders", payload);
        const savedOrder = resp?.data?.order;

        // clear cart locally
        try {
          localStorage.removeItem(CART_KEY);
        } catch (e) {}

        // navigate to PaymentSuccess route and pass query params used by that page
        const query = new URLSearchParams({
          orderId: savedOrder?.orderId || savedOrder?._id || payload.orderId,
          txnid: savedOrder?.txnId || "",
          amount: String(savedOrder?.amount || payload.amount || orderTotal),
          status: "success",
          fromFrontend: "true", // flag so PaymentSuccess does not save again
        }).toString();

        navigate(`/payment-success?${query}`);
        return;
      } catch (err) {
        console.error("COD order error:", err);
        alert(
          err.response?.data?.message ||
            err.message ||
            "Failed to place COD order"
        );
        return;
      } finally {
        setLoadingPayment(false);
      }
    }

    // non-COD: directly start PayU hosted flow (we do NOT validate local inputs)
    try {
      setLoadingPayment(true);

      const user = JSON.parse(localStorage.getItem("ajioUser") || "null");
      const customerName =
        (user && (user.name || user.fullName)) || card.name || "Customer";
      const customerEmail = (user && user.email) || "customer@example.com";
      const customerPhone = (user && (user.phone || user.mobile)) || "";

      const extra = {
        udf1: active,
        selectedBank: selectedBank || undefined,
        selectedWallet: selectedWallet || undefined,
        selectedEmiBank: selectedEmiBank || undefined,
        upiHint: upiId ? "provided" : undefined,
      };

      await submitPayU({
        amount: orderTotal,
        firstname: customerName,
        email: customerEmail,
        phone: customerPhone,
        productinfo: `AJIO Clone Order - ${items.length} items`,
        extra,
      });
    } catch (err) {
      console.error("Payment start error:", err);
      alert(err.message || "Payment initiation failed");
    } finally {
      setLoadingPayment(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-6">
        Select &nbsp; <span className="whitespace-nowrap">Payment Mode</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex border rounded overflow-hidden">
            <nav className="w-64 flex-shrink-0 bg-white border-r">
              {[
                { id: "card", label: "Credit/ Debit Card" },
                { id: "netbanking", label: "NetBanking" },
                { id: "wallet", label: "Wallet" },
                { id: "upi", label: "UPI" },
                { id: "emi", label: "EMI" },
                { id: "cod", label: "Cash on Delivery" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  className={`w-full text-left px-4 py-4 border-b last:border-b-0 ${
                    active === t.id
                      ? "bg-gray-50 border-l-2 border-amber-700 font-semibold"
                      : "text-gray-700"
                  }`}
                  type="button"
                >
                  {t.label}
                </button>
              ))}
            </nav>

            <div className="flex-1 min-w-0 p-6 bg-white">
              {/* CARD - disabled inputs */}
              {active === "card" && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">Add New Card</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-1">Card Number</label>
                      <input
                        value={card.number}
                        onChange={(e) =>
                          setCard((c) => ({ ...c, number: e.target.value }))
                        }
                        placeholder="1234 5678 9012 3456"
                        className="w-full border rounded px-3 py-2 bg-gray-50 cursor-not-allowed"
                        inputMode="numeric"
                        readOnly
                        disabled
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1">Name on Card</label>
                      <input
                        value={card.name}
                        onChange={(e) =>
                          setCard((c) => ({ ...c, name: e.target.value }))
                        }
                        className="w-full border rounded px-3 py-2 bg-gray-50 cursor-not-allowed"
                        placeholder="Mohit Rai"
                        readOnly
                        disabled
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-sm mb-1">
                          Expiration Date
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={card.month}
                            onChange={(e) =>
                              setCard((c) => ({ ...c, month: e.target.value }))
                            }
                            className="border rounded px-3 py-2 bg-gray-50 cursor-not-allowed"
                            disabled
                          >
                            <option value="">Month</option>
                            {Array.from({ length: 12 }, (_, i) => (
                              <option
                                key={i + 1}
                                value={String(i + 1).padStart(2, "0")}
                              >
                                {String(i + 1).padStart(2, "0")}
                              </option>
                            ))}
                          </select>
                          <select
                            value={card.year}
                            onChange={(e) =>
                              setCard((c) => ({ ...c, year: e.target.value }))
                            }
                            className="border rounded px-3 py-2 bg-gray-50 cursor-not-allowed"
                            disabled
                          >
                            <option value="">Year</option>
                            {Array.from({ length: 12 }, (_, i) => {
                              const y = new Date().getFullYear() + i;
                              return (
                                <option key={y} value={y}>
                                  {y}
                                </option>
                              );
                            })}
                          </select>
                          <input
                            value={card.cvv}
                            onChange={(e) =>
                              setCard((c) => ({ ...c, cvv: e.target.value }))
                            }
                            placeholder="CVV"
                            className="w-24 border rounded px-3 py-2 bg-gray-50 cursor-not-allowed"
                            inputMode="numeric"
                            readOnly
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" disabled />
                      <span className="text-gray-400">
                        Save this card securely
                      </span>
                    </label>

                    <div className="mt-6">
                      <button
                        onClick={handlePayClick}
                        type="button"
                        disabled={loadingPayment}
                        className="px-6 py-3 bg-amber-700 text-white font-semibold rounded shadow disabled:opacity-60"
                      >
                        {loadingPayment
                          ? "Redirecting to payment..."
                          : `PAY ₹${orderTotal.toFixed(2)} SECURELY`}
                      </button>
                      <div className="mt-2 text-xs text-gray-500">
                        By placing this order, you agree to AJIO's T&C
                      </div>
                      <div className="mt-1 text-sm text-amber-700">
                        You will be redirected to the payment gateway to enter
                        secure details.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* NETBANKING - visual-only options (not selectable) */}
              {active === "netbanking" && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">Select Bank</h2>
                  <div className="flex flex-wrap gap-6 items-center">
                    {["HDFC", "SBI", "ICICI", "AXIS", "Kotak"].map((b) => (
                      <div
                        key={b}
                        className="flex flex-col items-center gap-2 p-4 w-28 text-center border rounded bg-gray-50 cursor-not-allowed"
                        title="Bank selection will be done on the payment gateway"
                      >
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                          {b[0]}
                        </div>
                        <div className="text-sm">{b}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={handlePayClick}
                      disabled={loadingPayment}
                      type="button"
                      className="px-6 py-3 bg-amber-700 text-white font-semibold rounded shadow disabled:opacity-60"
                    >
                      {loadingPayment
                        ? "Redirecting to payment..."
                        : `PAY ₹${orderTotal.toFixed(2)} SECURELY`}
                    </button>
                    <div className="mt-2 text-xs text-gray-500">
                      By placing this order, you agree to AJIO's T&C
                    </div>
                    <div className="mt-1 text-sm text-amber-700">
                      Bank selection will be done on the payment gateway.
                    </div>
                  </div>
                </div>
              )}

              {/* WALLET - visual-only */}
              {active === "wallet" && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">Select Wallet</h2>
                  <div className="flex gap-8 items-center">
                    {["Paytm", "PhonePe", "Mobikwik"].map((w) => (
                      <div
                        key={w}
                        className="flex flex-col items-center gap-2 p-2 w-32 text-center border rounded bg-gray-50 cursor-not-allowed"
                        title="Wallet selection will be done on the payment gateway"
                      >
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                          {w[0]}
                        </div>
                        <div className="text-sm">{w}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={handlePayClick}
                      disabled={loadingPayment}
                      type="button"
                      className="px-6 py-3 bg-amber-700 text-white font-semibold rounded shadow disabled:opacity-60"
                    >
                      {loadingPayment
                        ? "Redirecting to payment..."
                        : `PAY ₹${orderTotal.toFixed(2)} SECURELY`}
                    </button>
                    <div className="mt-2 text-xs text-gray-500">
                      By placing this order, you agree to AJIO's T&C
                    </div>
                    <div className="mt-1 text-sm text-amber-700">
                      Wallet selection will be done on the payment gateway.
                    </div>
                  </div>
                </div>
              )}

              {/* UPI - disabled input */}
              {active === "upi" && (
                <div className="flex gap-8">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold mb-4">
                      Enter your UPI ID
                    </h2>
                    <p className="text-sm text-gray-500 mb-3">
                      UPI details will be entered on the secure payment gateway.
                    </p>

                    <input
                      value={upiId}
                      placeholder="1234567890@upi"
                      className="w-full border rounded px-3 py-2 mb-3 bg-gray-50 cursor-not-allowed"
                      readOnly
                      disabled
                    />
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" disabled />
                      <span className="text-gray-400">
                        Save this UPI ID for faster checkout
                      </span>
                    </label>

                    <div className="mt-6">
                      <button
                        onClick={handlePayClick}
                        disabled={loadingPayment}
                        type="button"
                        className="px-6 py-3 bg-amber-700 text-white font-semibold rounded shadow disabled:opacity-60"
                      >
                        {loadingPayment
                          ? "Redirecting to payment..."
                          : `PAY ₹${orderTotal.toFixed(2)} SECURELY`}
                      </button>
                      <div className="mt-2 text-xs text-gray-500">
                        By placing this order, you agree to AJIO's T&C
                      </div>
                      <div className="mt-1 text-sm text-amber-700">
                        You will be redirected to the payment gateway to
                        complete the UPI payment.
                      </div>
                    </div>
                  </div>

                  <div className="w-48 flex-shrink-0 border-l pl-6">
                    <h3 className="text-sm font-semibold mb-4">Scan QR Code</h3>
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded">
                      <span className="text-sm text-gray-400">
                        QR Placeholder
                      </span>
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        className="px-4 py-2 border rounded"
                        disabled
                      >
                        SHOW QR CODE
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* EMI - visual-only */}
              {active === "emi" && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">
                    Select Bank for EMI
                  </h2>
                  <div className="flex flex-wrap gap-6 items-start">
                    {["HDFC EMI", "SBI EMI", "Axis EMI", "ICICI EMI"].map(
                      (b) => (
                        <div
                          key={b}
                          className="flex flex-col items-center gap-2 p-4 w-36 text-center border rounded bg-gray-50 cursor-not-allowed"
                          title="EMI selection will be done on the payment gateway"
                        >
                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                            {b[0]}
                          </div>
                          <div className="text-sm">{b}</div>
                        </div>
                      )
                    )}
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={handlePayClick}
                      disabled={loadingPayment}
                      type="button"
                      className="px-6 py-3 bg-amber-700 text-white font-semibold rounded shadow disabled:opacity-60"
                    >
                      {loadingPayment
                        ? "Redirecting to payment..."
                        : `PAY ₹${orderTotal.toFixed(2)} SECURELY`}
                    </button>
                    <div className="mt-2 text-xs text-gray-500">
                      By placing this order, you agree to AJIO's T&C
                    </div>
                    <div className="mt-1 text-sm text-amber-700">
                      EMI selection will be done on the payment gateway.
                    </div>
                  </div>
                </div>
              )}

              {/* COD */}
              {active === "cod" && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">
                    Cash on Delivery
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Pay with cash at the time of delivery. Note: COD may not be
                    available for some pin codes or items.
                  </p>

                  <div className="mt-6">
                    <button
                      onClick={handlePayClick}
                      type="button"
                      className="px-6 py-3 bg-amber-700 text-white font-semibold rounded shadow"
                    >
                      {loadingPayment
                        ? "Placing order..."
                        : "PLACE ORDER - CASH ON DELIVERY"}
                    </button>
                    <div className="mt-2 text-xs text-gray-500">
                      By placing this order, you agree to AJIO's T&C
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="border rounded p-4 bg-white">
          <div className="mb-4">
            <div className="text-sm text-gray-600 font-semibold mb-2">
              Order Details
            </div>

            <div className="mt-2 flex justify-between">
              <div>Bag total</div>
              <div>₹{subtotal.toFixed(2)}</div>
            </div>

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
                ₹{orderTotal.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            By placing this order, you agree to AJIO's T&C
          </div>
        </aside>
      </div>
    </div>
  );
}
