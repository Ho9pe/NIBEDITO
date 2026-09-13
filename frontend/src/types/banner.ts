import { ApiResponse } from './api';

export interface Banner {
  _id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  badge: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerRequest {
  title: string;
  subtitle?: string;
  image: File;
  badge?: string;
  ctaText?: string;
  ctaLink?: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateBannerRequest extends Partial<Omit<CreateBannerRequest, 'image'>> {
  image?: File;
}

export interface BannerReorderItem {
  id: string;
  order: number;
}

export interface BannerService {
  getActiveBanners(): Promise<ApiResponse<{ banners: Banner[] }>>;
  getAllBannersAdmin(): Promise<ApiResponse<{ banners: Banner[] }>>;
  createBanner(formData: FormData): Promise<ApiResponse<{ banner: Banner }>>;
  updateBanner(id: string, formData: FormData): Promise<ApiResponse<{ banner: Banner }>>;
  deleteBanner(id: string): Promise<ApiResponse<{ banner: Banner }>>;
  toggleBannerStatus(id: string): Promise<ApiResponse<{ banner: Banner }>>;
  reorderBanners(banners: BannerReorderItem[]): Promise<ApiResponse<{ banners: Banner[] }>>;
}
