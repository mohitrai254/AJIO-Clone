// src/pages/ProductNotFound.jsx
import React, { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "../components/product/ProductCard";

/**
 * ProductNotFound page
 * - reads "search" query param to display the searched term
 * - shows recently viewed items (read from localStorage keys)
 */

function readLS(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

export default function ProductNotFound() {
  const [params] = useSearchParams();
  const searchQuery = params.get("search") || "";

  // prefer a dedicated 'recent' list, then fallback to cart / wishlist
  const recentItems = useMemo(() => {
    const candidates = [
      ...readLS("ajio_clone_recent"),
      ...readLS("ajio_clone_cart_v1"),
      ...readLS("ajio_clone_wishlist_v1"),
    ];

    // normalize to product-like objects (in case cart entries contain qty etc.)
    const normalized = candidates
      .map((it) => {
        if (!it) return null;
        // if item has nested product, try to extract
        // but most items in your app should already be product objects
        const product = it.product || it.p || it;
        return product;
      })
      .filter(Boolean);

    // dedupe by id
    const seen = new Set();
    const unique = [];
    for (const p of normalized) {
      const id =
        p._id || p.id || p.productId || p.product_id || JSON.stringify(p);
      if (!seen.has(id)) {
        seen.add(id);
        unique.push(p);
      }
      if (unique.length >= 8) break;
    }

    return unique;
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Message box */}
      <div className="bg-white border rounded shadow-sm p-8">
        <div className="border-4 border-amber-100 rounded p-8 bg-amber-50/30">
          <h2 className="text-2xl lg:text-3xl font-serif text-gray-800 text-center">
            Sorry! We couldn't find any matching items for
          </h2>

          <div className="mt-6 text-center">
            <div className="text-2xl lg:text-4xl font-bold text-gray-800 tracking-tight">
              {searchQuery ? (
                <span className="inline-block px-2 py-1 bg-white rounded">
                  {searchQuery}
                </span>
              ) : (
                <span className="inline-block px-2 py-1 bg-white rounded">
                  your search
                </span>
              )}
            </div>

            <div className="mx-auto mt-3 w-20 h-0.5 bg-amber-200" />

            <p className="mt-4 text-sm text-gray-500">
              Don't give up — check the spelling, try less specific search terms
              or browse through categories.
            </p>
          </div>
        </div>

        {/* Recently Viewed */}
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-gray-700 mb-6 text-center">
            Recently Viewed
          </h3>

          {recentItems && recentItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {recentItems.slice(0, 4).map((p) => (
                <div
                  key={p._id || p.id || p.productId || JSON.stringify(p)}
                  className="flex"
                >
                  <ProductCard p={p} compact={false} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-6">
                No recently viewed items yet.
              </p>
              <Link
                to="/"
                className="inline-block bg-amber-700 hover:bg-amber-800 text-white px-6 py-2 rounded font-medium"
              >
                Continue Shopping
              </Link>

              {/* small placeholder grid so the layout matches the screenshot */}
              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white border rounded-lg p-4 flex flex-col items-center text-sm text-gray-700 shadow-sm"
                  >
                    <div className="w-full h-44 bg-gray-100 rounded overflow-hidden flex items-center justify-center mb-4">
                      <svg
                        className="w-16 h-16 text-gray-300"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M3 3h18v18H3z"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="font-semibold text-xs text-amber-700 mb-1 truncate">
                      Brand Name
                    </div>
                    <div className="text-xs text-gray-600 mb-2 text-center">
                      Product title goes here
                    </div>
                    <div className="text-sm font-semibold text-gray-800">
                      ₹999
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Sale Price ₹899
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
