"use client";

import React, { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import type { IconType } from "react-icons";
import {
  FiPackage,
  FiClock,
  FiCheck,
  FiX,
  FiTruck,
  FiAlertCircle,
  FiUser,
  FiDollarSign,
} from "react-icons/fi";

interface RecentOrder {
  _id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: "pending" | "shipped" | "delivered" | "cancelled" | "processing";
  createdAt: string;
}

interface OrdersState {
  data: RecentOrder[];
  isLoading: boolean;
  error: string | null;
}

interface StatusConfig {
  icon: IconType;
  colorClass: string;
}

export default function RecentOrders(): React.JSX.Element {
  const [orders, setOrders] = useState<OrdersState>({
    data: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchRecentOrders = async (): Promise<void> => {
      try {
        const data: { orders: RecentOrder[] } =
          await adminService.getRecentOrders();
        setOrders({
          data: data.orders || [],
          isLoading: false,
          error: null,
        });
      } catch (error: any) {
        setOrders((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message || "Failed to load recent orders",
        }));
      }
    };

    fetchRecentOrders();
  }, []);

  const getStatusIcon = (status: string): React.JSX.Element => {
    const statusConfigs: Record<string, IconType> = {
      delivered: FiCheck,
      cancelled: FiX,
      shipped: FiTruck,
      pending: FiClock,
      processing: FiClock,
    };

    const IconComponent = statusConfigs[status.toLowerCase()] || FiAlertCircle;
    return <IconComponent className="w-4 h-4" />;
  };

  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      delivered:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      shipped:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      processing:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    };

    return (
      statusColors[status.toLowerCase()] ||
      "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
    );
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const capitalizeStatus = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (orders.isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (orders.error) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiAlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
          Error Loading Orders
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          {orders.error}
        </p>
      </div>
    );
  }

  if (orders.data.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiPackage className="w-8 h-8 text-slate-500 dark:text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
          No Recent Orders
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Orders will appear here once customers start placing them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.data.map((order: RecentOrder) => (
        <div
          key={order._id}
          className="group relative bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200"
        >
          <div className="flex items-start gap-4">
            {/* Order Icon */}
            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <FiPackage className="w-6 h-6 text-white" />
            </div>

            {/* Order Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    Order #{order.orderNumber}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <FiUser className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                      {order.customerName}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-semibold">
                    <FiDollarSign className="w-4 h-4" />
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Status and Time */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`
                    inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
                    ${getStatusColor(order.status)}
                  `}
                >
                  {getStatusIcon(order.status)}
                  {capitalizeStatus(order.status)}
                </span>

                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <FiClock className="w-3 h-3" />
                  <span>{formatDate(order.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hover Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-rose-600/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
        </div>
      ))}

      {/* View All Button */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <button className="w-full py-3 px-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group">
          <span className="flex items-center justify-center gap-2">
            View All Orders
            <FiPackage className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </span>
        </button>
      </div>
    </div>
  );
}
