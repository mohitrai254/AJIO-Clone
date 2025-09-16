// src/pages/ProductPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProduct } from "../api/productApi";

const inr = (n) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Math.round(n || 0)
  );

const CART_KEY = "ajio_clone_cart_v1";
const WISHLIST_KEY = "ajio_clone_wishlist_v1";

function readLS(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}
function writeLS(key, items) {
  localStorage.setItem(key, JSON.stringify(items || []));
}

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [qty, setQty] = useState(1);
  const [inCart, setInCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [activeImg, setActiveImg] = useState("");
  const [activeTab, setActiveTab] = useState("returns");

  // NEW: size selection state & error
  const [selectedSize, setSelectedSize] = useState("");
  const [sizeError, setSizeError] = useState("");

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const p = await getProduct(id);
        if (!ignore) {
          setProduct(p);
          setActiveImg(p?.imageUrl || "");
          // pre-select nothing
          setSelectedSize("");
        }
      } catch (e) {
        if (!ignore) setErr(e.message || "Failed to load product");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    // check cart - mark inCart true if any item with same product id exists
    const cart = readLS(CART_KEY);
    setInCart(cart.some((it) => (it._id || it.id) === id));

    const wl = readLS(WISHLIST_KEY);
    setInWishlist(wl.some((it) => (it._id || it.id) === id));

    return () => {
      ignore = true;
    };
  }, [id]);

  const addToCart = () => {
    // Require size selected
    if (!selectedSize) {
      setSizeError("Please select a size to proceed");
      return;
    }
    if (!product || qty <= 0) return;
    const items = readLS(CART_KEY);
    const key = product._id || product.id;
    const exists = items.find(
      (it) => (it._id || it.id) === key && it.selectedSize === selectedSize
    );

    // If same product with same size exists, increase qty, else push new entry (with size)
    if (exists) {
      exists.qty = (exists.qty || 1) + qty;
    } else {
      const itemToAdd = {
        ...(product || {}),
        qty,
        selectedSize,
      };
      items.push(itemToAdd);
    }
    writeLS(CART_KEY, items);
    setInCart(true);
    setSizeError("");
    // do not navigate immediately — button will change to "GO TO CART"
  };

  const handlePrimaryButton = () => {
    if (inCart) {
      // go to cart
      navigate("/cart");
    } else {
      addToCart();
    }
  };

  const toggleWishlist = () => {
    if (!product) return;
    const items = readLS(WISHLIST_KEY);
    const key = product._id || product.id;
    const exists = items.find((it) => (it._id || it.id) === key);
    if (exists) {
      const next = items.filter((it) => (it._id || it.id) !== key);
      writeLS(WISHLIST_KEY, next);
      setInWishlist(false);
    } else {
      items.push({ ...(product || {}) });
      writeLS(WISHLIST_KEY, items);
      setInWishlist(true);
    }
  };

  if (loading)
    return <div className="max-w-6xl mx-auto px-4 py-6">Loading…</div>;
  if (err)
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 text-red-600">
        Error: {err}
      </div>
    );
  if (!product)
    return <div className="max-w-6xl mx-auto px-4 py-6">Product not found</div>;

  const mrp = Math.max(
    Math.round((product.price || 0) * 1.8),
    (product.price || 0) + 1
  );
  const discountPct = Math.max(
    5,
    Math.min(90, Math.round(((mrp - (product.price || 0)) / mrp) * 100))
  );

  // example gallery
  const gallery = [
    product.imageUrl,
    product.backImageUrl,
    product.sideImageUrl,
  ];
  const currentIndex = gallery.indexOf(activeImg);
  const prevImg = () => {
    const idx = (currentIndex - 1 + gallery.length) % gallery.length;
    setActiveImg(gallery[idx]);
  };
  const nextImg = () => {
    const idx = (currentIndex + 1) % gallery.length;
    setActiveImg(gallery[idx]);
  };

  // available sizes - if product.sizes exists use it, otherwise fallback
  const availableSizes =
    product.sizes && product.sizes.length
      ? product.sizes
      : ["S", "M", "L", "XL", "XXL"];

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link to="/">Home</Link> / <Link to="/products">Products</Link> /{" "}
        <span className="text-gray-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Thumbnails */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="flex flex-col gap-3">
            {gallery.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(src)}
                className={`w-20 h-24 rounded border overflow-hidden flex items-center justify-center ${
                  activeImg === src ? "border-amber-600" : "border-gray-200"
                }`}
              >
                <img
                  src={src}
                  alt={`thumb-${i}`}
                  className="max-h-full max-w-full object-contain"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Main Image */}
        <div className="lg:col-span-7 flex items-center justify-center relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <button
              onClick={prevImg}
              className="w-10 h-10 rounded-full bg-white/90 border shadow-sm flex items-center justify-center"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 6L9 12l6 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div
            className="bg-white border rounded p-6 flex items-center justify-center w-full"
            style={{ minHeight: 520 }}
          >
            <img
              src={activeImg}
              alt={product.name}
              className="max-h-[600px] object-contain"
            />
          </div>

          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            <button
              onClick={nextImg}
              className="w-10 h-10 rounded-full bg-white/90 border shadow-sm flex items-center justify-center"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:col-span-4">
          <p className="text-xs text-amber-700 font-semibold uppercase">
            {product.brand}
          </p>
          <h1 className="text-xl md:text-2xl font-medium mt-1">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            <span className="text-2xl font-semibold text-gray-800">
              ₹{inr(product.price)}
            </span>
            <span className="text-gray-400 line-through text-sm">
              ₹{inr(mrp)}
            </span>
            <span className="text-green-600 text-sm font-medium">
              ({discountPct}% OFF)
            </span>
          </div>
          <p className="text-xs text-gray-500">Price inclusive of all taxes</p>

          {/* Offer block */}
          <div className="mt-4">
            <div className="border border-dashed border-gray-300 rounded-sm overflow-hidden">
              <div className="flex">
                <div className="w-28 border-r border-dashed border-gray-300 p-3 text-center text-xs text-amber-700">
                  <div className="text-[10px] uppercase">Offer</div>
                  <div className="font-semibold mt-1">Use Code</div>
                  <div className="font-extrabold">FLASHSALE</div>
                </div>
                <div className="flex-1 p-3 text-sm">
                  <div className="bg-amber-50 px-3 py-1 rounded text-sm inline-block">
                    Get it for{" "}
                    <span className="font-semibold text-amber-700">
                      ₹{Math.round(product.price * 0.6)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    Get Extra 400 off On cart value of 2890 & Above
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Size selector */}
          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-2">Select Size</div>
            <div className="flex items-center gap-3 flex-wrap">
              {availableSizes.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSelectedSize(s);
                    setSizeError("");
                  }}
                  className={`w-10 h-10 rounded-full border text-sm text-gray-700 bg-white flex items-center justify-center shadow-sm ${
                    selectedSize === s
                      ? "border-amber-700 bg-amber-50 font-semibold"
                      : "border-gray-300"
                  }`}
                  type="button"
                >
                  {s}
                </button>
              ))}
            </div>
            {sizeError && (
              <div className="text-sm text-red-600 mt-2">{sizeError}</div>
            )}
          </div>

          {/* Qty selector */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm">Quantity:</span>
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-8 h-8 border rounded flex items-center justify-center"
            >
              -
            </button>
            <span className="px-2">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="w-8 h-8 border rounded flex items-center justify-center"
            >
              +
            </button>
          </div>

          {/* Add to Cart / Wishlist */}
          <div className="mt-5">
            <button
              onClick={handlePrimaryButton}
              className="w-full bg-amber-700 text-white py-3 rounded font-semibold flex items-center justify-center gap-2"
              type="button"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {inCart ? "GO TO CART" : "ADD TO BAG"}
            </button>

            <button
              onClick={toggleWishlist}
              className={`w-full mt-4 py-3 rounded border font-medium ${
                inWishlist
                  ? "bg-red-50 border-red-400 text-red-600"
                  : "border-gray-300 text-gray-700"
              }`}
            >
              {inWishlist ? "SAVED ✔" : "SAVE TO WISHLIST"}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mt-8 border-t pt-6">
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab("returns")}
            className={`px-4 py-2 ${
              activeTab === "returns"
                ? "border-b-2 border-gray-800 font-semibold"
                : "text-gray-600"
            }`}
          >
            RETURNS
          </button>
          <button
            onClick={() => setActiveTab("promise")}
            className={`px-4 py-2 ${
              activeTab === "promise"
                ? "border-b-2 border-gray-800 font-semibold"
                : "text-gray-600"
            }`}
          >
            OUR PROMISE
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-700">
          {activeTab === "returns" ? (
            <p>
              <strong>10 day Return and Exchange</strong> — If you’re not happy
              with your purchase, return it within 10 days.
            </p>
          ) : (
            <p>
              <strong>Our Promise:</strong> Handpicked styles, assured quality
              and reliable service.
            </p>
          )}
        </div>
      </div>

      {/* Product details */}
      <div className="mt-8 text-sm text-gray-700">
        <h3 className="font-semibold mb-2">Product Details</h3>
        <div>Brand: {product.brand}</div>
        <div>Category: {product.category}</div>
        <div>Rating: {product.rating || "N/A"}</div>
      </div>
    </div>
  );
}
