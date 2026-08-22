import { ApiResponse } from './api';

export interface ShippingRate {
  _id: string;
  region: string;
  cost: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShippingRateRequest {
  region: string;
  cost: number;
  description?: string;
}

export interface UpdateShippingRateRequest {
  cost?: number;
  description?: string;
}

export interface GetShippingStatsParams {
  // No specific params needed based on backend
}

export interface GetPopularShippingRegionsParams {
  days?: number;
}

export interface ShippingStats {
  overview: {
    totalRegions: number;
    averageCost: number;
    minCost: number;
    maxCost: number;
  };
  regionDistribution: Array<{
    _id: string;
    orderCount: number;
    totalRevenue: number;
    totalShippingRevenue: number;
  }>;
}

export interface PopularShippingRegions {
  regions: Array<{
    _id: string;
    orderCount: number;
    totalShippingCost: number;
    averageOrderValue: number;
  }>;
  period: string;
}

export interface ShippingService {
  getShippingRates(): Promise<ShippingRate[]>;
  createShippingRate(rateData: CreateShippingRateRequest): Promise<ApiResponse<{ newRate: ShippingRate }>>;
  initializeDefaultRates(): Promise<ApiResponse<{ rates: ShippingRate[] }>>;
  updateShippingRate(rateId: string, updateData: UpdateShippingRateRequest): Promise<ApiResponse<{ updatedRate: ShippingRate }>>;
  deleteShippingRate(rateId: string): Promise<ApiResponse<{ deletedRate: ShippingRate }>>;
  getShippingStats?(params?: GetShippingStatsParams): Promise<ApiResponse<ShippingStats>>;
  getPopularShippingRegions?(params?: GetPopularShippingRegionsParams): Promise<ApiResponse<PopularShippingRegions>>;
}
