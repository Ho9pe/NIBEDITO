import { ApiResponse } from './api';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount: number;
  subcategories: import('./subcategory').Subcategory[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  image?: File;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

export interface CategoryService {
  createCategory(formData: FormData): Promise<ApiResponse<{ category: Category }>>;
  updateCategory(slug: string, formData: FormData): Promise<ApiResponse<{ category: Category }>>;
  getAllCategories(): Promise<ApiResponse<{ categories: Category[] }>>;
  getActiveCategories(): Promise<Category[]>;
  deleteCategory(slug: string): Promise<ApiResponse>;
  getCategory(slug: string): Promise<Category>;
  recalculateProductCounts(): Promise<ApiResponse>;
}
