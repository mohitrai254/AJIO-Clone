// frontend/src/pages/OrdersPage.jsx
import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/authContext";
import { Link } from "react-router-dom";

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    const fetchOrders = async () => {
      setLoadingOrders(true);
      setError(null);
      try {
        const res = await api.get("/orders");
        const payload = res.data;
        const data = payload?.data ?? payload?.orders ?? payload ?? [];
        setOrders(Array.isArray(data) ? data : [data]);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError(
          err.response?.data?.message || err.message || "Failed to load orders"
        );
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [user, loading]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">My Orders</h1>
      <p className="text-sm text-gray-600 mb-6">
        Track your orders and view order summary
      </p>

      {loadingOrders ? (
        <div>Loading orders...</div>
      ) : error ? (
        <div className="text-red-600">Error: {error}</div>
      ) : orders.length === 0 ? (
        <div className="text-gray-600">You have not placed any orders yet.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="bg-white border rounded p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded overflow-hidden">
                  {o.items && o.items[0] && o.items[0].imageUrl ? (
                    <img
                      src={o.items[0].imageUrl}
                      alt={o.items[0].name || "product image"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">
                        Order ID:{" "}
                        <span className="font-medium">
                          {o.orderId || o.txnId || o._id}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Placed:{" "}
                        <span className="font-medium">
                          {new Date(
                            o.createdAt || o.updatedAt || Date.now()
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm">Status</div>
                      <div className="font-semibold">
                        {(o.status || "pending").charAt(0).toUpperCase() +
                          (o.status || "pending").slice(1)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-sm font-medium">
                      {o.items && o.items[0] ? o.items[0].name : "No item name"}
                    </div>
                    <div className="text-xs text-gray-500">
                      Qty: {o.items && o.items[0] ? o.items[0].qty : "-"}
                    </div>
                    <div className="mt-2 text-sm">
                      Amount:{" "}
                      <span className="font-semibold">
                        ₹{Number(o.amount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    {/* <Link
                      to={`/orders/${encodeURIComponent(o._id)}`}
                      className="text-amber-700 hover:underline text-sm"
                    >
                      View details
                    </Link> */}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
