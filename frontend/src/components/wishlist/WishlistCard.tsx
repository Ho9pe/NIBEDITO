"use client";

import Image from "next/image";
import Link from "next/link";
import { FiShoppingCart, FiTrash2, FiTrendingDown, FiStar } from "react-icons/fi";
import { useWishlist } from "@/contexts/WishlistContext";
import { useToast } from "@/hooks/useToast";
import type { WishlistItem } from "@/types/wishlist";

interface WishlistCardProps {
  item: WishlistItem;
}

// ─── Star rating sub-component ────────────────────────────────────────────
const StarRating = ({ rating, reviewCount }: { rating: number; reviewCount: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-1 text-sm">
      {Array.from({ length: fullStars }, (_, i) => (
        <FiStar key={`f-${i}`} className="w-3.5 h-3.5 fill-current text-yellow-400" />
      ))}
      {hasHalf && (
        <div className="relative">
          <FiStar className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
          <FiStar
            className="w-3.5 h-3.5 fill-current text-yellow-400 absolute inset-0"
            style={{ clipPath: "inset(0 50% 0 0)" }}
          />
        </div>
      )}
      {Array.from({ length: emptyStars }, (_, i) => (
        <FiStar key={`e-${i}`} className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
      ))}
      <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">
        {rating.toFixed(1)} ({reviewCount})
      </span>
    </div>
  );
};

// ─── "X days ago" formatter ───────────────────────────────────────────────
const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
};

// ─── WishlistCard ─────────────────────────────────────────────────────────
export default function WishlistCard({ item }: WishlistCardProps) {
  const { removeFromWishlist } = useWishlist();
  const toast = useToast();

  const { product, priceAtTimeOfWishlisting, addedAt } = item;
  const hasPriceDropped = product.price < priceAtTimeOfWishlisting;
  const priceDrop = priceAtTimeOfWishlisting - product.price;
  const dropPercent = Math.round((priceDrop / priceAtTimeOfWishlisting) * 100);

  const handleRemove = async () => {
    const success = await removeFromWishlist(item._id);
    if (success) {
      toast.success("Removed from wishlist");
    } else {
      toast.error("Failed to remove item");
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.isActive) {
      toast.error("This product is currently unavailable");
      return;
    }
    // Navigate to product page for variant selection if no default variant
    // For now, attempt add with first variant logic same as ProductCard
    toast.info("Select a variant on the product page");
  };

  return (
    <div className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-slate-200/60 dark:hover:shadow-slate-900/60 hover:border-rose-200 dark:hover:border-rose-900/50 transition-all duration-300">
      <div className="flex gap-0">
        {/* Thumbnail */}
        <Link
          href={`/products/${product.slug}`}
          className="relative flex-shrink-0 w-32 sm:w-40 h-36 sm:h-44 overflow-hidden bg-slate-100 dark:bg-slate-700"
        >
          <Image
            src={product.thumbnailImage || "/images/placeholder.jpg"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="160px"
          />
          {/* Price-drop badge on image */}
          {hasPriceDropped && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md">
              <FiTrendingDown className="w-3 h-3" />
              ▼{dropPercent}%
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
          <div>
            {/* Product name */}
            <Link href={`/products/${product.slug}`}>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base line-clamp-2 hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-200 mb-2">
                {product.name}
              </h3>
            </Link>

            {/* Price row */}
            <div className="flex items-baseline gap-2 flex-wrap mb-1">
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                ৳{product.price.toFixed(2)}
              </span>
              {hasPriceDropped && (
                <>
                  <span className="text-sm text-slate-400 line-through">
                    ৳{priceAtTimeOfWishlisting.toFixed(2)}
                  </span>
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-0.5">
                    <FiTrendingDown className="w-3 h-3" />
                    Save ৳{priceDrop.toFixed(2)}
                  </span>
                </>
              )}
            </div>

            {/* Ratings */}
            <StarRating
              rating={product.ratings || 0}
              reviewCount={product.reviewCount || 0}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            {/* Added date */}
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Added {timeAgo(addedAt)}
            </span>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRemove}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-900 transition-all duration-200"
                title="Remove from wishlist"
              >
                <FiTrash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Remove</span>
              </button>

              <Link
                href={`/products/${product.slug}`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 rounded-lg transition-all duration-200 active:scale-95"
              >
                <FiShoppingCart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add to Cart</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
