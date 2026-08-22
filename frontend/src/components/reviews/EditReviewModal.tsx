"use client";

import { useState } from "react";
import { Star, X, Upload, Trash2, Save } from "lucide-react";
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
import { Review, UpdateReviewRequest } from "@/types/review";
import { reviewService } from "@/services/reviewService";
import Image from "next/image";

interface EditReviewModalProps {
  review: Review;
  onClose: () => void;
  onUpdate: (updatedReview: Review) => void;
}

export default function EditReviewModal({
  review,
  onClose,
  onUpdate,
}: EditReviewModalProps) {
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment || "");
  const [existingImages, setExistingImages] = useState(review.image || []);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]); // Track URLs of images to delete
  const [newImages, setNewImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const product = typeof review.product === "object" ? review.product : null;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => file.type.startsWith("image/"));

    // Calculate expected total images after operations
    const currentTotal =
      existingImages.length -
      removedImageIds.length +
      newImages.length +
      validFiles.length;
    if (currentTotal > 5) {
      alert(
        `You can have a maximum of 5 images. You currently have ${
          existingImages.length - removedImageIds.length + newImages.length
        } and are trying to add ${validFiles.length}.`
      );
      return;
    }

    setNewImages((prev) => [...prev, ...validFiles]);
  };

  const removeExistingImage = (index: number) => {
    const imageUrl = existingImages[index];
    setRemovedImageIds((prev) => [...prev, imageUrl]); // Track full URL
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      let updatedReview = { ...review };

      // Step 1: Update rating and comment if changed
      const hasRatingChanged = rating !== review.rating;
      const hasCommentChanged = comment.trim() !== (review.comment || "");
      if (hasRatingChanged || hasCommentChanged) {
        const updateData: UpdateReviewRequest = {
          ...(hasRatingChanged && { rating }),
          ...(hasCommentChanged && { comment: comment.trim() || undefined }),
        };
        const response = await reviewService.updateReview(
          review._id,
          updateData
        );
        if (response.success && response.payload) {
          updatedReview = response.payload.review;
        }
      }

      // Step 2: Delete removed images (bulk)
      if (removedImageIds.length > 0) {
        const response = await reviewService.deleteReviewImages(
          review._id,
          removedImageIds
        );
        if (response.success && response.payload) {
          updatedReview = response.payload.review;
        }
      }

      // Step 3: Add new images
      if (newImages.length > 0) {
        const response = await reviewService.addReviewImages(
          review._id,
          newImages
        );
        if (response.success && response.payload) {
          updatedReview = response.payload.review;
        }
      }

      onUpdate(updatedReview);
    } catch (error) {
      console.error("Error updating review:", error);
      alert("Failed to update review. Please try again.");
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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Your Review
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          {product && (
            <div className="flex items-center gap-4 p-4 bg-surface-elevated rounded-lg">
              {product.thumbnailImage && (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={product.thumbnailImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-sm text-text-secondary">
                  Editing your review
                </p>
              </div>
            </div>
          )}

          {/* Rating */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Rating *</Label>
            <div className="flex items-center gap-2">
              <div className="flex items-center">{renderStars()}</div>
              <span className="ml-3 text-sm text-text-secondary">
                {rating > 0 ? `${rating}/5 stars` : "Select rating"}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-3">
            <Label htmlFor="comment" className="text-base font-medium">
              Your Review
            </Label>
            <Textarea
              id="comment"
              placeholder="Share your experience with this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-text-tertiary">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Photos (Optional)</Label>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-text-secondary">Current photos:</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {existingImages.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-surface-elevated">
                        <Image
                          src={imageUrl}
                          alt={`Review image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            {newImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-text-secondary">
                  New photos to add:
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {newImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-surface-elevated">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={`New image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            {existingImages.length + newImages.length < 5 && (
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
                  className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border-color rounded-lg cursor-pointer hover:border-primary transition-colors"
                >
                  <Upload className="h-5 w-5 text-text-secondary" />
                  <span className="text-sm text-text-secondary">
                    Add photos ({existingImages.length + newImages.length}/5)
                  </span>
                </label>
              </div>
            )}
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
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Update Review
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
