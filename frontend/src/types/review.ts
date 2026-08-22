import { ApiResponse, PaginationInfo } from './api';

export interface Review {
  _id: string;
  product: string | {
    _id: string;
    name: string;
    slug: string;
    thumbnailImage?: string;
  };
  user: string | {
    _id: string;
    name: string;
    email: string;
  };
  rating: number;
  comment?: string;
  image: string[];
  helpful: number;
  helpfulUsers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  product: string;
  rating: number;
  comment?: string;
  images?: File[];
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}

export interface GetReviewsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetProductReviewsParams {
  page?: number;
  limit?: number;
  rating?: number;
  sortBy?: 'createdAt' | 'rating' | 'helpful';
  sortOrder?: 'asc' | 'desc';
}

export interface GetUserReviewsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetUserPendingReviewsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PendingReviewProduct {
  productId: string;
  product: {
    _id: string;
    name: string;
    slug: string;
    thumbnailImage?: string;
  };
  orderId: string;
  orderDate: string;
}

export interface PendingReviewsResponse {
  products: PendingReviewProduct[];
  pagination: PaginationInfo;
  filters?: {
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export interface ReviewsResponse {
  reviews: Review[];
  pagination: PaginationInfo;
  filters?: {
    search?: string;
    rating?: number;
    sortBy?: string;
    sortOrder?: string;
  };
}

export interface ReviewStats {
  stats: Array<{
    rating: number;
    count: number;
    percentage: number;
  }>;
  totalReviews: number;
  averageRating: number;
}

export interface MarkHelpfulResponse {
  helpful: number;
  isHelpful: boolean;
}

export interface AddReviewImagesRequest {
  images: File[];
}

export interface DeleteReviewImageRequest {
  imageId: string;
}

export interface ReviewService {
  createReview(reviewData: CreateReviewRequest): Promise<ApiResponse<{ review: Review }>>;
  getReviews?(params?: GetReviewsParams): Promise<ApiResponse<ReviewsResponse>>;
  getReviewById(reviewId: string): Promise<ApiResponse<{ review: Review }>>;
  getProductReviews(productId: string, params?: GetProductReviewsParams): Promise<ApiResponse<ReviewsResponse>>;
  getUserReviews(params?: GetUserReviewsParams): Promise<ApiResponse<ReviewsResponse>>;
  getUserPendingReviews(params?: GetUserPendingReviewsParams): Promise<ApiResponse<PendingReviewsResponse>>;
  updateReview(reviewId: string, reviewData: UpdateReviewRequest): Promise<ApiResponse<{ review: Review }>>;
  deleteReview(reviewId: string): Promise<ApiResponse<{ review: Review }>>;
  addReviewImages(reviewId: string, images: File[]): Promise<ApiResponse<{ review: Review }>>;
  deleteReviewImages(reviewId: string, imageIds: string[]): Promise<ApiResponse<{ review: Review; deletedImages: string[]; failedDeletions: any[] }>>;
  markReviewHelpful(reviewId: string): Promise<ApiResponse<MarkHelpfulResponse>>;
  getReviewStats(productId: string): Promise<ApiResponse<ReviewStats>>;
}
