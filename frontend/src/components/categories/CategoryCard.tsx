"use client";

import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiPackage, FiEye } from "react-icons/fi";
import type { Category, Subcategory } from "@/types";

interface CategoryWithSubcategories extends Category {
  subcategories: Subcategory[];
}

interface CategoryCardProps {
  category: CategoryWithSubcategories;
  onClick: () => void;
}

export default function CategoryCard({ category, onClick }: CategoryCardProps) {
  const handleExploreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to category products page
  };

  const handleViewDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <div className="category-card group">
      {/* Card Container */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-rose-300 dark:hover:border-rose-600">
        {/* Image Section */}
        <div className="relative h-48 sm:h-52 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 overflow-hidden">
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="p-6 bg-white dark:bg-slate-800 rounded-full shadow-lg">
                <FiPackage className="w-12 h-12 text-slate-400 dark:text-slate-500" />
              </div>
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Product count badge */}
          <div className="absolute top-3 right-3">
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
              {category.productCount} items
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {/* Category Name */}
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 line-clamp-1 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
            {category.name}
          </h3>

          {/* Description */}
          {category.description && (
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
              {category.description}
            </p>
          )}

          {/* Subcategories Preview */}
          {category.subcategories.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                Subcategories ({category.subcategories.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {category.subcategories.slice(0, 3).map((subcategory) => (
                  <span
                    key={subcategory._id}
                    className="inline-block bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md text-xs font-medium"
                  >
                    {subcategory.name}
                  </span>
                ))}
                {category.subcategories.length > 3 && (
                  <span className="inline-block bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-md text-xs font-medium">
                    +{category.subcategories.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Link
              href={`/products?category=${category._id}`}
              onClick={handleExploreClick}
              className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white hover:text-white text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 [&_*::selection]:bg-white/30 [&_*::selection]:text-white [&_*::-moz-selection]:bg-white/30 [&_*::-moz-selection]:text-white"
            >
              <span className="[&::selection]:bg-white/30 [&::selection]:text-white [&::-moz-selection]:bg-white/30 [&::-moz-selection]:text-white">
                Explore
              </span>
              <FiArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={handleViewDetailsClick}
              className="inline-flex items-center justify-center p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              <FiEye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
