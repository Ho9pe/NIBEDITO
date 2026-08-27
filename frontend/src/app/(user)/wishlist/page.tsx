"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useToast } from "@/hooks/useToast";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import WishlistCard from "@/components/wishlist/WishlistCard";
import {
  FiHeart,
  FiTrash2,
  FiShoppingBag,
  FiArrowRight,
} from "react-icons/fi";
import type { WishlistItem } from "@/types/wishlist";

type SortKey = "recent" | "price-low" | "price-high" | "price-dropped";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Recently Added" },
  { value: "price-low", label: "Price: Low → High" },
  { value: "price-high", label: "Price: High → Low" },
  { value: "price-dropped", label: "Price Dropped" },
];

export default function WishlistPage() {
  const { user } = useAuth();
  const { wishlist, loading, clearWishlist, refetchWishlist } = useWishlist();
  const toast = useToast();

  const [sortBy, setSortBy] = useState<SortKey>("recent");
  const [sortedItems, setSortedItems] = useState<WishlistItem[]>([]);
  const [clearing, setClearing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch full wishlist data when this page mounts
  useEffect(() => {
    refetchWishlist();
  }, [refetchWishlist]);

  // Sort items whenever wishlist or sort key changes
  const applySort = useCallback(() => {
    if (!wishlist) { setSortedItems([]); return; }
    const items = [...wishlist.items];

    switch (sortBy) {
      case "recent":
        items.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
        break;
      case "price-low":
        items.sort((a, b) => a.product.price - b.product.price);
        break;
      case "price-high":
        items.sort((a, b) => b.product.price - a.product.price);
        break;
      case "price-dropped":
        // Show price-dropped items first, then rest
        items.sort((a, b) => {
          const aDrop = a.priceAtTimeOfWishlisting - a.product.price;
          const bDrop = b.priceAtTimeOfWishlisting - b.product.price;
          return bDrop - aDrop;
        });
        break;
    }

    setSortedItems(items);
  }, [wishlist, sortBy]);

  useEffect(() => {
    applySort();
  }, [applySort]);

  const handleClearWishlist = async () => {
    setClearing(true);
    const success = await clearWishlist();
    setClearing(false);
    setShowConfirm(false);
    if (success) {
      toast.success("Wishlist cleared");
    } else {
      toast.error("Failed to clear wishlist");
    }
  };

  // ─── Computed values ────────────────────────────────────────────────
  const itemCount = wishlist?.items.length ?? 0;
  const droppedCount = wishlist?.items.filter(
    (item) => item.product.price < item.priceAtTimeOfWishlisting
  ).length ?? 0;

  // ─── Loading ────────────────────────────────────────────────────────
  if (loading) return <LoadingSpinner fullPage={true} />;

  // ─── Empty state ────────────────────────────────────────────────────
  if (!wishlist || itemCount === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-rose-100 dark:bg-rose-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiHeart className="w-10 h-10 text-rose-400 dark:text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
            Save products you love and get notified when their prices drop.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl transition-all duration-200 active:scale-95"
          >
            Browse Products
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // ─── Main page ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-4xl">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-6 border-b border-slate-200 dark:border-slate-800 relative">
          {/* Rose gradient accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />

          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-100 dark:bg-rose-950/30 rounded-xl">
              <FiHeart className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-0.5">
                My <span className="text-rose-600 dark:text-rose-400">Wishlist</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Products you love, all in one place
              </p>
            </div>
          </div>

          {/* Clear all button */}
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-900 transition-all duration-200"
            >
              <FiTrash2 className="w-4 h-4" />
              Clear All
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Are you sure?</span>
              <button
                onClick={handleClearWishlist}
                disabled={clearing}
                className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 disabled:opacity-60"
              >
                {clearing ? "Clearing…" : "Yes, clear"}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* ── Summary bar ── */}
        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-slate-900 dark:text-white">{itemCount}</span>
            <span className="text-slate-500 dark:text-slate-400">{itemCount === 1 ? "item" : "items"}</span>
          </div>
          {droppedCount > 0 && (
            <>
              <div className="w-px h-4 bg-slate-200 dark:bg-slate-600" />
              <div className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 font-medium">
                <span>🎉</span>
                <span>{droppedCount} {droppedCount === 1 ? "item has" : "items have"} dropped in price!</span>
              </div>
            </>
          )}
        </div>

        {/* ── Sort bar ── */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-1">
          <span className="text-sm text-slate-500 dark:text-slate-400 flex-shrink-0">Sort:</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`flex-shrink-0 px-4 py-1.5 text-sm font-medium rounded-full border transition-all duration-200 ${
                sortBy === opt.value
                  ? "bg-rose-600 dark:bg-rose-500 text-white border-rose-600 dark:border-rose-500"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-700 hover:text-rose-600 dark:hover:text-rose-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* ── Items list ── */}
        <div className="space-y-3">
          {sortedItems.map((item) => (
            <WishlistCard key={item._id} item={item} />
          ))}
        </div>

        {/* ── Continue shopping ── */}
        <div className="mt-8 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-200"
          >
            <FiShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
