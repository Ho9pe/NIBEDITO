"use client";

import React, { useState, useEffect } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useRouter } from "next/navigation";
import CategoryList from "@/components/admin/categories/CategoryList";
import CategoryForm from "@/components/admin/categories/CategoryForm";
import CategoryStats from "@/components/admin/categories/CategoryStats";
import { categoryService } from "@/services/categoryService";
import CategoryTester from "@/components/admin/categories/CategoryTester";
import type { Admin, Category, ApiResponse } from "@/types";
import {
  FiCheckCircle,
  FiX,
  FiPlus,
  FiFolder,
  FiActivity,
  FiAlertCircle,
} from "react-icons/fi";

interface AdminAuthContextType {
  admin: Admin | null;
  isLoading: boolean;
}

interface StatusState {
  type: "success" | "error" | "";
  message: string;
}

export default function CategoriesPage(): React.JSX.Element {
  const router = useRouter();
  const { admin, isLoading }: AdminAuthContextType = useAdminAuth();
  const [isAddMode, setIsAddMode] = useState<boolean>(false);
  const [status, setStatus] = useState<StatusState>({ type: "", message: "" });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push("/admin-login");
    }
  }, [admin, isLoading, router]);

  const fetchCategories = async (): Promise<void> => {
    try {
      setIsLoadingCategories(true);
      const data: ApiResponse<{ categories: Category[] }> =
        await categoryService.getAllCategories();
      setCategories(data.payload?.categories || []);
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.message || "Failed to fetch categories",
      });
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
    updatedCategories?: Category[]
  ): Promise<void> => {
    if (updatedCategories) {
      setCategories(updatedCategories);
    } else {
      try {
        setIsLoadingCategories(true);
        const data: ApiResponse<{ categories: Category[] }> =
          await categoryService.getAllCategories();
        setCategories(data.payload?.categories || []);
      } catch (error: any) {
        handleError(error.message);
      } finally {
        setIsLoadingCategories(false);
      }
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

  const handleAddModeToggle = (): void => {
    setIsAddMode(!isAddMode);
    clearStatus();
  };

  if (isLoading || !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Loading categories...
          </p>
        </div>
      </div>
    );
  }

  const totalCategories: number = categories.length;
  const activeCategories: number = categories.filter(
    (cat) => cat.isActive !== false
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="dashboard-header-gradient rounded-2xl mx-4 sm:mx-6 lg:mx-8 mt-4 sm:mt-6 lg:mt-8 mb-6 sm:mb-8">
          <div className="relative z-10 px-6 sm:px-8 lg:px-12 py-8 sm:py-10 lg:py-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Title Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <FiFolder className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-1">
                      Category Management
                    </h1>
                    <p className="text-white/90 text-lg sm:text-xl font-medium">
                      Organize and manage product categories
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-center">
                    <FiFolder className="w-6 h-6 text-white mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">
                      {totalCategories}
                    </p>
                    <p className="text-white/80 text-xs">Total</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-center">
                    <FiActivity className="w-6 h-6 text-white mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">
                      {activeCategories}
                    </p>
                    <p className="text-white/80 text-xs">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {status.message && (
        <div className="mx-4 sm:mx-6 lg:mx-8 mb-6">
          <div
            className={`p-4 rounded-xl border transition-all duration-200 ${
              status.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-400"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-400"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {status.type === "success" ? (
                  <FiCheckCircle className="w-5 h-5" />
                ) : (
                  <FiAlertCircle className="w-5 h-5" />
                )}
                <span className="font-medium">{status.message}</span>
              </div>
              <button
                onClick={clearStatus}
                className="p-1 hover:bg-black/10 rounded-lg transition-colors duration-200"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8 space-y-8">
        {/* Stats Section */}
        {!isAddMode && !isLoadingCategories && (
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <FiActivity className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200">
                Category Statistics
              </h2>
            </div>
            <CategoryStats categories={categories} />
          </section>
        )}

        {/* Add/Edit Category Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <FiFolder className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200">
                {isAddMode ? "Add New Category" : "Categories"}
              </h2>
            </div>

            <button
              onClick={() => {
                setIsAddMode(!isAddMode);
                clearStatus();
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                isAddMode
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  : "bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white shadow-lg hover:shadow-xl hover:scale-105"
              }`}
            >
              {isAddMode ? (
                <>
                  <FiX className="w-4 h-4" />
                  Cancel
                </>
              ) : (
                <>
                  <FiPlus className="w-4 h-4" />
                  Add Category
                </>
              )}
            </button>
          </div>

          {isAddMode && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6">
                <CategoryForm
                  onSuccess={(category) => {
                    setIsAddMode(false);
                    handleUpdateSuccess("Category created successfully");
                  }}
                  onError={handleError}
                />
              </div>
            </div>
          )}
        </section>

        {/* Categories List Section */}
        {!isAddMode && (
          <section className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6">
                <CategoryList
                  categories={categories}
                  isLoading={isLoadingCategories}
                  onUpdateSuccess={handleUpdateSuccess}
                  onError={handleError}
                />
              </div>
            </div>
          </section>
        )}

        {/* API Tester Section */}
        <section className="space-y-6">
          <CategoryTester />
        </section>
      </div>
    </div>
  );
}
