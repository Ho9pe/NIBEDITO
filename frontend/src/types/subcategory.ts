import { ApiResponse } from './api';
import { Category } from './category';

export interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  category: string | Category;
  productCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubcategoryRequest {
  name: string;
  description?: string;
  image?: File;
  category: string;
}

export interface UpdateSubcategoryRequest extends Partial<CreateSubcategoryRequest> {}

export interface SubcategoryService {
  createSubcategory(formData: FormData): Promise<ApiResponse<{ subcategory: Subcategory }>>;
  updateSubcategory(slug: string, formData: FormData): Promise<ApiResponse<{ subcategory: Subcategory }>>;
  getAllSubcategories(categoryId?: string | null): Promise<ApiResponse<{ subcategories: Subcategory[] }>>;
  getActiveSubcategories(categoryId?: string | null): Promise<Subcategory[]>;
  deleteSubcategory(slug: string): Promise<ApiResponse>;
  getSubcategory(slug: string): Promise<Subcategory>;
  getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]>;
  recalculateProductCounts(): Promise<ApiResponse>;
}
