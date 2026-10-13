import axios from '@/utils/axios';
import {
  BannerService,
  Banner,
  BannerReorderItem,
  ApiResponse,
} from '@/types';

export const bannerService: BannerService = {
  /** Public — fetches only active banners for the homepage */
  async getActiveBanners(): Promise<ApiResponse<{ banners: Banner[] }>> {
    const { data } = await axios.get<ApiResponse<{ banners: Banner[] }>>('/banners');
    return data;
  },

  /** Admin — fetches all banners (active + inactive) */
  async getAllBannersAdmin(): Promise<ApiResponse<{ banners: Banner[] }>> {
    const { data } = await axios.get<ApiResponse<{ banners: Banner[] }>>('/banners/all');
    return data;
  },

  /** Admin — creates a banner with image (multipart/form-data) */
  async createBanner(formData: FormData): Promise<ApiResponse<{ banner: Banner }>> {
    const { data } = await axios.post<ApiResponse<{ banner: Banner }>>(
      '/banners',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
  },

  /** Admin — updates a banner; image is optional */
  async updateBanner(id: string, formData: FormData): Promise<ApiResponse<{ banner: Banner }>> {
    const { data } = await axios.put<ApiResponse<{ banner: Banner }>>(
      `/banners/${id}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
  },

  /** Admin — deletes a banner and its Cloudinary image */
  async deleteBanner(id: string): Promise<ApiResponse<{ banner: Banner }>> {
    const { data } = await axios.delete<ApiResponse<{ banner: Banner }>>(`/banners/${id}`);
    return data;
  },

  /** Admin — toggles isActive on a banner */
  async toggleBannerStatus(id: string): Promise<ApiResponse<{ banner: Banner }>> {
    const { data } = await axios.patch<ApiResponse<{ banner: Banner }>>(
      `/banners/${id}/toggle`
    );
    return data;
  },

  /** Admin — bulk updates display order */
  async reorderBanners(
    banners: BannerReorderItem[]
  ): Promise<ApiResponse<{ banners: Banner[] }>> {
    const { data } = await axios.patch<ApiResponse<{ banners: Banner[] }>>(
      '/banners/reorder',
      { banners }
    );
    return data;
  },
};
