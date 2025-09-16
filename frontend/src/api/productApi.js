// frontend/src/api/productApi.js
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function getProducts({ signal, params } = {}) {
  // params: object -> convert to querystring
  const qs = params
    ? "?" +
      Object.entries(params)
        .filter(([k, v]) => typeof v !== "undefined" && v !== null && v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join("&")
    : "";

  const url = `${BASE}/products${qs}`;
  const res = await fetch(url, { signal });
  if (!res.ok) {
    const txt = await res.text();
    const err = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    err.body = txt;
    throw err;
  }
  return res.json();
}

export async function getProduct(id) {
  const res = await fetch(`${BASE}/products/${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

export async function getFilters() {
  const res = await fetch(`${BASE}/products/_meta/filters`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
