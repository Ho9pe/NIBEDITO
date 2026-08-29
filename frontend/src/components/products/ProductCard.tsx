"use client";

import Image from "next/image";
import Link from "next/link";
import { FiShoppingCart, FiStar, FiHeart } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import MarkdownRenderer from "@/components/common/MarkdownRenderer";
import LoginPopup from "@/components/common/LoginPopup";
import type { Product } from "@/types";
import { logger } from "@/utils/logger";

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
}

// ─── Star rating sub-component ────────────────────────────────────────────
const StarRating = ({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount: number;
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1 text-sm">
      {Array.from({ length: fullStars }, (_, i) => (
        <FiStar key={`full-${i}`} className="w-4 h-4 fill-current text-yellow-400" />
      ))}
      {hasHalfStar && (
        <div className="relative">
          <FiStar className="w-4 h-4 text-gray-300 dark:text-gray-600" />
          <FiStar
            className="w-4 h-4 fill-current text-yellow-400 absolute inset-0"
            style={{ clipPath: "inset(0 50% 0 0)" }}
          />
        </div>
      )}
      {Array.from({ length: emptyStars }, (_, i) => (
        <FiStar key={`empty-${i}`} className="w-4 h-4 text-gray-300 dark:text-gray-600" />
      ))}
      <span className="ml-1 text-text-secondary text-xs sm:text-sm">
        {rating.toFixed(1)} ({reviewCount}{" "}
        {reviewCount === 1 ? "review" : "reviews"})
      </span>
    </div>
  );
};

// ─── ProductCard ──────────────────────────────────────────────────────────
export default function ProductCard({
  product,
  viewMode = "grid",
}: ProductCardProps) {
  const { addToCart, cart } = useCart();
  const { isWishlisted, addToWishlist, removeByProductId } = useWishlist();
  const { user } = useAuth();
  const toast = useToast();
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const { _id, slug, name, description, price, thumbnailImage, variants } =
    product;

  const wishlisted = isWishlisted(_id);

  const isMobile = useRef<boolean>(
    typeof window !== "undefined" && window.innerWidth <= 768
  );

  useEffect(() => {
    const el = document.querySelector(`#product-${_id} .product-description`);
    if (el && el.scrollHeight > el.clientHeight) {
      el.classList.add("truncated");
    }
  }, [_id]);

  // ─── Cart handler ───────────────────────────────────────────────────
  const handleAddToCart = async (e: React.MouseEvent): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setShowLoginPopup(true);
      return;
    }

    if (!variants || variants.length === 0) {
      toast.error("No variants available for this product");
      return;
    }

    const defaultVariant = variants[0];
    const existingCartItem = cart?.items?.find(
      (item) =>
        item.product._id === _id && item.variant._id === defaultVariant._id
    );

    try {
      if (existingCartItem) {
        const success = await addToCart(
          _id,
          existingCartItem.quantity + 1,
          defaultVariant._id
        );
        if (success) toast.success("Updated quantity in cart");
        else toast.error("Failed to update cart");
      } else {
        const success = await addToCart(_id, 1, defaultVariant._id);
        if (success) toast.success("Added to cart successfully!");
        else toast.error("Failed to add to cart");
      }
    } catch {
      toast.error("Error adding to cart");
    }
  };

  // ─── Wishlist handler ────────────────────────────────────────────────
  const handleWishlistToggle = async (e: React.MouseEvent): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setShowLoginPopup(true);
      return;
    }

    setWishlistLoading(true);
    try {
      if (wishlisted) {
        const success = await removeByProductId(_id);
        if (success) toast.success("Removed from wishlist");
        else toast.error("Failed to remove from wishlist");
      } else {
        const success = await addToWishlist(_id);
        if (success) toast.success("Added to wishlist!");
        else toast.error("Failed to add to wishlist");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setWishlistLoading(false);
    }
  };

  logger.debug("Rendering ProductCard for:", name);

  // ════════════════════════════════════════════════════════════════════
  // LIST VIEW — uses the correct CSS classes: product-list-item etc.
  // Action buttons live in product-list-actions (outside the Link area)
  // ════════════════════════════════════════════════════════════════════
  if (viewMode === "list") {
    return (
      <>
        <div id={`product-${_id}`} className="product-list-item">
          {/* Clickable region: image + info */}
          <Link
            href={`/products/${slug}`}
            className="flex flex-row flex-1 min-w-0 no-underline"
          >
            <div className="product-list-image">
              <Image
                src={thumbnailImage || "/images/placeholder.jpg"}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 480px) 96px, (max-width: 640px) 128px, 192px"
              />
            </div>
            <div className="product-list-content">
              <div className="product-list-info">
                <div>
                  <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white mb-1 line-clamp-2">
                    {name}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    <MarkdownRenderer
                      markdown={description.slice(0, 80) + (description.length > 80 ? "..." : "")}
                      disableLinks={true}
                    />
                  </div>
                </div>
                <div className="mt-auto pt-2">
                  <StarRating
                    rating={product.ratings || 0}
                    reviewCount={product.reviewCount || 0}
                  />
                  <p className="font-bold text-rose-600 dark:text-rose-400 mt-1">
                    ৳{price.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* ── Action buttons: outside the Link — no navigation on click ── */}
          <div className="product-list-actions gap-2">
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors duration-200 active:scale-95 whitespace-nowrap"
            >
              <FiShoppingCart className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Add to Cart</span>
            </button>

            <button
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
              title={wishlisted ? "Saved to wishlist — manage in Wishlist page" : "Save to wishlist"}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 active:scale-95 disabled:opacity-60 whitespace-nowrap ${
                wishlisted
                  ? "bg-rose-500 border-rose-500 text-white"
                  : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-rose-400 hover:text-rose-600 dark:hover:text-rose-400"
              }`}
            >
              <FiHeart className={`w-4 h-4 flex-shrink-0 ${wishlisted ? "fill-current" : ""}`} />
              <span className="hidden sm:inline">{wishlisted ? "Saved" : "Wishlist"}</span>
            </button>
          </div>
        </div>

        <LoginPopup
          isOpen={showLoginPopup}
          onClose={() => setShowLoginPopup(false)}
          title="Login Required"
          message="Please login to add items to your cart and enjoy a personalized shopping experience."
        />
      </>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // GRID VIEW — product-card is position:relative, heart sits on top
  // Link wraps image + info only (not full card height)
  // Cart button and heart are both OUTSIDE the Link
  // ════════════════════════════════════════════════════════════════════
  return (
    <>
      <div id={`product-${_id}`} className="product-card">
        {/* Heart button — absolutely positioned, outside Link, no navigation */}
        <button
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
          title={wishlisted ? "Saved to wishlist" : "Save to wishlist"}
          className={`absolute top-2 right-2 z-20 w-8 h-8 flex items-center justify-center rounded-full shadow transition-all duration-200 active:scale-90 disabled:opacity-60 ${
            wishlisted
              ? "bg-rose-500 text-white shadow-rose-400/50"
              : "bg-white/90 dark:bg-slate-700/90 text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-700"
          }`}
        >
          <FiHeart className={`w-3.5 h-3.5 ${wishlisted ? "fill-current" : ""}`} />
        </button>

        {/* Clickable region: image + product info */}
        <Link href={`/products/${slug}`} className="block flex-1 min-h-0">
          <div className="relative w-full aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
            <Image
              src={thumbnailImage || "/images/placeholder.jpg"}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="p-3">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-2 mb-1">
              {name}
            </h3>
            <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
              <MarkdownRenderer markdown={description} disableLinks={true} />
            </div>
            <div className="flex items-center justify-between mt-auto">
              <p className="font-bold text-rose-600 dark:text-rose-400">৳{price.toFixed(2)}</p>
              <StarRating
                rating={product.ratings || 0}
                reviewCount={product.reviewCount || 0}
              />
            </div>
          </div>
        </Link>

        {/* Add to Cart — outside Link, no navigation */}
        <div className="px-3 pb-3">
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors duration-200 active:scale-95"
          >
            <FiShoppingCart className="w-4 h-4" />
            <span>{isMobile.current ? "Add" : "Add to Cart"}</span>
          </button>
        </div>
      </div>

      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        title="Login Required"
        message="Please login to add items to your cart and enjoy a personalized shopping experience."
      />
    </>
  );
}
