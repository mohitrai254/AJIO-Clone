// src/pages/DeliveryPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const CART_KEY = "ajio_clone_cart_v1";
const ADDRESS_KEY = "ajio_clone_address_v1";

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function readAddress() {
  try {
    return JSON.parse(localStorage.getItem(ADDRESS_KEY) || "null");
  } catch {
    return null;
  }
}
function writeAddress(obj) {
  try {
    localStorage.setItem(ADDRESS_KEY, JSON.stringify(obj));
  } catch {}
}

/** fallback default address */
const DEFAULT_ADDRESS = {
  name: "Mohit Rai",
  mobile: "9264913078",
  pin: "",
  locality: "",
  flat: "n8/162 r-26, in front of lane no 8",
  landmark: "rajendra vihar colony",
  city: "varanasi",
  state: "uttar pradesh",
  tag: "HOME",
  makeDefault: true,
};

function getExpectedDeliveryDate() {
  const today = new Date();
  today.setDate(today.getDate() + 7);
  return today.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}
export default function DeliveryPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [address, setAddress] = useState(
    () => readAddress() || DEFAULT_ADDRESS
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  // form state for drawer
  const [form, setForm] = useState({ ...address });
  const [errors, setErrors] = useState({});

  // fees — keep same values as CartPage
  const DELIVERY_FEE = 99;
  const PLATFORM_FEE = 29;

  useEffect(() => {
    setItems(read(CART_KEY));
    const onStorage = () => setItems(read(CART_KEY));
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onStorage);
    };
  }, []);

  // when drawer opens, prevent background scroll
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // re-sync form with address when drawer opens
  useEffect(() => {
    setForm((prev) => ({ ...address }));
    setErrors({});
  }, [drawerOpen, address]);

  const subtotal = items.reduce(
    (s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 1),
    0
  );

  const convenienceFee = DELIVERY_FEE + PLATFORM_FEE;
  const orderTotal = Math.max(0, subtotal) + convenienceFee;

  const openDrawer = () => {
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const validateForm = () => {
    const err = {};
    if (!form.name || !form.name.trim()) err.name = "Name is required";
    if (!form.mobile || !/^\d{10}$/.test(form.mobile))
      err.mobile = "Enter valid 10 digit mobile";
    if (!form.pin || !/^\d{4,6}$/.test(form.pin)) err.pin = "Pin code required";
    if (!form.locality || !form.locality.trim())
      err.locality = "Locality required";
    if (!form.flat || !form.flat.trim()) err.flat = "Flat / building required";
    if (!form.city || !form.city.trim()) err.city = "City required";
    if (!form.state || !form.state.trim()) err.state = "State required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleReset = () => {
    setForm({ ...address });
    setErrors({});
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const newAddr = {
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      pin: form.pin.trim(),
      locality: form.locality.trim(),
      flat: form.flat.trim(),
      landmark: (form.landmark || "").trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      tag: form.tag || "HOME",
      makeDefault: !!form.makeDefault,
    };
    setAddress(newAddr);
    writeAddress(newAddr);
    setDrawerOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="sr-only">Delivery Details</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Delivery address + expected delivery */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address */}
          <div className="bg-white border rounded p-6">
            <div className="flex items-start gap-4">
              <div className="text-2xl text-gray-500">
                {/* location pin */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M12 21s-7-4.5-7-10a7 7 0 1114 0c0 5.5-7 10-7 10z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="11" r="2.5" fill="currentColor" />
                </svg>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold">
                      Delivery Address
                    </div>
                    <div className="text-sm text-gray-500">
                      We will deliver your order to this address
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={openDrawer}
                      className="text-sm text-amber-700 underline"
                      type="button"
                    >
                      Change Address
                    </button>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-800">
                  <div className="font-medium">
                    {address.name}{" "}
                    <span className="ml-2 inline-block border px-2 py-0.5 text-xs rounded">
                      {address.tag || "HOME"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {address.makeDefault ? "Default" : ""}
                  </div>
                  <div className="mt-2 whitespace-pre-line text-sm text-gray-600">
                    {address.flat}
                    <br />
                    {address.locality}
                    <br />
                    {address.city}, {address.state} - {address.pin}
                    <br />
                    Phone : {address.mobile}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Expected delivery */}
          <div className="bg-white border rounded p-6">
            <div className="flex items-center gap-4">
              <div className="text-2xl text-gray-500">
                {/* package icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
                    stroke="currentColor"
                    strokeWidth="1.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <div className="font-semibold">Expected Delivery</div>
                <div className="text-sm text-gray-500">
                  Estimated delivery dates for your order
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {items.length === 0 ? (
                <div className="text-sm text-gray-500">No items in bag.</div>
              ) : (
                items.map((it, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <img
                      src={it.imageUrl || ""}
                      alt={it.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <div className="font-semibold">
                        {getExpectedDeliveryDate()}
                      </div>
                      <div className="text-sm text-gray-600">{it.brand}</div>
                      <div className="text-sm text-gray-600">{it.name}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Order summary */}
        <aside className="border rounded p-4 bg-white">
          <div className="mb-4">
            <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 mb-4">
              <div className="font-medium">You are earning ₹200 SuperCash!</div>
              <div className="text-xs">
                Amount will be credited after 15 days of delivery
              </div>
              <div className="mt-1 text-xs text-blue-600">Know More</div>
            </div>

            <div className="text-sm text-gray-600 font-semibold mb-2">
              Order Details
            </div>

            <div className="mt-2 flex justify-between">
              <div>Bag total</div>
              <div>₹{subtotal.toFixed(2)}</div>
            </div>

            <div className="mt-2 flex justify-between">
              <div>
                Convenience Fee{" "}
                <span className="text-xs text-gray-400">What's this?</span>
              </div>
              <div>₹{convenienceFee}</div>
            </div>

            <div className="mt-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <div>Delivery Fee</div>
                <div>₹{DELIVERY_FEE}</div>
              </div>
              <div className="flex justify-between">
                <div>Platform Fee</div>
                <div>₹{PLATFORM_FEE}</div>
              </div>
            </div>

            <div className="mt-3 border-t pt-3">
              <div className="text-sm">Order Total</div>
              <div className="text-2xl font-semibold">
                ₹{orderTotal.toFixed(2)}
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/payment")}
            className="w-full py-3 rounded font-semibold flex items-center justify-center gap-2"
            style={{ background: "#8a5a1a", color: "white" }}
            type="button"
          >
            PROCEED TO PAYMENT
          </button>
        </aside>
      </div>

      {/* Drawer + overlay */}
      {drawerOpen && (
        <>
          {/* dim overlay */}
          <div
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/50 z-40"
            aria-hidden
          />

          {/* drawer */}
          <aside
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] md:w-[480px] bg-white z-50 shadow-xl flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Add new address</h2>
              <button
                onClick={closeDrawer}
                className="p-2 rounded hover:bg-gray-100"
                aria-label="Close"
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-gray-700"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M6 6l12 12M6 18L18 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* content scroll */}
            <form
              onSubmit={handleSave}
              className="p-6 overflow-auto flex-1 flex flex-col"
            >
              <div className="space-y-4">
                <label className="block">
                  <div className="text-xs text-gray-600 mb-1">Name *</div>
                  <input
                    name="name"
                    value={form.name || ""}
                    onChange={handleChange}
                    className="w-full border-b py-2 focus:outline-none"
                  />
                  {errors.name && (
                    <div className="text-xs text-red-600">{errors.name}</div>
                  )}
                </label>

                <label className="block">
                  <div className="text-xs text-gray-600 mb-1">Mobile *</div>
                  <input
                    name="mobile"
                    value={form.mobile || ""}
                    onChange={handleChange}
                    className="w-full border-b py-2 focus:outline-none"
                    inputMode="numeric"
                  />
                  {errors.mobile && (
                    <div className="text-xs text-red-600">{errors.mobile}</div>
                  )}
                </label>

                <label className="block">
                  <div className="text-xs text-gray-600 mb-1">Pin Code *</div>
                  <input
                    name="pin"
                    value={form.pin || ""}
                    onChange={handleChange}
                    className="w-full border-b py-2 focus:outline-none"
                    inputMode="numeric"
                  />
                  {errors.pin && (
                    <div className="text-xs text-red-600">{errors.pin}</div>
                  )}
                </label>

                <label className="block">
                  <div className="text-xs text-gray-600 mb-1">
                    Locality / Area / Street *
                  </div>
                  <input
                    name="locality"
                    value={form.locality || ""}
                    onChange={handleChange}
                    className="w-full border-b py-2 focus:outline-none"
                  />
                  {errors.locality && (
                    <div className="text-xs text-red-600">
                      {errors.locality}
                    </div>
                  )}
                </label>

                <label className="block">
                  <div className="text-xs text-gray-600 mb-1">
                    Flat number / Building Name *
                  </div>
                  <input
                    name="flat"
                    value={form.flat || ""}
                    onChange={handleChange}
                    className="w-full border-b py-2 focus:outline-none"
                  />
                  {errors.flat && (
                    <div className="text-xs text-red-600">{errors.flat}</div>
                  )}
                </label>

                <label className="block">
                  <div className="text-xs text-gray-600 mb-1">Landmark</div>
                  <input
                    name="landmark"
                    value={form.landmark || ""}
                    onChange={handleChange}
                    className="w-full border-b py-2 focus:outline-none"
                  />
                </label>

                <label className="block">
                  <div className="text-xs text-gray-600 mb-1">
                    District/City *
                  </div>
                  <input
                    name="city"
                    value={form.city || ""}
                    onChange={handleChange}
                    className="w-full border-b py-2 focus:outline-none"
                  />
                  {errors.city && (
                    <div className="text-xs text-red-600">{errors.city}</div>
                  )}
                </label>

                <label className="block">
                  <div className="text-xs text-gray-600 mb-1">State *</div>
                  <input
                    name="state"
                    value={form.state || ""}
                    onChange={handleChange}
                    className="w-full border-b py-2 focus:outline-none"
                  />
                  {errors.state && (
                    <div className="text-xs text-red-600">{errors.state}</div>
                  )}
                </label>

                {/* Address Type */}
                <div>
                  <div className="text-xs text-gray-600 mb-2">Address Type</div>
                  <div className="flex items-center gap-4">
                    {["HOME", "WORK", "OTHERS"].map((t) => (
                      <label
                        key={t}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="radio"
                          name="tag"
                          value={t}
                          checked={(form.tag || "HOME") === t}
                          onChange={handleChange}
                        />
                        <span>{t.charAt(0) + t.slice(1).toLowerCase()}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="makeDefault"
                    checked={!!form.makeDefault}
                    onChange={handleChange}
                  />
                  <span className="text-sm">Make as default Address</span>
                </label>
              </div>

              {/* bottom sticky actions */}
              <div className="mt-6 border-t pt-4 flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-3 border rounded font-medium"
                >
                  RESET
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 rounded font-semibold"
                  style={{ background: "#8a5a1a", color: "white" }}
                >
                  SAVE
                </button>
              </div>
            </form>
          </aside>
        </>
      )}
    </div>
  );
}
