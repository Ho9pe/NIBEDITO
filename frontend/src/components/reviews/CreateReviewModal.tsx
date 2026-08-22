"use client";

import { useState } from "react";
import { Star, X, Upload, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PendingReviewProduct, CreateReviewRequest } from "@/types/review";
import { reviewService } from "@/services/reviewService";
import Image from "next/image";

interface CreateReviewModalProps {
  product: PendingReviewProduct;
  onClose: () => void;
  onSuccess: (productId: string) => void;
}

export default function CreateReviewModal({
  product,
  onClose,
  onSuccess,
}: CreateReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => file.type.startsWith("image/"));

    if (validFiles.length + images.length > 5) {
      alert("You can upload maximum 5 images");
      return;
    }

    setImages((prev) => [...prev, ...validFiles]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewData: CreateReviewRequest = {
        product: product.productId,
        rating,
        comment: comment.trim() || undefined,
        images: images.length > 0 ? images : undefined,
      };

      const response = await reviewService.createReview(reviewData);

      if (response.success) {
        onSuccess(product.productId);
      }
    } catch (error) {
      console.error("Error creating review:", error);
      alert("Failed to create review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const starNumber = i + 1;
      const isActive = starNumber <= (hoveredStar || rating);

      return (
        <button
          key={i}
          type="button"
          className="p-1 rounded transition-all duration-150 hover:scale-110"
          onMouseEnter={() => setHoveredStar(starNumber)}
          onMouseLeave={() => setHoveredStar(0)}
          onClick={() => setRating(starNumber)}
        >
          <Star
            className={`h-8 w-8 transition-colors ${
              isActive ? "text-warning fill-current" : "text-border-color"
            }`}
          />
        </button>
      );
    });
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1:
        return "Poor";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Very Good";
      case 5:
        return "Excellent";
      default:
        return "";
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Write a Review
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          <div className="flex items-center gap-4 p-4 bg-surface-elevated rounded-lg">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              {product.product.thumbnailImage ? (
                <Image
                  src={product.product.thumbnailImage}
                  alt={product.product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-border-color flex items-center justify-center">
                  <span className="text-text-tertiary text-xs">No Image</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg line-clamp-2">
                {product.product.name}
              </h3>
              <p className="text-sm text-text-secondary">
                Delivered on {new Date(product.orderDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Rating *</Label>
            <div className="flex items-center gap-2">
              <div className="flex items-center">{renderStars()}</div>
              <div className="ml-3">
                <span className="text-sm text-text-secondary">
                  {rating > 0 ? `${rating}/5 stars` : "Select rating"}
                </span>
                {rating > 0 && (
                  <span className="block text-xs text-primary font-medium">
                    {getRatingText(rating)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-3">
            <Label htmlFor="comment" className="text-base font-medium">
              Your Review
            </Label>
            <Textarea
              id="comment"
              placeholder="Share your experience with this product. What did you like or dislike about it?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
              maxLength={500}
            />
            <p className="text-xs text-text-tertiary">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Add Photos (Optional)
            </Label>
            <p className="text-sm text-text-secondary">
              Help other customers by showing photos of the product.
            </p>

            {/* Uploaded Images */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {images.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-surface-elevated">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`Review image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {images.length < 5 && (
              <div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-border-color rounded-lg cursor-pointer hover:border-primary transition-colors"
                >
                  <Upload className="h-6 w-6 text-text-secondary" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-text-color">
                      Click to upload images
                    </p>
                    <p className="text-xs text-text-tertiary">
                      PNG, JPG up to 5 images ({images.length}/5)
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Guidelines */}
          <div className="bg-info/5 border border-info/20 rounded-lg p-4">
            <h4 className="font-medium text-info mb-2">Review Guidelines</h4>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• Be honest and helpful to other customers</li>
              <li>• Focus on the product&apos;s features and quality</li>
              <li>• Avoid inappropriate language or personal information</li>
              <li>• Include specific details about your experience</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Submit Review
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
