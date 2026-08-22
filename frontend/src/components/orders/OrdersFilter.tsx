"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Order } from "@/types/order";
import { FiFilter, FiX, FiRotateCcw } from "react-icons/fi";

interface OrdersFilterProps {
  isFilterVisible: boolean;
  setIsFilterVisible: (visible: boolean) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  paymentFilter: string;
  setPaymentFilter: (payment: string) => void;
  giftFilter: string;
  setGiftFilter: (gift: string) => void;
  sortByDate: string;
  setSortByDate: (date: string) => void;
  sortByPrice: string;
  setSortByPrice: (price: string) => void;
  uniqueStatuses: string[];
  paginatedOrdersLength: number;
  filteredOrdersLength: number;
  ordersPerPage: number;
  currentPage: number;
  totalPages: number;
  resetFilters: () => void;
}

export function OrdersFilter({
  isFilterVisible,
  setIsFilterVisible,
  statusFilter,
  setStatusFilter,
  paymentFilter,
  setPaymentFilter,
  giftFilter,
  setGiftFilter,
  sortByDate,
  setSortByDate,
  sortByPrice,
  setSortByPrice,
  uniqueStatuses,
  paginatedOrdersLength,
  filteredOrdersLength,
  ordersPerPage,
  currentPage,
  totalPages,
  resetFilters,
}: OrdersFilterProps) {
  return (
    <div
      className={`lg:col-span-1 ${
        isFilterVisible ? "block" : "hidden lg:block"
      }`}
    >
      <div className="lg:sticky lg:top-6 space-y-4">
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-400/20 dark:to-purple-400/20 border-b border-indigo-100 dark:border-indigo-800/30">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-md">
                  <FiFilter className="w-4 h-4 text-white" />
                </div>
                <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent font-bold">
                  Filter Orders
                </span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFilterVisible(false)}
                className="lg:hidden p-1 h-auto"
              >
                <FiX className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 space-y-6">
            {/* Order Status Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Order Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500 text-slate-900 dark:text-slate-100"
              >
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status.toLowerCase()}>
                    {status === "all" ? "All Statuses" : status}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Status Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Payment Status
              </label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500 text-slate-900 dark:text-slate-100"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>

            {/* Order Type Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Order Type
              </label>
              <select
                value={giftFilter}
                onChange={(e) => setGiftFilter(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500 text-slate-900 dark:text-slate-100"
              >
                <option value="all">All Orders</option>
                <option value="gift">Gift Orders</option>
                <option value="personal">Personal Orders</option>
              </select>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

            {/* Sort by Date */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Sort by Date
              </label>
              <select
                value={sortByDate}
                onChange={(e) => setSortByDate(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500 text-slate-900 dark:text-slate-100"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {/* Sort by Price */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Sort by Price
              </label>
              <select
                value={sortByPrice}
                onChange={(e) => setSortByPrice(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500 text-slate-900 dark:text-slate-100"
              >
                <option value="none">No Price Sorting</option>
                <option value="highest">Highest Price First</option>
                <option value="lowest">Lowest Price First</option>
              </select>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

            {/* Reset Filters */}
            <Button
              onClick={resetFilters}
              variant="outline"
              className="w-full gap-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <FiRotateCcw className="w-4 h-4" />
              Reset Filters
            </Button>

            {/* Filter Summary */}
            <div className="p-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                Showing {paginatedOrdersLength} of {filteredOrdersLength} orders
                {filteredOrdersLength > ordersPerPage &&
                  ` (Page ${currentPage} of ${totalPages})`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
