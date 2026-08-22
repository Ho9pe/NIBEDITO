"use client";

import { useState, useEffect, useCallback } from "react";
import { reviewService } from "@/services/reviewService";
import { Review, ReviewStats } from "@/types";
import { useToast } from "@/hooks/useToast";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Pagination from "@/components/common/Pagination";
import { PaginationInfo } from "@/types/api";
import ReviewCard from "./ReviewCard";
import ReviewFilters from "./ReviewFilters";
import ReviewStatsBar from "./ReviewStatsBar";
import ImageModal from "./ImageModal";

interface ReviewListProps {
  productId: string;
}

export default function ReviewList({ productId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    pages: 1,
    page: 1,
    limit: 5,
    hasNext: false,
    hasPrev: false,
    nextPage: null,
    prevPage: null,
  });
  const [filters, setFilters] = useState({
    rating: undefined as number | undefined,
    sortBy: "createdAt" as "createdAt" | "rating" | "helpful",
    sortOrder: "desc" as "asc" | "desc",
  });
  const [selectedImages, setSelectedImages] = useState<string[] | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const toast = useToast();

  const fetchReviews = useCallback(
    async (page: number = 1) => {
      try {
        if (reviews.length === 0) {
          setLoading(true);
        } else {
          setUpdating(true);
        }

        const response = await reviewService.getProductReviews(productId, {
          page,
          limit: pagination.limit,
          rating: filters.rating,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        });
        setReviews(response.payload.reviews);
        setPagination(response.payload.pagination);
      } catch (error: any) {
        toast.error(error.message || "Failed to fetch reviews");
      } finally {
        setLoading(false);
        setUpdating(false);
      }
    },
    [productId, pagination.limit, filters, toast]
  );

  const fetchStats = useCallback(async () => {
    try {
      const response = await reviewService.getReviewStats(productId);
      setStats(response.payload);
    } catch (error) {
      console.error("Failed to fetch review stats:", error);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews(pagination.page);
  }, [filters]);

  useEffect(() => {
    fetchStats();
  }, [productId, fetchStats]);

  const handleFilterChange = useCallback(
    (newFilters: Partial<typeof filters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
      setPagination(prev => ({ ...prev, page: 1 }));
    },
    []
  );

  const handleRatingClick = useCallback(
    (rating: number | undefined) => {
      handleFilterChange({ rating });
    },
    [handleFilterChange]
  );

  const handlePageChange = useCallback((newPage: number) => {
    fetchReviews(newPage);
  }, [fetchReviews]);

  const handleHelpfulClick = useCallback(
    async (reviewId: string) => {
      try {
        // Optimistic update
        setReviews((prevReviews) =>
          prevReviews.map((review) => {
            if (review._id === reviewId) {
              const userId = localStorage.getItem("user")
                ? JSON.parse(localStorage.getItem("user")!)?._id
                : null;

              if (!userId) return review;

              const isCurrentlyHelpful = review.helpfulUsers.includes(userId);
              return {
                ...review,
                helpful: isCurrentlyHelpful ? review.helpful - 1 : review.helpful + 1,
                helpfulUsers: isCurrentlyHelpful
                  ? review.helpfulUsers.filter((id) => id !== userId)
                  : [...review.helpfulUsers, userId],
              };
            }
            return review;
          })
        );

        await reviewService.markReviewHelpful(reviewId);
        fetchStats();
      } catch (error: any) {
        toast.error(error.message || "Failed to mark review as helpful");
        fetchReviews(pagination.page);
      }
    },
    [toast, fetchStats, fetchReviews, pagination.page]
  );

  const handleImageClick = useCallback((images: string[], index: number) => {
    setSelectedImages(images);
    setSelectedImageIndex(index);
  }, []);

  const handleCloseImageModal = useCallback(() => {
    setSelectedImages(null);
    setSelectedImageIndex(0);
  }, []);

  if (loading && pagination.page === 1) {
    return <LoadingSpinner fullPage={false} size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar with clickable rating bars */}
      {stats && (
        <ReviewStatsBar
          stats={stats}
          onRatingClick={handleRatingClick}
          selectedRating={filters.rating}
        />
      )}

      {/* Filters */}
      <ReviewFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        totalReviews={stats?.totalReviews || 0}
      />

      {/* Reviews with smooth transition */}
      <div
        className={`space-y-4 transition-opacity duration-300 ${
          updating ? "opacity-50" : "opacity-100"
        }`}
      >
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-surface border border-border rounded-xl animate-fade-in">
            <p className="text-text-secondary text-lg">No reviews yet</p>
            <p className="text-text-secondary text-sm mt-2">
              Be the first to review this product!
            </p>
          </div>
        ) : (
          reviews.map((review, index) => (
            <div
              key={review._id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ReviewCard 
                review={review} 
                onHelpfulClick={handleHelpfulClick}
                onImageClick={handleImageClick}
              />
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Pagination
          pagination={pagination}
          onPageChange={handlePageChange}
          showInfo={true}
          className="mt-8"
        />
      )}

      {/* Image Modal - Rendered at top level */}
      {selectedImages && (
        <ImageModal
          images={selectedImages}
          initialIndex={selectedImageIndex}
          onClose={handleCloseImageModal}
        />
      )}
    </div>
  );
}
