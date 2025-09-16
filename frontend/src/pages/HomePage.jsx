// src/pages/HomePage.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";

/**
 * IMPORTANT:
 * Put your images under src/assets/ with these names (or change the imports below):
 *  banner1.jpg, banner2.jpg, banner3.jpg, banner4.jpg
 *  payment1.jpg, payment2.jpg, payment3.jpg, payment4.jpg
 *  trend1.jpg, trend2.jpg, trend3.jpg, trend4.jpg
 */

// Banner images
import banner1 from "../assets/image1.png";
import banner2 from "../assets/image2.png";
import banner3 from "../assets/image3.png";
import banner4 from "../assets/image4.png";
import banner5 from "../assets/image5.png";
import banner6 from "../assets/image6.png";
import banner7 from "../assets/image7.png";
import banner8 from "../assets/image8.png";
import banner9 from "../assets/image9.png";
import banner10 from "../assets/image10.png";

// Payment offer images
import payment1 from "../assets/imageP1.png";
import payment2 from "../assets/imageP2.png";
import payment3 from "../assets/imageP3.png";
import payment4 from "../assets/imageP4.png";

// Top trends images
import trend1 from "../assets/imageT1.png";
import trend2 from "../assets/imageT2.png";
import trend3 from "../assets/imageT3.png";
import trend4 from "../assets/imageT4.png";
import trend5 from "../assets/imageT5.png";
import trend6 from "../assets/imageT6.png";
import trend7 from "../assets/imageT7.png";

/* ---------------- reusable single-slide carousel ---------------- */
function Carousel({
  images = [],
  height = 420,
  interval = 4000,
  showDots = true,
  showArrows = true,
  objectFit = "cover",
}) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const pausedRef = useRef(false);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!images.length) return;
    if (interval <= 0) return;
    timerRef.current = setInterval(() => {
      if (!pausedRef.current) next();
    }, interval);
    return () => clearInterval(timerRef.current);
  }, [images.length, interval, next]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg shadow"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
      style={{ height }}
    >
      <div
        className="h-full w-full flex transition-transform duration-500 ease-in-out"
        style={{
          width: `${images.length * 100}%`,
          transform: `translateX(-${(index * 100) / images.length}%)`,
        }}
      >
        {images.map((src, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-full h-full flex items-center justify-center"
            style={{ width: `${100 / images.length}%` }}
          >
            <img
              src={src}
              alt={`slide-${i}`}
              className="w-full h-full object-cover"
              style={{ objectFit }}
              draggable="false"
            />
          </div>
        ))}
      </div>

      {/* Arrows */}
      {showArrows && images.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white"
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
          <button
            onClick={next}
            aria-label="Next"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white"
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
        </>
      )}

      {/* Dots */}
      {showDots && images.length > 1 && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-3 flex gap-2 z-20">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-3 h-3 rounded-full ${
                i === index ? "bg-white" : "bg-white/60"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- multi-card carousel for Top Trends ---------------- */
function MultiCardCarousel({ images = [], cardWidth = 220, gap = 16 }) {
  const containerRef = useRef(null);
  const [visible, setVisible] = useState(4);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      if (w >= 1280) setVisible(4);
      else if (w >= 1024) setVisible(4);
      else if (w >= 768) setVisible(3);
      else if (w >= 480) setVisible(2);
      else setVisible(1);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const maxIndex = Math.max(0, images.length - visible);

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(maxIndex, i + 1));

  return (
    <div className="relative">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-2xl font-semibold">Top Trends</h2>
        <div className="text-sm text-gray-500">
          Handpicked styles & popular picks
        </div>
      </div>

      <div className="relative">
        <div className="overflow-hidden">
          <div
            ref={containerRef}
            className="flex transition-transform duration-500"
            style={{
              gap,
              transform: `translateX(-${index * (cardWidth + gap)}px)`,
              width: "max-content",
            }}
          >
            {images.map((src, i) => (
              <div
                key={i}
                className="bg-white rounded-lg overflow-hidden shadow-sm"
                style={{ minWidth: cardWidth, maxWidth: cardWidth }}
              >
                <div className="w-full h-56 bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={src}
                    alt={`trend-${i}`}
                    className="object-cover w-full h-full"
                    draggable="false"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prev/Next */}
        <button
          onClick={prev}
          disabled={index <= 0}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center"
          aria-label="Previous trends"
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
        <button
          onClick={next}
          disabled={index >= maxIndex}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center"
          aria-label="Next trends"
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
  );
}

/* ---------------- Home Page ---------------- */
export default function HomePage() {
  const bannerImages = [
    banner1,
    banner2,
    banner3,
    banner4,
    banner5,
    banner6,
    banner7,
    banner8,
    banner9,
    banner10,
  ];
  const paymentImages = [payment1, payment2, payment3, payment4];
  const trendImages = [trend1, trend2, trend3, trend4, trend5, trend6, trend7];

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 py-6">
      {/* Banner */}
      <section>
        <Carousel images={bannerImages} height={520} interval={5000} />
      </section>

      {/* Payment offers */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
          <div>
            <h2 className="text-xl font-semibold">Payment Offers</h2>
            <p className="text-sm text-gray-500">
              Earn cashback & enjoy exclusive payment deals
            </p>
          </div>

          <div className="lg:col-span-2">
            <Carousel
              images={paymentImages}
              height={140}
              interval={3500}
              showDots={false}
            />
          </div>
        </div>
      </section>

      {/* Top Trends */}
      <section>
        <MultiCardCarousel images={trendImages} cardWidth={260} gap={20} />
      </section>
    </div>
  );
}
