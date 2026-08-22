"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Pagination from "@/components/common/Pagination";
import {
  FiEdit2,
  FiEye,
  FiPackage,
  FiTag,
  FiCalendar,
  FiDollarSign,
} from "react-icons/fi";
import type { Product, PaginationInfo } from "@/types";

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onProductClick: (slug: string) => void;
  onLimitChange?: (limit: number) => void;
}

export default function ProductList({
  products,
  isLoading,
  pagination,
  onPageChange,
  onProductClick,
  onLimitChange,
}: ProductListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const descriptions = document.querySelectorAll(".product-description");
    descriptions.forEach((desc) => {
      if (desc.scrollHeight > desc.clientHeight) {
        desc.classList.add("truncated");
      } else {
        desc.classList.remove("truncated");
      }
    });
  }, [products]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-slate-200 dark:bg-slate-700 rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="p-8 text-center">
          <FiPackage className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            No products found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Get started by creating your first product to build your catalog.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Products ({products.length})
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage your product catalog
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM5 17a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                onClick={() => onProductClick(product.slug)}
                className="group cursor-pointer bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-1"
              >
                {/* Product Image */}
                <div className="aspect-square relative bg-slate-100 dark:bg-slate-700">
                  {product.thumbnailImage ? (
                    <Image
                      src={product.thumbnailImage}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiPackage className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg p-2">
                      <FiEdit2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                      {typeof product.category === "object" &&
                      product.category?.name
                        ? product.category.name
                        : "Uncategorized"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      ${product.price}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {product.variants?.length || 0} variants
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>ID: {product._id.slice(-8)}</span>
                    <span>
                      {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product._id}
                onClick={() => onProductClick(product.slug)}
                className="group cursor-pointer flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-200 hover:shadow-md"
              >
                {/* Product Image */}
                <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-700 flex-shrink-0 relative overflow-hidden">
                  {product.thumbnailImage ? (
                    <Image
                      src={product.thumbnailImage}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiPackage className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {typeof product.category === "object" &&
                        product.category?.name
                          ? product.category.name
                          : "Uncategorized"}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 ml-4">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          ${product.price}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {product.variants?.length || 0} variants
                        </div>
                      </div>
                      <FiEdit2 className="w-5 h-5 text-slate-400 group-hover:text-rose-500 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {(pagination.pages > 1 || onLimitChange) && (
        <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4">
          <Pagination
            pagination={pagination}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
            showLimitSelector={true}
            limitOptions={[5, 10, 25, 50]}
            showInfo={true}
            className=""
          />
        </div>
      )}
    </div>
  );
}
