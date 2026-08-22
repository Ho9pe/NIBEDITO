"use client";

import { useState } from "react";
import Link from "next/link";
import Pagination from "@/components/common/Pagination";
import {
  FiEye,
  FiEdit3,
  FiTrash2,
  FiUser,
  FiGift,
  FiMoreVertical,
  FiDollarSign,
  FiCalendar,
  FiCreditCard,
  FiPackage,
} from "react-icons/fi";
import { Order, PaginationInfo } from "@/types";

interface OrdersTableProps {
  orders: Order[];
  loading: boolean;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
  onPaidStatusUpdate: (orderId: string, isPaid: boolean) => void;
  onDelete: (orderId: string) => void;
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrice = (price: number): string => {
  return `৳${price.toFixed(2)}`;
};

export default function OrdersTable({
  orders,
  loading,
  onStatusUpdate,
  onPaidStatusUpdate,
  onDelete,
  pagination,
  onPageChange,
  onLimitChange,
}: OrdersTableProps) {
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const handleLimitChange = (newLimit: number): void => {
    if (onLimitChange) {
      onLimitChange(newLimit);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">Loading orders...</p>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="p-8 text-center">
        <FiPackage className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
          No orders found
        </h3>
        <p className="text-slate-500 dark:text-slate-400">
          Orders will appear here once customers start placing them.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {orders.map((order) => (
              <tr
                key={order._id}
                className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="text-sm font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                      >
                        #{order._id.slice(-8)}
                      </Link>
                      {order.isGift && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                          <FiGift className="w-3 h-3 mr-1" />
                          Gift
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {typeof order.user === "object"
                        ? order.user.name
                        : "Guest"}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {order.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-900 dark:text-slate-100">
                    {order.items.length} item
                    {order.items.length !== 1 ? "s" : ""}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {formatPrice(order.finalPrice)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={order.status}
                    onChange={(e) => onStatusUpdate(order._id, e.target.value)}
                    className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${
                      order.status === "Processing"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                        : order.status === "Shipped"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        : order.status === "Delivered"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    }`}
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={order.isPaid}
                        onChange={(e) =>
                          onPaidStatusUpdate(order._id, e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-rose-300 dark:peer-focus:ring-rose-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-500 peer-checked:bg-rose-600"></div>
                    </label>
                    <span
                      className={`text-xs font-medium ${
                        order.isPaid
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {order.isPaid ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/admin/orders/${order._id}`}
                      className="p-1 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                    >
                      <FiEdit3 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => onDelete(order._id)}
                      className="p-1 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-700">
        {orders.map((order) => (
          <div
            key={order._id}
            className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="relative">
                <Link
                  href={`/admin/orders/${order._id}`}
                  className="text-sm font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                >
                  Order #{order._id.slice(-8)}
                </Link>
                {order.isGift && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 mt-1">
                    <FiGift className="w-3 h-3 mr-1" />
                    Gift
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Customer:
                </span>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {typeof order.user === "object" ? order.user.name : "Guest"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Items:
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {order.items.length} item
                  {order.items.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Payment:
                </span>
                <div className="flex items-center space-x-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={order.isPaid}
                      onChange={(e) =>
                        onPaidStatusUpdate(order._id, e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-rose-300 dark:peer-focus:ring-rose-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-500 peer-checked:bg-rose-600"></div>
                  </label>
                  <span
                    className={`text-xs font-medium ${
                      order.isPaid
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {order.isPaid ? "Paid" : "Unpaid"}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Total:
                </span>
                <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {formatPrice(order.finalPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Date:
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {formatDate(order.createdAt)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        pagination={pagination}
        onPageChange={onPageChange}
        onLimitChange={handleLimitChange}
        showLimitSelector={true}
        limitOptions={[5, 10, 25, 50]}
        className="mt-8"
      />
    </div>
  );
}
