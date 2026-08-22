"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useRouter } from "next/navigation";
import ProductList from "@/components/admin/products/ProductList";
import ProductForm from "@/components/admin/products/ProductForm";
import ProductStats from "@/components/admin/products/ProductStats";
import ErrorMessage from "@/components/common/Error";
import { productService } from "@/services/productService";
import ProductTester from "@/components/admin/products/ProductTester";
import { FiPlus, FiX, FiPackage } from "react-icons/fi";
import type { Product, PaginationInfo } from "@/types";

interface StatusState {
  type: string;
  message: string;
}

interface TotalStats {
  totalProducts: number;
  totalValue: number;
  totalVariants: number;
  activeCategories: number;
}

export default function ProductsPage() {
  const router = useRouter();
  const { admin, isLoading } = useAdminAuth();
  const [isAddMode, setIsAddMode] = useState<boolean>(false);
  const [status, setStatus] = useState<StatusState>({ type: "", message: "" });
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    pages: 1,
    page: 1,
    limit: 10,
    hasNext: false,
    hasPrev: false,
    nextPage: null,
    prevPage: null,
  });
  const [limit, setLimit] = useState<number>(10);
  const [totalStats, setTotalStats] = useState<TotalStats>({
    totalProducts: 0,
    totalValue: 0,
    totalVariants: 0,
    activeCategories: 0,
  });

  const fetchProducts = useCallback(
    async (page: number = 1): Promise<void> => {
      try {
        setIsLoadingProducts(true);
        const response = await productService.getAllProducts({ page, limit });

        if (!response.success) {
          throw new globalThis.Error(
            response.message || "Failed to fetch products"
          );
        }

        setProducts(response.payload!.products || []);

        // Calculate total variants and value for stats
        const totalVariants =
          response.payload!.products?.reduce(
            (sum, product) => sum + (product.variants?.length || 0),
            0
          ) || 0;

        const totalValue =
          response.payload!.products?.reduce(
            (sum, product) => sum + (product.price || 0),
            0
          ) || 0;

        // Get unique categories count
        const uniqueCategories = new Set<string>();
        response.payload!.products?.forEach((product) => {
          if (typeof product.category === "object" && product.category?._id) {
            uniqueCategories.add(product.category._id);
          }
        });

        // Set pagination directly from API response
        setPagination(response.payload!.pagination);

        // Set stats
        setTotalStats({
          totalProducts: response.payload!.pagination.total || 0,
          totalValue,
          totalVariants,
          activeCategories: uniqueCategories.size,
        });
      } catch (error: any) {
        setStatus({
          type: "error",
          message: error.message || "Failed to fetch products",
        });
      } finally {
        setIsLoadingProducts(false);
      }
    },
    [limit]
  );

  // Initial load effect - only runs once
  useEffect(() => {
    if (!isLoading && !admin) {
      router.push("/admin-login");
    } else if (admin) {
      fetchProducts(1);
    }
  }, [isLoading, admin, router, fetchProducts]);

  const handleLimitChange = (newLimit: number): void => {
    setLimit(newLimit);
    // fetchProducts will be called automatically via useEffect when limit changes
  };

  if (isLoading || !admin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
          <span className="text-slate-600 dark:text-slate-400">Loading...</span>
        </div>
      </div>
    );
  }

  const handleProductClick = (slug: string): void => {
    router.push(`/admin/products/${slug}`);
  };

  const clearStatus = (): void => {
    setStatus({ type: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section with Enhanced Gradient */}
        <div className="product-header-gradient-enhanced rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <FiPackage className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    Product Management
                  </h1>
                  <p className="text-white/80 text-sm sm:text-base mt-1">
                    Manage your product catalog and inventory
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
                    <span className="hidden sm:inline">Add Product</span>
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

        {/* Stats Section */}
        {!isAddMode && !isLoadingProducts && (
          <div className="mb-6 sm:mb-8">
            <ProductStats totalStats={totalStats} />
          </div>
        )}

        {/* Add Form Section */}
        {isAddMode && (
          <div className="mb-6 sm:mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-4 sm:px-6 py-4">
                <h2 className="text-lg font-semibold text-white">
                  Add New Product
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <ProductForm
                  onSuccess={() => {
                    setIsAddMode(false);
                    fetchProducts();
                    setStatus({
                      type: "success",
                      message: "Product created successfully",
                    });
                  }}
                  onError={(message) => {
                    setStatus({
                      type: "error",
                      message: message || "Failed to create product",
                    });
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Products List */}
        {!isAddMode && (
          <div className="mb-8">
            <ProductList
              products={products}
              isLoading={isLoadingProducts}
              pagination={pagination}
              onPageChange={fetchProducts}
              onProductClick={handleProductClick}
              onLimitChange={handleLimitChange}
            />
          </div>
        )}

        {/* API Tester Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-4 sm:px-6 py-4">
            <h2 className="text-lg font-semibold text-white">API Testing</h2>
            <p className="text-blue-100 text-sm mt-1">
              Use this tool to test the Product API functionality
            </p>
          </div>
          <div className="p-4 sm:p-6">
            <ProductTester />
          </div>
        </div>
      </div>
    </div>
  );
}
