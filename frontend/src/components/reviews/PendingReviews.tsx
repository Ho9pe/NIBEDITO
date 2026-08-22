"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Calendar,
  Star,
  Clock,
  Search,
  Filter,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateReviewModal from "./CreateReviewModal";
import { reviewService } from "@/services/reviewService";
import {
  PendingReviewProduct,
  GetUserPendingReviewsParams,
} from "@/types/review";
import Image from "next/image";
import Pagination from "@/components/common/Pagination";
import { PaginationInfo } from "@/types/api";

export default function PendingReviews() {
  const [pendingProducts, setPendingProducts] = useState<
    PendingReviewProduct[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [reviewingProduct, setReviewingProduct] =
    useState<PendingReviewProduct | null>(null);
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
      fetchPendingReviews(1, limit, false); // Not initial
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Effect for sort change
  useEffect(() => {
    fetchPendingReviews(1, limit, false); // Not initial
  }, [sortBy]);

  const fetchPendingReviews = useCallback(
    async (page: number = 1, limitParam: number = limit, isInitial: boolean = true) => {
      try {
        if (isInitial) {
          setLoading(true);
        } else {
          setIsFetching(true);
        }
        // Map UI sort to backend params
        let backendSortBy = "orderDate";
        let backendSortOrder: "asc" | "desc" = "desc";
        switch (sortBy) {
          case "newest":
            backendSortBy = "orderDate";
            backendSortOrder = "desc";
            break;
          case "oldest":
            backendSortBy = "orderDate";
            backendSortOrder = "asc";
            break;
          case "name":
            backendSortBy = "product.name";
            backendSortOrder = "asc";
            break;
        }

        const params: GetUserPendingReviewsParams = {
          page,
          limit: limitParam,
          search: searchTerm || undefined,
          sortBy: backendSortBy,
          sortOrder: backendSortOrder,
        };

        const response = await reviewService.getUserPendingReviews(params);

        if (response.success && response.payload) {
          setPendingProducts(response.payload.products);
          setPagination(response.payload.pagination);
          // Optionally sync sortBy from response.filters if it differs, but keep user input priority
          if (response.payload.filters?.sortBy) {
            // Map back if needed, but for now, rely on local state
          }
        }
      } catch (error) {
        console.error("Error fetching pending reviews:", error);
        alert("Failed to load pending reviews. Please try again.");
      } finally {
        setLoading(false);
        setIsFetching(false);
        setIsInitialLoad(false);
      }
    },
    [limit, searchTerm, sortBy]
  );

  useEffect(() => {
    fetchPendingReviews(1, limit, true); // Initial load
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleSort = (value: typeof sortBy) => {
    setSortBy(value);
  };

  const handleWriteReview = (product: PendingReviewProduct) => {
    setReviewingProduct(product);
  };

  const handleReviewCreated = (productId: string) => {
    // Remove the product from pending list after review is created
    setPendingProducts((prev) => prev.filter((p) => p.productId !== productId));
    setReviewingProduct(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Remove filteredProducts and sortedProducts; use pendingProducts directly
  const productsToDisplay = pendingProducts; // No local filter/sort

  if (loading && isInitialLoad) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
        </div>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  const handlePageChange = (newPage: number) => {
    fetchPendingReviews(newPage, limit);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    fetchPendingReviews(1, newLimit);
  };

  const getSortLabel = (sortBy: string) => {
    switch (sortBy) {
      case "newest":
        return "Newest Orders";
      case "oldest":
        return "Oldest Orders";
      case "name":
        return "Product Name";
      default:
        return "Newest Orders";
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 relative">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary h-4 w-4" />
          <Input
            placeholder="Search products to review..."
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
              Newest Orders
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("oldest")}>
              Oldest Orders
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("name")}>
              Product Name
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-warning/10 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">
                Products Awaiting Review
              </p>
              <p className="text-xl font-semibold">{pagination.total}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Products List */}
      <div className={`grid gap-4 ${isFetching ? 'opacity-75' : 'animate-fade-in'}`}>
        {productsToDisplay.length === 0 ? (
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No pending reviews</h3>
              <p className="text-text-secondary mb-4">
                {searchTerm
                  ? `No products match your search "${searchTerm}"`
                  : "You don't have any products waiting for review."}
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {productsToDisplay.map((item) => (
              <Card
                key={item.productId}
                className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 transition-shadow duration-200 hover:shadow-md"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-elevated">
                      {item.product.thumbnailImage ? (
                        <Image
                          src={item.product.thumbnailImage}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-text-tertiary" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {item.product.name}
                      </h3>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-text-secondary mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Delivered on {formatDate(item.orderDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          <span>
                            Order #{item.orderId.slice(-8).toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-text-secondary mb-4">
                        Share your experience with this product to help other
                        customers make informed decisions.
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0 w-full sm:w-auto">
                      <Button
                        onClick={() => handleWriteReview(item)}
                        className="w-full sm:w-auto flex items-center gap-2 bg-primary hover:bg-primary-dark text-white"
                      >
                        <Star className="h-4 w-4" />
                        Write Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
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

      {/* Create Review Modal */}
      {reviewingProduct && (
        <CreateReviewModal
          product={reviewingProduct}
          onClose={() => setReviewingProduct(null)}
          onSuccess={handleReviewCreated}
        />
      )}
    </div>
  );
}
