"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Edit3,
  Star,
  Calendar,
  Package,
  Filter,
  ChevronDown,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ReviewCard from "./ReviewCard";
import EditReviewModal from "./EditReviewModal";
import { reviewService } from "@/services/reviewService";
import { Review, GetUserReviewsParams } from "@/types/review";
import Pagination from "@/components/common/Pagination";
import { PaginationInfo } from "@/types/api";

export default function PastReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "rating-high" | "rating-low"
  >("newest");
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    pages: 1,
    page: 1,
    limit: 10,
    hasNext: false,
    hasPrev: false,
    nextPage: null,
    prevPage: null,
  });
  const [limit, setLimit] = useState<number>(10);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReviews(1, limit, false); // Not initial
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Effect for sort change
  useEffect(() => {
    fetchReviews(1, limit, false); // Not initial
  }, [sortBy]);

  const fetchReviews = useCallback(
    async (page: number = 1, limitParam: number = limit, isInitial: boolean = true) => {
      try {
        if (isInitial) {
          setLoading(true);
        } else {
          setIsFetching(true);
        }
        // Map UI sort to backend params
        let backendSortBy = "createdAt";
        let backendSortOrder: "asc" | "desc" = "desc";
        switch (sortBy) {
          case "newest":
            backendSortBy = "createdAt";
            backendSortOrder = "desc";
            break;
          case "oldest":
            backendSortBy = "createdAt";
            backendSortOrder = "asc";
            break;
          case "rating-high":
            backendSortBy = "rating";
            backendSortOrder = "desc";
            break;
          case "rating-low":
            backendSortBy = "rating";
            backendSortOrder = "asc";
            break;
        }

        const params: GetUserReviewsParams = {
          page,
          limit: limitParam,
          search: searchTerm || undefined,
          sortBy: backendSortBy,
          sortOrder: backendSortOrder,
        };

        const response = await reviewService.getUserReviews(params);

        if (response.success && response.payload) {
          setReviews(response.payload.reviews);
          setPagination(response.payload.pagination);
          // Optionally sync sortBy from response.filters if it differs, but keep user input priority
          if (response.payload.filters?.sortBy) {
            // Map back if needed, but for now, rely on local state
          }
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        alert("Failed to load your reviews. Please try again.");
      } finally {
        setLoading(false);
        setIsFetching(false);
        setIsInitialLoad(false);
      }
    },
    [limit, searchTerm, sortBy]
  );

  useEffect(() => {
    fetchReviews(1, limit, true); // Initial load
  }, []); // Initial load, but effects above handle changes

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleSort = (value: typeof sortBy) => {
    setSortBy(value);
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
  };

  const handleUpdateReview = (updatedReview: Review) => {
    setReviews((prev) =>
      prev.map((review) =>
        review._id === updatedReview._id ? updatedReview : review
      )
    );
    setEditingReview(null);
  };

  const getSortLabel = (sortBy: string) => {
    switch (sortBy) {
      case "newest":
        return "Newest First";
      case "oldest":
        return "Oldest First";
      case "rating-high":
        return "Highest Rating";
      case "rating-low":
        return "Lowest Rating";
      default:
        return "Newest First";
    }
  };

  // Remove filteredReviews and sortedReviews; use reviews directly
  const reviewsToDisplay = reviews; // No local filter/sort

  if (loading && isInitialLoad) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
        </div>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  const handlePageChange = (newPage: number) => {
    fetchReviews(newPage, limit);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    fetchReviews(1, newLimit);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 relative">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary h-4 w-4" />
          <Input
            placeholder="Search your reviews..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
            disabled={isFetching}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2" disabled={isFetching}>
              <Filter className="h-4 w-4" />
              Sort by: {getSortLabel(sortBy)}
              <ChevronDown className="h-4 w-4" />
              {isFetching && <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full ml-2" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleSort("newest")}>
              Newest First
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("oldest")}>
              Oldest First
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("rating-high")}>
              Highest Rating
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("rating-low")}>
              Lowest Rating
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Reviews Stats - Removed excessive hover effects */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-950/30 p-3 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Reviews</p>
                <p className="text-xl font-semibold text-slate-900 dark:text-white">
                  {pagination.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 dark:bg-amber-950/30 p-3 rounded-lg">
                <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Average Rating</p>
                <p className="text-xl font-semibold text-slate-900 dark:text-white">
                  {reviews.length > 0
                    ? (
                        reviews.reduce(
                          (sum, review) => sum + review.rating,
                          0
                        ) / reviews.length
                      ).toFixed(1)
                    : "0.0"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-950/30 p-3 rounded-lg">
                <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Products Reviewed</p>
                <p className="text-xl font-semibold text-slate-900 dark:text-white">{reviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <div className={`space-y-4 ${isFetching ? 'opacity-75' : 'animate-fade-in'}`}>
        {reviewsToDisplay.length === 0 ? (
          <Card className="card-modern">
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-24 h-24 bg-surface-elevated rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-12 w-12 text-text-tertiary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
              <p className="text-text-secondary mb-4">
                {searchTerm
                  ? `No reviews match your search "${searchTerm}"`
                  : "You haven't written any reviews yet."}
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviewsToDisplay.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                onEdit={() => handleEditReview(review)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        showLimitSelector={true}
        limitOptions={[5, 10, 25, 50]}
        className="mt-8"
      />

      {/* Edit Review Modal */}
      {editingReview && (
        <EditReviewModal
          review={editingReview}
          onClose={() => setEditingReview(null)}
          onUpdate={handleUpdateReview}
        />
      )}
    </div>
  );
}
