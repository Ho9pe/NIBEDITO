"use client";

import React from "react";
import {
  FiShield,
  FiRefreshCw,
  FiLock,
  FiTruck,
  FiStar,
} from "react-icons/fi";

const TRUST_ITEMS = [
  {
    id: 1,
    icon: <FiShield className="w-5 h-5" />,
    title: "100% Authentic",
    desc: "Genuine & verified products",
  },
  {
    id: 2,
    icon: <FiRefreshCw className="w-5 h-5" />,
    title: "Easy Returns",
    desc: "Hassle-free within 7 days",
  },
  {
    id: 3,
    icon: <FiLock className="w-5 h-5" />,
    title: "Secure Payments",
    desc: "SSL encrypted checkout",
  },
  {
    id: 4,
    icon: <FiTruck className="w-5 h-5" />,
    title: "Fast Delivery",
    desc: "Same-day & express options",
  },
  {
    id: 5,
    icon: <FiStar className="w-5 h-5" />,
    title: "Trusted by 10K+",
    desc: "Happy customers & counting",
  },
];

export default function TrustBar() {
  return (
    <section className="relative px-[5%] py-6 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
      {/* Subtle top divider glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-400/40 to-transparent" />

      <div className="max-w-7xl mx-auto">
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-600/40 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 px-4 py-4 lg:px-8 lg:py-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-0 lg:divide-x lg:divide-slate-200 dark:lg:divide-slate-600">
            {TRUST_ITEMS.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-3 lg:px-6 first:lg:pl-0 last:lg:pr-0 group"
                style={{ animationDelay: `${idx * 80}ms`, animationFillMode: "both" }}
              >
                {/* Icon bubble */}
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white shadow-md shadow-rose-500/25 group-hover:scale-110 group-hover:shadow-rose-500/40 transition-all duration-300">
                  {item.icon}
                </div>
                {/* Text */}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-gray-100 leading-tight">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-gray-400 leading-snug mt-0.5 truncate">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subtle bottom divider glow */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-400/40 to-transparent" />
    </section>
  );
}
