// src/pages/PaymentSuccess.jsx
import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import api from "../api/api"; // your axios instance that already attaches token

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function readCart() {
  try {
    return JSON.parse(localStorage.getItem("ajio_clone_cart_v1") || "[]");
  } catch {
    return [];
  }
}

function readAddress() {
  try {
    return JSON.parse(localStorage.getItem("ajio_clone_address_v1") || "null");
  } catch {
    return null;
  }
}

function readUser() {
  try {
    return JSON.parse(localStorage.getItem("ajioUser") || "null");
  } catch {
    return null;
  }
}

export default function PaymentSuccess() {
  const q = useQuery();
  const orderId = q.get("orderId") || q.get("orderid") || q.get("txnid");
  const txnid = q.get("txnid");
  const amount = Number(q.get("amount") || q.get("amt") || 0);
  const providerStatus = (q.get("status") || "success").toLowerCase();
  const fromFrontend = q.get("fromFrontend") === "true";

  // We'll show a friendly "Placed" status for successful payments
  const displayStatus =
    providerStatus === "success" || providerStatus === "ok"
      ? "Placed"
      : providerStatus;

  const [saving, setSaving] = useState(false);
  const [savedOrder, setSavedOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If the frontend already saved the order (fromFrontend), we don't need to re-save.
    // But if fromFrontend is false, we follow the previous behavior and POST to /orders.
    if (fromFrontend) {
      // Optionally, you may try to fetch the saved order from backend to show its details.
      // Try fetch by orderId (best-effort). If fails, the UI will still show query params.
      (async () => {
        try {
          setSaving(true);
          if (orderId) {
            const resp = await api
              .get(`/orders/by-orderid/${encodeURIComponent(orderId)}`)
              .catch(() => null);
            if (resp?.data?.order) {
              setSavedOrder(resp.data.order);
              // clear cart if not done yet
              try {
                localStorage.removeItem("ajio_clone_cart_v1");
              } catch (e) {}
            }
          }
        } catch (err) {
          console.error("Failed to fetch saved order (fromFrontend):", err);
        } finally {
          setSaving(false);
        }
      })();
      return;
    }

    async function saveOrder() {
      try {
        setSaving(true);
        const items = readCart().map((it) => ({
          productId: it.productId ?? it.id ?? it._id ?? null,
          productObjectId: it._id || null,
          name: it.name,
          brand: it.brand,
          price: Number(it.price || 0),
          qty: Number(it.qty || 1),
          imageUrl: it.imageUrl || it.sideImageUrl || it.backImageUrl || "",
        }));

        const shippingAddress = readAddress();
        const user = readUser();

        const payload = {
          orderId: orderId || `PAYU-${Date.now()}`,
          txnId: txnid || null,
          amount:
            amount || items.reduce((s, i) => s + i.price * (i.qty || 1), 0),
          // set internal status to 'placed' for successful payments
          status:
            providerStatus === "success" || providerStatus === "ok"
              ? "placed"
              : providerStatus,
          paymentMethod: "payu",
          paymentRaw: {
            query: Object.fromEntries(q.entries ? Array.from(q.entries()) : []),
          },
          items,
          user: user
            ? {
                id: user.id || user._id || null,
                phone: user.phone || user.mobile,
                email: user.email || null,
                name: user.name || null,
              }
            : null,
          shippingAddress: shippingAddress || null,
          meta: {
            savedFrom: "frontend/payment-success",
          },
        };

        const resp = await api.post("/orders", payload);
        if (resp?.data?.order) {
          setSavedOrder(resp.data.order);
          try {
            localStorage.removeItem("ajio_clone_cart_v1");
          } catch (e) {}
        } else {
          setError("Server did not return saved order.");
        }
      } catch (err) {
        console.error(
          "Failed to save order:",
          err.response?.data || err.message
        );
        setError(
          err.response?.data?.message || err.message || "Failed to save order"
        );
      } finally {
        setSaving(false);
      }
    }

    saveOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">Payment Completed ✅</h1>

      <div className="bg-white p-6 rounded shadow space-y-3">
        <p>
          Order ID:{" "}
          <strong>{orderId || (savedOrder && savedOrder._id) || "—"}</strong>
        </p>

        {/* Show friendly placed status */}
        <p>
          Order Status:{" "}
          <strong>
            {savedOrder?.status
              ? String(savedOrder.status).charAt(0).toUpperCase() +
                String(savedOrder.status).slice(1)
              : displayStatus}
          </strong>
        </p>

        <p>
          Transaction ID:{" "}
          <strong>{txnid || (savedOrder && savedOrder.txnId) || "—"}</strong>
        </p>
        <p>
          Amount:{" "}
          <strong>₹{amount.toFixed ? amount.toFixed(2) : amount}</strong>
        </p>

        {saving && (
          <div className="text-sm text-gray-600">
            Saving order to database...
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600">
            Error saving order: {error}
          </div>
        )}

        {savedOrder && (
          <>
            <div className="mt-4">
              <h3 className="font-semibold">Order saved</h3>
              <p className="text-sm text-gray-600">
                Order stored with id: <strong>{savedOrder._id}</strong>
              </p>
            </div>

            <div className="mt-3">
              <h4 className="font-semibold">Items</h4>
              <ul className="list-disc ml-5 text-sm">
                {savedOrder.items.map((it, idx) => (
                  <li key={idx}>
                    {it.name} — qty: {it.qty} — ₹{(it.price || 0).toFixed(2)} —
                    productId: {String(it.productId)}
                  </li>
                ))}
              </ul>
            </div>

            {savedOrder.shippingAddress && (
              <div className="mt-3">
                <h4 className="font-semibold">Shipping</h4>
                <div className="text-sm">
                  {savedOrder.shippingAddress.name} —{" "}
                  {savedOrder.shippingAddress.mobile}
                  <div>
                    {savedOrder.shippingAddress.flat},{" "}
                    {savedOrder.shippingAddress.locality}
                  </div>
                  <div>
                    {savedOrder.shippingAddress.city} —{" "}
                    {savedOrder.shippingAddress.pin}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-4">
          <Link to="/" className="text-amber-700 underline">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
