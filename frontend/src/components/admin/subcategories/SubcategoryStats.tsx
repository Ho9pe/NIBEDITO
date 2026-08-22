"use client";

import React, { useState, useEffect } from "react";
import { FiLayers, FiTag, FiTrendingUp, FiPackage } from "react-icons/fi";
import type { Subcategory, Category } from "@/types";
import type { IconType } from "react-icons";

interface SubcategoryStatsProps {
  subcategories: Subcategory[];
}

interface CategoryCount {
  count: number;
  name: string;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  totalProducts: number;
  categoryCounts: Record<string, CategoryCount>;
}

interface StatData {
  title: string;
  value: string | number;
  icon: IconType;
  gradient: string;
  bgColor: string;
  textColor: string;
  description: string;
  subValue?: string;
}

interface CategoryStat {
  id: string;
  name: string;
  count: number;
}

export default function SubcategoryStats({
  subcategories,
}: SubcategoryStatsProps): React.JSX.Element {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    inactive: 0,
    totalProducts: 0,
    categoryCounts: {},
  });

  useEffect(() => {
    if (subcategories && subcategories.length > 0) {
      const active: number = subcategories.filter((cat) => cat.isActive).length;
      const totalProducts: number = subcategories.reduce(
        (sum, cat) => sum + (cat.productCount || 0),
        0
      );

      // Count subcategories per parent category
      const categoryCounts: Record<string, CategoryCount> = {};
      subcategories.forEach((subcat) => {
        const categoryId: string =
          typeof subcat.category === "object"
            ? subcat.category?._id || ""
            : subcat.category || "";
        const categoryName: string =
          typeof subcat.category === "object"
            ? (subcat.category as Category)?.name || "Unknown"
            : "Unknown";

        if (!categoryCounts[categoryId]) {
          categoryCounts[categoryId] = { count: 0, name: categoryName };
        }
        categoryCounts[categoryId].count += 1;
      });

      setStats({
        total: subcategories.length,
        active,
        inactive: subcategories.length - active,
        totalProducts,
        categoryCounts,
      });
    }
  }, [subcategories]);

  const categoryStats: CategoryStat[] = Object.entries(
    stats.categoryCounts
  ).map(([id, data]) => ({
    id,
    name: data.name,
    count: data.count,
  }));

  const mostPopularCategory: CategoryStat = categoryStats.reduce(
    (prev, current) => {
      return prev.count > current.count ? prev : current;
    },
    { count: 0, name: "", id: "" }
  );

  const recentCount: number = subcategories.filter((subcat) => {
    if (!subcat.createdAt) return false;
    const createdAt = new Date(subcat.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;

  const statsData: StatData[] = [
    {
      title: "Total Subcategories",
      value: subcategories.length,
      icon: FiLayers,
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      description: "All subcategories in system",
    },
    {
      title: "Categories Used",
      value: categoryStats.length,
      icon: FiTag,
      gradient: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      textColor: "text-emerald-600 dark:text-emerald-400",
      description: "Parent categories with subcategories",
    },
    {
      title: "Most Popular Category",
      value: mostPopularCategory?.name || "N/A",
      icon: FiTrendingUp,
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
      description: mostPopularCategory
        ? `${mostPopularCategory.count} subcategories`
        : "No data available",
      subValue: mostPopularCategory
        ? `${mostPopularCategory.count} subcategories`
        : "",
    },
    {
      title: "Recent Additions",
      value: recentCount,
      icon: FiPackage,
      gradient: "from-rose-500 to-rose-600",
      bgColor: "bg-rose-50 dark:bg-rose-900/20",
      textColor: "text-rose-600 dark:text-rose-400",
      description: "Added in the last 7 days",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <div
          key={index}
          className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:-translate-y-1"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div
              className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
            >
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {stat.title}
            </h3>

            <p className="text-3xl font-bold text-slate-800 dark:text-slate-200 group-hover:scale-105 transition-transform duration-200">
              {typeof stat.value === "string" && stat.value.length > 15
                ? `${stat.value.substring(0, 15)}...`
                : typeof stat.value === "number"
                ? stat.value.toLocaleString()
                : stat.value}
            </p>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {stat.description}
            </p>
          </div>

          {/* Hover Effect */}
          <div
            className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-200 pointer-events-none`}
          ></div>

          {/* Animated Border */}
          <div
            className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 pointer-events-none -z-10`}
          ></div>
        </div>
      ))}
    </div>
  );
}
