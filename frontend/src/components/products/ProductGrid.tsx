"use client";

import { useState } from "react";
import LoadingSpinner from "../common/LoadingSpinner";
import LoginPopup from "../common/LoginPopup";
import Pagination from "../common/Pagination";
import { FiShoppingCart, FiStar, FiHeart } from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import type { Product, PaginationInfo } from "@/types";

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  error?: string | null;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void; // Added: Prop for limit change handler
  viewMode?: "grid" | "list";
}

// Helper component for rendering star ratings
const StarRating = ({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount: number;
}) => {
  const numericRating = Number(rating) || 0;
  const numericReviewCount = Number(reviewCount) || 0;
  const fullStars = Math.floor(numericRating);
  const hasHalfStar = numericRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1 text-sm">
      {/* Render full stars */}
      {Array.from({ length: fullStars }, (_, i) => (
        <FiStar
          key={`full-${i}`}
          className="w-4 h-4 fill-current text-yellow-400"
        />
      ))}
      {/* Render half star if applicable */}
      {hasHalfStar && (
        <div className="relative">
          <FiStar className="w-4 h-4 text-gray-300 dark:text-gray-600" />
          <FiStar
            className="w-4 h-4 fill-current text-yellow-400 absolute inset-0"
            style={{ clipPath: "inset(0 50% 0 0)" }}
          />
        </div>
      )}
      {/* Render empty stars */}
      {Array.from({ length: emptyStars }, (_, i) => (
        <FiStar
          key={`empty-${i}`}
          className="w-4 h-4 text-gray-300 dark:text-gray-600"
        />
      ))}
      {/* Rating text and review count */}
      <span className="ml-1 text-text-secondary text-xs sm:text-sm">
        {numericRating.toFixed(1)} ({numericReviewCount} )
      </span>
    </div>
  );
};

export default function ProductGrid({
  products,
  isLoading,
  error,
  pagination,
  onPageChange,
  onLimitChange,
  viewMode = "grid",
}: ProductGridProps) {
  const { addToCart } = useCart();
  const { isWishlisted, addToWishlist, removeByProductId } = useWishlist();
  const { user } = useAuth();
  const toast = useToast();
  const [addingToCart, setAddingToCart] = useState<Record<string, boolean>>({});
  const [wishlistLoading, setWishlistLoading] = useState<Record<string, boolean>>({});
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const handleAddToCart = async (
    product: Product,
    e: React.MouseEvent
  ): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is logged in
    if (!user) {
      setShowLoginPopup(true);
      return;
    }

    if (!product.variants || product.variants.length === 0) {
      toast.error("No variants available for this product");
      return;
    }

    const productId = product._id;
    setAddingToCart((prev) => ({ ...prev, [productId]: true }));

    try {
      const success = await addToCart(productId, 1, product.variants[0]._id);
      if (success) {
        toast.success("Added to cart successfully!");
      } else {
        toast.error("Failed to add to cart");
      }
    } catch (error) {
      toast.error("Error adding to cart");
      console.error("Add to cart error:", error);
    } finally {
      setAddingToCart((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleWishlistToggle = async (
    product: Product,
    e: React.MouseEvent
  ): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setShowLoginPopup(true);
      return;
    }

    const productId = product._id;
    setWishlistLoading((prev) => ({ ...prev, [productId]: true }));
    try {
      if (isWishlisted(productId)) {
        const success = await removeByProductId(productId);
        if (success) {
          toast.success("Removed from wishlist");
        } else {
          toast.error("Failed to remove from wishlist");
        }
      } else {
        const success = await addToWishlist(productId);
        if (success) {
          toast.success("Added to wishlist!");
        } else {
          toast.error("Failed to add to wishlist");
        }
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setWishlistLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 max-w-md mx-auto">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            Error Loading Products
          </h3>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-surface border border-border rounded-xl p-8 max-w-md mx-auto">
          <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-text-secondary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Products Found
          </h3>
          <p className="text-text-secondary">
            Try adjusting your filters or search criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Products Grid/List */}
      <div
        className={`grid gap-6 ${
          viewMode === "grid"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-1"
        }`}
      >
        {products.map((product) => (
          <div
            key={product._id}
            className={`group relative bg-surface border border-border rounded-xl overflow-hidden 
                        shadow-md hover:shadow-xl transition-all duration-300 
                        hover:-translate-y-2 hover:scale-105 
                        ${
                          viewMode === "list"
                            ? "flex flex-row"
                            : "flex flex-col h-full"
                        }`}
          >
            <Link
              href={`/products/${product.slug}`}
              className={`block flex-1 ${
                viewMode === "list"
                  ? "flex flex-row h-full"
                  : "flex flex-col h-full"
              }`}
            >
              {/* Product Image */}
              <div
                className={`relative bg-surface-elevated overflow-hidden flex-shrink-0 ${
                  viewMode === "list"
                    ? "w-32 sm:w-40 md:w-48 h-full"
                    : "aspect-square w-full"
                }`}
              >
                <Image
                  src={product.thumbnailImage || "/images/placeholder.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Stock Status */}
                {product.variants &&
                  product.variants.length > 0 &&
                  product.variants[0].quantity === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="bg-red-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                        Out of Stock
                      </span>
                    </div>
                  )}
              </div>

              {/* Product Info */}
              <div
                className={`p-4 flex flex-col flex-1 ${
                  viewMode === "list"
                    ? "justify-between min-h-0 min-w-0"
                    : "h-full"
                }`}
              >
                {/* Top Section - Title and Description */}
                <div className={viewMode === "grid" ? "flex-1 min-h-0" : ""}>
                  <h3
                    className={`font-semibold text-foreground group-hover:text-primary transition-colors ${
                      viewMode === "list"
                        ? "text-base md:text-lg mb-2 line-clamp-2"
                        : "text-base mb-2 line-clamp-2"
                    }`}
                    style={{
                      minHeight: viewMode === "list" ? "2.5rem" : "2.5rem",
                    }}
                  >
                    {product.name}
                  </h3>

                  {/* Description for both views */}
                  <p
                    className={`text-sm text-text-secondary mb-3 ${
                      viewMode === "list" ? "line-clamp-2" : "line-clamp-2"
                    }`}
                    style={{
                      minHeight: viewMode === "list" ? "2.5rem" : "2.5rem",
                    }}
                  >
                    {product.description || "No description available."}
                  </p>
                  {viewMode === "grid" && (
                    <StarRating
                      rating={product.ratings || 0}
                      reviewCount={product.reviewCount || 0}
                    />
                  )}
                </div>

                {/* Bottom Section - Price and Action Buttons */}
                <div
                  className={`flex items-center justify-between mt-auto pt-2 ${
                    viewMode === "list" ? "flex-wrap gap-2" : ""
                  }`}
                >
                  <div className="flex flex-col">
                    {viewMode === "list" && (
                      <StarRating
                        rating={product.ratings || 0}
                        reviewCount={product.reviewCount || 0}
                      />
                    )}
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold text-primary ${
                          viewMode === "list" ? "text-lg" : "text-lg"
                        }`}
                      >
                        ৳{product.price}
                      </span>
                    </div>
                  </div>

                  {viewMode === "grid" && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Heart Button beside cart */}
                      <button
                        onClick={(e) => handleWishlistToggle(product, e)}
                        disabled={wishlistLoading[product._id]}
                        title={
                          isWishlisted(product._id)
                            ? "In your wishlist"
                            : "Add to wishlist"
                        }
                        className={`btn-icon shadow-md hover:shadow-lg transition-all duration-200 flex-shrink-0 ${
                          isWishlisted(product._id)
                            ? "bg-rose-500 text-white"
                            : "bg-surface-elevated text-text-secondary hover:text-rose-500 border border-border"
                        }`}
                      >
                        <FiHeart
                          size={16}
                          className={
                            isWishlisted(product._id) ? "fill-current" : ""
                          }
                        />
                      </button>

                      {/* Add to Cart button */}
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={
                          addingToCart[product._id] ||
                          (product.variants &&
                            product.variants[0]?.quantity === 0)
                        }
                        className="btn-icon btn-primary disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex-shrink-0"
                      >
                        {addingToCart[product._id] ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FiShoppingCart size={16} />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Link>

            {/* List View Action Buttons */}
            {viewMode === "list" && (
              <div className="p-4 flex flex-col items-center justify-center gap-2 flex-shrink-0 min-w-0">
                <button
                  onClick={(e) => handleAddToCart(product, e)}
                  disabled={
                    addingToCart[product._id] ||
                    (product.variants && product.variants[0]?.quantity === 0)
                  }
                  className="btn btn-primary btn-sm w-full disabled:opacity-50 whitespace-nowrap flex items-center justify-center"
                >
                  {addingToCart[product._id] ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <FiShoppingCart size={16} className="mr-2" />
                  )}
                  <span className="hidden sm:inline">Add to Cart</span>
                  <span className="sm:hidden">Add</span>
                </button>

                {/* Dedicated Wishlist button for list view */}
                <button
                  onClick={(e) => handleWishlistToggle(product, e)}
                  disabled={wishlistLoading[product._id]}
                  className={`btn btn-sm w-full whitespace-nowrap flex items-center justify-center border transition-all duration-200 ${
                    isWishlisted(product._id)
                      ? "bg-rose-500 border-rose-500 text-white"
                      : "bg-surface-elevated border-border text-foreground hover:border-rose-400 hover:text-rose-500"
                  }`}
                >
                  <FiHeart
                    size={16}
                    className={`mr-2 ${
                      isWishlisted(product._id) ? "fill-current" : ""
                    }`}
                  />
                  <span className="hidden sm:inline">
                    {isWishlisted(product._id) ? "Saved" : "Wishlist"}
                  </span>
                  <span className="sm:hidden">
                    {isWishlisted(product._id) ? "Saved" : "Save"}
                  </span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && onPageChange && (
        <Pagination
          pagination={pagination}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          showLimitSelector={true}
          limitOptions={[5, 10, 12, 25, 50]}
          className="mt-8"
        />
      )}

      {/* Login Popup */}
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        title="Login Required"
        message="Please login to add items to your cart and enjoy a personalized shopping experience."
      />
    </div>
  );
}
