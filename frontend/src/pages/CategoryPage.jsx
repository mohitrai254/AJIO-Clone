// src/pages/CategoryPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  useSearchParams,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { brandsData } from "../components/menus/brandsData";
import FiltersSidebar from "../components/FiltersSidebar";
import { getProducts } from "../api/productApi";
import ProductCard from "../components/product/ProductCard";

/** build readable breadcrumbs */
function buildBreadcrumbs(pathname, categoryParam) {
  const parts = (pathname || "")
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);

  const pretty = (seg) =>
    seg
      .replace(/[-_]/g, " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const crumbs = [{ label: "Home", to: "/" }];

  let acc = "";
  parts.forEach((seg) => {
    acc += `/${seg}`;
    crumbs.push({ label: pretty(seg), to: acc });
  });

  if (categoryParam) {
    crumbs.push({ label: pretty(categoryParam), to: null });
  }

  return crumbs;
}

// helper: normalize category strings for robust comparisons
function normalizeCategoryKey(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\&/g, "and")
    .replace(/[-_]/g, " ")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function CategoryPage() {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const categoryParam = params.get("category") || "";
  const searchQuery = (params.get("search") || "").toLowerCase().trim();

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [sortBy, setSortBy] = useState("relevance");

  // selectedBrands stores lowercase brand keys
  const [selectedBrands, setSelectedBrands] = useState(new Set());
  const [selectedPriceBucket, setSelectedPriceBucket] = useState(new Set());
  const [showAllBrands, setShowAllBrands] = useState(false);

  // gridMode: "large" => 3-per-row (default), "compact" => 5-per-row
  const [gridMode, setGridMode] = useState("large");

  // fetch products
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        if (!ignore) setAllProducts(data.data || []);
      } catch (e) {
        if (!ignore) setErr(e.message || "Failed to load products");
        console.error("CategoryPage fetch error:", e);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  // derive facets from allProducts
  const { brandCounts, priceBuckets } = useMemo(() => {
    const bc = {};
    for (const p of allProducts) {
      const brand = (p.brand || "Unknown").trim();
      bc[brand] = (bc[brand] || 0) + 1;
    }

    const brandCountsArr = Object.entries(bc)
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count || a.brand.localeCompare(b.brand));

    const bucketsDef = [
      { id: "0-499", label: "Below Rs.500", min: 0, max: 499 },
      { id: "500-1000", label: "Rs.500-1000", min: 500, max: 1000 },
      { id: "1001-1500", label: "Rs.1001-1500", min: 1001, max: 1500 },
      { id: "1501-2000", label: "Rs.1501-2000", min: 1501, max: 2000 },
      { id: "2001-2500", label: "Rs.2001-2500", min: 2001, max: 2500 },
      { id: "2501-999999", label: "Above Rs.2500", min: 2501, max: Infinity },
    ];
    const buckets = bucketsDef.map((b) => {
      const count = allProducts.filter((p) => {
        const price = Number(p.price || 0);
        return price >= b.min && price <= b.max;
      }).length;
      return { ...b, count };
    });

    return { brandCounts: brandCountsArr, priceBuckets: buckets };
  }, [allProducts]);

  // displayBrands
  const displayBrands = useMemo(() => {
    const pathLower = (location.pathname || "").toLowerCase();
    const keys = Object.keys(brandsData || {});
    let chosenKey = "MEN";

    for (const k of keys) {
      if (pathLower.includes(k.toLowerCase())) {
        chosenKey = k;
        break;
      }
    }

    const fallbackList = brandsData[chosenKey] || [];
    const countsMap = new Map(
      (brandCounts || []).map((b) => [b.brand, b.count])
    );

    const fallbackItems = fallbackList.map((b) => ({
      brand: b,
      count:
        countsMap.get(b) ||
        allProducts.filter((p) => (p.brand || "").trim() === b).length ||
        0,
    }));

    const extra = (brandCounts || []).filter(
      (b) => !fallbackList.includes(b.brand)
    );

    return [...fallbackItems, ...extra];
  }, [brandsData, brandCounts, allProducts, location.pathname, categoryParam]);

  // Apply filters + categoryParam + searchQuery + sorting
  const filtered = useMemo(() => {
    let out = allProducts;

    if (categoryParam) {
      const cKey = normalizeCategoryKey(categoryParam);
      out = out.filter((p) => normalizeCategoryKey(p.category) === cKey);
    }

    if (searchQuery) {
      out = out.filter((p) =>
        (p.name || "").toLowerCase().includes(searchQuery)
      );
    }

    if (selectedBrands.size > 0) {
      out = out.filter((p) =>
        selectedBrands.has((p.brand || "").toLowerCase())
      );
    }

    if (selectedPriceBucket && selectedPriceBucket.size > 0) {
      out = out.filter((p) => {
        const price = Number(p.price || 0);
        for (const id of selectedPriceBucket) {
          const bucket = priceBuckets.find((b) => b.id === id);
          if (!bucket) continue;
          if (price >= bucket.min && price <= bucket.max) return true;
        }
        return false;
      });
    }

    if (sortBy === "price-lowest") {
      out = [...out].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-highest") {
      out = [...out].sort((a, b) => b.price - a.price);
    } else if (sortBy === "ratings") {
      out = [...out].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "discount") {
      const disc = (p) => {
        const mrp = Math.max(
          Math.round((p.price || 0) * 1.8),
          (p.price || 0) + 1
        );
        return (mrp - (p.price || 0)) / mrp || 0;
      };
      out = [...out].sort((a, b) => disc(b) - disc(a));
    } else if (sortBy === "newest") {
      const dateOf = (p) => {
        const d =
          p.createdAt ||
          p.created_at ||
          p.addedAt ||
          p.added_at ||
          p.date ||
          null;
        const t = d ? Date.parse(d) : 0;
        return isNaN(t) ? 0 : t;
      };
      out = [...out].sort((a, b) => dateOf(b) - dateOf(a));
    }

    return out;
  }, [
    allProducts,
    categoryParam,
    searchQuery,
    selectedBrands,
    selectedPriceBucket,
    sortBy,
    priceBuckets,
  ]);

  // If search query exists and no results, redirect
  useEffect(() => {
    if (!loading && !err && searchQuery && filtered.length === 0) {
      navigate("/product-not-found", { replace: true });
    }
  }, [loading, err, searchQuery, filtered, navigate]);

  // helpers
  const toggleBrand = useCallback((lowercaseBrand) => {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(lowercaseBrand)) next.delete(lowercaseBrand);
      else next.add(lowercaseBrand);
      return next;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setSelectedBrands(new Set());
    setSelectedPriceBucket(new Set());
  }, []);

  const title = categoryParam || "All Products";
  const intro = `Versatile and sophisticated, AJIO brings to you a wide range of ${title.toLowerCase()} for men. Browse through curated picks and the latest styles.`;

  // gridClass: "large" => 3 per row on large screens; "compact" => 5 per row on large screens
  const gridClass =
    gridMode === "large"
      ? "grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      : "grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5";

  const breadcrumbs = useMemo(
    () => buildBreadcrumbs(location.pathname, categoryParam),
    [location.pathname, categoryParam]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <nav className="text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
        {breadcrumbs.map((crumb, i) =>
          crumb.to ? (
            <span key={i}>
              <Link to={crumb.to} className="hover:underline">
                {crumb.label}
              </Link>
              {i < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
            </span>
          ) : (
            <span key={i} className="text-gray-700">
              {crumb.label}
            </span>
          )
        )}
      </nav>

      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        <aside className="lg:w-56 flex-shrink-0">
          <FiltersSidebar
            displayBrands={displayBrands}
            showAllBrands={showAllBrands}
            setShowAllBrands={setShowAllBrands}
            selectedBrands={selectedBrands}
            toggleBrand={toggleBrand}
            priceBuckets={priceBuckets}
            selectedPriceBucket={selectedPriceBucket}
            setSelectedPriceBucket={setSelectedPriceBucket}
            clearAllFilters={clearAllFilters}
          />
        </aside>

        <main className="flex-1">
          <header className="mb-6">
            <h1 className="text-3xl font-semibold mb-2">{title}</h1>
            <p className="text-gray-600 mb-4">{intro}</p>

            <div className="bg-white border rounded-md px-4 py-3 flex items-center">
              <div className="flex-1 text-sm text-gray-700">
                <strong>{filtered.length}</strong> Items Found
              </div>

              <div className="flex-none flex items-center gap-3">
                <span className="text-sm text-gray-600 uppercase tracking-wider">
                  GRID
                </span>
                <div className="flex items-center gap-2">
                  {/* grid mode buttons */}
                  <button
                    type="button"
                    onClick={() => setGridMode("large")}
                    aria-pressed={gridMode === "large"}
                    title="Show 3 per row"
                    className={`p-1 rounded ${
                      gridMode === "large"
                        ? "ring-2 ring-amber-300"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-10 grid grid-cols-3 gap-1">
                      <span className="block h-4 bg-gray-200 rounded" />
                      <span className="block h-4 bg-gray-200 rounded" />
                      <span className="block h-4 bg-gray-200 rounded" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGridMode("compact")}
                    aria-pressed={gridMode === "compact"}
                    title="Show 5 per row"
                    className={`p-1 rounded ${
                      gridMode === "compact"
                        ? "ring-2 ring-amber-300"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-16 grid grid-cols-5 gap-1">
                      <span className="block h-3 bg-gray-200 rounded" />
                      <span className="block h-3 bg-gray-200 rounded" />
                      <span className="block h-3 bg-gray-200 rounded" />
                      <span className="block h-3 bg-gray-200 rounded" />
                      <span className="block h-3 bg-gray-200 rounded" />
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex-1 flex justify-end items-center gap-4">
                <label className="text-sm text-gray-600">Sort By</label>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="relevance">Relevance</option>
                  <option value="discount">Discount</option>
                  <option value="price-lowest">Price (lowest first)</option>
                  <option value="newest">What's New</option>
                  <option value="price-highest">Price (highest first)</option>
                  <option value="ratings">Ratings</option>
                </select>
              </div>
            </div>
          </header>

          {loading && <p className="text-gray-600">Loading products…</p>}
          {!loading && err && <p className="text-red-600">Error: {err}</p>}
          {!loading && !err && filtered.length === 0 && !searchQuery && (
            <p className="text-gray-600">No products found.</p>
          )}

          {!loading && !err && filtered.length > 0 && (
            <div className={gridClass}>
              {filtered.map((p) => (
                <ProductCard
                  key={p._id || p.id || `${p.name}-${Math.random()}`}
                  p={p}
                  compact={gridMode === "compact"}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
