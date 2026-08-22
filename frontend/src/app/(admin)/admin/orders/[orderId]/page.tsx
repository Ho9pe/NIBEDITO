"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminService } from "@/services/adminService";
import Link from "next/link";
import { useToast } from "@/hooks/useToast";
import { Order } from "@/types";
import {
  FiArrowLeft,
  FiUser,
  FiMapPin,
  FiGift,
  FiShoppingBag,
  FiDollarSign,
  FiEdit3,
  FiTrash2,
  FiPackage,
  FiCalendar,
  FiMail,
  FiPhone,
  FiTag,
  FiCreditCard,
} from "react-icons/fi";

export default function OrderDetailsPage() {
  const { orderId } = useParams() as { orderId: string };
  const router = useRouter();
  const toast = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await adminService.getOrderById(orderId);
        setOrder(response.payload as Order);
        setError(null);
      } catch (err: any) {
        const errorMessage = err.message || "Failed to fetch order details";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleString("en-US", options);
  };

  const formatPrice = (price: number): string => {
    if (!price || isNaN(price)) return "৳0.00";
    return "৳" + price.toFixed(2);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;

    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      toast.success("Order status updated successfully");

      // Update local state to reflect change
      setOrder((prev) =>
        prev ? { ...prev, status: newStatus as Order["status"] } : null
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to update order status");
    }
  };

  const handlePaidStatusUpdate = async (isPaid: boolean) => {
    if (!order) return;

    try {
      await adminService.updateOrderPaidStatus(orderId, isPaid);
      toast.success(`Order marked as ${isPaid ? "paid" : "unpaid"}`);

      // Update local state to reflect change
      setOrder((prev) => (prev ? { ...prev, isPaid } : null));
    } catch (err: any) {
      toast.error(err.message || "Failed to update payment status");
    }
  };

  const handleOrderDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this order?")) {
      return;
    }

    try {
      await adminService.deleteOrder(orderId);
      toast.success("Order deleted successfully");
      router.push("/admin/orders");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete order");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiPackage className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-2">
            Error loading order
          </h2>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Link
            href="/admin/orders"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Back to Orders</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-8 max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiPackage className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
            Order Not Found
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            The order you are looking for does not exist or has been deleted.
          </p>
          <Link
            href="/admin/orders"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Back to Orders</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="dashboard-header-gradient rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Link
                  href="/admin/orders"
                  className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200"
                >
                  <FiArrowLeft className="w-5 h-5" />
                </Link>
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <FiEdit3 className="w-8 h-8 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    Order Details
                  </h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-white/70 text-sm">Order ID:</span>
                      <span className="text-white font-mono text-sm bg-white/20 px-2 py-1 rounded">
                        {order._id.slice(-8)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiCalendar className="w-4 h-4 text-white/70" />
                      <span className="text-white/80 text-sm">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleOrderDelete}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer & Shipping Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Details */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <FiUser className="w-5 h-5" />
                  <span>Customer Details</span>
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-lg">
                      {typeof order.user === "object"
                        ? order.user?.name
                        : "Guest"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                      {typeof order.user === "object"
                        ? order.user?.name
                        : "Guest Customer"}
                    </h3>
                    {typeof order.user === "object" && order.user?._id && (
                      <Link
                        href={`/admin/users/${order.user._id}`}
                        className="text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 text-sm font-medium"
                      >
                        View Customer Profile →
                      </Link>
                    )}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                        <FiMail className="w-4 h-4" />
                        <span>
                          {order.email ||
                            (typeof order.user === "object"
                              ? order.user?.email
                              : "N/A")}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                        <FiPhone className="w-4 h-4" />
                        <span>
                          {order.phone ||
                            (typeof order.user === "object"
                              ? order.user?.phone
                              : "N/A")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <FiMapPin className="w-5 h-5" />
                  <span>Shipping Information</span>
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Address
                    </label>
                    <p className="text-slate-900 dark:text-slate-100">
                      {order.street}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        City
                      </label>
                      <p className="text-slate-900 dark:text-slate-100">
                        {order.city}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        State
                      </label>
                      <p className="text-slate-900 dark:text-slate-100">
                        {order.state}
                      </p>
                    </div>
                  </div>
                  {order.addressDetails && (
                    <div>
                      <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Additional Details
                      </label>
                      <p className="text-slate-900 dark:text-slate-100">
                        {order.addressDetails}
                      </p>
                    </div>
                  )}
                  {order.shippingRegion && (
                    <div>
                      <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Shipping Region
                      </label>
                      <p className="text-slate-900 dark:text-slate-100">
                        {order.shippingRegion}
                      </p>
                    </div>
                  )}
                  {order.freeShipping !== undefined && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Free Shipping:
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.freeShipping
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                      >
                        {order.freeShipping ? "Yes" : "No"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Gift Information */}
            {(order.isGift || order.giftMessage || order.giftNote) && (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 px-6 py-4 border-b border-purple-200 dark:border-purple-800">
                  <h2 className="text-lg font-semibold text-purple-900 dark:text-purple-100 flex items-center space-x-2">
                    <FiGift className="w-5 h-5" />
                    <span>Gift Information</span>
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      <FiGift className="w-4 h-4 mr-1" />
                      Gift Order
                    </span>
                  </div>
                  {(order.giftMessage || order.giftNote) && (
                    <div>
                      <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Gift Note
                      </label>
                      <div className="mt-1 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="text-purple-900 dark:text-purple-100 text-sm">
                          {order.giftMessage || order.giftNote}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <FiShoppingBag className="w-5 h-5" />
                  <span>Order Items</span>
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Variant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {order.items.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {item.productDetails?.name || "Unknown Product"}
                            </div>
                            {typeof item.product === "string" && (
                              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                {item.productDetails?.slug
                                  ? `Slug: ${item.productDetails.slug}`
                                  : `ID: ${item.product.slice(-8)}`}
                              </div>
                            )}
                            {item.productDetails?.slug && (
                              <Link
                                href={`/admin/products/${item.productDetails.slug}`}
                                className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-medium"
                              >
                                View Product →
                              </Link>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-900 dark:text-slate-100">
                            {item.variantDetails?.color && (
                              <div className="flex items-center space-x-2">
                                <span className="text-slate-500 dark:text-slate-400">
                                  Color:
                                </span>
                                <span>{item.variantDetails.color}</span>
                              </div>
                            )}
                            {item.variantDetails?.size && (
                              <div className="flex items-center space-x-2">
                                <span className="text-slate-500 dark:text-slate-400">
                                  Size:
                                </span>
                                <span>{item.variantDetails.size}</span>
                              </div>
                            )}
                            {!item.variantDetails &&
                              typeof item.variant === "string" && (
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                  ID: {item.variant.slice(-8)}
                                </div>
                              )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                          {formatPrice(
                            item.productDetails?.price ||
                              item.cost / item.quantity
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                          {formatPrice(item.cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar - Price & Status */}
          <div className="space-y-6">
            {/* Price Details */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 px-6 py-4 border-b border-emerald-200 dark:border-emerald-800">
                <h2 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 flex items-center space-x-2">
                  <FiDollarSign className="w-5 h-5" />
                  <span>Price Details</span>
                </h2>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">
                    Subtotal:
                  </span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {formatPrice(order.totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">
                    Shipping:
                  </span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {formatPrice(order.shippingCost || 0)}
                  </span>
                </div>

                {/* Coupon Details */}
                {(order.couponDetails ||
                  order.coupon ||
                  order.discountAmount > 0) && (
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <FiTag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        Coupon Applied
                      </span>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-emerald-700 dark:text-emerald-300">
                          Code:
                        </span>
                        <span className="text-sm font-mono bg-emerald-100 dark:bg-emerald-800 px-2 py-1 rounded">
                          {order.couponDetails?.code ||
                            (order.coupon && typeof order.coupon === "object"
                              ? order.coupon.code
                              : typeof order.coupon === "string"
                              ? order.coupon
                              : "Applied")}
                        </span>
                      </div>
                      {order.discountAmount > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-emerald-700 dark:text-emerald-300">
                            Discount:
                          </span>
                          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                            -{formatPrice(order.discountAmount)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Total:
                    </span>
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formatPrice(order.finalPrice || order.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-4 border-b border-blue-200 dark:border-blue-800">
                <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 flex items-center space-x-2">
                  <FiEdit3 className="w-5 h-5" />
                  <span>Order Status</span>
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Order Status
                  </label>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm font-medium transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      order.status === "Processing"
                        ? "border-yellow-300 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-300"
                        : order.status === "Shipped"
                        ? "border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300"
                        : order.status === "Delivered"
                        ? "border-green-300 bg-green-50 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300"
                        : "border-red-300 bg-red-50 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300"
                    }`}
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Payment Status
                  </label>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FiCreditCard
                        className={`w-5 h-5 ${
                          order.isPaid
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          order.isPaid
                            ? "text-green-700 dark:text-green-300"
                            : "text-red-700 dark:text-red-300"
                        }`}
                      >
                        {order.isPaid ? "Paid" : "Unpaid"}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={order.isPaid}
                        onChange={(e) =>
                          handlePaidStatusUpdate(e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-500 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
