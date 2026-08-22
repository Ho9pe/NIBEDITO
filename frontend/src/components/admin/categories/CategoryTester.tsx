// frontend/src/components/admin/categories/CategoryTester.js
"use client";

import { useState } from "react";
import { categoryService } from "@/services/categoryService";
import {
  FiRefreshCw,
  FiChevronDown,
  FiChevronRight,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiCode,
} from "react-icons/fi";
import type { Category } from "@/types/category";

interface TestResult {
  operation: string;
  success: boolean;
  message: string;
  timestamp: string;
}

export default function CategoryTester() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const addResult = (
    operation: string,
    success: boolean,
    message: string
  ): void => {
    setTestResults((prev) => [
      {
        operation,
        success,
        message,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const runTests = async (): Promise<void> => {
    setIsLoading(true);
    setTestResults([]);

    try {
      // Test 1: Get All Categories
      try {
        const categoriesData = await categoryService.getAllCategories();
        addResult(
          "Get All Categories",
          true,
          `Successfully fetched ${categoriesData.payload?.categories?.length ?? 0} categories`
        );

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error: any) {
        addResult("Get All Categories", false, error.message);
      }

      // Test 2: Create Category
      let newCategory: Category | undefined;
      try {
        const formData = new FormData();
        const testName = "Test Category " + Date.now();
        formData.append("name", testName);
        formData.append("description", "Test Description");

        const blob = await fetch("https://picsum.photos/200").then((r) =>
          r.blob()
        );
        const testImage = new File([blob], "test-image.jpg", {
          type: "image/jpeg",
        });
        formData.append("image", testImage);

        const createResponse = await categoryService.createCategory(formData);
        newCategory = createResponse.payload.category;
        addResult(
          "Create Category",
          true,
          `Created category: ${newCategory.name}`
        );

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error: any) {
        addResult("Create Category", false, error.message);
        setIsLoading(false);
        return;
      }

      // Test 3: Get Active Categories
      try {
        const activeCategories = await categoryService.getActiveCategories();
        addResult(
          "Get Active Categories",
          true,
          `Successfully fetched ${activeCategories.length} active categories`
        );

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error: any) {
        addResult("Get Active Categories", false, error.message);
      }

      // Test 4: Get Single Category
      try {
        const fetchedCategory = await categoryService.getCategory(
          newCategory!.slug
        );
        addResult(
          "Get Single Category",
          true,
          `Successfully fetched category: ${fetchedCategory.name}`
        );

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error: any) {
        addResult("Get Single Category", false, error.message);
      }

      // Test 5: Update Category
      let updatedSlug: string | undefined;
      try {
        const formData = new FormData();
        const updatedName = newCategory!.name + " (Updated)";
        formData.append("name", updatedName);
        formData.append("description", "Updated Description");

        const updateResponse = await categoryService.updateCategory(
          newCategory!.slug,
          formData
        );
        const updatedCategory = updateResponse.payload.category;
        updatedSlug = updatedCategory.slug;
        addResult(
          "Update Category",
          true,
          `Updated category: ${updatedCategory.name}`
        );

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error: any) {
        addResult("Update Category", false, error.message);
        return;
      }

      // Test 6: Recalculate Product Counts
      try {
        const recalculateResponse =
          await categoryService.recalculateProductCounts();
        addResult(
          "Recalculate Product Counts",
          true,
          `Successfully recalculated product counts for all categories`
        );

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error: any) {
        addResult("Recalculate Product Counts", false, error.message);
      }

      // Test 7: Delete Category
      if (updatedSlug) {
        try {
          const deleteResponse = await categoryService.deleteCategory(
            updatedSlug
          );
          addResult(
            "Delete Category",
            true,
            `Deleted category: ${deleteResponse.payload.category.name}`
          );
        } catch (error: any) {
          addResult("Delete Category", false, error.message);
        }
      }
    } catch (error: any) {
      addResult("Test Suite", false, "Test suite failed: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div
        className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <FiCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                Category API Tester
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Test complete API workflow
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isExpanded && testResults.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {testResults.filter((r) => r.success).length}/
                  {testResults.length} passed
                </span>
              </div>
            )}

            <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors duration-200">
              {isExpanded ? (
                <FiChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              ) : (
                <FiChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={runTests}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105"
            >
              <FiRefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              {isLoading ? "Running Tests..." : "Run Test Flow"}
            </button>

            {testResults.length > 0 && (
              <button
                onClick={() => setTestResults([])}
                className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200"
              >
                Clear Results
              </button>
            )}
          </div>

          {/* Results */}
          <div className="space-y-4">
            {testResults.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCode className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  No Tests Run Yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Click &quot;Run Test Flow&quot; to start the complete API test suite.
                </p>
              </div>
            )}

            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  result.success
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      result.success
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-red-100 dark:bg-red-900/30"
                    }`}
                  >
                    {result.success ? (
                      <FiCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <FiAlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4
                        className={`font-semibold text-sm ${
                          result.success
                            ? "text-green-800 dark:text-green-400"
                            : "text-red-800 dark:text-red-400"
                        }`}
                      >
                        {result.operation}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <FiClock className="w-3 h-3" />
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <p
                      className={`text-sm ${
                        result.success
                          ? "text-green-700 dark:text-green-300"
                          : "text-red-700 dark:text-red-300"
                      }`}
                    >
                      {result.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
