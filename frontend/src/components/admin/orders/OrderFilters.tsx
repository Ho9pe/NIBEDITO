"use client";

import { useState } from "react";
import { FiFilter, FiX, FiSearch, FiUser, FiGift } from "react-icons/fi";
import { GetAllOrdersParams } from "@/types";

interface OrderFiltersProps {
  filters: GetAllOrdersParams;
  onFilterChange: (filters: GetAllOrdersParams) => void;
}

export default function OrderFilters({
  filters,
  onFilterChange,
}: OrderFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<GetAllOrdersParams>(filters);

  const handleFilterChange = (key: keyof GetAllOrdersParams, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: GetAllOrdersParams = {
      status: undefined,
      userId: undefined,
      isGift: undefined,
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      order: "desc",
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters =
    filters.status || filters.userId || filters.isGift !== undefined;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FiFilter className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Filters
            </h3>
            {hasActiveFilters && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <FiX className="w-4 h-4" />
                <span>Clear</span>
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <span>{isExpanded ? "Collapse" : "Expand"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Filters - Always Visible */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Order Status
            </label>
            <select
              value={filters.status || ""}
              onChange={(e) =>
                handleFilterChange("status", e.target.value || undefined)
              }
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
            >
              <option value="">All Statuses</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Gift Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Order Type
            </label>
            <select
              value={
                filters.isGift === undefined ? "" : filters.isGift.toString()
              }
              onChange={(e) => {
                const value = e.target.value;
                handleFilterChange(
                  "isGift",
                  value === "" ? undefined : value === "true"
                );
              }}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
            >
              <option value="">All Orders</option>
              <option value="true">Gift Orders</option>
              <option value="false">Regular Orders</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy || "createdAt"}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
            >
              <option value="createdAt">Date Created</option>
              <option value="totalPrice">Total Amount</option>
              <option value="status">Status</option>
              <option value="user.name">Customer Name</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Order
            </label>
            <select
              value={filters.order || "desc"}
              onChange={(e) =>
                handleFilterChange("order", e.target.value as "asc" | "desc")
              }
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Filters - Expandable */}
      {isExpanded && (
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center space-x-2">
                <FiSearch className="w-4 h-4" />
                <span>Advanced Search</span>
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Customer Search */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Customer ID
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={filters.userId || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "userId",
                          e.target.value || undefined
                        )
                      }
                      placeholder="Enter customer ID"
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Items Per Page */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Items Per Page
                  </label>
                  <select
                    value={filters.limit || 10}
                    onChange={(e) =>
                      handleFilterChange("limit", parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Filter Summary */}
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
              <h5 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                Active Filters Summary
              </h5>
              <div className="flex flex-wrap gap-2">
                {filters.status && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    Status: {filters.status}
                  </span>
                )}
                {filters.isGift !== undefined && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    <FiGift className="w-3 h-3 mr-1" />
                    {filters.isGift ? "Gift Orders" : "Regular Orders"}
                  </span>
                )}
                {filters.userId && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    <FiUser className="w-3 h-3 mr-1" />
                    Customer: {filters.userId.slice(-8)}
                  </span>
                )}
                {!hasActiveFilters && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    No active filters
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
