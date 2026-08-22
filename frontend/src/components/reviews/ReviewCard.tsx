"use client";

import { useState } from "react";
import {
  Edit3,
  Star,
  Calendar,
  Package,
  Heart,
  MessageSquare,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Review } from "@/types/review";
import Image from "next/image";

interface ReviewCardProps {
  review: Review;
  onEdit: () => void;
}

export default function ReviewCard({ review, onEdit }: ReviewCardProps) {
  const [showAllImages, setShowAllImages] = useState(false);

  const product = typeof review.product === "object" ? review.product : null;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-warning fill-current" : "text-border-color"
        }`}
      />
    ));
  };

  const imagesToShow = showAllImages ? review.image : review.image.slice(0, 3);
  const remainingImages = review.image.length - 3;

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 transition-shadow duration-200 hover:shadow-md">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              {/* Product Image */}
              {product?.thumbnailImage && (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-elevated">
                  <Image
                    src={product.thumbnailImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-text-secondary" />
                  <h3 className="font-semibold text-lg line-clamp-1">
                    {product?.name || "Product"}
                  </h3>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                    <span className="ml-2 text-sm font-medium">
                      {review.rating}/5
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-text-secondary text-sm">
                    <Calendar className="h-3 w-3" />
                    {formatDate(review.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="flex items-center gap-2 self-start"
            >
              <Edit3 className="h-4 w-4" />
              Edit
            </Button>
          </div>

          {/* Review Content */}
          {review.comment && (
            <div className="bg-surface-elevated rounded-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-text-secondary mt-0.5" />
                <span className="text-sm font-medium text-text-secondary">
                  Your Review
                </span>
              </div>
              <p className="text-text-color leading-relaxed">
                {review.comment}
              </p>
            </div>
          )}

          {/* Review Images */}
          {review.image && review.image.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-text-secondary" />
                <span className="text-sm font-medium text-text-secondary">
                  Photos ({review.image.length})
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {imagesToShow.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden bg-surface-elevated"
                  >
                    <Image
                      src={imageUrl}
                      alt={`Review image ${index + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                ))}

                {!showAllImages && remainingImages > 0 && (
                  <button
                    onClick={() => setShowAllImages(true)}
                    className="relative aspect-square rounded-lg overflow-hidden bg-surface-elevated border-2 border-dashed border-border-color hover:border-primary transition-colors duration-200 flex items-center justify-center"
                  >
                    <div className="text-center">
                      <span className="text-lg font-semibold text-text-secondary">
                        +{remainingImages}
                      </span>
                      <p className="text-xs text-text-tertiary">more</p>
                    </div>
                  </button>
                )}
              </div>

              {showAllImages && remainingImages > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllImages(false)}
                  className="text-sm"
                >
                  Show Less
                </Button>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border-color">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-danger" />
                <span className="text-sm text-text-secondary">
                  {review.helpful} helpful
                </span>
              </div>

              {review.updatedAt !== review.createdAt && (
                <Badge variant="secondary" className="text-xs">
                  Edited
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
