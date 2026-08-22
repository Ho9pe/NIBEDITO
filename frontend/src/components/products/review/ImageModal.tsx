"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface ImageModalProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

export default function ImageModal({
  images,
  initialIndex,
  onClose,
}: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [currentIndex]);

  const handlePrevious = () => {
    setIsLoading(true);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIsLoading(true);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 animate-fade-in"
      style={{ zIndex: 9999 }}
      onClick={handleBackdropClick}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 z-10 backdrop-blur-sm"
        aria-label="Close modal"
      >
        <FiX className="w-6 h-6 text-white" />
      </button>

      {/* Previous Button */}
      {images.length > 1 && (
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 backdrop-blur-sm hidden sm:flex items-center justify-center"
          aria-label="Previous image"
        >
          <FiChevronLeft className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Image Container */}
      <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        )}

        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={images[currentIndex]}
            alt={`Review image ${currentIndex + 1}`}
            width={1200}
            height={1200}
            className="max-w-full max-h-full object-contain"
            onLoadingComplete={() => setIsLoading(false)}
            priority
          />
        </div>
      </div>

      {/* Next Button */}
      {images.length > 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 backdrop-blur-sm hidden sm:flex items-center justify-center"
          aria-label="Next image"
        >
          <FiChevronRight className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Mobile Navigation */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 sm:hidden">
          <button
            onClick={handlePrevious}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 backdrop-blur-sm"
            aria-label="Previous image"
          >
            <FiChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={handleNext}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 backdrop-blur-sm"
            aria-label="Next image"
          >
            <FiChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 rounded-full text-white text-sm backdrop-blur-sm hidden sm:block">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Thumbnail Navigation (optional, for desktop) */}
      {images.length > 1 && images.length <= 10 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 hidden lg:flex gap-2 max-w-screen-lg overflow-x-auto px-4 scrollbar-none">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => {
                setIsLoading(true);
                setCurrentIndex(index);
              }}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                currentIndex === index
                  ? "border-white scale-110"
                  : "border-white/30 hover:border-white/60"
              }`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${index + 1}`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
