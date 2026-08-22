import axios from '@/utils/axios';
import { 
    SubcategoryService, 
    Subcategory, 
    ApiResponse 
} from '@/types';

export const subcategoryService: SubcategoryService = {
    async createSubcategory(formData: FormData): Promise<ApiResponse<{ subcategory: Subcategory }>> {
        const { data } = await axios.post<ApiResponse<{ subcategory: Subcategory }>>('/subcategories', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        });
        return data;
    },

    async updateSubcategory(slug: string, formData: FormData): Promise<ApiResponse<{ subcategory: Subcategory }>> {
        const { data } = await axios.put<ApiResponse<{ subcategory: Subcategory }>>(`/subcategories/${slug}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        });
        return data;
    },

    async getAllSubcategories(categoryId?: string | null): Promise<ApiResponse<{ subcategories: Subcategory[] }>> {
        const params = categoryId ? { categoryId: categoryId } : {};
        const { data } = await axios.get<ApiResponse<{ subcategories: Subcategory[] }>>('/subcategories', { params });
        return data;
    },

    async getActiveSubcategories(categoryId?: string | null): Promise<Subcategory[]> {
        const response = await this.getAllSubcategories(categoryId);
        return response.payload?.subcategories.filter(subcategory => subcategory.isActive) || [];
    },

    async deleteSubcategory(slug: string): Promise<ApiResponse> {
        const { data } = await axios.delete<ApiResponse>(`/subcategories/${slug}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        });
        return data;
    },

    async getSubcategory(slug: string): Promise<Subcategory> {
        const { data } = await axios.get<ApiResponse<{ subcategory: Subcategory }>>(`/subcategories/${slug}`);
        return data.payload!.subcategory;
    },

    async getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
        const { data } = await axios.get<ApiResponse<{ subcategories: Subcategory[] }>>(`/subcategories/category/${categoryId}`);
        return data.payload?.subcategories || [];
    },

    async recalculateProductCounts(): Promise<ApiResponse> {
        const { data } = await axios.post<ApiResponse>('/subcategories/recalculate-counts', {}, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        });
        return data;
    }
};