"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
  FiBox,
  FiRefreshCw,
  FiFolder,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
} from "react-icons/fi";
import { categoryService } from "@/services/categoryService";
import CategoryForm from "./CategoryForm";
import type { Category, ApiResponse } from "@/types";

interface CategoryListProps {
  categories: Category[];
  isLoading: boolean;
  onUpdateSuccess: (message: string, updatedCategories?: Category[]) => void;
  onError: (message: string) => void;
}

interface DeleteDialogProps {
  isOpen: boolean;
  category: Category | null;
  isDeleting: boolean;
}

export default function CategoryList({
  categories,
  isLoading,
  onUpdateSuccess,
  onError,
}: CategoryListProps): React.JSX.Element {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogProps>({
    isOpen: false,
    category: null,
    isDeleting: false,
  });
  const [isUpdatingCounts, setIsUpdatingCounts] = useState<boolean>(false);

  const handleDeleteClick = (category: Category): void => {
    setDeleteDialog({
      isOpen: true,
      category,
      isDeleting: false,
    });
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!deleteDialog.category) return;

    try {
      setDeleteDialog((prev) => ({ ...prev, isDeleting: true }));

      const response: ApiResponse = await categoryService.deleteCategory(
        deleteDialog.category.slug
      );

      const updatedCategories: Category[] = categories.filter(
        (cat) => cat.slug !== deleteDialog.category!.slug
      );

      setDeleteDialog({ isOpen: false, category: null, isDeleting: false });

      await onUpdateSuccess("Category deleted successfully", updatedCategories);

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    } catch (error: any) {
      onError(error.message);
      setDeleteDialog({ isOpen: false, category: null, isDeleting: false });

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    }
  };

  const handleDeleteCancel = (): void => {
    setDeleteDialog({ isOpen: false, category: null, isDeleting: false });
  };

  const handleStatusToggle = async (category: Category): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append("isActive", (!category.isActive).toString());

      const response: ApiResponse<{ category: Category }> =
        await categoryService.updateCategory(category.slug, formData);

      if (response.statusCode === 200) {
        onUpdateSuccess("Category status updated successfully");
      }
    } catch (error: any) {
      onError(error.message);
    }
  };

  const handleUpdateCounts = async (): Promise<void> => {
    try {
      setIsUpdatingCounts(true);
      const response: ApiResponse =
        await categoryService.recalculateProductCounts();
      onUpdateSuccess(
        "Product counts updated successfully",
        response.payload?.categories
      );
    } catch (error: any) {
      onError(error.message);
    } finally {
      setIsUpdatingCounts(false);
    }
  };

  const handleEditStart = (category: Category): void => {
    setEditingCategory(category);
  };

  const handleEditCancel = (): void => {
    setEditingCategory(null);
  };

  const handleEditSuccess = (): void => {
    setEditingCategory(null);
    onUpdateSuccess("Category updated successfully");
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

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiFolder className="w-8 h-8 text-slate-500 dark:text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
          No Categories Found
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Create your first category to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          All Categories ({categories.length})
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

      {/* Categories Grid */}
      <div className="space-y-4">
        {categories
          .filter((category) => category.slug !== deleteDialog.category?.slug)
          .map((category) => (
            <div
              key={category._id}
              className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all duration-200"
            >
              {editingCategory?.slug === category.slug ? (
                <div className="p-6">
                  <CategoryForm
                    category={category}
                    onSuccess={handleEditSuccess}
                    onError={onError}
                    onCancel={handleEditCancel}
                  />
                </div>
              ) : (
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Category Image */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        {category.image ? (
                          <Image
                            src={category.image}
                            alt={category.name}
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-slate-500 dark:text-slate-400 text-2xl font-bold">
                            {category.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Category Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 truncate">
                              {category.name}
                            </h3>
                            <button
                              onClick={() => handleStatusToggle(category)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                                category.isActive
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                                  : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                              }`}
                            >
                              {category.isActive ? (
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

                          {/* Description */}
                          <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 line-clamp-2">
                            {category.description || "No description provided"}
                          </p>

                          {/* Product Count */}
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <FiBox className="w-4 h-4" />
                            <span>{category.productCount || 0} Products</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => setEditingCategory(category)}
                            className="inline-flex items-center justify-center w-10 h-10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200"
                            title="Edit category"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(category)}
                            className="inline-flex items-center justify-center w-10 h-10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200"
                            title="Delete category"
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
                        Delete Category
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
                      {deleteDialog.category?.name}
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
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteDialog.isDeleting}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteDialog.isDeleting ? "Deleting..." : "Delete Category"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
