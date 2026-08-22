import axios from '@/utils/axios';
import { 
    CategoryService, 
    Category, 
    ApiResponse 
} from '@/types';

export const categoryService: CategoryService = {
    async createCategory(formData: FormData): Promise<ApiResponse<{ category: Category }>> {
        const { data } = await axios.post<ApiResponse<{ category: Category }>>('/categories', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    },

    async updateCategory(slug: string, formData: FormData): Promise<ApiResponse<{ category: Category }>> {
        const { data } = await axios.put<ApiResponse<{ category: Category }>>(`/categories/${slug}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        });
        return data;
    },

    async getAllCategories(): Promise<ApiResponse<{ categories: Category[] }>> {
        const { data } = await axios.get<ApiResponse<{ categories: Category[] }>>('/categories');
        return data;
    },

    async getActiveCategories(): Promise<Category[]> {
        const response = await this.getAllCategories();
        return response.payload?.categories.filter(category => category.isActive) || [];
    },

    async deleteCategory(slug: string): Promise<ApiResponse> {
        const { data } = await axios.delete<ApiResponse>(`/categories/${slug}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        });
        return data;
    },

    async getCategory(slug: string): Promise<Category> {
        const { data } = await axios.get<ApiResponse<{ category: Category }>>(`/categories/${slug}`);
        return data.payload!.category;
    },

    async recalculateProductCounts(): Promise<ApiResponse> {
        const { data } = await axios.post<ApiResponse>('/categories/recalculate-counts');
        return data;
    }
};
