"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { subcategoryService } from "@/services/subcategoryService";
import ImageManager from "@/components/admin/products/ImageManager";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/Error";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  FiPlus,
  FiTrash2,
  FiArrowLeft,
  FiEdit3,
  FiSave,
  FiPackage,
  FiImage,
} from "react-icons/fi";
import MarkdownEditor from "@/components/admin/common/MarkdownEditor";
import type { Product, Category, Subcategory, ProductVariant } from "@/types";

interface FormData {
  name: string;
  description: string;
  price: string;
  category: string;
  subcategory: string;
  shipping: boolean;
  variants: ProductVariant[];
}

export default function ProductDetailsPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoadingSubcategories, setIsLoadingSubcategories] =
    useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    price: "",
    category: "",
    subcategory: "",
    shipping: false,
    variants: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const [productData, categoriesData] = await Promise.all([
          productService.getProduct(slug),
          categoryService.getAllCategories(),
        ]);

        setProduct(productData);
        setCategories(categoriesData.payload!.categories);

        // Load subcategories if product has a category
        const categoryId =
          typeof productData.category === "object"
            ? productData.category._id
            : productData.category;
        if (categoryId) {
          try {
            setIsLoadingSubcategories(true);
            const subcats = await subcategoryService.getSubcategoriesByCategory(
              categoryId
            );
            setSubcategories(subcats || []);
          } catch (error) {
            console.error("Failed to fetch subcategories:", error);
          } finally {
            setIsLoadingSubcategories(false);
          }
        }

        const subcategoryId =
          typeof productData.subcategory === "object"
            ? productData.subcategory?._id
            : productData.subcategory;

        setFormData({
          name: productData.name,
          description: productData.description,
          price: productData.price.toString(),
          category: categoryId || "",
          subcategory: subcategoryId || "",
          shipping: productData.shipping || false,
          variants: productData.variants || [],
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  // Update subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      const fetchSubcategories = async (): Promise<void> => {
        try {
          setIsLoadingSubcategories(true);
          const subcats = await subcategoryService.getSubcategoriesByCategory(
            formData.category
          );
          setSubcategories(subcats || []);

          // If current subcategory doesn't belong to this category, reset it
          if (formData.subcategory) {
            const subcatBelongsToCategory = subcats.some(
              (subcat) => subcat._id === formData.subcategory
            );

            if (!subcatBelongsToCategory) {
              setFormData((prev) => ({ ...prev, subcategory: "" }));
            }
          }
        } catch (error) {
          console.error("Failed to fetch subcategories:", error);
          setSubcategories([]);
        } finally {
          setIsLoadingSubcategories(false);
        }
      };

      fetchSubcategories();
    } else {
      setSubcategories([]);
      // Reset subcategory if category is cleared
      if (formData.subcategory) {
        setFormData((prev) => ({ ...prev, subcategory: "" }));
      }
    }
  }, [formData.category]); // Remove formData.subcategory from dependencies

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDescriptionChange = (value: string): void => {
    setFormData((prev) => ({
      ...prev,
      description: value,
    }));
  };

  const handleVariantChange = (
    index: number,
    field: keyof ProductVariant,
    value: string | number
  ): void => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: value,
    };
    setFormData((prev) => ({ ...prev, variants: updatedVariants }));
  };

  const addVariant = (): void => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          _id: `temp-${Date.now()}`,
          color: "",
          size: "",
          quantity: 0,
          images: [],
        },
      ],
    }));
  };

  const removeVariant = (index: number): void => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleThumbnailChange = async (files: File[]): Promise<void> => {
    if (!product || !files[0]) return;

    try {
      const formDataToSend = new FormData();
      // Include all required fields from current formData
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("category", formData.category);
      if (formData.subcategory) {
        formDataToSend.append("subcategory", formData.subcategory);
      }
      formDataToSend.append("shipping", formData.shipping.toString());

      // Keep existing variants
      formDataToSend.append("variants", JSON.stringify(formData.variants));

      // Add the new thumbnail
      formDataToSend.append("thumbnail", files[0]);

      const response = await productService.updateProduct(
        product.slug,
        formDataToSend
      );
      if (response.payload) {
        setProduct(response.payload.product);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleVariantImagesChange = async (
    variantIndex: number,
    files: File[],
    removedIndices: number[] = []
  ): Promise<void> => {
    if (!product) return;

    try {
      const formDataToSend = new FormData();
      // Include all required fields
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("category", formData.category);
      if (formData.subcategory) {
        formDataToSend.append("subcategory", formData.subcategory);
      }
      formDataToSend.append("shipping", formData.shipping.toString());

      // Prepare variants with the new images
      const updatedVariants = [...formData.variants];

      // Add new files to formData if any
      files.forEach((file) => {
        formDataToSend.append("variantImages", file);
      });

      // Create an update object for this variant
      const variantUpdate = {
        ...updatedVariants[variantIndex],
        removedImageIndices: removedIndices,
        newImageCount: files.length,
      };

      // Keep other variants unchanged
      const variantsToUpdate = updatedVariants.map((v, idx) =>
        idx === variantIndex ? variantUpdate : v
      );

      formDataToSend.append("variants", JSON.stringify(variantsToUpdate));

      const response = await productService.updateProduct(
        product.slug,
        formDataToSend
      );
      if (response.payload) {
        setProduct(response.payload.product);
        setFormData((prev) => ({
          ...prev,
          variants: response.payload!.product.variants || [],
        }));
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (!product) return;

    setIsSubmitting(true);
    setError("");

    try {
      const formDataToSend = new FormData();

      // Include all required fields
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("category", formData.category);
      if (formData.subcategory) {
        formDataToSend.append("subcategory", formData.subcategory);
      }
      formDataToSend.append("shipping", formData.shipping.toString());
      formDataToSend.append("variants", JSON.stringify(formData.variants));

      const response = await productService.updateProduct(
        product.slug,
        formDataToSend
      );
      if (response.payload) {
        setProduct(response.payload.product);
      }
      router.push("/admin/products");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!product) return;

    try {
      setIsSubmitting(true);
      await productService.deleteProduct(product.slug);
      router.push("/admin/products");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <ErrorMessage message="Product not found" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="product-header-gradient-enhanced rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <FiEdit3 className="w-8 h-8 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">
                    {product.name}
                  </h1>
                  <p className="text-white/80 text-sm sm:text-base mt-1">
                    Edit product details and manage inventory
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.push("/admin/products")}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back</span>
                </button>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isSubmitting}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <FiPackage className="w-5 h-5" />
                <span>Basic Information</span>
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Product Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                  placeholder="Enter product name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <div className="border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden">
                  <MarkdownEditor
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    height={300}
                  />
                </div>
              </div>

              {/* Price and Category Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400">
                      $
                    </span>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full pl-8 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="subcategory"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Subcategory
                  </label>
                  <div className="relative">
                    <select
                      id="subcategory"
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleInputChange}
                      disabled={!formData.category || isLoadingSubcategories}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Subcategory (Optional)</option>
                      {subcategories.map((subcategory) => (
                        <option key={subcategory._id} value={subcategory._id}>
                          {subcategory.name}
                        </option>
                      ))}
                    </select>
                    {isLoadingSubcategories && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-600"></div>
                      </div>
                    )}
                  </div>
                  {!formData.category && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Please select a category first
                    </p>
                  )}
                </div>
              </div>

              {/* Shipping Checkbox */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="shipping"
                  name="shipping"
                  checked={formData.shipping}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-rose-600 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded focus:ring-rose-500 focus:ring-2"
                />
                <label
                  htmlFor="shipping"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Available for Shipping
                </label>
              </div>
            </div>
          </div>

          {/* Image Management */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <FiImage className="w-5 h-5" />
                <span>Product Images</span>
              </h2>
            </div>
            <div className="p-6">
              <ImageManager
                title="Thumbnail Image"
                currentImage={product.thumbnailImage}
                onImageChange={handleThumbnailChange}
                onImageRemove={() => {}}
              />
            </div>
          </div>

          {/* Product Variants */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <FiPackage className="w-5 h-5" />
                  <span>Product Variants</span>
                </h2>
                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Add Variant</span>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {formData.variants.length === 0 ? (
                <div className="text-center py-12">
                  <FiPackage className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                    No variants added
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    Add product variants to manage different sizes, colors, and
                    inventory.
                  </p>
                </div>
              ) : (
                formData.variants.map((variant, index) => (
                  <div
                    key={index}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                        Variant #{index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Color *
                        </label>
                        <input
                          type="text"
                          value={variant.color}
                          onChange={(e) =>
                            handleVariantChange(index, "color", e.target.value)
                          }
                          required
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                          placeholder="e.g., Red, Blue"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Size *
                        </label>
                        <input
                          type="text"
                          value={variant.size}
                          onChange={(e) =>
                            handleVariantChange(index, "size", e.target.value)
                          }
                          required
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                          placeholder="e.g., S, M, L"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          value={variant.quantity}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "quantity",
                              parseInt(e.target.value)
                            )
                          }
                          min="0"
                          required
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <ImageManager
                        title="Variant Images"
                        currentImage={variant.images}
                        onImageChange={(files, removedIndices) =>
                          handleVariantImagesChange(
                            index,
                            files,
                            removedIndices
                          )
                        }
                        multiple={true}
                        maxImages={5}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FiSave className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showDeleteDialog}
          title="Delete Product"
          message={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
          confirmButtonProps={{
            className: "btn btn-danger",
          }}
        />
      </div>
    </div>
  );
}
