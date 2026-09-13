"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { bannerService } from "@/services/bannerService";
import type { Banner } from "@/types";
import { DUMMY_IMAGES } from "@/constants/dummyData";
import { FiChevronLeft, FiChevronRight, FiArrowRight } from "react-icons/fi";

interface HeroSectionProps {
  user?: any;
}

const AUTO_PLAY_INTERVAL = 5000; // ms

export default function HeroSection({ user }: HeroSectionProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [textKey, setTextKey] = useState(0); // bump to re-trigger CSS fade-in
  const touchStart = useRef<number | null>(null);

  /* Fetch active banners on mount */
  useEffect(() => {
    bannerService
      .getActiveBanners()
      .then((res) => setBanners(res.payload?.banners ?? []))
      .catch(() => { })
      .finally(() => setIsLoaded(true));
  }, []);

  const hasBanners = isLoaded && banners.length > 0;
  const banner = hasBanners ? banners[current] : null;

  /* Navigation */
  const goTo = useCallback(
    (index: number) => {
      if (!banners.length) return;
      setCurrent((index + banners.length) % banners.length);
      setTextKey((k) => k + 1); // re-mount text so CSS animation replays
    },
    [banners.length]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  /* Auto-advance */
  useEffect(() => {
    if (!hasBanners || banners.length <= 1 || isPaused) return;
    const id = setInterval(next, AUTO_PLAY_INTERVAL);
    return () => clearInterval(id);
  }, [hasBanners, banners.length, isPaused, next]);

  /* Touch swipe on image card */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const delta = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) delta > 0 ? next() : prev();
    touchStart.current = null;
  };

  return (
    <section
      className="flex items-center px-[5%] py-10 sm:py-14 lg:py-6 xl:py-8 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] relative overflow-hidden"
      onMouseEnter={() => hasBanners && setIsPaused(true)}
      onMouseLeave={() => hasBanners && setIsPaused(false)}
    >

      {/* ── Richer background ──────────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary blurred orbs */}
        <div className="absolute -top-32 -right-32 w-72 h-72 lg:w-96 lg:h-96 bg-gradient-to-br from-rose-300/40 to-rose-500/40 dark:from-rose-400/25 dark:to-rose-600/25 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-72 h-72 lg:w-96 lg:h-96 bg-gradient-to-br from-rose-500/35 to-rose-700/35 dark:from-rose-600/20 dark:to-rose-700/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-rose-200/20 to-rose-400/20 dark:from-rose-800/10 dark:to-rose-900/10 rounded-full blur-3xl" />
        {/* Extra accent orbs */}
        <div className="absolute top-10 left-1/3 w-40 h-40 bg-rose-400/15 dark:bg-rose-500/10 rounded-full blur-2xl" />
        <div className="absolute bottom-16 right-1/4 w-52 h-52 bg-rose-300/20 dark:bg-rose-400/10 rounded-full blur-2xl" />

        {/* Subtle dot-grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04] dark:opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#e11d48" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>
      </div>

      <div className="flex flex-col-reverse lg:flex-row items-center justify-between w-full max-w-7xl mx-auto relative z-10 gap-6 lg:gap-10">

        {/* ── LEFT — content ───────────────────────────────────────────── */}
        <div className="w-full lg:w-[55%] xl:w-[52%] text-center lg:text-left">
          {!isLoaded ? (
            /* ── Skeleton loader (prevents flash of fallback on page refresh) ── */
            <div className="space-y-5 animate-pulse">
              <div className="inline-block w-24 h-7 bg-slate-300/60 dark:bg-slate-700/60 rounded-full mx-auto lg:mx-0" />
              <div className="space-y-3">
                <div className="w-3/4 h-12 md:h-14 bg-slate-300/60 dark:bg-slate-700/60 rounded-2xl mx-auto lg:mx-0" />
                <div className="w-1/2 h-10 md:h-12 bg-slate-300/40 dark:bg-slate-700/40 rounded-2xl mx-auto lg:mx-0" />
              </div>
              <div className="w-2/3 h-5 bg-slate-300/40 dark:bg-slate-700/40 rounded-lg mx-auto lg:mx-0" />
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <div className="w-36 h-12 bg-slate-300/60 dark:bg-slate-700/60 rounded-xl" />
                <div className="w-44 h-12 bg-slate-300/40 dark:bg-slate-700/40 rounded-xl" />
              </div>
            </div>
          ) : hasBanners && banner ? (
            /*
             * Banner-driven content — keyed on `textKey` so that every slide
             * change re-mounts the node, replaying the hero-text-in animation.
             */
            <div key={textKey} className="space-y-5 animate-hero-text-in">

              {/* Badge chip */}
              {banner.badge && (
                <span className="inline-block px-4 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-full uppercase tracking-widest shadow-md">
                  {banner.badge}
                </span>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-rose-700 to-rose-500 bg-clip-text text-transparent">
                  {banner.title}
                </span>
              </h1>

              {/* Subtitle */}
              {banner.subtitle && (
                <p className="text-lg md:text-xl text-slate-600 dark:text-gray-300 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                  {banner.subtitle}
                </p>
              )}

              {/* CTA row */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                {/* Primary — banner's custom CTA */}
                <Link
                  href={banner.ctaLink || "/products"}
                  className="relative inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-rose-700 to-rose-600 text-white hover:text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-rose-600/30 hover:scale-105 group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-rose-800 to-rose-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  <span className="relative z-10 text-white">
                    {banner.ctaText || "Shop Now"}
                  </span>
                  <FiArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Secondary — always Browse Categories */}
                <Link
                  href="/categories"
                  className="relative inline-flex items-center justify-center px-8 py-3.5 border-2 border-rose-600 text-rose-700 dark:text-rose-400 font-medium rounded-xl overflow-hidden z-10 transition-all duration-300 hover:text-white dark:hover:text-white group"
                >
                  <span className="absolute inset-0 bg-rose-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-[-1]" />
                  <span className="relative">Browse Categories</span>
                </Link>
              </div>


            </div>
          ) : (
            /* ── Fallback static content (only shown when API confirms 0 banners) ── */
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-rose-700 to-rose-600 bg-clip-text text-transparent">
                  Perfect
                </span>{" "}
                <span className="text-slate-900 dark:text-gray-100">
                  Gifts for Every
                </span>{" "}
                <span className="text-rose-600 text-5xl md:text-6xl lg:text-7xl">
                  Occasion
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Discover thoughtfully curated gifts that create lasting memories.
                From personalized treasures to luxury collections.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/products"
                  className="relative inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-rose-700 to-rose-600 text-white font-medium rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 group hover:text-white [&_*::selection]:bg-white/30 [&_*::selection]:text-white [&_*::-moz-selection]:bg-white/30 [&_*::-moz-selection]:text-white"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-rose-800 to-rose-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-[-1]" />
                  <span className="relative z-10 text-white [&::selection]:bg-white/30 [&::selection]:text-white [&::-moz-selection]:bg-white/30 [&::-moz-selection]:text-white">
                    Shop Now
                  </span>
                </Link>
                <Link
                  href="/categories"
                  className="relative inline-flex items-center justify-center px-8 py-3 border-2 border-rose-600 text-rose-700 dark:text-rose-400 font-medium rounded-lg overflow-hidden z-10 transition-all duration-300 hover:text-white dark:hover:text-white group"
                >
                  <span className="absolute inset-0 bg-rose-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-[-1]" />
                  <span className="relative">Browse Categories</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT — image card ───────────────────────────────────────── */}
        <div className="w-full lg:w-[45%] xl:w-[42%] flex justify-center lg:justify-end items-center">
          {/* Mobile/Tablet: max-w-[300px] -> sm -> md — Desktop: dynamic square up to 520px via hero-banner-card */}
          <div className="relative w-full max-w-[300px] sm:max-w-sm md:max-w-md lg:max-w-none hero-banner-card">
            {/* Mobile: landscape card (3/2) — Tablet: 4/3 — Desktop: balanced square (1/1) */}
            <div
              className="relative w-full aspect-[3/2] sm:aspect-[4/3] lg:aspect-square rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-white/10"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
            {!isLoaded ? (
              /* ── Card Skeleton (prevents image flash on page refresh) ── */
              <div className="w-full h-full bg-slate-200/80 dark:bg-slate-800/80 animate-pulse flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-rose-500/30 border-t-rose-500 animate-spin" />
              </div>
            ) : hasBanners ? (
              <>
                {/* Sliding track — all banner images laid out side-by-side */}
                <div
                  className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
                  style={{
                    width: `${banners.length * 100}%`,
                    transform: `translateX(-${current * (100 / banners.length)}%)`,
                  }}
                >
                  {banners.map((b, i) => (
                    <div
                      key={b._id}
                      className="relative h-full flex-shrink-0"
                      style={{ width: `${100 / banners.length}%` }}
                    >
                      <Image
                        src={b.imageUrl || DUMMY_IMAGES.hero}
                        alt={b.title}
                        fill
                        className="object-cover"
                        priority={i === 0}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>

                {/* Subtle bottom gradient so dots stay readable */}
                <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

                {/* Prev / Next arrows — inside card edges */}
                {banners.length > 1 && (
                  <>
                    <button
                      onClick={prev}
                      aria-label="Previous banner"
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/25 backdrop-blur-sm border border-white/40 text-white hover:text-white flex items-center justify-center hover:bg-white/40 transition-all duration-200 hover:scale-110"
                    >
                      <FiChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={next}
                      aria-label="Next banner"
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/25 backdrop-blur-sm border border-white/40 text-white hover:text-white flex items-center justify-center hover:bg-white/40 transition-all duration-200 hover:scale-110"
                    >
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Dot indicators */}
                {banners.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
                    {banners.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goTo(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        className={`transition-all duration-300 rounded-full ${i === current
                            ? "w-6 h-2 bg-white"
                            : "w-2 h-2 bg-white/50 hover:bg-white/75"
                          }`}
                      />
                    ))}
                  </div>
                )}

                {/* Progress bar along card bottom edge */}
                {banners.length > 1 && !isPaused && (
                  <div
                    key={`pb-${current}`}
                    className="absolute bottom-0 left-0 h-0.5 bg-rose-500 animate-progress-bar"
                    style={{ animationDuration: `${AUTO_PLAY_INTERVAL}ms` }}
                  />
                )}
              </>
            ) : (
              /* Fallback — static image (only when API confirms 0 banners) */
              <Image
                src={DUMMY_IMAGES.hero}
                alt="Gift collection"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
