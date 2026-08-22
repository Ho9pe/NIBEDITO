"use client";

import { FiGrid, FiTrendingUp, FiStar } from "react-icons/fi";

interface CategoryHeroProps {
  totalCategories: number;
}

export default function CategoryHero({ totalCategories }: CategoryHeroProps) {
  return (
    <div className="categories-hero-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/90 via-white/80 to-rose-50/90 dark:from-slate-900/90 dark:via-slate-800/80 dark:to-slate-900/90"></div>

      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-100 dark:bg-rose-900/20 rounded-full blur-3xl opacity-70"></div>
        <div className="absolute top-20 -left-10 w-32 h-32 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-10 right-20 w-24 h-24 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-2xl opacity-60"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-14">
        <div className="text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-12 h-12 mb-3 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
            <FiGrid className="w-6 h-6 text-rose-600" />
          </div>

          {/* Main heading */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            Explore Our
            <span className="block text-gradient bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent pb-1">
              Categories
            </span>
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-5 max-w-xl mx-auto leading-relaxed">
            Discover amazing products across {totalCategories} carefully curated
            categories. From everyday essentials to unique finds, we have
            something for everyone.
          </p>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
              <div className="p-1.5 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                <FiGrid className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <span className="font-medium text-xs sm:text-sm">
                {totalCategories} Categories
              </span>
            </div>

            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FiTrendingUp className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <span className="font-medium text-xs sm:text-sm">
                Trending Products
              </span>
            </div>

            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
              <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <FiStar className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <span className="font-medium text-xs sm:text-sm">Top Rated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
