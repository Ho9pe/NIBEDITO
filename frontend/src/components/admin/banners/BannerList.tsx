"use client";

import React, { useState } from "react";
import Image from "next/image";
import { bannerService } from "@/services/bannerService";
import type { Banner } from "@/types";
import BannerForm from "./BannerForm";
import {
  FiEdit2,
  FiTrash2,
  FiToggleLeft,
  FiToggleRight,
  FiLoader,
  FiImage,
  FiAlertTriangle,
} from "react-icons/fi";

interface BannerListProps {
  banners: Banner[];
  isLoading: boolean;
  onUpdateSuccess: (banners: Banner[], message: string) => void;
  onError: (message: string) => void;
}

export default function BannerList({
  banners,
  isLoading,
  onUpdateSuccess,
  onError,
}: BannerListProps) {
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try {
      const res = await bannerService.toggleBannerStatus(id);
      const updated = banners.map((b) =>
        b._id === id ? res.payload!.banner : b
      );
      onUpdateSuccess(updated, res.message);
    } catch (err: any) {
      onError(err?.response?.data?.message ?? "Failed to toggle banner status");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await bannerService.deleteBanner(id);
      const updated = banners.filter((b) => b._id !== id);
      onUpdateSuccess(updated, res.message);
    } catch (err: any) {
      onError(err?.response?.data?.message ?? "Failed to delete banner");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Loading banners...
          </p>
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
          <FiImage className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
          No banners yet
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">
          Click "Add Banner" to create your first promotional banner.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {banners.map((banner) => (
        <div key={banner._id}>
          {/* Edit inline panel */}
          {editingBanner?._id === banner._id ? (
            <div className="border border-rose-200 dark:border-rose-800 rounded-2xl overflow-hidden">
              <div className="bg-rose-50 dark:bg-rose-900/20 px-6 py-4 border-b border-rose-200 dark:border-rose-800">
                <h3 className="font-semibold text-rose-700 dark:text-rose-400">
                  Editing: {banner.title}
                </h3>
              </div>
              <div className="p-6">
                <BannerForm
                  banner={banner}
                  onSuccess={(updated, msg) => {
                    const newList = banners.map((b) =>
                      b._id === updated._id ? updated : b
                    );
                    setEditingBanner(null);
                    onUpdateSuccess(newList, msg);
                  }}
                  onError={onError}
                  onCancel={() => setEditingBanner(null)}
                />
              </div>
            </div>
          ) : (
            /* Banner row card */
            <div
              className={`flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 rounded-2xl border transition-all duration-200
                ${banner.isActive
                  ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                  : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 opacity-60"
                }`}
            >
              {/* Thumbnail */}
              <div className="relative w-full sm:w-40 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800">
                {banner.imageUrl ? (
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FiImage className="w-8 h-8 text-slate-400" />
                  </div>
                )}
                {/* Active badge */}
                <div
                  className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold
                    ${banner.isActive
                      ? "bg-green-500 text-white"
                      : "bg-slate-400 text-white"
                    }`}
                >
                  {banner.isActive ? "Active" : "Inactive"}
                </div>
                {banner.badge && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-rose-600 text-white text-xs font-bold rounded-full">
                    {banner.badge}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {banner.title}
                </p>
                {banner.subtitle && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {banner.subtitle}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 mt-2">
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    Order: <strong>{banner.order}</strong>
                  </span>
                  <span className="text-xs text-rose-500 font-medium">
                    {banner.ctaText} → {banner.ctaLink}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Toggle */}
                <button
                  onClick={() => handleToggle(banner._id)}
                  disabled={togglingId === banner._id}
                  title={banner.isActive ? "Deactivate" : "Activate"}
                  className="p-2.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20
                    transition-all duration-200 disabled:opacity-50"
                >
                  {togglingId === banner._id ? (
                    <FiLoader className="w-5 h-5 animate-spin" />
                  ) : banner.isActive ? (
                    <FiToggleRight className="w-5 h-5 text-green-500" />
                  ) : (
                    <FiToggleLeft className="w-5 h-5" />
                  )}
                </button>

                {/* Edit */}
                <button
                  onClick={() => setEditingBanner(banner)}
                  title="Edit"
                  className="p-2.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20
                    transition-all duration-200"
                >
                  <FiEdit2 className="w-5 h-5" />
                </button>

                {/* Delete */}
                {confirmDeleteId === banner._id ? (
                  <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-1.5">
                    <FiAlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                      Sure?
                    </span>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      disabled={deletingId === banner._id}
                      className="text-xs text-red-600 dark:text-red-400 font-semibold hover:underline disabled:opacity-50"
                    >
                      {deletingId === banner._id ? "Deleting..." : "Yes"}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-xs text-slate-500 hover:underline"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(banner._id)}
                    title="Delete"
                    className="p-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20
                      transition-all duration-200"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
