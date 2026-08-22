"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiX, FiPackage, FiArrowRight, FiGrid } from "react-icons/fi";
import type { Category, Subcategory } from "@/types";

interface CategoryWithSubcategories extends Category {
  subcategories: Subcategory[];
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryWithSubcategories;
}

export default function CategoryModal({
  isOpen,
  onClose,
  category,
}: CategoryModalProps) {
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="relative h-48 sm:h-56 bg-gradient-to-br from-rose-500 to-pink-600 rounded-t-2xl overflow-hidden">
            {category.image ? (
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <FiPackage className="w-20 h-20 text-white/80" />
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <FiX className="w-6 h-6" />
            </button>

            {/* Title overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                {category.name}
              </h2>
              <div className="flex items-center space-x-4 text-white/90">
                <span className="inline-flex items-center space-x-1">
                  <FiPackage className="w-4 h-4" />
                  <span>{category.productCount} Products</span>
                </span>
                <span className="inline-flex items-center space-x-1">
                  <FiGrid className="w-4 h-4" />
                  <span>{category.subcategories.length} Subcategories</span>
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {/* Description */}
            {category.description && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  About This Category
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {category.description}
                </p>
              </div>
            )}

            {/* Subcategories */}
            {category.subcategories.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Subcategories ({category.subcategories.length})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.subcategories.map((subcategory) => (
                    <Link
                      key={subcategory._id}
                      href={`/products?category=${category._id}&subcategory=${subcategory._id}`}
                      className="group bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-rose-300 dark:hover:border-rose-600 transition-all duration-200 hover:shadow-md hover:-translate-y-1 overflow-hidden"
                    >
                      {/* Subcategory Image */}
                      <div className="relative h-32 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-600 dark:to-slate-700 overflow-hidden">
                        {subcategory.image ? (
                          <Image
                            src={subcategory.image}
                            alt={subcategory.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-full backdrop-blur-sm">
                              <FiPackage className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                            </div>
                          </div>
                        )}

                        {/* Product count badge */}
                        <div className="absolute top-2 right-2">
                          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-slate-700 dark:text-slate-300 px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                            {subcategory.productCount}
                          </div>
                        </div>
                      </div>

                      {/* Subcategory Content */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-1">
                            {subcategory.name}
                          </h4>
                          <FiArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors flex-shrink-0 ml-2" />
                        </div>

                        {subcategory.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                            {subcategory.description}
                          </p>
                        )}

                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {subcategory.productCount} product
                          {subcategory.productCount !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
              <Link
                href={`/products?category=${category._id}`}
                className="flex-1 inline-flex items-center justify-center space-x-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white hover:text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 [&_*::selection]:bg-white/30 [&_*::selection]:text-white [&_*::-moz-selection]:bg-white/30 [&_*::-moz-selection]:text-white"
              >
                <FiPackage className="w-5 h-5" />
                <span className="[&::selection]:bg-white/30 [&::selection]:text-white [&::-moz-selection]:bg-white/30 [&::-moz-selection]:text-white">
                  View All Products
                </span>
              </Link>

              <button
                onClick={onClose}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
