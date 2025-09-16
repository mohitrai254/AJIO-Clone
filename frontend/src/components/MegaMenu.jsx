// src/components/MegaMenu.jsx
import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { brandsData } from "./menus/brandsData";

export default function MegaMenu({
  sections = [],
  categoryKey = null,
  top = 0,
  onClose = () => {},
  onMouseEnter = () => {},
  onMouseLeave = () => {},
}) {
  const brands = brandsData[categoryKey] || [];

  const rootId = "mega-menu-root";
  let container = document.getElementById(rootId);
  if (!container) {
    container = document.createElement("div");
    container.id = rootId;
    document.body.appendChild(container);
  }

  const [tab, setTab] = useState("categories");

  useEffect(() => {
    setTab("categories");
  }, [categoryKey, sections]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const brandColumns = useMemo(() => {
    const cols = 4;
    const arr = Array.from({ length: cols }, () => []);
    brands.forEach((b, i) => arr[i % cols].push(b));
    return arr;
  }, [brands]);

  const headingFontSize = 13;
  const itemFontSize = 13;

  const categoriesContent = (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "200px 1fr 1fr 1fr",
        gap: 8, // tighter gap
      }}
    >
      {/* Left headings */}
      <div style={{ padding: "2px 4px" }}>
        <ul style={{ margin: 0, padding: 0 }}>
          {sections.map((sec, i) => (
            <li key={i} style={{ listStyle: "none", marginBottom: 4 }}>
              <a
                href={`/products?category=${encodeURIComponent(sec.heading)}`}
                style={{
                  fontSize: headingFontSize,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "#111827",
                  textDecoration: "none",
                }}
              >
                {sec.heading}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Right content */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
          gridColumn: "2 / span 3",
        }}
      >
        {sections.map((sec, idx) => (
          <div key={idx} style={{ padding: "2px 4px" }}>
            <h3
              style={{
                fontSize: headingFontSize,
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: 4,
                color: "#111827",
              }}
            >
              {sec.heading}
            </h3>

            <ul style={{ margin: 0, padding: 0 }}>
              {sec.items?.map((it, j) => (
                <li
                  key={j}
                  style={{
                    marginBottom: 3,
                    lineHeight: 1.3, // tighter
                  }}
                >
                  <a
                    href={`/products?category=${encodeURIComponent(it)}`}
                    style={{
                      color: "#475569",
                      fontSize: itemFontSize,
                      textDecoration: "none",
                    }}
                    className="hover:text-gray-900 hover:font-semibold"
                  >
                    {it}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  const brandsContent = (
    <div
      style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}
    >
      {brandColumns.map((col, ci) => (
        <div key={ci} style={{ padding: "2px 4px" }}>
          <ul style={{ margin: 0, padding: 0 }}>
            {col.map((b, i) => (
              <li key={i} style={{ marginBottom: 3, lineHeight: 1.3 }}>
                <a
                  href={`/products?search=${encodeURIComponent(b)}`}
                  style={{
                    color: "#475569",
                    fontSize: itemFontSize,
                    textDecoration: "none",
                  }}
                  className="hover:text-gray-900 hover:font-semibold"
                >
                  {b}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  const portal = (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: top,
        zIndex: 9999,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          className="bg-white border-t shadow-md"
          style={{
            maxWidth: 1152,
            width: "100%",
            padding: "6px 12px",
            boxSizing: "border-box",
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              borderBottom: "1px solid #efefef",
              paddingBottom: 4,
              marginBottom: 6,
            }}
          >
            <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>
              Shop By:
            </div>
            <button
              onMouseEnter={() => setTab("categories")}
              type="button"
              style={{
                padding: "4px 8px",
                borderRadius: 4,
                background: tab === "categories" ? "#f3f4f6" : "transparent",
                fontSize: 12,
                fontWeight: tab === "categories" ? 700 : 600,
                textTransform: "uppercase",
                color: tab === "categories" ? "#111827" : "#374151",
              }}
            >
              Categories
            </button>
            <button
              onMouseEnter={() => setTab("brands")}
              type="button"
              style={{
                padding: "4px 8px",
                borderRadius: 4,
                background: tab === "brands" ? "#f3f4f6" : "transparent",
                fontSize: 12,
                fontWeight: tab === "brands" ? 700 : 600,
                textTransform: "uppercase",
                color: tab === "brands" ? "#111827" : "#374151",
              }}
            >
              Brands
            </button>
          </div>

          {/* Content */}
          {tab === "categories" ? categoriesContent : brandsContent}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(portal, container);
}
