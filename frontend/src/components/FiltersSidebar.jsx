// src/components/FiltersSidebar.jsx
import React from "react";

export default function FiltersSidebar({
  displayBrands = [],
  showAllBrands,
  setShowAllBrands,
  selectedBrands,
  toggleBrand,
  priceBuckets = [],
  selectedPriceBucket,
  setSelectedPriceBucket,
  clearAllFilters,
}) {
  const selectedPriceSet =
    selectedPriceBucket instanceof Set
      ? selectedPriceBucket
      : new Set(selectedPriceBucket ? [selectedPriceBucket] : []);

  const togglePrice = (id) => {
    if (!setSelectedPriceBucket) return;
    const next = new Set(selectedPriceSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedPriceBucket(next);
  };

  // --- MERGE BRANDS IGNORING CASE ---
  const mergedBrands = React.useMemo(() => {
    const acc = {};
    for (const b of displayBrands || []) {
      const raw = b && b.brand ? String(b.brand).trim() : "";
      if (!raw) continue;
      const key = raw.toLowerCase();
      if (!acc[key]) {
        acc[key] = { brand: raw, count: Number(b.count || 0), variants: [raw] };
      } else {
        acc[key].count += Number(b.count || 0);
        if (!acc[key].variants.includes(raw)) acc[key].variants.push(raw);
      }
    }
    // return array sorted by count descending
    return Object.values(acc).sort(
      (a, b) => b.count - a.count || a.brand.localeCompare(b.brand)
    );
  }, [displayBrands]);

  // helper: case-insensitive check whether this brand (any casing) is selected
  const isBrandSelected = React.useCallback(
    (brand) => {
      if (!selectedBrands) return false;
      const want = String(brand || "").toLowerCase();

      if (selectedBrands instanceof Set) {
        if (selectedBrands.has(want)) return true;
        // fallback: check any selected entry case-insensitively
        for (const s of selectedBrands) {
          if (String(s || "").toLowerCase() === want) return true;
        }
        return false;
      }

      if (Array.isArray(selectedBrands)) {
        return selectedBrands.some(
          (s) => String(s || "").toLowerCase() === want
        );
      }

      return false;
    },
    [selectedBrands]
  );

  return (
    <div className="bg-white border rounded-md p-3 sticky top-24 text-sm">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-lg font-semibold leading-tight">Refine By</h4>
        <button
          onClick={clearAllFilters}
          className="text-sm text-gray-500 hover:underline"
        >
          Clear
        </button>
      </div>

      {/* Gender */}
      <div className="mb-2 border-b pb-2">
        <h5 className="text-sm font-semibold mb-1">Gender</h5>
        <div className="text-sm text-gray-700 space-y-0.5">
          <label className="block py-0">
            <input type="checkbox" className="mr-2 accent-amber-600" /> Men
          </label>
          <label className="block py-0">
            <input type="checkbox" className="mr-2 accent-amber-600" /> Women
          </label>
        </div>
      </div>

      {/* Price */}
      <div className="mb-2 border-b pb-2">
        <h5 className="text-sm font-semibold mb-1">Price</h5>
        <div className="text-sm text-gray-700 space-y-0.5">
          {priceBuckets.map((b) => (
            <label
              key={b.id}
              className="block py-0 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-amber-600"
                  checked={selectedPriceSet.has(b.id)}
                  onChange={() => togglePrice(b.id)}
                />
                <span className="truncate max-w-[130px]">{b.label}</span>
              </div>
              <span className="text-gray-400 text-sm">({b.count})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="mb-2">
        <h5 className="text-sm font-semibold mb-1">Brands</h5>
        <div className="text-sm text-gray-700 space-y-0.5">
          {mergedBrands && mergedBrands.length > 0 ? (
            (showAllBrands ? mergedBrands : mergedBrands.slice(0, 8)).map(
              (b) => {
                const rep = b.brand; // display (original casing)
                const norm = String(rep).toLowerCase(); // normalized key
                const checked = isBrandSelected(rep);
                return (
                  <label key={norm} className="block py-0">
                    <input
                      type="checkbox"
                      value={norm}
                      className="mr-2 accent-amber-600"
                      checked={checked}
                      // pass lowercase key to parent so parent stores consistent keys
                      onChange={() => toggleBrand(norm)}
                    />
                    <span className="inline-block truncate max-w-[130px]">
                      {rep}
                    </span>{" "}
                    <span className="text-gray-400">({b.count})</span>
                  </label>
                );
              }
            )
          ) : (
            <div className="text-sm text-gray-400 py-1">No brands found</div>
          )}

          {mergedBrands.length > 8 && (
            <button
              onClick={() => setShowAllBrands((s) => !s)}
              className="mt-1 text-sm text-blue-600 hover:underline"
            >
              {showAllBrands
                ? "Show less"
                : `MORE (${mergedBrands.length - 8})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
