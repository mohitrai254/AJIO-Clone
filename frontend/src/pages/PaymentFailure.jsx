// src/pages/PaymentFailure.jsx
import React from "react";
import { useLocation, Link } from "react-router-dom";

export default function PaymentFailure() {
  const q = new URLSearchParams(useLocation().search);
  const status = q.get("status") || "failure";
  const txnid = q.get("txnid") || "";
  const amount = q.get("amount") || "";

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">Payment Failed ❌</h1>
      <div className="bg-white p-6 rounded shadow">
        <p className="mb-2">
          Status: <strong>{status}</strong>
        </p>
        <p className="mb-2">
          Transaction ID: <strong>{txnid}</strong>
        </p>
        <p className="mb-2">
          Amount: <strong>₹{amount}</strong>
        </p>
        <div className="mt-4">
          <Link to="/payment" className="text-amber-700 underline">
            Try another method
          </Link>
        </div>
      </div>
    </div>
  );
}
