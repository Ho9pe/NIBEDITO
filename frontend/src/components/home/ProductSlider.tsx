"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { productService } from "@/services/productService";
import type { Product } from "@/types/product";

const TRENDING_COUNT = 4;

// Product documents are inconsistent about `ratings`: newer ones store a
// numeric average, older ones still hold an array of rating entries. An empty
// array is truthy, so `ratings || 0` happily yields [] and any arithmetic on it
// throws. Coerce to a number before using it.
const toRating = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

export default function ProductSlider() {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchTrending = async () => {
      try {
        // "Trending" = best selling. Falls back to nothing rendered rather than
        // an error banner, since this is a marketing strip on the landing page.
        const response = await productService.getAllProducts({
          page: 1,
          limit: TRENDING_COUNT,
          sortField: "totalSold",
          sortOrder: "desc",
        });
        if (!isMounted) return;
        setProducts(response.payload?.products || []);
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to load trending products:", error);
        setProducts([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchTrending();
    return () => {
      isMounted = false;
    };
  }, []);

  // Nothing to show and nothing pending: drop the section entirely rather than
  // leaving an empty framed panel on the page.
  if (!isLoading && products.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 px-[5%] bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 dark:from-slate-900 dark:to-slate-800 relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-rose-700 to-rose-600 rounded-full"></div>

      <div className="max-w-7xl mx-auto bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-600 p-8 lg:p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-12 dark:opacity-15">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-300 to-rose-400 dark:from-rose-500 dark:to-rose-600 rounded-full transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-rose-400 to-rose-300 dark:from-rose-600 dark:to-rose-500 rounded-full transform -translate-x-16 translate-y-16"></div>
        </div>

        {/* Section Header */}
        <div className="text-center mb-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
            <h2 className="text-3xl lg:text-4xl font-bold">
              <span className="bg-gradient-to-r from-slate-700 to-rose-600 dark:from-gray-100 dark:to-rose-400 bg-clip-text text-transparent">
                Trending
              </span>{" "}
              <span className="text-rose-600 text-4xl lg:text-5xl">Gifts</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-gray-300 lg:border-l lg:border-slate-400 dark:lg:border-gray-600 lg:pl-6">
              Discover what&apos;s popular this season
            </p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative z-10">
          {isLoading
            ? [...Array(TRENDING_COUNT)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-md animate-pulse"
                >
                  <div className="aspect-square bg-slate-200 dark:bg-slate-700"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            : products.map((product) => (
                <Link
                  key={product._id}
                  href={`/products/${product.slug}`}
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 block"
                  onMouseEnter={() => setHoveredProduct(product._id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <Image
                      src={product.thumbnailImage || "/images/placeholder.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />

                    {/* Overlay */}
                    <div
                      className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
                        hoveredProduct === product._id
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    >
                      <span className="flex items-center gap-2 bg-gradient-to-r from-rose-700 to-rose-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 1.5M7 13l1.5 1.5m7.5-1.5L17.5 15M9 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm10.5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                          />
                        </svg>
                        View Product
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100 mb-2 line-clamp-1">
                      {product.name}
                    </h3>

                    <p className="text-sm text-slate-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(toRating(product.ratings))
                                ? "fill-current"
                                : "fill-slate-300 dark:fill-gray-600"
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-sm font-medium text-slate-600 dark:text-gray-400 ml-1">
                          {toRating(product.ratings).toFixed(1)}
                        </span>
                      </div>

                      <span className="text-xl font-bold text-slate-900 dark:text-gray-100">
                        ৳ {product.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12 relative z-10">
          <Link
            href="/products"
            className="relative inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-rose-700 to-rose-600 text-white font-medium rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 group [&_*::selection]:bg-white/30 [&_*::selection]:text-white [&_*::-moz-selection]:bg-white/30 [&_*::-moz-selection]:text-white"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-rose-800 to-rose-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-[-1]"></span>
            <span className="relative z-10 text-white [&::selection]:bg-white/30 [&::selection]:text-white [&::-moz-selection]:bg-white/30 [&::-moz-selection]:text-white">
              View All Products
            </span>
            <svg
              className="relative z-10 w-5 h-5 text-white [&::selection]:bg-white/30 [&::selection]:text-white [&::-moz-selection]:bg-white/30 [&::-moz-selection]:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
