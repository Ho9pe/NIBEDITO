"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FiShoppingBag, FiArrowRight } from "react-icons/fi";

export default function EmptyCart(): React.JSX.Element {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl h-96 animate-pulse bg-white/20 dark:bg-slate-800/20 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-700/25 bg-[size:20px_20px] opacity-50"></div>

      <div className="relative z-10 w-full max-w-2xl animate-fade-in">
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="p-8 lg:p-12 text-center">
            {/* Icon */}
            <div className="mb-8">
              <div className="w-32 h-32 lg:w-40 lg:h-40 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center shadow-xl">
                <FiShoppingBag className="w-16 h-16 lg:w-20 lg:h-20 text-slate-400 dark:text-slate-500" />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
                  Your Cart is Empty
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-2">
                  Looks like you haven&apos;t added anything to your cart yet.
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  Browse our products and find something you like!
                </p>
              </div>

              {/* Suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200/50 dark:border-blue-800/30">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-3 mx-auto">
                    <span className="text-white text-sm font-bold">✨</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                    New Arrivals
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Check out our latest products
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border border-green-200/50 dark:border-green-800/30">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-3 mx-auto">
                    <span className="text-white text-sm font-bold">🔥</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                    Best Sellers
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Popular items everyone loves
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl border border-purple-200/50 dark:border-purple-800/30">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-3 mx-auto">
                    <span className="text-white text-sm font-bold">💰</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                    On Sale
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Great deals and discounts
                  </p>
                </div>
              </div>

              {/* Action Button - Fixed to work like hero section button */}
              <Link
                href="/products"
                className="relative inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-rose-700 to-rose-600 text-white font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 group [&_*::selection]:bg-white/30 [&_*::selection]:text-white [&_*::-moz-selection]:bg-white/30 [&_*::-moz-selection]:text-white"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-rose-800 to-rose-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-[-1]"></span>
                <FiShoppingBag className="relative z-10 w-5 h-5 text-white [&::selection]:bg-white/30 [&::selection]:text-white [&::-moz-selection]:bg-white/30 [&::-moz-selection]:text-white" />
                <span className="relative z-10 text-white [&::selection]:bg-white/30 [&::selection]:text-white [&::-moz-selection]:bg-white/30 [&::-moz-selection]:text-white">
                  Continue Shopping
                </span>
                <FiArrowRight className="relative z-10 w-5 h-5 text-white [&::selection]:bg-white/30 [&::selection]:text-white [&::-moz-selection]:bg-white/30 [&::-moz-selection]:text-white" />
              </Link>

              {/* Additional Links */}
              <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm">
                <Link
                  href="/categories"
                  className="text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                >
                  Browse Categories
                </Link>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <Link
                  href="/wishlist"
                  className="text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                >
                  My Wishlist
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
