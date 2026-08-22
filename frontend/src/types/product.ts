import { ApiResponse, PaginationInfo } from './api';
import { Category } from './category';
import { Subcategory } from './subcategory';

export interface ProductVariant {
  _id: string;
  color: string;
  size: string;
  quantity: number;
  images: string[];
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string | Category;
  subcategory?: string | Subcategory;
  shipping: boolean;
  variants: ProductVariant[];
  thumbnailImage: string;
  ratings?: number;
  reviewCount?: number;
  totalSold?: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  shipping: boolean;
  variants: Omit<ProductVariant, '_id'>[];
  images: File[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  subcategory?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: boolean;
  sortField?: string;
  sortOrder?: string;
}

export interface ProductsResponse {
  products: Product[];
  pagination: PaginationInfo; // Updated to use standardized PaginationInfo
}

export interface ProductService {
  createProduct(formData: FormData): Promise<ApiResponse<{ product: Product }>>;
  getAllProducts(params: GetProductsParams): Promise<ApiResponse<ProductsResponse>>;
  getProduct(slug: string): Promise<Product>;
  getProductsByCategory(categorySlug: string, params?: Record<string, any>): Promise<ProductsResponse>;
  getProductsBySubcategory(subcategorySlug: string, params?: Record<string, any>): Promise<ProductsResponse>;
  updateProduct(slug: string, formData: FormData): Promise<ApiResponse<{ product: Product }>>;
  deleteProduct(slug: string): Promise<ApiResponse<{ product: Product }>>;
}
  
