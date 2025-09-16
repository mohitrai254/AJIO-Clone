// src/components/layout/ProgressSteps.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function ProgressSteps({
  active = "bag", // "bag" | "delivery" | "payment"
  ajioGold = "#8a5a1a",
}) {
  const navigate = useNavigate();

  // animated fill widths for each step
  const progressWidth =
    active === "bag" ? "0%" : active === "delivery" ? "50%" : "100%";

  const stepRoute = {
    bag: "/cart",
    delivery: "/delivery",
    payment: "/payment",
  };

  const Step = ({ id, label, icon, isActive }) => (
    <div className="flex flex-col items-center text-center flex-1 relative z-10">
      <button
        type="button"
        onClick={() => navigate(stepRoute[id])}
        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold focus:outline-none ${
          isActive ? "" : "border border-gray-300 bg-white text-gray-600"
        }`}
        style={isActive ? { background: ajioGold, color: "white" } : {}}
        aria-current={isActive ? "step" : undefined}
      >
        {icon}
      </button>
      <div
        className={`mt-2 text-sm ${isActive ? "font-medium" : "text-gray-600"}`}
      >
        {label}
      </div>
    </div>
  );

  return (
    <div className="mt-6 mb-6">
      {/* keep same outer container as navbar for alignment */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-6 relative">
          {/* Logo area (same styling as navbar) */}
          <button
            type="button"
            onClick={() => navigate("/")}
            aria-label="Go to Home"
            className="flex-shrink-0"
          >
            <svg
              width="220"
              height="60"
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
          </button>

          {/* Steps container — we let it sit right after logo (no forced centering) */}
          <div className="flex-1 relative">
            {/* Connector line anchored to centers of outer circles.
                Circle size is w-10 (40px), so center offset is 20px.
                This prevents extra short tails beyond the first/last circle. */}
            <div
              className="absolute top-5"
              style={{
                left: 20, // start from center of first circle
                right: 20, // end at center of last circle
              }}
            >
              <div className="h-1 bg-gray-200 rounded w-full relative overflow-hidden">
                <div
                  className="absolute left-0 top-0 bottom-0 rounded transition-all duration-300"
                  style={{ width: progressWidth, background: "#f3dfc8" }}
                />
              </div>
            </div>

            {/* Steps: use flex justify-between so circles align with connector */}
            <div
              className="flex items-center justify-between relative z-20 px-0"
              style={{ gap: 0 }}
            >
              <Step
                id="bag"
                label="Bag"
                isActive={active === "bag"}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />

              <Step
                id="delivery"
                label="Delivery Details"
                isActive={active === "delivery"}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M3 7h18M7 7v10a2 2 0 002 2h6a2 2 0 002-2V7"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />

              <Step
                id="payment"
                label="Payment"
                isActive={active === "payment"}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M12 8v6M8 12h8"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
