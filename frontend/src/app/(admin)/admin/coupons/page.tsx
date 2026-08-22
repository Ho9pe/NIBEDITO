"use client";

import { useState, useEffect } from "react";
import { couponService } from "@/services/couponService";
import { useToast } from "@/hooks/useToast";
import { FiPlus, FiX, FiTag } from "react-icons/fi";
import { Coupon } from "@/types";
import CouponStats from "@/components/admin/coupons/CouponStats";
import CouponList from "@/components/admin/coupons/CouponList";
import CouponForm from "@/components/admin/coupons/CouponForm";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const toast = useToast();

  const loadCoupons = async () => {
    try {
      const response = await couponService.getAllCoupons();
      setCoupons(response.payload?.coupons || []);
      setLoading(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to load coupons");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleFormSuccess = () => {
    setShowAddForm(false);
    loadCoupons();
  };

  const handleFormError = (message: string) => {
    toast.error(message);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Loading coupons...
          </p>
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <FiTag className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    Coupon Management
                  </h1>
                  <p className="text-white/80 text-sm sm:text-base mt-1">
                    Create and manage discount coupons
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                {showAddForm ? (
                  <>
                    <FiX className="w-5 h-5" />
                    <span className="hidden sm:inline">Cancel</span>
                  </>
                ) : (
                  <>
                    <FiPlus className="w-5 h-5" />
                    <span className="hidden sm:inline">Add Coupon</span>
                    <span className="sm:hidden">Add</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        {!showAddForm && (
          <div className="mb-6 sm:mb-8">
            <CouponStats coupons={coupons} />
          </div>
        )}

        {/* Add/Edit Form Section */}
        {showAddForm && (
          <div className="mb-6 sm:mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-4 sm:px-6 py-4">
                <h2 className="text-lg font-semibold text-white">
                  Add New Coupon
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <CouponForm
                  onSuccess={handleFormSuccess}
                  onError={handleFormError}
                  onCancel={() => setShowAddForm(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Coupons List */}
        <CouponList coupons={coupons} onCouponsUpdate={loadCoupons} />
      </div>
    </div>
  );
}
