"use client";

import React, { useState, useEffect } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useRouter } from "next/navigation";
import SubcategoryList from "@/components/admin/subcategories/SubcategoryList";
import SubcategoryForm from "@/components/admin/subcategories/SubcategoryForm";
import SubcategoryStats from "@/components/admin/subcategories/SubcategoryStats";
import SubcategoryTester from "@/components/admin/subcategories/SubcategoryTester";
import { subcategoryService } from "@/services/subcategoryService";
import { categoryService } from "@/services/categoryService";
import ErrorMessage from "@/components/common/Error";
import { FiPlus, FiX, FiFilter, FiLayers } from "react-icons/fi";
import type { Admin, Category, Subcategory, ApiResponse } from "@/types";

interface AdminAuthContextType {
  admin: Admin | null;
  isLoading: boolean;
}

interface StatusState {
  type: "success" | "error" | "";
  message: string;
}

export default function SubcategoriesPage(): React.JSX.Element {
  const router = useRouter();
  const { admin, isLoading }: AdminAuthContextType = useAdminAuth();
  const [isAddMode, setIsAddMode] = useState<boolean>(false);
  const [status, setStatus] = useState<StatusState>({ type: "", message: "" });
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [isLoadingSubcategories, setIsLoadingSubcategories] =
    useState<boolean>(true);

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push("/admin-login");
    }
  }, [admin, isLoading, router]);

  const fetchCategories = async (): Promise<void> => {
    try {
      const data: ApiResponse<{ categories: Category[] }> =
        await categoryService.getAllCategories();
      setCategories(data.payload?.categories || []);
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.message || "Failed to fetch categories",
      });
    }
  };

  const fetchSubcategories = async (
    categoryId: string | null = null
  ): Promise<void> => {
    try {
      setIsLoadingSubcategories(true);
      const data: ApiResponse<{ subcategories: Subcategory[] }> =
        await subcategoryService.getAllSubcategories(categoryId);
      setSubcategories(data.payload?.subcategories || []);
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.message || "Failed to fetch subcategories",
      });
    } finally {
      setIsLoadingSubcategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  useEffect(() => {
    fetchSubcategories(selectedCategoryId || null);
  }, [selectedCategoryId]);

  const clearStatus = (): void => {
    setStatus({ type: "", message: "" });
  };

  useEffect(() => {
    if (status.message) {
      const timer: NodeJS.Timeout = setTimeout(clearStatus, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleUpdateSuccess = async (
    message: string,
    updatedSubcategories?: Subcategory[]
  ): Promise<void> => {
    if (updatedSubcategories) {
      setSubcategories(updatedSubcategories);
    } else {
      await fetchSubcategories(selectedCategoryId || null);
    }

    setStatus({
      type: "success",
      message: message || "Operation completed successfully",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleError = (message: string): void => {
    setStatus({
      type: "error",
      message: message || "An error occurred",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    setSelectedCategoryId(e.target.value);
  };

  const handleFormSuccess = (subcategory?: Subcategory): void => {
    setIsAddMode(false);
    handleUpdateSuccess("Subcategory created successfully");
  };

  if (isLoading || !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Loading subcategories...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section with Enhanced Gradient */}
        <div className="dashboard-header-gradient rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <FiLayers className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    Subcategory Management
                  </h1>
                  <p className="text-white/80 text-sm sm:text-base mt-1">
                    Organize your products with subcategories
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddMode(!isAddMode);
                  clearStatus();
                }}
                className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                {isAddMode ? (
                  <>
                    <FiX className="w-5 h-5" />
                    <span className="hidden sm:inline">Cancel</span>
                  </>
                ) : (
                  <>
                    <FiPlus className="w-5 h-5" />
                    <span className="hidden sm:inline">Add Subcategory</span>
                    <span className="sm:hidden">Add</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {status.message && (
          <div className="mb-6">
            <ErrorMessage
              type={status.type}
              message={status.message}
              onClose={clearStatus}
            />
          </div>
        )}

        {/* Category Filter Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
              <FiFilter className="w-5 h-5" />
              <label htmlFor="category-filter" className="text-sm font-medium">
                Filter by Category:
              </label>
            </div>
            <div className="flex-1 sm:max-w-xs">
              <select
                id="category-filter"
                value={selectedCategoryId}
                onChange={handleCategoryChange}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        {!isAddMode && !isLoadingSubcategories && (
          <div className="mb-6 sm:mb-8">
            <SubcategoryStats subcategories={subcategories} />
          </div>
        )}

        {/* Add Form Section */}
        {isAddMode && (
          <div className="mb-6 sm:mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-4 sm:px-6 py-4">
                <h2 className="text-lg font-semibold text-white">
                  Add New Subcategory
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <SubcategoryForm
                  categories={categories}
                  onSuccess={(subcategory) => {
                    setIsAddMode(false);
                    handleUpdateSuccess("Subcategory created successfully");
                  }}
                  onError={handleError}
                />
              </div>
            </div>
          </div>
        )}

        {/* Subcategories List */}
        <div className="mb-8">
          <SubcategoryList
            subcategories={subcategories}
            categories={categories}
            isLoading={isLoadingSubcategories}
            onUpdateSuccess={handleUpdateSuccess}
            onError={handleError}
          />
        </div>

        {/* API Tester Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-4 sm:px-6 py-4">
            <h2 className="text-lg font-semibold text-white">API Testing</h2>
            <p className="text-blue-100 text-sm mt-1">
              Use this tool to test the Subcategory API functionality
            </p>
          </div>
          <div className="p-4 sm:p-6">
            <SubcategoryTester />
          </div>
        </div>
      </div>
    </div>
  );
}
