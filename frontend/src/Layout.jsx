// src/Layout.jsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProgressSteps from "./components/layout/ProgressSteps";

export default function Layout() {
  const location = useLocation();
  const path = (location.pathname || "/").toLowerCase();

  // routes (or route prefixes) where we want the progress bar instead of navbar
  // add or change these to match your router (examples: '/checkout', '/checkout/delivery')
  const progressRoutePrefixes = ["/cart", "/delivery", "/payment", "/checkout"];

  // check whether current path should show progress instead of navbar
  const showProgress = progressRoutePrefixes.some(
    (prefix) =>
      path === prefix ||
      path.startsWith(prefix + "/") ||
      path.startsWith(prefix)
  );

  // determine which step is active for the progress component
  const getActive = () => {
    if (path.includes("/payment")) return "payment";
    if (path.includes("/delivery")) return "delivery";
    // default to bag for any cart/checkout path
    if (path.includes("/cart") || path.includes("/checkout")) return "bag";
    return "bag";
  };

  return (
    <div className="flex flex-col min-h-screen">
      {showProgress ? <ProgressSteps active={getActive()} /> : <Navbar />}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
