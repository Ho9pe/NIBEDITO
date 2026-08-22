import { ApiResponse } from './api';

export interface CartVariant {
  _id: string;
  color: string;
  size: string;
}

export interface CartProduct {
  _id: string;
  name: string;
  price: number;
  thumbnailImage: string;
  slug: string;
  category: string;
}

export interface CartItem {
  _id: string;
  product: CartProduct;
  variant: CartVariant;
  quantity: number;
  cost: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalPrice: number;
  status: 'active' | 'checkedOut';
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  itemId: string;
  quantity: number;
}

export interface RemoveFromCartRequest {
  itemId: string;
}

export interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (productId: string, quantity: number, variantId: string) => Promise<boolean>;
  updateCartItem: (itemId: string, quantity: number) => Promise<boolean>;
  removeFromCart: (itemId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refetchCart: () => Promise<void>;
}

export interface CartService {
  getCart(): Promise<ApiResponse<{ cart: Cart }>>;
  addToCart(data: AddToCartRequest): Promise<ApiResponse<{ cart: Cart }>>;
  updateCartItem(data: UpdateCartItemRequest): Promise<ApiResponse<{ cart: Cart }>>;
  removeFromCart(data: RemoveFromCartRequest): Promise<ApiResponse<{ cart: Cart }>>;
  clearCart(): Promise<ApiResponse>;
}
