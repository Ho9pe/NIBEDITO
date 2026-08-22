"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { orderService } from "@/services/orderService";
import { Order } from "@/types/order";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { FiShoppingBag, FiFilter, FiX } from "react-icons/fi";
import { OrderCard } from "@/components/orders/OrderCard";
import { OrdersEmptyState } from "@/components/orders/OrdersEmptyState";
import Pagination from "@/components/common/Pagination";
import { PaginationInfo } from "@/types/api";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "price-high" | "price-low">("latest");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [paginatedOrders, setPaginatedOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/my-orders");
      return;
    }
    fetchOrders();
  }, [router, user]);

  const fetchOrders = async () => {
    try {
      const result = await orderService.getUserOrders();
      if (result.success && result.data) {
        const sortedOrders = result.data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders);
      } else {
        toast.error(result.error || "Failed to fetch orders");
      }
    } catch (error) {
      toast.error("Error fetching orders");
      console.error("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyPagination = useCallback(() => {
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    setPaginatedOrders(
      filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)
    );
  }, [filteredOrders, currentPage, ordersPerPage]);

  const applyFilters = useCallback(() => {
    let result = [...orders];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(
        (order) =>
          (order.status || "Processing").toLowerCase() ===
          statusFilter.toLowerCase()
      );
    }

    // Apply sorting
    if (sortBy === "latest") {
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === "oldest") {
      result.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else if (sortBy === "price-high") {
      result.sort((a, b) => (b.finalPrice || 0) - (a.finalPrice || 0));
    } else if (sortBy === "price-low") {
      result.sort((a, b) => (a.finalPrice || 0) - (b.finalPrice || 0));
    }

    setFilteredOrders(result);
    setCurrentPage(1);
  }, [orders, statusFilter, sortBy]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  useEffect(() => {
    applyPagination();
  }, [applyPagination]);

  const resetFilters = () => {
    setStatusFilter("all");
    setSortBy("latest");
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const paginationInfo: PaginationInfo = {
    total: filteredOrders.length,
    pages: Math.ceil(filteredOrders.length / ordersPerPage),
    page: currentPage,
    limit: ordersPerPage,
    hasNext: currentPage < Math.ceil(filteredOrders.length / ordersPerPage),
    hasPrev: currentPage > 1,
    nextPage:
      currentPage < Math.ceil(filteredOrders.length / ordersPerPage)
        ? currentPage + 1
        : null,
    prevPage: currentPage > 1 ? currentPage - 1 : null,
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case "latest": return "Newest First";
      case "oldest": return "Oldest First";
      case "price-high": return "Highest Price";
      case "price-low": return "Lowest Price";
      default: return "Newest First";
    }
  };

  const getStatusLabel = () => {
    if (statusFilter === "all") return "All Orders";
    return statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1);
  };

  if (loading) {
    return <LoadingSpinner fullPage={true} />;
  }

  if (!orders.length) {
    return <OrdersEmptyState type="no-orders" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
        {/* Enhanced Header with Rose Theme */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-6 border-b border-slate-200 dark:border-slate-800 relative">
          {/* Rose accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-rose-500/50 to-transparent"></div>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-100 dark:bg-rose-950/30 rounded-xl">
              <FiShoppingBag className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                My <span className="text-rose-600 dark:text-rose-400">Orders</span>
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Track and manage your orders
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Filters - Modern Design */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 mb-6 overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              {/* Filter Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-rose-100 dark:bg-rose-950/30 rounded-lg">
                    <FiFilter className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    Filter Orders
                  </h3>
                </div>
                {(statusFilter !== "all" || sortBy !== "latest") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                  >
                    <FiX className="h-4 w-4 mr-1" />
                    Reset All
                  </Button>
                )}
              </div>

              {/* Filter Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Order Status
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-between bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          {getStatusLabel()}
                        </span>
                        <FiFilter className="h-4 w-4 text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="start" 
                      className="w-56 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg"
                    >
                      <DropdownMenuItem 
                        onClick={() => setStatusFilter("all")}
                        className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <span className={statusFilter === "all" ? "font-semibold text-rose-600 dark:text-rose-400" : ""}>
                          All Orders
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setStatusFilter("pending")}
                        className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <span className={statusFilter === "pending" ? "font-semibold text-rose-600 dark:text-rose-400" : ""}>
                          Pending
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setStatusFilter("processing")}
                        className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <span className={statusFilter === "processing" ? "font-semibold text-rose-600 dark:text-rose-400" : ""}>
                          Processing
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setStatusFilter("delivered")}
                        className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <span className={statusFilter === "delivered" ? "font-semibold text-rose-600 dark:text-rose-400" : ""}>
                          Delivered
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setStatusFilter("cancelled")}
                        className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <span className={statusFilter === "cancelled" ? "font-semibold text-rose-600 dark:text-rose-400" : ""}>
                          Cancelled
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Sort Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Sort By
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-between bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          {getSortLabel()}
                        </span>
                        <FiFilter className="h-4 w-4 text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="start" 
                      className="w-56 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg"
                    >
                      <DropdownMenuItem 
                        onClick={() => setSortBy("latest")}
                        className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <span className={sortBy === "latest" ? "font-semibold text-rose-600 dark:text-rose-400" : ""}>
                          Newest First
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setSortBy("oldest")}
                        className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <span className={sortBy === "oldest" ? "font-semibold text-rose-600 dark:text-rose-400" : ""}>
                          Oldest First
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setSortBy("price-high")}
                        className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <span className={sortBy === "price-high" ? "font-semibold text-rose-600 dark:text-rose-400" : ""}>
                          Highest Price
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setSortBy("price-low")}
                        className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <span className={sortBy === "price-low" ? "font-semibold text-rose-600 dark:text-rose-400" : ""}>
                          Lowest Price
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Results Info */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Results
                  </label>
                  <div className="flex items-center h-10 px-4 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""} found
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <OrdersEmptyState
            type="no-filtered-orders"
            onResetFilters={resetFilters}
          />
        ) : (
          <>
            <div className="space-y-4">
              {paginatedOrders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>

            <Pagination
              pagination={paginationInfo}
              onPageChange={handlePageChange}
              showInfo={true}
              className="mt-8"
            />
          </>
        )}
      </div>
    </div>
  );
}
