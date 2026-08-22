import axios from '@/utils/axios';
import type { ApiResponse } from '@/types/api';
import type {
  Cart,
  CartService,
  AddToCartRequest,
  UpdateCartItemRequest,
  RemoveFromCartRequest
} from '@/types/cart';

const cartService: CartService = {
  async getCart(): Promise<ApiResponse<{ cart: Cart }>> {
    const { data } = await axios.get<ApiResponse<{ cart: Cart }>>('/cart');
    return data;
  },

  async addToCart(requestData: AddToCartRequest): Promise<ApiResponse<{ cart: Cart }>> {
    const { data } = await axios.post<ApiResponse<{ cart: Cart }>>('/cart/add-item', requestData);
    return data;
  },

  async updateCartItem(requestData: UpdateCartItemRequest): Promise<ApiResponse<{ cart: Cart }>> {
    const { data } = await axios.put<ApiResponse<{ cart: Cart }>>('/cart/update', requestData);
    return data;
  },

  async removeFromCart(requestData: RemoveFromCartRequest): Promise<ApiResponse<{ cart: Cart }>> {
    const { data } = await axios.delete<ApiResponse<{ cart: Cart }>>('/cart/remove', {
      data: requestData
    });
    return data;
  },

  async clearCart(): Promise<ApiResponse> {
    const { data } = await axios.delete<ApiResponse>('/cart/clear');
    return data;
  }
};

export default cartService;
