"use client";

import { useState } from "react";
import { couponService } from "@/services/couponService";
import { useToast } from "@/hooks/useToast";
import { format } from "date-fns";
import { FiTag, FiEdit3, FiTrash2, FiClock, FiPlus } from "react-icons/fi";
import { Coupon } from "@/types";
import CouponForm from "./CouponForm";

interface CouponListProps {
  coupons: Coupon[];
  onCouponsUpdate: () => void;
}

export default function CouponList({
  coupons,
  onCouponsUpdate,
}: CouponListProps) {
  const toast = useToast();
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async (couponId: string) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) {
      return;
    }

    try {
      await couponService.deleteCoupon(couponId);
      toast.success("Coupon deleted successfully");
      onCouponsUpdate();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete coupon");
    }
  };

  const handleEdit = async (couponId: string) => {
    try {
      setIsLoading(true);
      const response = await couponService.getCouponById(couponId);
      const coupon = response.payload?.coupon;

      if (!coupon) {
        throw new Error("Coupon not found");
      }

      // Format date string to be compatible with datetime-local input
      const expiryDate = new Date(coupon.expiryDate);
      const formattedDate = expiryDate.toISOString().slice(0, 16);

      setEditingCoupon({
        ...coupon,
        expiryDate: formattedDate,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to load coupon details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSuccess = () => {
    setEditingCoupon(null);
    onCouponsUpdate();
  };

  const handleEditCancel = () => {
    setEditingCoupon(null);
  };

  if (editingCoupon) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Edit Coupon</h2>
        </div>
        <div className="p-6">
          <CouponForm
            editingCoupon={editingCoupon}
            onSuccess={handleEditSuccess}
            onError={(message) => toast.error(message)}
            onCancel={handleEditCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <FiTag className="w-5 h-5" />
          <span>Coupon List</span>
        </h2>
      </div>

      {coupons.length === 0 ? (
        <div className="text-center py-12">
          <FiTag className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            No coupons found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Create your first coupon to offer discounts to customers.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Product Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Shipping Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Min Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Expiry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Usage Limit
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {coupons.map((coupon) => {
                  const isExpired = new Date(coupon.expiryDate) < new Date();
                  return (
                    <tr
                      key={coupon._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
                            <FiTag className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
                              {coupon.code}
                            </div>
                            <div
                              className={`text-xs ${
                                isExpired
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-green-600 dark:text-green-400"
                              }`}
                            >
                              {isExpired ? "Expired" : "Active"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900 dark:text-slate-100">
                          {coupon.discountOptions.productDiscount.type !==
                          "none" ? (
                            `${
                              coupon.discountOptions.productDiscount.type ===
                              "percentage"
                                ? coupon.discountOptions.productDiscount.value +
                                  "%"
                                : "৳" +
                                  coupon.discountOptions.productDiscount.value
                            }`
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500">
                              None
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900 dark:text-slate-100">
                          {coupon.discountOptions.shippingDiscount.type !==
                          "none" ? (
                            coupon.discountOptions.shippingDiscount.type ===
                            "free" ? (
                              "Free"
                            ) : (
                              `${
                                coupon.discountOptions.shippingDiscount.type ===
                                "percentage"
                                  ? coupon.discountOptions.shippingDiscount
                                      .value + "%"
                                  : "৳" +
                                    coupon.discountOptions.shippingDiscount
                                      .value
                              }`
                            )
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500">
                              None
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                        ৳{coupon.minOrderAmount}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1 text-sm text-slate-500 dark:text-slate-400">
                          <FiClock className="w-4 h-4" />
                          <span>
                            {format(
                              new Date(coupon.expiryDate),
                              "MMM dd, yyyy HH:mm"
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                        {coupon.usageLimit}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(coupon._id)}
                            disabled={isLoading}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50"
                            title="Edit Coupon"
                          >
                            <FiEdit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon._id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Delete Coupon"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-700">
            {coupons.map((coupon) => {
              const isExpired = new Date(coupon.expiryDate) < new Date();
              return (
                <div
                  key={coupon._id}
                  className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
                        <FiTag className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
                          {coupon.code}
                        </div>
                        <div
                          className={`text-xs ${
                            isExpired
                              ? "text-red-600 dark:text-red-400"
                              : "text-green-600 dark:text-green-400"
                          }`}
                        >
                          {isExpired ? "Expired" : "Active"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(coupon._id)}
                        disabled={isLoading}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <FiEdit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon._id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        Product Discount:
                      </span>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {coupon.discountOptions.productDiscount.type !== "none"
                          ? `${
                              coupon.discountOptions.productDiscount.type ===
                              "percentage"
                                ? coupon.discountOptions.productDiscount.value +
                                  "%"
                                : "৳" +
                                  coupon.discountOptions.productDiscount.value
                            }`
                          : "None"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        Shipping Discount:
                      </span>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {coupon.discountOptions.shippingDiscount.type !== "none"
                          ? coupon.discountOptions.shippingDiscount.type ===
                            "free"
                            ? "Free"
                            : `${
                                coupon.discountOptions.shippingDiscount.type ===
                                "percentage"
                                  ? coupon.discountOptions.shippingDiscount
                                      .value + "%"
                                  : "৳" +
                                    coupon.discountOptions.shippingDiscount
                                      .value
                              }`
                          : "None"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        Min Order:
                      </span>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        ৳{coupon.minOrderAmount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        Expires:
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {format(new Date(coupon.expiryDate), "MMM dd, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        Usage Limit:
                      </span>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {coupon.usageLimit}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
