// src/pages/WishlistPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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

export default function WishlistPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(read(WISHLIST_KEY));
    const onStorage = () => setItems(read(WISHLIST_KEY));
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onStorage);
    };
  }, []);

  const remove = (idx) => {
    const next = items.filter((_, i) => i !== idx);
    write(WISHLIST_KEY, next);
    setItems(next);
  };

  const moveToCart = (idx) => {
    const next = [...items];
    const item = next.splice(idx, 1)[0];
    write(WISHLIST_KEY, next);
    setItems(next);

    const cart = read(CART_KEY);
    cart.push({ ...(item || {}), qty: 1 });
    write(CART_KEY, cart);
    window.dispatchEvent(new Event("storage"));
  };

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Saved Items</h1>
        <p>No saved items yet.</p>
        <Link
          to="/products"
          className="text-amber-700 underline mt-4 inline-block"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Saved Items</h1>
      <div className="space-y-4">
        {items.map((it, idx) => (
          <div key={idx} className="flex gap-4 border rounded p-3 items-center">
            <img
              src={it.imageUrl}
              alt={it.name}
              className="w-24 h-24 object-contain"
            />
            <div className="flex-1">
              <div className="font-semibold">{it.name}</div>
              <div className="text-sm text-gray-600">{it.brand}</div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => moveToCart(idx)}
                className="text-amber-700 text-sm"
              >
                Add to bag
              </button>
              <button
                onClick={() => remove(idx)}
                className="text-red-600 text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
