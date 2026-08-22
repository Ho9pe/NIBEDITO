"use client";

import { useState } from "react";
import { couponService } from "@/services/couponService";
import { useToast } from "@/hooks/useToast";
import { Coupon, CreateCouponRequest } from "@/types";
import {
  FiGift,
  FiCalendar,
  FiUsers,
  FiPackage,
  FiTruck,
} from "react-icons/fi";

interface CouponFormProps {
  editingCoupon?: Coupon;
  onSuccess: () => void;
  onError: (message: string) => void;
  onCancel: () => void;
}

interface FormData {
  code: string;
  productDiscountType: "fixed" | "percentage" | "none";
  productDiscountValue: number;
  shippingDiscountType: "free" | "fixed" | "percentage" | "none";
  shippingDiscountValue: number;
  expiryDate: string;
  minOrderAmount: number;
  maxDiscount: number;
  usageLimit: number;
}

export default function CouponForm({
  editingCoupon,
  onSuccess,
  onError,
  onCancel,
}: CouponFormProps) {
  const toast = useToast();
  const [formData, setFormData] = useState<FormData>({
    code: editingCoupon?.code || "",
    productDiscountType:
      editingCoupon?.discountOptions?.productDiscount?.type || "none",
    productDiscountValue:
      editingCoupon?.discountOptions?.productDiscount?.value || 0,
    shippingDiscountType:
      editingCoupon?.discountOptions?.shippingDiscount?.type || "none",
    shippingDiscountValue:
      editingCoupon?.discountOptions?.shippingDiscount?.value || 0,
    expiryDate: editingCoupon?.expiryDate
      ? new Date(editingCoupon.expiryDate).toISOString().slice(0, 16)
      : "",
    minOrderAmount: editingCoupon?.minOrderAmount || 0,
    maxDiscount:
      editingCoupon?.discountOptions?.productDiscount?.maxDiscount || 0,
    usageLimit: editingCoupon?.usageLimit || 1,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name.includes("Value") ||
        name.includes("Amount") ||
        name === "usageLimit" ||
        name === "maxDiscount"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const couponData: CreateCouponRequest = {
        code: formData.code,
        productDiscountType: formData.productDiscountType,
        productDiscountValue: formData.productDiscountValue,
        shippingDiscountType: formData.shippingDiscountType,
        shippingDiscountValue: formData.shippingDiscountValue,
        expiryDate: formData.expiryDate,
        minOrderAmount: formData.minOrderAmount,
        maxDiscount: formData.maxDiscount,
        usageLimit: formData.usageLimit,
      };

      if (editingCoupon) {
        await couponService.updateCoupon(editingCoupon._id, couponData);
        toast.success("Coupon updated successfully");
      } else {
        await couponService.createCoupon(couponData);
        toast.success("Coupon created successfully");
      }

      onSuccess();
    } catch (error: any) {
      onError(error.message || "Failed to save coupon");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Coupon Code */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Coupon Code *
        </label>
        <input
          type="text"
          name="code"
          value={formData.code}
          onChange={handleChange}
          required
          disabled={!!editingCoupon}
          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Enter coupon code (e.g., SAVE20)"
        />
      </div>

      {/* Discount Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Discount */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <FiPackage className="w-5 h-5" />
            <span>Product Discount</span>
          </h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Discount Type
            </label>
            <select
              name="productDiscountType"
              value={formData.productDiscountType}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
            >
              <option value="none">No Product Discount</option>
              <option value="fixed">Fixed Amount</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>

          {formData.productDiscountType !== "none" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Discount Value
              </label>
              <div className="relative">
                {formData.productDiscountType === "fixed" && (
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400">
                    ৳
                  </span>
                )}
                {formData.productDiscountType === "percentage" && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400">
                    %
                  </span>
                )}
                <input
                  type="number"
                  name="productDiscountValue"
                  value={formData.productDiscountValue}
                  onChange={handleChange}
                  min="0"
                  required
                  className={`w-full py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors ${
                    formData.productDiscountType === "fixed"
                      ? "pl-8 pr-4"
                      : formData.productDiscountType === "percentage"
                      ? "pl-4 pr-8"
                      : "px-4"
                  }`}
                  placeholder={
                    formData.productDiscountType === "percentage"
                      ? "Enter percentage"
                      : "Enter amount"
                  }
                />
              </div>
            </div>
          )}

          {formData.productDiscountType === "percentage" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Maximum Discount Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400">
                  ৳
                </span>
                <input
                  type="number"
                  name="maxDiscount"
                  value={formData.maxDiscount}
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full pl-8 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                  placeholder="Enter maximum discount"
                />
              </div>
            </div>
          )}
        </div>

        {/* Shipping Discount */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <FiTruck className="w-5 h-5" />
            <span>Shipping Discount</span>
          </h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Discount Type
            </label>
            <select
              name="shippingDiscountType"
              value={formData.shippingDiscountType}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
            >
              <option value="none">No Shipping Discount</option>
              <option value="free">Free Shipping</option>
              <option value="fixed">Fixed Amount</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>

          {formData.shippingDiscountType !== "none" &&
            formData.shippingDiscountType !== "free" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Discount Value
                </label>
                <div className="relative">
                  {formData.shippingDiscountType === "fixed" && (
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400">
                      ৳
                    </span>
                  )}
                  {formData.shippingDiscountType === "percentage" && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400">
                      %
                    </span>
                  )}
                  <input
                    type="number"
                    name="shippingDiscountValue"
                    value={formData.shippingDiscountValue}
                    onChange={handleChange}
                    min="0"
                    required
                    className={`w-full py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors ${
                      formData.shippingDiscountType === "fixed"
                        ? "pl-8 pr-4"
                        : formData.shippingDiscountType === "percentage"
                        ? "pl-4 pr-8"
                        : "px-4"
                    }`}
                    placeholder={
                      formData.shippingDiscountType === "percentage"
                        ? "Enter percentage"
                        : "Enter amount"
                    }
                  />
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Additional Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Expiry Date *
          </label>
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="datetime-local"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Minimum Order Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400">
              ৳
            </span>
            <input
              type="number"
              name="minOrderAmount"
              value={formData.minOrderAmount}
              onChange={handleChange}
              min="0"
              className="w-full pl-8 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Usage Limit Per User
          </label>
          <div className="relative">
            <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="number"
              name="usageLimit"
              value={formData.usageLimit}
              onChange={handleChange}
              min="1"
              required
              className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
              placeholder="1"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:transform-none"
        >
          <FiGift className="w-5 h-5" />
          <span>{editingCoupon ? "Update Coupon" : "Create Coupon"}</span>
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
