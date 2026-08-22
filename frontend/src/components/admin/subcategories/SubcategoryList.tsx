"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  FiEdit2,
  FiTrash2,
  FiBox,
  FiRefreshCw,
  FiLayers,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiX,
} from "react-icons/fi";
import { subcategoryService } from "@/services/subcategoryService";
import SubcategoryForm from "./SubcategoryForm";
import type { Subcategory, Category, ApiResponse } from "@/types";

interface SubcategoryListProps {
  subcategories: Subcategory[];
  categories: Category[];
  isLoading: boolean;
  onUpdateSuccess: (
    message: string,
    updatedSubcategories?: Subcategory[]
  ) => void;
  onError: (message: string) => void;
}

interface DeleteDialogProps {
  isOpen: boolean;
  subcategory: Subcategory | null;
  isDeleting: boolean;
}

export default function SubcategoryList({
  subcategories,
  categories,
  isLoading,
  onUpdateSuccess,
  onError,
}: SubcategoryListProps): React.JSX.Element {
  const [editingSubcategory, setEditingSubcategory] =
    useState<Subcategory | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogProps>({
    isOpen: false,
    subcategory: null,
    isDeleting: false,
  });
  const [isUpdatingCounts, setIsUpdatingCounts] = useState<boolean>(false);

  const handleDeleteClick = (subcategory: Subcategory): void => {
    setDeleteDialog({
      isOpen: true,
      subcategory,
      isDeleting: false,
    });
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!deleteDialog.subcategory) return;

    try {
      setDeleteDialog((prev) => ({ ...prev, isDeleting: true }));

      const response: ApiResponse = await subcategoryService.deleteSubcategory(
        deleteDialog.subcategory.slug
      );

      const updatedSubcategories: Subcategory[] = subcategories.filter(
        (subcat) => subcat.slug !== deleteDialog.subcategory!.slug
      );

      setDeleteDialog({ isOpen: false, subcategory: null, isDeleting: false });

      await onUpdateSuccess(
        "Subcategory deleted successfully",
        updatedSubcategories
      );

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    } catch (error: any) {
      onError(error.message);
      setDeleteDialog({ isOpen: false, subcategory: null, isDeleting: false });

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    }
  };

  const handleDeleteCancel = (): void => {
    setDeleteDialog({ isOpen: false, subcategory: null, isDeleting: false });
  };

  const handleStatusToggle = async (
    subcategory: Subcategory
  ): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append("isActive", (!subcategory.isActive).toString());

      const response: ApiResponse<{ subcategory: Subcategory }> =
        await subcategoryService.updateSubcategory(subcategory.slug, formData);

      if (response.success) {
        onUpdateSuccess("Subcategory status updated successfully");
      }
    } catch (error: any) {
      onError(error.message);
    }
  };

  const handleUpdateCounts = async (): Promise<void> => {
    try {
      setIsUpdatingCounts(true);
      const response: ApiResponse =
        await subcategoryService.recalculateProductCounts();
      onUpdateSuccess(
        "Product counts updated successfully",
        response.payload?.subcategories
      );
    } catch (error: any) {
      onError(error.message);
    } finally {
      setIsUpdatingCounts(false);
    }
  };

  const handleEditStart = (subcategory: Subcategory): void => {
    setEditingSubcategory(subcategory);
  };

  const handleEditCancel = (): void => {
    setEditingSubcategory(null);
  };

  const handleEditSuccess = (): void => {
    setEditingSubcategory(null);
    onUpdateSuccess("Subcategory updated successfully");
  };

  const getCategoryName = (category: string | Category): string => {
    if (typeof category === "string") {
      const foundCategory = categories.find((cat) => cat._id === category);
      return foundCategory?.name || "Unknown Category";
    }
    return category.name || "Unknown Category";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-4 p-6 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (subcategories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiLayers className="w-8 h-8 text-slate-500 dark:text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
          No Subcategories Found
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Create your first subcategory to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          All Subcategories ({subcategories.length})
        </h3>
        <button
          onClick={handleUpdateCounts}
          disabled={isUpdatingCounts}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Recalculate product counts"
        >
          <FiRefreshCw
            className={`w-4 h-4 ${isUpdatingCounts ? "animate-spin" : ""}`}
          />
          <span className="hidden sm:inline">Update Counts</span>
        </button>
      </div>

      {/* Subcategories Grid */}
      <div className="space-y-4">
        {subcategories
          .filter(
            (subcategory) => subcategory.slug !== deleteDialog.subcategory?.slug
          )
          .map((subcategory) => (
            <div
              key={subcategory._id}
              className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all duration-200"
            >
              {editingSubcategory?.slug === subcategory.slug ? (
                <div className="p-6">
                  <SubcategoryForm
                    categories={categories}
                    subcategory={subcategory}
                    onSuccess={handleEditSuccess}
                    onError={onError}
                    onCancel={handleEditCancel}
                  />
                </div>
              ) : (
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Subcategory Image */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        {subcategory.image ? (
                          <Image
                            src={subcategory.image}
                            alt={subcategory.name}
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-slate-500 dark:text-slate-400 text-2xl font-bold">
                            {subcategory.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Subcategory Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 truncate">
                              {subcategory.name}
                            </h3>
                            <button
                              onClick={() => handleStatusToggle(subcategory)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                                subcategory.isActive
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                                  : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                              }`}
                            >
                              {subcategory.isActive ? (
                                <>
                                  <FiEye className="w-3 h-3" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <FiEyeOff className="w-3 h-3" />
                                  Inactive
                                </>
                              )}
                            </button>
                          </div>

                          {/* Category */}
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                            Category: {getCategoryName(subcategory.category)}
                          </p>

                          {/* Description */}
                          <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 line-clamp-2">
                            {subcategory.description ||
                              "No description provided"}
                          </p>

                          {/* Product Count */}
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <FiBox className="w-4 h-4" />
                            <span>
                              {subcategory.productCount || 0} Products
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleEditStart(subcategory)}
                            className="inline-flex items-center justify-center w-10 h-10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200"
                            title="Edit subcategory"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(subcategory)}
                            className="inline-flex items-center justify-center w-10 h-10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200"
                            title="Delete subcategory"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialog.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
              onClick={handleDeleteCancel}
            />

            {/* Dialog */}
            <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 text-left shadow-xl transition-all duration-300 sm:my-8 sm:w-full sm:max-w-lg border border-slate-200 dark:border-slate-700">
              {/* Header */}
              <div className="px-6 pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                      <FiAlertCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Delete Subcategory
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={handleDeleteCancel}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-4">
                <div className="space-y-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {deleteDialog.subcategory?.name}
                    </span>
                    ?
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    This action cannot be undone. All associated data will be
                    permanently removed.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  onClick={handleDeleteCancel}
                  disabled={deleteDialog.isDeleting}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteDialog.isDeleting}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteDialog.isDeleting
                    ? "Deleting..."
                    : "Delete Subcategory"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
