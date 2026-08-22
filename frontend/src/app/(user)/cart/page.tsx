"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import CartItems from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import EmptyCart from "@/components/cart/EmptyCart";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { FiShoppingCart } from "react-icons/fi";

export default function CartPage() {
  const router = useRouter();
  const { cart, loading } = useCart();
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading only on initial mount
  if (!mounted || loading) {
    return <LoadingSpinner fullPage={true} />;
  }

  // Show empty cart if no items
  if (!cart?.items?.length) {
    return <EmptyCart />;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Background Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-700/25 bg-[size:20px_20px] opacity-50"></div>

      <div className="relative z-10 animate-fade-in">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 lg:py-6 max-w-7xl">
          {/* Enhanced Header with Clean Gradient Styling */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              {/* Enhanced Light Theme Background with More Vibrant Colors */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100/95 via-indigo-100/90 to-purple-100/95 dark:from-slate-800/90 dark:via-slate-700/85 dark:to-indigo-900/90"></div>

              {/* Content */}
              <div className="relative z-10 flex items-center gap-3 sm:gap-4 p-6 sm:p-8 lg:p-10">
                {/* Enhanced Icon with Better Light Theme Contrast and Shimmer */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/80 to-indigo-500/70 dark:from-blue-600/40 dark:to-indigo-500/30 rounded-xl lg:rounded-2xl blur-sm animate-pulse"></div>
                  <div className="relative p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-white/90 to-blue-100/80 dark:from-slate-700/80 dark:to-slate-600/70 backdrop-blur-sm rounded-xl lg:rounded-2xl border border-blue-300/60 dark:border-blue-700/30 shadow-lg">
                    <FiShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-blue-700 dark:text-blue-400 drop-shadow-sm" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Enhanced Title with Better Light Theme Visibility */}
                  <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-slate-800 dark:text-slate-200 mb-2 drop-shadow-sm tracking-tight">
                    <span className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 dark:from-slate-300 dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
                      Shopping Cart
                    </span>
                  </h1>

                  {/* Enhanced Subtitle with Better Light Theme Colors */}
                  <div className="flex items-center gap-3">
                    <div className="h-1 w-8 sm:w-12 lg:w-16 bg-gradient-to-r from-blue-500/90 via-indigo-500/80 to-purple-500/70 dark:from-blue-500/60 dark:via-indigo-500/50 dark:to-purple-500/40 rounded-full shadow-sm"></div>
                    <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base lg:text-xl font-semibold drop-shadow-sm">
                      <span className="bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent font-bold text-lg sm:text-xl lg:text-2xl">
                        {cart.items.length}
                      </span>{" "}
                      <span className="text-slate-600 dark:text-slate-400">
                        {cart.items.length === 1 ? "item" : "items"} ready for
                        checkout
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced Bottom Accent Line with More Vibrant Light Theme Colors */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400/80 via-indigo-400/70 via-purple-400/60 via-pink-400/50 to-rose-400/40 dark:from-blue-600/40 dark:via-indigo-600/30 dark:via-purple-600/25 dark:via-pink-600/20 dark:to-rose-600/15"></div>
            </div>
          </div>

          {/* Cart Grid - Mobile optimized */}
          <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6 xl:gap-8">
            {/* Cart Items - Full width on mobile, 2/3 on desktop */}
            <div className="lg:col-span-2">
              <CartItems items={cart.items} />
            </div>

            {/* Cart Summary - Full width on mobile, 1/3 on desktop */}
            <div className="lg:col-span-1">
              <CartSummary cart={cart} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
