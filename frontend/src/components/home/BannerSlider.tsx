"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { bannerService } from "@/services/bannerService";
import type { Banner } from "@/types";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const AUTO_PLAY_INTERVAL = 4500; // ms

export default function BannerSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    bannerService
      .getActiveBanners()
      .then((res) => setBanners(res.payload?.banners ?? []))
      .catch(() => {}) // silent fail — homepage should still render
      .finally(() => setIsLoading(false));
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (!banners.length) return;
      setCurrent((index + banners.length) % banners.length);
    },
    [banners.length]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-advance
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;
    timerRef.current = setInterval(next, AUTO_PLAY_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length, isPaused, next]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  // Touch swipe
  const touchStart = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const delta = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) delta > 0 ? next() : prev();
    touchStart.current = null;
  };

  // Nothing to show
  if (isLoading) {
    return (
      <section className="w-full">
        <div className="w-full h-[320px] sm:h-[420px] lg:h-[500px] bg-slate-200 dark:bg-slate-800 animate-pulse rounded-none" />
      </section>
    );
  }

  if (!banners.length) return null;

  const banner = banners[current];

  return (
    <section
      className="relative w-full overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Promotional banner slider"
    >
      {/* Slides */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((b, i) => (
          <div
            key={b._id}
            className="relative w-full flex-shrink-0 h-[320px] sm:h-[420px] lg:h-[500px]"
            aria-hidden={i !== current}
          >
            {/* Background image */}
            <Image
              src={b.imageUrl}
              alt={b.title}
              fill
              className="object-cover"
              priority={i === 0}
              sizes="100vw"
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex items-end pb-10 sm:pb-14 lg:pb-16 px-6 sm:px-10 lg:px-16">
              <div className="max-w-2xl space-y-3">
                {/* Badge chip */}
                {b.badge && (
                  <span className="inline-block px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-full uppercase tracking-widest animate-fade-in">
                    {b.badge}
                  </span>
                )}

                {/* Title */}
                <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white leading-tight drop-shadow-lg">
                  {b.title}
                </h2>

                {/* Subtitle */}
                {b.subtitle && (
                  <p className="text-sm sm:text-base lg:text-lg text-white/85 leading-relaxed max-w-lg drop-shadow">
                    {b.subtitle}
                  </p>
                )}

                {/* CTA button */}
                {b.ctaText && b.ctaLink && (
                  <Link
                    href={b.ctaLink}
                    className="inline-flex items-center gap-2 mt-2 px-6 py-3 bg-rose-600 hover:bg-rose-700
                      text-white hover:text-white font-semibold rounded-xl transition-all duration-300
                      shadow-xl hover:shadow-rose-600/40 hover:scale-105 group"
                  >
                    {b.ctaText}
                    <FiChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Prev / Next arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous banner"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10
              w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm
              border border-white/30 text-white hover:text-white flex items-center justify-center
              hover:bg-white/35 transition-all duration-200 hover:scale-110"
          >
            <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={next}
            aria-label="Next banner"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10
              w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm
              border border-white/30 text-white hover:text-white flex items-center justify-center
              hover:bg-white/35 transition-all duration-200 hover:scale-110"
          >
            <FiChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`transition-all duration-300 rounded-full
                ${i === current
                  ? "w-7 h-2.5 bg-white"
                  : "w-2.5 h-2.5 bg-white/45 hover:bg-white/70"
                }`}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      {banners.length > 1 && !isPaused && (
        <div
          key={current}
          className="absolute bottom-0 left-0 h-0.5 bg-rose-500 animate-progress-bar"
          style={{ animationDuration: `${AUTO_PLAY_INTERVAL}ms` }}
        />
      )}
    </section>
  );
}
