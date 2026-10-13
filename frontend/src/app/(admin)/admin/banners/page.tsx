"use client";

import React, { useState, useEffect } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useRouter } from "next/navigation";
import { bannerService } from "@/services/bannerService";
import BannerForm from "@/components/admin/banners/BannerForm";
import BannerList from "@/components/admin/banners/BannerList";
import type { Banner } from "@/types";
import {
  FiImage,
  FiPlus,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiActivity,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

interface StatusState {
  type: "success" | "error" | "";
  message: string;
}

export default function BannersPage(): React.JSX.Element {
  const router = useRouter();
  const { admin, isLoading } = useAdminAuth();

  const [isAddMode, setIsAddMode] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoadingBanners, setIsLoadingBanners] = useState(true);
  const [status, setStatus] = useState<StatusState>({ type: "", message: "" });

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && !admin) router.push("/admin-login");
  }, [admin, isLoading, router]);

  // Auto-clear status after 5 seconds
  useEffect(() => {
    if (!status.message) return;
    const t = setTimeout(() => setStatus({ type: "", message: "" }), 5000);
    return () => clearTimeout(t);
  }, [status]);

  const fetchBanners = async () => {
    try {
      setIsLoadingBanners(true);
      const res = await bannerService.getAllBannersAdmin();
      setBanners(res.payload?.banners ?? []);
    } catch (err: any) {
      setStatus({
        type: "error",
        message: err?.response?.data?.message ?? "Failed to load banners",
      });
    } finally {
      setIsLoadingBanners(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleSuccess = (updatedBanners: Banner[], message: string) => {
    setBanners(updatedBanners);
    setStatus({ type: "success", message });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleError = (message: string) => {
    setStatus({ type: "error", message });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Stats
  const totalBanners = banners.length;
  const activeBanners = banners.filter((b) => b.isActive).length;
  const inactiveBanners = totalBanners - activeBanners;

  if (isLoading || !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">

      {/* ── Header Banner ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        <div className="dashboard-header-gradient rounded-2xl mx-4 sm:mx-6 lg:mx-8 mt-4 sm:mt-6 lg:mt-8 mb-6 sm:mb-8">
          <div className="relative z-10 px-6 sm:px-8 lg:px-12 py-8 sm:py-10 lg:py-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

              {/* Title */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <FiImage className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-1">
                      Banner Management
                    </h1>
                    <p className="text-white/90 text-lg sm:text-xl font-medium">
                      Manage promotional banners on the homepage slider
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                  <FiImage className="w-5 h-5 text-white mx-auto mb-1" />
                  <p className="text-2xl font-bold text-white">{totalBanners}</p>
                  <p className="text-white/80 text-xs">Total</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                  <FiEye className="w-5 h-5 text-white mx-auto mb-1" />
                  <p className="text-2xl font-bold text-white">{activeBanners}</p>
                  <p className="text-white/80 text-xs">Active</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                  <FiEyeOff className="w-5 h-5 text-white mx-auto mb-1" />
                  <p className="text-2xl font-bold text-white">{inactiveBanners}</p>
                  <p className="text-white/80 text-xs">Inactive</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Status toast ──────────────────────────────────────────────── */}
      {status.message && (
        <div className="mx-4 sm:mx-6 lg:mx-8 mb-6">
          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-200 ${
              status.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-400"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-400"
            }`}
          >
            <div className="flex items-center gap-3">
              {status.type === "success" ? (
                <FiCheckCircle className="w-5 h-5" />
              ) : (
                <FiAlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{status.message}</span>
            </div>
            <button
              onClick={() => setStatus({ type: "", message: "" })}
              className="p-1 hover:bg-black/10 rounded-lg transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 lg:px-8 pb-12 space-y-8">

        {/* Add Banner Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <FiActivity className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200">
                {isAddMode ? "Create New Banner" : "Banners"}
              </h2>
            </div>

            <button
              onClick={() => {
                setIsAddMode(!isAddMode);
                setStatus({ type: "", message: "" });
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                isAddMode
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  : "bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white shadow-lg hover:shadow-xl hover:scale-105"
              }`}
            >
              {isAddMode ? (
                <>
                  <FiX className="w-4 h-4" /> Cancel
                </>
              ) : (
                <>
                  <FiPlus className="w-4 h-4" /> Add Banner
                </>
              )}
            </button>
          </div>

          {isAddMode && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6">
                <BannerForm
                  onSuccess={(newBanner, msg) => {
                    setBanners((prev) =>
                      [...prev, newBanner].sort((a, b) => a.order - b.order)
                    );
                    setIsAddMode(false);
                    setStatus({ type: "success", message: msg });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  onError={handleError}
                  onCancel={() => setIsAddMode(false)}
                />
              </div>
            </div>
          )}
        </section>

        {/* Banners List */}
        {!isAddMode && (
          <section className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                    All Banners
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Banners are displayed on the homepage slider in order.
                    Only active banners are shown to users.
                  </p>
                </div>
              </div>
              <div className="p-6">
                <BannerList
                  banners={banners}
                  isLoading={isLoadingBanners}
                  onUpdateSuccess={handleSuccess}
                  onError={handleError}
                />
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
