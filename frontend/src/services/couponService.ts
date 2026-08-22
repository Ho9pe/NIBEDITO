import axios from '@/utils/axios';
import { 
    CouponService, 
    CreateCouponRequest, 
    UpdateCouponRequest, 
    PreviewCouponRequest,
    GetCouponStatsParams,
    GetCouponUsageAnalyticsParams,
    CouponStats,
    CouponUsageAnalytics,
    ApiResponse,
    Coupon,
    CouponPreviewResponse
} from '@/types';

export const couponService: CouponService = {
    async getAllCoupons(): Promise<ApiResponse<{ coupons: Coupon[] }>> {
        const { data } = await axios.get<ApiResponse<Coupon[]>>('/coupon');
        return {
            ...data,
            payload: { coupons: data.payload || [] }
        };
    },

    async getCouponById(couponId: string): Promise<ApiResponse<{ coupon: Coupon }>> {
        const { data } = await axios.get<ApiResponse<Coupon>>(`/coupon/${couponId}`);
        return {
            ...data,
            payload: { coupon: data.payload! }
        };
    },

    async createCoupon(couponData: CreateCouponRequest): Promise<ApiResponse<{ coupon: Coupon }>> {
        const { data } = await axios.post<ApiResponse<Coupon>>('/coupon', couponData);
        return {
            ...data,
            payload: { coupon: data.payload! }
        };
    },

    async updateCoupon(couponId: string, couponData: UpdateCouponRequest): Promise<ApiResponse<{ coupon: Coupon }>> {
        const { data } = await axios.put<ApiResponse<Coupon>>(`/coupon/${couponId}`, couponData);
        return {
            ...data,
            payload: { coupon: data.payload! }
        };
    },

    async deleteCoupon(couponId: string): Promise<ApiResponse<{ coupon: Coupon }>> {
        const { data } = await axios.delete<ApiResponse<Coupon>>(`/coupon/${couponId}`);
        return {
            ...data,
            payload: { coupon: data.payload! }
        };
    },

    async previewCoupon(couponData: PreviewCouponRequest): Promise<ApiResponse<CouponPreviewResponse>> {
        const { data } = await axios.post<ApiResponse<CouponPreviewResponse>>('/coupon/preview', {
            couponCode: couponData.couponCode,
            shippingRegion: couponData.shippingRegion
        });
        return data;
    },

    async applyCoupon(couponData: PreviewCouponRequest): Promise<ApiResponse<CouponPreviewResponse>> {
        const { data } = await axios.post<ApiResponse<CouponPreviewResponse>>('/coupon/apply', {
            couponCode: couponData.couponCode,
            shippingRegion: couponData.shippingRegion
        });
        return data;
    },

    async getCouponStats(params: GetCouponStatsParams = {}): Promise<ApiResponse<CouponStats>> {
        const { data } = await axios.get<ApiResponse<CouponStats>>('/coupon/analytics/stats');
        return data;
    },

    async getCouponUsageAnalytics(params: GetCouponUsageAnalyticsParams = {}): Promise<ApiResponse<CouponUsageAnalytics>> {
        const { startDate, endDate } = params;
        const query = new URLSearchParams({
            ...(startDate && { startDate }),
            ...(endDate && { endDate })
        });

        const { data } = await axios.get<ApiResponse<CouponUsageAnalytics>>(`/coupon/analytics/usage?${query}`);
        return data;
    }
};