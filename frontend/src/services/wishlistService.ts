import axios from '@/utils/axios';
import type { ApiResponse } from '@/types/api';
import type {
  Wishlist,
  WishlistService,
} from '@/types/wishlist';

const wishlistService: WishlistService = {
  // Full wishlist with populated product data — for the Wishlist page
  async getWishlist(): Promise<ApiResponse<{ wishlist: Wishlist }>> {
    const { data } = await axios.get<ApiResponse<{ wishlist: Wishlist }>>('/wishlist');
    return data;
  },

  // Returns only wishlisted product IDs — lightweight, called once on login
  async getWishlistIds(): Promise<ApiResponse<{ wishlistedIds: string[] }>> {
    const { data } = await axios.get<ApiResponse<{ wishlistedIds: string[] }>>('/wishlist/ids');
    return data;
  },

  // Add a product to wishlist
  async addToWishlist({ productId }: { productId: string }): Promise<ApiResponse<{ wishlist: Wishlist }>> {
    const { data } = await axios.post<ApiResponse<{ wishlist: Wishlist }>>('/wishlist/add', { productId });
    return data;
  },

  // Remove a single item by its item._id or product._id
  async removeFromWishlist({ itemId, productId }: { itemId?: string; productId?: string }): Promise<ApiResponse<{ wishlist: Wishlist }>> {
    const { data } = await axios.delete<ApiResponse<{ wishlist: Wishlist }>>('/wishlist/remove', {
      data: { itemId, productId },
    });
    return data;
  },

  // Clear all items
  async clearWishlist(): Promise<ApiResponse<{ wishlist: Wishlist }>> {
    const { data } = await axios.delete<ApiResponse<{ wishlist: Wishlist }>>('/wishlist/clear');
    return data;
  },
};

export default wishlistService;
