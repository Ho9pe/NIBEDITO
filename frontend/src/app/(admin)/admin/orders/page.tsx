"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import OrdersTable from "@/components/admin/orders/OrdersTable";
import OrderFilters from "@/components/admin/orders/OrderFilters";
import { useToast } from "@/hooks/useToast";
import {
  Order,
  GetAllOrdersParams,
  OrdersResponse,
  PaginationInfo,
} from "@/types";
import {
  FiShoppingCart,
  FiGift,
  FiTrendingUp,
  FiPackage,
} from "react-icons/fi";

export default function AdminOrdersPage() {
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  const [giftOrdersCount, setGiftOrdersCount] = useState(0);
  const [filters, setFilters] = useState<GetAllOrdersParams>({
    status: undefined,
    userId: undefined,
    isGift: undefined,
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    order: "desc",
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllOrders(filters);
      const ordersData = response.payload as OrdersResponse;
      setOrders(ordersData.orders);
      setPagination(ordersData.pagination);
      setError(null);

      // Count gift orders if viewing all orders
      if (filters.isGift === undefined) {
        const giftOrders = ordersData.orders.filter(
          (order) => order.isGift === true
        );
        setGiftOrdersCount(giftOrders.length);
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch orders";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const handleFilterChange = (newFilters: GetAllOrdersParams) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (newPage: number): void => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit: number): void => {
    setFilters((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      toast.success("Order status updated successfully");
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message || "Failed to update order status");
    }
  };

  const handlePaidStatusUpdate = async (orderId: string, isPaid: boolean) => {
    try {
      await adminService.updateOrderPaidStatus(orderId, isPaid);
      toast.success(`Order marked as ${isPaid ? "paid" : "unpaid"}`);
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message || "Failed to update payment status");
    }
  };

  const handleOrderDelete = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to delete this order?")) {
      return;
    }

    try {
      await adminService.deleteOrder(orderId);
      toast.success("Order deleted successfully");
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete order");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiPackage className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">
              Error Loading Orders
            </h3>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
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
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <FiShoppingCart className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    Order Management
                  </h1>
                  <p className="text-white/80 text-sm sm:text-base mt-1">
                    Monitor and manage customer orders
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4 lg:gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <FiTrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white/70 text-xs uppercase tracking-wide">
                        Total Orders
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {pagination.total}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <FiGift className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white/70 text-xs uppercase tracking-wide">
                        Gift Orders
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {filters.isGift === true
                          ? pagination.total
                          : giftOrdersCount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-6">
          <OrderFilters filters={filters} onFilterChange={handleFilterChange} />
        </div>

        {/* Filter Info */}
        {filters.isGift !== undefined && (
          <div className="mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <FiGift className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  {filters.isGift === true
                    ? "Showing only orders marked as gifts."
                    : "Showing only regular orders."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <OrdersTable
            orders={orders}
            loading={loading}
            onStatusUpdate={handleStatusUpdate}
            onPaidStatusUpdate={handlePaidStatusUpdate}
            onDelete={handleOrderDelete}
            pagination={pagination}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </div>
      </div>
    </div>
  );
}
