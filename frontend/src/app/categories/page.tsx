"use client";

import { useState, useEffect } from "react";
import { categoryService } from "@/services/categoryService";
import { subcategoryService } from "@/services/subcategoryService";
import CategoryGrid from "@/components/categories/CategoryGrid";
import CategoryHero from "@/components/categories/CategoryHero";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/Error";
import type { Category, Subcategory } from "@/types";

interface CategoryWithSubcategories extends Category {
  subcategories: Subcategory[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchCategoriesWithSubcategories = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError("");

        // Fetch all categories
        const categoriesResponse = await categoryService.getAllCategories();
        const categoriesData = categoriesResponse.payload?.categories || [];

        // Fetch subcategories for each category
        const categoriesWithSubs: CategoryWithSubcategories[] =
          await Promise.all(
            categoriesData.map(async (category) => {
              try {
                const subcategories =
                  await subcategoryService.getActiveSubcategories(category._id);
                return {
                  ...category,
                  subcategories: subcategories || [],
                };
              } catch (err) {
                console.error(
                  `Failed to fetch subcategories for ${category.name}:`,
                  err
                );
                return {
                  ...category,
                  subcategories: [],
                };
              }
            })
          );

        // Filter to only show active categories
        const activeCategories = categoriesWithSubs.filter(
          (category) => category.isActive
        );
        setCategories(activeCategories);
      } catch (err: any) {
        console.error("Failed to fetch categories:", err);
        setError(err.message || "Failed to load categories");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoriesWithSubcategories();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
          <p className="text-text-secondary">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <CategoryHero totalCategories={categories.length} />

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {categories.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-surface-elevated rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-text-tertiary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Categories Available
            </h3>
            <p className="text-text-secondary">
              Check back later for new product categories.
            </p>
          </div>
        ) : (
          <CategoryGrid categories={categories} />
        )}
      </div>
    </div>
  );
}
