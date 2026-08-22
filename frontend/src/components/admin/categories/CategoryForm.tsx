"use client";

import React, { useState, useEffect } from "react";
import { categoryService } from "@/services/categoryService";
import type { Category, ApiResponse } from "@/types";
import { FiUpload, FiX, FiSave, FiLoader } from "react-icons/fi";

interface CategoryFormProps {
  category?: Category;
  onSuccess: (category?: Category) => void;
  onError: (message: string) => void;
  onCancel?: () => void;
}

interface FormData {
  name: string;
  description: string;
  isActive: boolean;
}

interface FormErrors {
  name?: string;
  description?: string;
}

export default function CategoryForm({
  category,
  onSuccess,
  onError,
  onCancel,
}: CategoryFormProps): React.JSX.Element {
  const [formData, setFormData] = useState<FormData>({
    name: category?.name || "",
    description: category?.description || "",
    isActive: category?.isActive ?? true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    category?.image || null
  );

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || "",
        isActive: category.isActive,
      });
      setImagePreview(category.image || null);
    }
  }, [category]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Category name must be at least 2 characters";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must not exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));

    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];

    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        onError("Please select a valid image file");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        onError("Image file size must be less than 5MB");
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (): void => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name.trim());
      submitData.append("description", formData.description.trim());
      submitData.append("isActive", formData.isActive.toString());

      if (imageFile) {
        submitData.append("image", imageFile);
      }

      let response: ApiResponse<{ category: Category }>;

      if (category) {
        // Update existing category
        response = await categoryService.updateCategory(
          category.slug,
          submitData
        );
      } else {
        // Create new category
        response = await categoryService.createCategory(submitData);
      }

      if (response.success) {
        onSuccess(response.payload?.category);
      } else {
        throw new Error(response.message || "Operation failed");
      }
    } catch (error: any) {
      onError(error.message || "An error occurred while saving the category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing: boolean = !!category;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
        >
          Category Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors ${
            errors.name
              ? "border-red-500"
              : "border-slate-300 dark:border-slate-600"
          }`}
          placeholder="Enter category name"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.name}
          </p>
        )}
      </div>

      {/* Category Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors resize-none ${
            errors.description
              ? "border-red-500"
              : "border-slate-300 dark:border-slate-600"
          }`}
          placeholder="Enter category description (optional)"
          disabled={isSubmitting}
        />
        <div className="flex justify-between items-center mt-1">
          {errors.description && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.description}
            </p>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400 ml-auto">
            {formData.description.length}/500
          </p>
        </div>
      </div>

      {/* Category Image */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Category Image
        </label>

        <div className="flex items-start gap-4">
          {/* Image Preview */}
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Category preview"
                className="w-24 h-24 object-cover rounded-lg border border-slate-200 dark:border-slate-600"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                disabled={isSubmitting}
              >
                <FiX className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex-1">
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div className="flex flex-col items-center justify-center">
                <FiUpload className="w-6 h-6 text-slate-500 dark:text-slate-400 mb-1" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Click to upload image
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isSubmitting}
              />
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
        </div>
      </div>

      {/* Active Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={handleInputChange}
          className="w-4 h-4 text-rose-600 bg-gray-100 border-gray-300 rounded focus:ring-rose-500 dark:focus:ring-rose-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          disabled={isSubmitting}
        />
        <label
          htmlFor="isActive"
          className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Active (visible to customers)
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <FiLoader className="w-4 h-4 animate-spin" />
              {isEditing ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              <FiSave className="w-4 h-4" />
              {isEditing ? "Update Category" : "Create Category"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
