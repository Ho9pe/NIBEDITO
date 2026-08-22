"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { FiMinus, FiPlus, FiShoppingCart, FiStar } from "react-icons/fi";
import { productService } from "@/services/productService";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ImageMagnifier from "@/components/products/ImageMagnifier";
import LoginPopup from "@/components/common/LoginPopup";
import { useToast } from "@/hooks/useToast";
import MarkdownRenderer from "@/components/common/MarkdownRenderer";
import ReviewList from "@/components/products/review/ReviewList";
import type { Product, ProductVariant } from "@/types";

export default function ProductDetailsPage() {
  const { slug } = useParams() as { slug: string };
  const { addToCart, cart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  useEffect(() => {
    const fetchProduct = async (): Promise<void> => {
      try {
        setLoading(true);
        const data = await productService.getProduct(slug);
        setProduct(data);
        setSelectedImage(data.thumbnailImage);
        if (data.variants?.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleVariantSelect = (variant: ProductVariant): void => {
    setSelectedVariant(variant);
    if (variant.images?.length > 0) {
      setSelectedImage(variant.images[0]);
    }

    // Check if this variant is in cart and update quantity
    const existingCartItem = cart?.items?.find(
      (item) =>
        item.product._id === product?._id && item.variant._id === variant._id
    );

    // Set initial quantity to 1 or existing cart quantity
    setQuantity(existingCartItem ? existingCartItem.quantity : 1);
  };

  const handleAddToCart = async (): Promise<void> => {
    if (!product || !selectedVariant) return;

    // Check if user is logged in
    if (!user) {
      setShowLoginPopup(true);
      return;
    }

    try {
      if (!selectedVariant) {
        toast.error("Please select a variant");
        return;
      }

      // Check if this variant is already in cart
      const existingCartItem = cart?.items?.find(
        (item) =>
          item.product._id === product._id &&
          item.variant._id === selectedVariant._id
      );

      const success = await addToCart(
        product._id!,
        quantity,
        selectedVariant._id
      );
      if (success) {
        toast.success(
          existingCartItem
            ? "Cart updated successfully!"
            : "Added to cart successfully!"
        );
      } else {
        toast.error("Failed to update cart");
      }
    } catch (error) {
      toast.error("Error updating cart");
      console.error("Add to cart error:", error);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface border border-border rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Error</h2>
          <p className="text-text-secondary">{error}</p>
        </div>
      </div>
    );
  if (!product) return null;

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        {/* Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-surface border border-border rounded-2xl p-6 lg:p-8 shadow-sm">
          {/* Left Column - Gallery and Variants */}
          <div className="space-y-6 lg:space-y-8">
            {/* Product Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square w-full bg-background border border-border rounded-xl overflow-hidden">
                <ImageMagnifier
                  src={selectedImage || product.thumbnailImage!}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Image Thumbnails */}
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                <button
                  className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 border-2 rounded-lg overflow-hidden transition-all duration-200 ${
                    selectedImage === product.thumbnailImage
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedImage(product.thumbnailImage!)}
                >
                  <Image
                    src={product.thumbnailImage!}
                    alt="Main product"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </button>
                {selectedVariant?.images?.map((image, idx) => (
                  <button
                    key={idx}
                    className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 border-2 rounded-lg overflow-hidden transition-all duration-200 ${
                      selectedImage === image
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedImage(image)}
                  >
                    <Image
                      src={image}
                      alt={`Variant ${idx + 1}`}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Variants Section */}
            {product.variants?.length > 0 && (
              <div className="bg-background border border-border rounded-xl p-4 lg:p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 pb-3 border-b border-border">
                  Available Variants
                </h3>
                <div className="space-y-3">
                  {product.variants.map((variant, index) => (
                    <label
                      key={index}
                      className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedVariant === variant
                          ? "border-primary bg-primary/5"
                          : variant.quantity === 0
                          ? "border-border bg-background opacity-60 cursor-not-allowed"
                          : "border-border hover:border-primary/50 hover:bg-background"
                      }`}
                    >
                      <input
                        type="radio"
                        name="variant"
                        checked={selectedVariant === variant}
                        onChange={() => handleVariantSelect(variant)}
                        disabled={variant.quantity === 0}
                        className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
                      />
                      <div className="w-12 h-12 border border-border rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={variant.images?.[0] || product.thumbnailImage!}
                          alt={variant.color}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <span>{variant.color}</span>
                          <span className="text-text-secondary">•</span>
                          <span>{variant.size}</span>
                        </div>
                        {variant.quantity === 0 && (
                          <span className="text-xs text-red-500 font-medium">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="flex flex-col h-full">
            {/* Product Header */}
            <div className="space-y-4 mb-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                {product.name}
              </h1>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <span className="text-2xl sm:text-3xl font-bold text-primary">
                    ৳ {product.price}
                  </span>
                </div>
                {typeof product.category === "object" && product.category && (
                  <div className="inline-flex items-center px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                    <span className="text-sm font-medium text-primary">
                      {product.category.name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Description */}
            <div className="flex-1 mb-6">
              <div className="prose prose-sm sm:prose max-w-none text-text-secondary">
                <MarkdownRenderer markdown={product.description} />
              </div>
            </div>

            {/* Purchase Section */}
            <div className="mt-auto space-y-4 pt-6 border-t border-border">
              <div className="flex items-center gap-4">
                {/* Quantity Selector */}
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                    className="p-3 text-foreground hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-3 min-w-[3rem] text-center font-semibold text-foreground">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((prev) => prev + 1)}
                    disabled={
                      selectedVariant && quantity >= selectedVariant.quantity
                    }
                    className="p-3 text-foreground hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  className="flex-1 btn btn-primary gap-2 py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.quantity === 0}
                >
                  <FiShoppingCart className="w-5 h-5" />
                  {cart?.items?.find(
                    (item) =>
                      item.product._id === product._id &&
                      item.variant._id === selectedVariant?._id
                  )
                    ? "Update Cart"
                    : "Add to Cart"}
                </button>
              </div>

              {/* Stock Info */}
              {selectedVariant && (
                <div className="text-sm text-text-secondary">
                  {selectedVariant.quantity > 0 ? (
                    <span className="text-green-600">
                      {selectedVariant.quantity} in stock
                    </span>
                  ) : (
                    <span className="text-red-500">Out of stock</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
            Customer Reviews
          </h2>
          <ReviewList productId={product._id!} />
        </div>
      </div>

      {/* Login Popup */}
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        title="Login Required"
        message="Please login to add items to your cart and continue with your purchase."
      />
    </main>
  );
}
