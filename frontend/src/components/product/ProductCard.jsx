// src/components/product/ProductCard.jsx
import React from "react";
import { Link } from "react-router-dom";

const inr = (n) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Math.round(n || 0)
  );

function RatingBadge({ rating }) {
  const cls =
    rating >= 4
      ? "bg-green-100 text-green-700 border-green-200"
      : rating >= 3
      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
      : "bg-red-100 text-red-700 border-red-200";
  return (
    <span
      className={`inline-block text-[10px] px-1 py-0.5 rounded border ${cls}`}
    >
      {rating} ★
    </span>
  );
}

export default function ProductCard({ p, compact = false }) {
  const mrp = Math.max(Math.round((p.price || 0) * 1.8), (p.price || 0) + 1);
  const discountPct = Math.max(
    5,
    Math.min(90, Math.round(((mrp - (p.price || 0)) / mrp) * 100))
  );
  const offerPrice = Math.round((p.price || 0) * 0.6);

  // smaller image box in compact mode
  const imgH = compact ? "h-44" : "h-56";

  // prefer main image, fallback to side/back, then blank
  const imageSrc = p.imageUrl || p.sideImageUrl || p.backImageUrl || "";

  const bgStyle = {
    backgroundImage: imageSrc ? `url(${imageSrc})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center 45%",
    backgroundRepeat: "no-repeat",
  };

  // product detail link path (use _id if available)
  const id = p._id || p.id || p.productId;

  const inStock =
    typeof p.stockQuantity === "number" ? p.stockQuantity > 0 : true;

  return (
    <Link
      to={`/products/${encodeURIComponent(id)}`}
      className="block"
      aria-label={`Open ${p.name}`}
    >
      <div className="bg-white border rounded-md overflow-hidden hover:shadow-sm transition relative">
        <div
          className={`${imgH} bg-white`}
          style={bgStyle}
          aria-hidden="true"
        />
        {/* stock badge top-left
        <div className="absolute top-2 left-2">
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
              inStock
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {inStock ? `In stock (${p.stockQuantity})` : "Out of stock"}
          </span>
        </div> */}
        <div className="px-2 py-1 text-center">
          <p className="text-[10px] font-semibold tracking-wide text-amber-700 uppercase leading-tight">
            {p.brand}
          </p>

          <h3 className="text-[12px] text-gray-800 mt-1 leading-tight line-clamp-2">
            {p.name}
          </h3>

          {p.rating ? (
            <div className="mt-1">
              <RatingBadge rating={p.rating} />
            </div>
          ) : null}

          <div className="mt-1 flex items-baseline justify-center gap-1.5">
            <span className="font-semibold text-[13px] leading-none">
              ₹{inr(p.price)}
            </span>
            <span className="line-through text-gray-400 text-[11px] leading-none">
              ₹{inr(mrp)}
            </span>
            <span className="text-green-600 text-[11px] leading-none">
              ({discountPct}% off)
            </span>
          </div>

          <div className="mt-1 text-[11px] text-green-700 font-medium flex items-center justify-center gap-1 leading-none">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-600" />
            Offer Price: ₹{inr(offerPrice)}
          </div>
        </div>
      </div>
    </Link>
  );
}
