"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { bannerService } from "@/services/bannerService";
import type { Banner } from "@/types";
import {
  FiUpload,
  FiX,
  FiLoader,
  FiImage,
  FiLink,
  FiTag,
  FiType,
  FiAlignLeft,
} from "react-icons/fi";

interface BannerFormProps {
  /** If provided the form is in edit mode */
  banner?: Banner;
  onSuccess: (banner: Banner, message: string) => void;
  onError: (message: string) => void;
  onCancel: () => void;
}

export default function BannerForm({
  banner,
  onSuccess,
  onError,
  onCancel,
}: BannerFormProps) {
  const isEdit = !!banner;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: banner?.title ?? "",
    subtitle: banner?.subtitle ?? "",
    badge: banner?.badge ?? "",
    ctaText: banner?.ctaText ?? "Shop Now",
    ctaLink: banner?.ctaLink ?? "/products",
    isActive: banner?.isActive ?? true,
    order: banner?.order ?? 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    banner?.imageUrl ?? ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    if (errors.image) setErrors((prev) => ({ ...prev, image: "" }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (form.title.length > 150)
      newErrors.title = "Title must be under 150 characters";
    if (!isEdit && !imageFile) newErrors.image = "Banner image is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) =>
        formData.append(key, String(val))
      );
      if (imageFile) formData.append("image", imageFile);

      if (isEdit) {
        const res = await bannerService.updateBanner(banner!._id, formData);
        onSuccess(res.payload!.banner, "Banner updated successfully");
      } else {
        const res = await bannerService.createBanner(formData);
        onSuccess(res.payload!.banner, "Banner created successfully");
      }
    } catch (err: any) {
      onError(
        err?.response?.data?.message ?? err.message ?? "Something went wrong"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Banner Image {!isEdit && <span className="text-rose-500">*</span>}
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 overflow-hidden
            ${errors.image ? "border-red-400 bg-red-50 dark:bg-red-900/10" : "border-slate-300 dark:border-slate-600 hover:border-rose-400 dark:hover:border-rose-500 bg-slate-50 dark:bg-slate-800/50"}`}
        >
          {imagePreview ? (
            <div className="relative h-52 w-full">
              <Image
                src={imagePreview}
                alt="Banner preview"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <p className="text-white font-medium text-sm">
                  Click to change image
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mb-4">
                <FiImage className="w-8 h-8 text-rose-500" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Click to upload banner image
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                JPG, PNG, WEBP — max 10 MB (recommended: 1920×600 px)
              </p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
          id="banner-image-input"
        />
        {errors.image && (
          <p className="mt-1 text-xs text-red-500">{errors.image}</p>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          <span className="flex items-center gap-2">
            <FiType className="w-4 h-4" /> Title{" "}
            <span className="text-rose-500">*</span>
          </span>
        </label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Up to 50% Off on All Gifts"
          className={`w-full px-4 py-3 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
            placeholder:text-slate-400 transition-colors outline-none
            ${errors.title ? "border-red-400 focus:border-red-500" : "border-slate-200 dark:border-slate-600 focus:border-rose-500 dark:focus:border-rose-400"}`}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-500">{errors.title}</p>
        )}
      </div>

      {/* Subtitle */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          <span className="flex items-center gap-2">
            <FiAlignLeft className="w-4 h-4" /> Subtitle
          </span>
        </label>
        <input
          type="text"
          name="subtitle"
          value={form.subtitle}
          onChange={handleChange}
          placeholder="e.g. Shop the season's best deals — limited time only"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-rose-500 dark:focus:border-rose-400
            text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors outline-none"
        />
      </div>

      {/* Badge + Order row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <span className="flex items-center gap-2">
              <FiTag className="w-4 h-4" /> Badge Chip
            </span>
          </label>
          <input
            type="text"
            name="badge"
            value={form.badge}
            onChange={handleChange}
            placeholder="e.g. SALE, NEW, HOT DEAL"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-rose-500 dark:focus:border-rose-400
              text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Display Order
          </label>
          <input
            type="number"
            name="order"
            min={0}
            value={form.order}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-rose-500 dark:focus:border-rose-400
              text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors outline-none"
          />
        </div>
      </div>

      {/* CTA Text + CTA Link row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Button Label
          </label>
          <input
            type="text"
            name="ctaText"
            value={form.ctaText}
            onChange={handleChange}
            placeholder="Shop Now"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-rose-500 dark:focus:border-rose-400
              text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <span className="flex items-center gap-2">
              <FiLink className="w-4 h-4" /> Button Link
            </span>
          </label>
          <input
            type="text"
            name="ctaLink"
            value={form.ctaLink}
            onChange={handleChange}
            placeholder="/products"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-rose-500 dark:focus:border-rose-400
              text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors outline-none"
          />
        </div>
      </div>

      {/* Active Toggle */}
      <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            className="sr-only peer"
            id="banner-isActive"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-600
            peer-checked:after:translate-x-full peer-checked:after:border-white
            after:content-[''] after:absolute after:top-[2px] after:left-[2px]
            after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all
            peer-checked:bg-rose-600" />
        </label>
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Active
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {form.isActive
              ? "This banner will be visible on the homepage"
              : "This banner is hidden from the homepage"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-600 to-rose-700
            hover:from-rose-700 hover:to-rose-800 text-white font-medium rounded-xl
            transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isSubmitting ? (
            <>
              <FiLoader className="w-4 h-4 animate-spin" />
              {isEdit ? "Saving..." : "Creating..."}
            </>
          ) : (
            <>
              <FiUpload className="w-4 h-4" />
              {isEdit ? "Save Changes" : "Create Banner"}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800
            hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300
            font-medium rounded-xl transition-all duration-200 disabled:opacity-60"
        >
          <FiX className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </form>
  );
}
