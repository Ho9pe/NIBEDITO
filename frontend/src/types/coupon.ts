import { ApiResponse } from './api';

export interface DiscountOptions {
  productDiscount: {
    type: 'fixed' | 'percentage' | 'none';
    value: number;
    maxDiscount?: number;
  };
  shippingDiscount: {
    type: 'free' | 'fixed' | 'percentage' | 'none';
    value: number;
  };
}

export interface UserUsage {
  userId: string;
  timesUsed: number;
}

export interface Coupon {
  _id: string;
  code: string;
  discountOptions: DiscountOptions;
  minOrderAmount: number;
  expiryDate: string;
  usageLimit: number;
  usedBy: UserUsage[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponRequest {
  code: string;
  productDiscountType: 'fixed' | 'percentage' | 'none';
  productDiscountValue: number;
  shippingDiscountType: 'free' | 'fixed' | 'percentage' | 'none';
  shippingDiscountValue: number;
  expiryDate: string;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit: number;
}

export interface UpdateCouponRequest extends Partial<CreateCouponRequest> {}

export interface PreviewCouponRequest {
  couponCode: string;
  shippingRegion: string;
}

export interface CouponPreviewResponse {
  couponId: string;
  productDiscountAmount: number;
  shippingDiscountAmount: number;
  totalDiscount: number;
  originalShippingCost: number;
  finalShippingCost: number;
  finalPrice: number;
  discountDetails: DiscountOptions;
  shippingRegion: string;
  cartTotal: number;
  applied?: boolean;
}

export interface GetCouponStatsParams {
  // No specific params needed based on backend
}

export interface GetCouponUsageAnalyticsParams {
  startDate?: string;
  endDate?: string;
}

export interface CouponStats {
  overview: {
    totalCoupons: number;
    activeCoupons: number;
    expiredCoupons: number;
    productDiscountCoupons: number;
    shippingDiscountCoupons: number;
    totalUsage: number;
  };
  mostUsedCoupons: Array<{
    _id: string;
    code: string;
    totalUsage: number;
    usageLimit: number;
    expiryDate: string;
    discountOptions: DiscountOptions;
  }>;
}

export interface CouponUsageAnalytics {
  couponUsage: Array<{
    _id: string;
    couponCode: string;
    usageCount: number;
    totalDiscountGiven: number;
    averageDiscount: number;
    totalOrderValue: number;
  }>;
}

export interface CouponService {
  getAllCoupons(): Promise<ApiResponse<{ coupons: Coupon[] }>>;
  getCouponById(couponId: string): Promise<ApiResponse<{ coupon: Coupon }>>;
  createCoupon(couponData: CreateCouponRequest): Promise<ApiResponse<{ coupon: Coupon }>>;
  updateCoupon(couponId: string, couponData: UpdateCouponRequest): Promise<ApiResponse<{ coupon: Coupon }>>;
  deleteCoupon(couponId: string): Promise<ApiResponse<{ coupon: Coupon }>>;
  previewCoupon(couponData: PreviewCouponRequest): Promise<ApiResponse<CouponPreviewResponse>>;
  applyCoupon(couponData: PreviewCouponRequest): Promise<ApiResponse<CouponPreviewResponse>>;
  getCouponStats?(params?: GetCouponStatsParams): Promise<ApiResponse<CouponStats>>;
  getCouponUsageAnalytics?(params?: GetCouponUsageAnalyticsParams): Promise<ApiResponse<CouponUsageAnalytics>>;
}
