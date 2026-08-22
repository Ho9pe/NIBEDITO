import axios from '@/utils/axios';
import {
    ReviewService,
    CreateReviewRequest,
    UpdateReviewRequest,
    GetReviewsParams,
    GetProductReviewsParams,
    GetUserReviewsParams,
    GetUserPendingReviewsParams,
    Review,
    ReviewsResponse,
    PendingReviewsResponse,
    ReviewStats,
    MarkHelpfulResponse,
    ApiResponse
} from '@/types';

export const reviewService: ReviewService = {
    async createReview(reviewData: CreateReviewRequest): Promise<ApiResponse<{ review: Review }>> {
        const formData = new FormData();
        formData.append('product', reviewData.product);
        formData.append('rating', reviewData.rating.toString());

        if (reviewData.comment) {
            formData.append('comment', reviewData.comment);
        }

        if (reviewData.images && reviewData.images.length > 0) {
            reviewData.images.forEach((image) => {
                formData.append('reviewImages', image);
            });
        }

        const { data } = await axios.post<ApiResponse<{ review: Review }>>('/reviews', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    },

    async getReviews(params: GetReviewsParams = {}): Promise<ApiResponse<ReviewsResponse>> {
        const { page, limit, search } = params;
        const query = new URLSearchParams({
            ...(page && { page: page.toString() }),
            ...(limit && { limit: limit.toString() }),
            ...(search && { search })
        });

        const { data } = await axios.get<ApiResponse<ReviewsResponse>>(`/reviews?${query}`);
        return data;
    },

    async getReviewById(reviewId: string): Promise<ApiResponse<{ review: Review }>> {
        const { data } = await axios.get<ApiResponse<{ review: Review }>>(`/reviews/${reviewId}`);
        return data;
    },

    async getProductReviews(productId: string, params: GetProductReviewsParams = {}): Promise<ApiResponse<ReviewsResponse>> {
        const { page, limit, rating, sortBy, sortOrder } = params;
        const query = new URLSearchParams({
            ...(page && { page: page.toString() }),
            ...(limit && { limit: limit.toString() }),
            ...(rating && { rating: rating.toString() }),
            ...(sortBy && { sortBy }),
            ...(sortOrder && { sortOrder })
        });

        const { data } = await axios.get<ApiResponse<ReviewsResponse>>(`/reviews/product/${productId}?${query}`);
        return data;
    },

    async getUserReviews(params: GetUserReviewsParams = {}): Promise<ApiResponse<ReviewsResponse>> {
        const { page, limit, search, sortBy, sortOrder } = params;
        const query = new URLSearchParams({
            ...(page && { page: page.toString() }),
            ...(limit && { limit: limit.toString() }),
            ...(search && { search }),
            ...(sortBy && { sortBy }),
            ...(sortOrder && { sortOrder })
        });

        const { data } = await axios.get<ApiResponse<ReviewsResponse>>(`/reviews/user?${query}`);
        return data;
    },

    async getUserPendingReviews(params: GetUserPendingReviewsParams = {}): Promise<ApiResponse<PendingReviewsResponse>> {
        const { page, limit, search, sortBy, sortOrder } = params;
        const query = new URLSearchParams({
            ...(page && { page: page.toString() }),
            ...(limit && { limit: limit.toString() }),
            ...(search && { search }),
            ...(sortBy && { sortBy }),
            ...(sortOrder && { sortOrder })
        });

        const { data } = await axios.get<ApiResponse<PendingReviewsResponse>>(`/reviews/pending/user?${query}`);
        return data;
    },

    async updateReview(reviewId: string, reviewData: UpdateReviewRequest): Promise<ApiResponse<{ review: Review }>> {
        const { data } = await axios.patch<ApiResponse<{ review: Review }>>(`/reviews/${reviewId}`, reviewData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return data;
    },

    async deleteReview(reviewId: string): Promise<ApiResponse<{ review: Review }>> {
        const { data } = await axios.delete<ApiResponse<{ review: Review }>>(`/reviews/${reviewId}`);
        return data;
    },

    async markReviewHelpful(reviewId: string): Promise<ApiResponse<MarkHelpfulResponse>> {
        const { data } = await axios.post<ApiResponse<MarkHelpfulResponse>>(`/reviews/${reviewId}/helpful`);
        return data;
    },

    async getReviewStats(productId: string): Promise<ApiResponse<ReviewStats>> {
        const { data } = await axios.get<ApiResponse<ReviewStats>>(`/reviews/product/${productId}/stats`);
        return data;
    },

    async addReviewImages(reviewId: string, images: File[]): Promise<ApiResponse<{ review: Review }>> {
        const formData = new FormData();
        images.forEach((image) => {
            formData.append('reviewImages', image); // Changed from 'images' to 'reviewImages'
        });

        const { data } = await axios.post<ApiResponse<{ review: Review }>>(`/reviews/${reviewId}/images`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    },

    async deleteReviewImages(reviewId: string, imageIds: string[]): Promise<ApiResponse<{ review: Review; deletedImages: string[]; failedDeletions: any[] }>> {
        const { data } = await axios.delete<ApiResponse<{ review: Review; deletedImages: string[]; failedDeletions: any[] }>>(`/reviews/${reviewId}/images`, {
            data: { imageIds }, // Send imageIds in the body
        });
        return data;
    },
};
