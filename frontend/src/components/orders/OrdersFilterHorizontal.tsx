"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiRotateCcw,
  FiShoppingBag,
  FiCheck,
  FiX,
} from "react-icons/fi";

interface OrdersFilterHorizontalProps {
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
  totalOrders: number;
  filteredOrdersLength: number;
  resetFilters: () => void;
}

export function OrdersFilterHorizontal({
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
  totalOrders,
  filteredOrdersLength,
  resetFilters,
}: OrdersFilterHorizontalProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters =
    statusFilter !== "all" ||
    paymentFilter !== "all" ||
    giftFilter !== "all" ||
    sortByDate !== "latest" ||
    sortByPrice !== "none";

  const getFilterDisplayText = (filter: string, type: string) => {
    switch (type) {
      case "status":
        return filter === "all"
          ? "All"
          : filter.charAt(0).toUpperCase() + filter.slice(1);
      case "payment":
        return filter === "all" ? "All" : filter === "paid" ? "Paid" : "Unpaid";
      case "gift":
        return filter === "all"
          ? "All"
          : filter === "gift"
          ? "Gift"
          : "Personal";
      case "date":
        return sortByDate === "latest" ? "Latest" : "Oldest";
      case "price":
        return sortByPrice === "none"
          ? "None"
          : sortByPrice === "highest"
          ? "High to Low"
          : "Low to High";
      default:
        return filter;
    }
  };

  return (
    <Card className="mb-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
      <CardContent className="p-4 lg:p-6">
        {/* Header with order count and toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-md">
                <FiShoppingBag className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                  {filteredOrdersLength} of {totalOrders} Orders
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {hasActiveFilters ? "Filtered results" : "All your orders"}
                </p>
              </div>
            </div>
            {hasActiveFilters && (
              <Badge
                variant="secondary"
                className="ml-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
              >
                Filtered
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <FiRotateCcw className="w-3 h-3" />
                Reset
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-1 min-w-[80px]"
            >
              <FiFilter className="w-3 h-3" />
              Filters
              {isExpanded ? (
                <FiChevronUp className="w-3 h-3" />
              ) : (
                <FiChevronDown className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>

        {/* Quick filter chips - always visible */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mr-2">
            Quick filters:
          </span>

          {/* Status chips */}
          {["all", "processing", "shipped", "delivered"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={`h-7 px-3 text-xs transition-all ${
                statusFilter === status
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                  : "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600"
              }`}
            >
              {getFilterDisplayText(status, "status")}
              {statusFilter === status && <FiCheck className="w-3 h-3 ml-1" />}
            </Button>
          ))}

          {/* Payment status chips */}
          {["all", "paid", "unpaid"].map((payment) => (
            <Button
              key={payment}
              variant={paymentFilter === payment ? "default" : "outline"}
              size="sm"
              onClick={() => setPaymentFilter(payment)}
              className={`h-7 px-3 text-xs transition-all ${
                paymentFilter === payment
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                  : "border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-600"
              }`}
            >
              {getFilterDisplayText(payment, "payment")}
              {paymentFilter === payment && (
                <FiCheck className="w-3 h-3 ml-1" />
              )}
            </Button>
          ))}
        </div>

        {/* Expanded filters */}
        {isExpanded && (
          <>
            <Separator className="mb-4 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Order Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Order Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-9 px-3 py-1 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500 text-slate-900 dark:text-slate-100 transition-all"
                >
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status.toLowerCase()}>
                      {status === "all" ? "All Statuses" : status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Payment Status
                </label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full h-9 px-3 py-1 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500 text-slate-900 dark:text-slate-100 transition-all"
                >
                  <option value="all">All Payments</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>

              {/* Order Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Order Type
                </label>
                <select
                  value={giftFilter}
                  onChange={(e) => setGiftFilter(e.target.value)}
                  className="w-full h-9 px-3 py-1 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500 text-slate-900 dark:text-slate-100 transition-all"
                >
                  <option value="all">All Orders</option>
                  <option value="gift">Gift Orders</option>
                  <option value="personal">Personal Orders</option>
                </select>
              </div>

              {/* Sort by Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Sort by Date
                </label>
                <select
                  value={sortByDate}
                  onChange={(e) => setSortByDate(e.target.value)}
                  className="w-full h-9 px-3 py-1 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500 text-slate-900 dark:text-slate-100 transition-all"
                >
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

              {/* Sort by Price */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Sort by Price
                </label>
                <select
                  value={sortByPrice}
                  onChange={(e) => setSortByPrice(e.target.value)}
                  className="w-full h-9 px-3 py-1 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500 text-slate-900 dark:text-slate-100 transition-all"
                >
                  <option value="none">No Price Sorting</option>
                  <option value="highest">Highest Price First</option>
                  <option value="lowest">Lowest Price First</option>
                </select>
              </div>
            </div>

            {/* Active filters summary */}
            {hasActiveFilters && (
              <div className="mt-4 p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-lg border border-indigo-200/50 dark:border-indigo-800/30">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                      Active filters:
                    </span>
                    {statusFilter !== "all" && (
                      <Badge
                        variant="secondary"
                        className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                      >
                        Status: {getFilterDisplayText(statusFilter, "status")}
                        <button
                          onClick={() => setStatusFilter("all")}
                          className="ml-1 hover:text-indigo-900 dark:hover:text-indigo-100"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {paymentFilter !== "all" && (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                      >
                        Payment:{" "}
                        {getFilterDisplayText(paymentFilter, "payment")}
                        <button
                          onClick={() => setPaymentFilter("all")}
                          className="ml-1 hover:text-green-900 dark:hover:text-green-100"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {giftFilter !== "all" && (
                      <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                      >
                        Type: {getFilterDisplayText(giftFilter, "gift")}
                        <button
                          onClick={() => setGiftFilter("all")}
                          className="ml-1 hover:text-purple-900 dark:hover:text-purple-100"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {sortByPrice !== "none" && (
                      <Badge
                        variant="secondary"
                        className="bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300"
                      >
                        Price: {getFilterDisplayText(sortByPrice, "price")}
                        <button
                          onClick={() => setSortByPrice("none")}
                          className="ml-1 hover:text-orange-900 dark:hover:text-orange-100"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-100"
                  >
                    <FiRotateCcw className="w-3 h-3" />
                    Clear All
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
