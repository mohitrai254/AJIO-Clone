// frontend/src/components/layout/Navbar.jsx
import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { menuData } from "../menus/menuData";
import MegaMenu from "../MegaMenu";
import { useAuth } from "../../context/authContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const navRef = useRef(null);

  const [activeKey, setActiveKey] = useState(null);
  const hoverTimeoutRef = useRef(null);

  const [dropdownTop, setDropdownTop] = useState(0);
  const updateDropdownTop = () => {
    const el = navRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setDropdownTop(rect.bottom + window.scrollY);
  };

  useEffect(() => {
    updateDropdownTop();
    window.addEventListener("resize", updateDropdownTop);
    window.addEventListener("scroll", updateDropdownTop, true);
    return () => {
      window.removeEventListener("resize", updateDropdownTop);
      window.removeEventListener("scroll", updateDropdownTop, true);
      clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  const openForKey = (key) => {
    clearTimeout(hoverTimeoutRef.current);
    setActiveKey(key);
    updateDropdownTop();
  };

  const leaveNavItemWithDelay = () => {
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveKey(null);
    }, 150);
  };

  const leaveDropdown = () => {
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveKey(null);
    }, 120);
  };

  const enterDropdown = () => {
    clearTimeout(hoverTimeoutRef.current);
  };

  return (
    <header className="w-full bg-white border-b shadow-sm" ref={navRef}>
      {/* Top small links row */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-end h-5 text-xs text-gray-600">
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to="/orders"
                  className="hover:underline text-xs text-amber-700"
                >
                  My Orders
                </Link>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-700">
                    Hello, {user.name}
                  </span>
                  <button
                    onClick={logout}
                    className="text-xs text-gray-600 hover:text-black"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login" className="hover:underline text-xs">
                Sign In / Join AJIO
              </Link>
            )}

            <a
              href="#"
              className="hover:underline text-xs"
              onClick={(e) => e.preventDefault()}
            >
              Customer Care
            </a>
            <a
              href="#"
              className="bg-black text-white px-4 py-2 text-xs"
              onClick={(e) => e.preventDefault()}
            >
              Visit AJIOLUXE
            </a>
          </div>
        </div>
      </div>

      {/* rest of your Navbar unchanged below... */}
      {/* Main nav row */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 mt-1">
          {/* Logo */}
          <div className="flex-shrink-0 pr-4">
            <Link to="/" className="inline-flex items-center">
              <svg
                width="300"
                height="72"
                viewBox="0 0 380 78"
                xmlns="http://www.w3.org/2000/svg"
                className="block"
              >
                <text
                  x="0"
                  y="56"
                  style={{
                    fontFamily:
                      "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
                  }}
                  fontWeight="550"
                  fontSize="60"
                  letterSpacing="8"
                  fill="#294651"
                >
                  AJIO
                </text>
              </svg>
            </Link>
          </div>

          {/* Center nav */}
          <nav className="flex-1 relative" aria-label="Main navigation">
            <ul className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-4">
              {Object.keys(menuData).map((key) => (
                <li
                  key={key}
                  className="group"
                  onMouseEnter={() => openForKey(key)}
                  onMouseLeave={leaveNavItemWithDelay}
                >
                  <button
                    className="text-[15px] font-normal tracking-wider uppercase text-gray-700 hover:text-gray-900 whitespace-nowrap"
                    aria-haspopup="true"
                    aria-expanded={activeKey === key}
                    aria-controls={`mega-${key}`}
                  >
                    {key}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right: search + icons */}
          <div className="flex items-center gap-3">
            <form
              onSubmit={handleSearch}
              className="hidden md:flex items-center bg-amber-50 border border-gray-800 rounded-full px-2 py-0.5 w-60"
              role="search"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search AJIO"
                className="bg-transparent text-sm outline-none placeholder:text-gray-500 w-44 py-0.5"
                aria-label="Search AJIO"
              />
              <button
                type="submit"
                className="p-1 rounded-full hover:bg-amber-100"
                aria-label="Search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
                  />
                </svg>
              </button>
            </form>

            <Link
              to="/wishlist"
              className="w-9 h-9 rounded-full bg-[#294651] flex items-center justify-center"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.657 3.172 10.83a4 4 0 010-5.657z" />
              </svg>
            </Link>

            <Link
              to="/cart"
              className="w-9 h-9 rounded-full bg-[#294651] flex items-center justify-center"
              title="Bag"
              aria-label="Bag"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6 2l1 2h10l1-2h-12zm12 6H6l-1 12h14L18 8zM9 10h2v6H9v-6zm4 0h2v6h-2v-6z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Portal-based dropdown */}
      {activeKey && (
        <MegaMenu
          sections={menuData[activeKey]}
          categoryKey={activeKey}
          top={dropdownTop}
          onClose={() => setActiveKey(null)}
          onMouseEnter={enterDropdown}
          onMouseLeave={leaveDropdown}
        />
      )}
    </header>
  );
}
