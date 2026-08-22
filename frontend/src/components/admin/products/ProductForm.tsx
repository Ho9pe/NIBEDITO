"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  FiX,
  FiUpload,
  FiPlus,
  FiTrash2,
  FiImage,
  FiPackage,
  FiSave,
  FiLoader,
} from "react-icons/fi";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { subcategoryService } from "@/services/subcategoryService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/Error";
import MarkdownEditor from "@/components/admin/common/MarkdownEditor";
import type { Product, ProductVariant, Category, Subcategory } from "@/types";

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
  onError: (message: string) => void;
  onCancel?: () => void;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  category: string;
  subcategory: string;
  shipping: boolean;
  variants: ProductVariant[];
}

export default function ProductForm({
  product,
  onSuccess,
  onError,
  onCancel,
}: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    category:
      typeof product?.category === "object" && product.category
        ? product.category._id
        : (product?.category as string) || "",
    subcategory:
      typeof product?.subcategory === "object" && product.subcategory
        ? product.subcategory._id
        : (product?.subcategory as string) || "",
    shipping: product?.shipping || false,
    variants: product?.variants || [],
  });
  const [thumbnailImage, setThumbnailImage] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [variantImages, setVariantImages] = useState<Record<number, File[]>>(
    {}
  );
  const [variantPreviews, setVariantPreviews] = useState<
    Record<number, string[]>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);
  const [isLoadingSubcategories, setIsLoadingSubcategories] =
    useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleError = (message: string): void => {
    setError(message);
    onError(message);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const fetchCategories = async (): Promise<void> => {
      try {
        setIsLoadingCategories(true);
        const data = await categoryService.getAllCategories();
        setCategories(data.payload!.categories || []);
      } catch (error: any) {
        handleError(error.message);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();

    // If product exists, set thumbnail preview
    if (product?.thumbnailImage) {
      setThumbnailPreview(product.thumbnailImage);
    }

    // If product has a subcategory, prefetch the subcategories for that category
    if (
      typeof product?.category === "object" &&
      product.category?._id &&
      typeof product?.subcategory === "object" &&
      product.subcategory?._id
    ) {
      const fetchInitialSubcategories = async (): Promise<void> => {
        try {
          setIsLoadingSubcategories(true);
          const categoryId =
            typeof product.category === "object"
              ? product.category._id
              : product.category;
          const subcats = await subcategoryService.getSubcategoriesByCategory(
            categoryId
          );
          setSubcategories(subcats || []);
        } catch (error) {
          console.error("Failed to fetch initial subcategories:", error);
        } finally {
          setIsLoadingSubcategories(false);
        }
      };

      fetchInitialSubcategories();
    }
  }, [product]);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      const fetchSubcategories = async (): Promise<void> => {
        try {
          setIsLoadingSubcategories(true);
          const subcats = await subcategoryService.getSubcategoriesByCategory(
            formData.category
          );
          setSubcategories(subcats || []);
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
    setFormData((prev) => ({ ...prev, description: value }));
  };

  const handleThumbnailChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailImage(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleVariantImageChange = (
    variantIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    const existingFiles = variantImages[variantIndex] || [];

    // Check if total images would exceed 5
    if (existingFiles.length + newFiles.length > 5) {
      handleError("Maximum 5 images allowed per variant");
      return;
    }

    // Combine existing and new files
    const updatedFiles = [...existingFiles, ...newFiles];
    setVariantImages((prev) => ({
      ...prev,
      [variantIndex]: updatedFiles,
    }));

    // Generate previews for all images
    const existingPreviews = variantPreviews[variantIndex] || [];
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setVariantPreviews((prev) => ({
      ...prev,
      [variantIndex]: [...existingPreviews, ...newPreviews],
    }));
  };

  const removeVariantImage = (
    variantIndex: number,
    imageIndex: number
  ): void => {
    setVariantImages((prev) => ({
      ...prev,
      [variantIndex]: prev[variantIndex].filter((_, i) => i !== imageIndex),
    }));

    setVariantPreviews((prev) => ({
      ...prev,
      [variantIndex]: prev[variantIndex].filter((_, i) => i !== imageIndex),
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

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!thumbnailImage && !product) {
        throw new globalThis.Error("Thumbnail image is required");
      }

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("category", formData.category);

      // Only append subcategory if selected
      if (formData.subcategory) {
        formDataToSend.append("subcategory", formData.subcategory);
      }

      formDataToSend.append("shipping", formData.shipping.toString());

      // Append thumbnail with specific name if it's a new image
      if (thumbnailImage) {
        const thumbnailExtension = thumbnailImage.name.split(".").pop();
        const thumbnailBlob = new Blob([thumbnailImage], {
          type: thumbnailImage.type,
        });
        formDataToSend.append(
          "thumbnail",
          thumbnailBlob,
          `product-thumbnail.${thumbnailExtension}`
        );
      }

      // Process variants and their images - remove _id for new variants
      let totalImageIndex = 0;
      const variantsWithImageInfo = formData.variants.map(
        (variant, variantIndex) => {
          const currentVariantImages = variantImages[variantIndex] || [];
          const startIndex = Object.entries(variantImages)
            .slice(0, variantIndex)
            .reduce((acc, [_, images]) => acc + images.length, 0);

          const imageIndices = currentVariantImages.map(
            (_, index) => startIndex + index
          );

          // Remove _id for new variants (those with temp IDs)
          const cleanVariant = { ...variant };
          if (cleanVariant._id?.startsWith("temp-")) {
            delete cleanVariant._id;
          }

          return {
            ...cleanVariant,
            imageIndices,
          };
        }
      );

      formDataToSend.append("variants", JSON.stringify(variantsWithImageInfo));

      // Append variant images with specific names
      Object.entries(variantImages).forEach(([variantIndex, images]) => {
        images.forEach((image) => {
          const extension = image.name.split(".").pop();
          const blob = new Blob([image], { type: image.type });
          formDataToSend.append(
            "variantImages",
            blob,
            `product-variant-${variantIndex}-${totalImageIndex}.${extension}`
          );
          totalImageIndex++;
        });
      });

      if (product) {
        await productService.updateProduct(product.slug, formDataToSend);
      } else {
        await productService.createProduct(formDataToSend);
      }

      onSuccess();
    } catch (error: any) {
      handleError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingCategories) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
          <span className="text-slate-600 dark:text-slate-400">
            Loading categories...
          </span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="mb-6">
          <ErrorMessage type="error" message={error} onClose={() => setError("")} />
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <FiPackage className="w-5 h-5" />
            <span>Basic Information</span>
          </h3>
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
              minLength={3}
              maxLength={300}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          </div>

          {/* Subcategory */}
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

      {/* Thumbnail Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <FiImage className="w-5 h-5" />
            <span>Thumbnail Image</span>
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FiUpload className="w-8 h-8 mb-2 text-slate-400" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-medium">Click to upload</span>{" "}
                    thumbnail image
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    PNG, JPG or JPEG (MAX. 10MB)
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
              </label>
            </div>
            {thumbnailPreview && (
              <div className="relative inline-block">
                <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                  <Image
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setThumbnailImage(null);
                    setThumbnailPreview("");
                  }}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Variants Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <FiPackage className="w-5 h-5" />
              <span>Product Variants</span>
            </h3>
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
              <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                No variants added
              </h4>
              <p className="text-slate-500 dark:text-slate-400">
                Add product variants to manage different sizes, colors, and
                inventory.
              </p>
            </div>
          ) : (
            formData.variants.map((variant, variantIndex) => (
              <div
                key={variantIndex}
                className="border border-slate-200 dark:border-slate-700 rounded-lg p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    Variant #{variantIndex + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeVariant(variantIndex)}
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
                        handleVariantChange(
                          variantIndex,
                          "color",
                          e.target.value
                        )
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
                        handleVariantChange(
                          variantIndex,
                          "size",
                          e.target.value
                        )
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
                          variantIndex,
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

                {/* Variant Images */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Variant Images ({variantImages[variantIndex]?.length || 0}
                      /5)
                    </h5>
                  </div>

                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-2 pb-3">
                        <FiUpload className="w-6 h-6 mb-1 text-slate-400" />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Upload variant images
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) =>
                          handleVariantImageChange(variantIndex, e)
                        }
                        className="hidden"
                        disabled={variantImages[variantIndex]?.length >= 5}
                      />
                    </label>
                  </div>

                  {variantPreviews[variantIndex]?.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {variantPreviews[variantIndex]?.map(
                        (preview, imageIndex) => (
                          <div key={imageIndex} className="relative group">
                            <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                              <Image
                                src={preview}
                                alt={`Variant ${variantIndex} preview ${imageIndex}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                removeVariantImage(variantIndex, imageIndex)
                              }
                              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <FiX className="w-3 h-3" />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  )}
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
          disabled={isLoading}
          className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <>
              <FiLoader className="w-5 h-5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <FiSave className="w-5 h-5" />
              <span>{product ? "Update Product" : "Create Product"}</span>
            </>
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="inline-flex items-center justify-center px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
