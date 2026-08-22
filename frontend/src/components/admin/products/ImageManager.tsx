"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FiUpload, FiX, FiPlus, FiImage } from "react-icons/fi";

interface ImageManagerProps {
  currentImage?: string | string[];
  onImageChange: (files: File[], removedIndices?: number[]) => void;
  onImageRemove?: () => void;
  multiple?: boolean;
  maxImages?: number;
  title?: string;
  variantIndex?: number;
}

export default function ImageManager({
  currentImage,
  onImageChange,
  onImageRemove,
  multiple = false,
  maxImages = 5,
  title = "Image",
  variantIndex,
}: ImageManagerProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>(
    multiple
      ? (currentImage as string[]) || []
      : currentImage
      ? [currentImage as string]
      : []
  );
  const [removedIndices, setRemovedIndices] = useState<number[]>([]);

  // Update previewUrls when currentImage changes
  useEffect(() => {
    setPreviewUrls(
      multiple
        ? (currentImage as string[]) || []
        : currentImage
        ? [currentImage as string]
        : []
    );
    setRemovedIndices([]); // Reset removed indices when currentImage updates
  }, [currentImage, multiple]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(e.target.files || []);

    if (multiple) {
      const currentCount = previewUrls.length - removedIndices.length;
      if (currentCount + files.length > maxImages) {
        alert(`Maximum ${maxImages} images allowed`);
        return;
      }
      onImageChange(files, removedIndices);
    } else {
      const file = files[0];
      if (file) {
        onImageChange([file]);
      }
    }
  };

  const removeImage = (index: number): void => {
    setRemovedIndices((prev) => [...prev, index]);
    onImageChange([], [...removedIndices, index]); // Pass empty files array and updated removedIndices
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <FiImage className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100">
          {title}
        </h4>
        {multiple && (
          <span className="text-sm text-slate-500 dark:text-slate-400">
            ({previewUrls.length - removedIndices.length}/{maxImages})
          </span>
        )}
      </div>

      {/* Current Images */}
      {previewUrls.filter((_, index) => !removedIndices.includes(index))
        .length > 0 && (
        <div
          className={`grid gap-4 ${
            multiple
              ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              : "grid-cols-1"
          }`}
        >
          {previewUrls
            .filter((_, index) => !removedIndices.includes(index))
            .map((url, displayIndex) => {
              const originalIndex = previewUrls.findIndex(
                (originalUrl, i) =>
                  originalUrl === url &&
                  !removedIndices
                    .slice(0, removedIndices.indexOf(i) + 1)
                    .includes(i)
              );
              return (
                <div key={`${url}-${displayIndex}`} className="relative group">
                  <div
                    className={`relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 ${
                      multiple ? "aspect-square" : "aspect-video max-w-sm"
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`${title} ${displayIndex + 1}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeImage(originalIndex)}
                        className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 transform scale-90 group-hover:scale-100"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Upload Area */}
      {(!multiple ||
        previewUrls.length - removedIndices.length < maxImages) && (
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FiUpload className="w-8 h-8 mb-2 text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300 transition-colors" />
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                <span className="font-medium">Click to upload</span>{" "}
                {title.toLowerCase()}
                {multiple &&
                  ` (${
                    maxImages - (previewUrls.length - removedIndices.length)
                  } remaining)`}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                PNG, JPG or JPEG (MAX. 10MB)
              </p>
            </div>
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              multiple={multiple}
              className="hidden"
              disabled={
                multiple &&
                previewUrls.length - removedIndices.length >= maxImages
              }
            />
          </label>
        </div>
      )}

      {/* Guidelines */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <FiImage className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">Image Guidelines:</p>
            <ul className="space-y-0.5 text-blue-600 dark:text-blue-400">
              <li>• Use high-quality images for best results</li>
              <li>• Recommended size: 800x600 pixels or higher</li>
              <li>• Supported formats: PNG, JPG, JPEG</li>
              {multiple && <li>• Maximum {maxImages} images per variant</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
