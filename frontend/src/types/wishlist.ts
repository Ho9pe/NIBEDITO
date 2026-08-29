import { ApiResponse } from './api';

// ─── Populated product shape returned inside wishlist items ───────────────
export interface WishlistProduct {
  _id: string;
  name: string;
  price: number;
  thumbnailImage: string;
  slug: string;
  ratings: number;
  reviewCount: number;
  isActive: boolean;
}

// ─── A single item inside the wishlist document ───────────────────────────
export interface WishlistItem {
  _id: string;                      // item._id — use this for DELETE /remove
  product: WishlistProduct;
  priceAtTimeOfWishlisting: number; // price snapshot — compare with product.price for drop detection
  addedAt: string;                  // ISO date string
}

// ─── Full wishlist document ────────────────────────────────────────────────
export interface Wishlist {
  _id: string;
  user: string;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
}

// ─── Context shape ────────────────────────────────────────────────────────
export interface WishlistContextType {
  wishlist: Wishlist | null;
  wishlistedIds: string[];                             // product IDs — for O(1) heart-icon checks
  loading: boolean;
  addToWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (itemId: string) => Promise<boolean>;
  removeByProductId: (productId: string) => Promise<boolean>;
  clearWishlist: () => Promise<boolean>;
  isWishlisted: (productId: string) => boolean;
  refetchWishlist: () => Promise<void>;
}

// ─── Service interface ────────────────────────────────────────────────────
export interface WishlistService {
  getWishlist(): Promise<ApiResponse<{ wishlist: Wishlist | null }>>;
  getWishlistIds(): Promise<ApiResponse<{ wishlistedIds: string[] }>>;
  addToWishlist(data: { productId: string }): Promise<ApiResponse<{ wishlist: Wishlist }>>;
  removeFromWishlist(data: { itemId?: string; productId?: string }): Promise<ApiResponse<{ wishlist: Wishlist }>>;
  clearWishlist(): Promise<ApiResponse<{ wishlist: Wishlist | null }>>;
}
