"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FiShoppingBag, FiFilter } from "react-icons/fi";

interface OrdersEmptyStateProps {
  type: "no-orders" | "no-filtered-orders";
  onResetFilters?: () => void;
}

export function OrdersEmptyState({
  type,
  onResetFilters,
}: OrdersEmptyStateProps) {
  if (type === "no-orders") {
    // `relative` matters: the decorative grid below is absolutely positioned,
    // and without a positioned parent it resolved against the viewport instead
    // - covering the whole page, sidebar included, and swallowing every click.
    // pointer-events-none is the belt to that braces, since the layer is
    // decoration and should never take input.
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <div className="pointer-events-none absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-700/25 bg-[size:20px_20px] opacity-50"></div>
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl">
            <CardContent className="p-8 lg:p-12 text-center">
              <div className="mb-8">
                <div className="w-32 h-32 lg:w-40 lg:h-40 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center shadow-xl">
                  <FiShoppingBag className="w-16 h-16 lg:w-20 lg:h-20 text-slate-400 dark:text-slate-500" />
                </div>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
                No Orders Found
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                You haven&apos;t placed any orders yet. Start shopping to see
                your orders here!
              </p>
              <Link
                href="/products"
                className="relative inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-rose-700 to-rose-600 text-white font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 group hover:text-white [&_*::selection]:bg-white/30 [&_*::selection]:text-white [&_*::-moz-selection]:bg-white/30 [&_*::-moz-selection]:text-white"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-rose-800 to-rose-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-[-1]"></span>
                <span className="relative z-10 text-white [&::selection]:bg-white/30 [&::selection]:text-white [&::-moz-selection]:bg-white/30 [&::-moz-selection]:text-white">
                  Start Shopping
                </span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
      <CardContent className="p-8 lg:p-12 text-center">
        <div className="mb-6">
          <div className="w-24 h-24 lg:w-32 lg:h-32 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center shadow-lg">
            <FiFilter className="w-12 h-12 lg:w-16 lg:h-16 text-slate-400 dark:text-slate-500" />
          </div>
        </div>
        <h3 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
          No orders match your filters
        </h3>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          Try adjusting your filters to see more results.
        </p>
        <Button
          onClick={onResetFilters}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Clear Filters
        </Button>
      </CardContent>
    </Card>
  );
}
