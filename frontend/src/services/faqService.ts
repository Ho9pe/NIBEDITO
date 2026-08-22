import axios from '@/utils/axios';
import { 
    FAQService, 
    FAQ, 
    CreateFAQRequest, 
    UpdateFAQRequest,
    ApiResponse 
} from '@/types';

export const faqService: FAQService = {
    async getAllFaqs(): Promise<ApiResponse<{ faqs: FAQ[] }>> {
        const { data } = await axios.get<{ success: boolean; count: number; data: FAQ[] }>('/faqs');
        return {
            success: data.success,
            statusCode: 200,
            message: 'FAQs retrieved successfully',
            payload: { faqs: data.data }
        };
    },

    async getFaqById(id: string): Promise<ApiResponse<{ faq: FAQ }>> {
        const { data } = await axios.get<{ success: boolean; data: FAQ }>(`/faqs/${id}`);
        return {
            success: data.success,
            statusCode: 200,
            message: 'FAQ retrieved successfully',
            payload: { faq: data.data }
        };
    },

    async createFaq(faqData: CreateFAQRequest): Promise<ApiResponse<{ faq: FAQ }>> {
        const { data } = await axios.post<{ success: boolean; message: string; data: FAQ }>('/faqs', faqData);
        return {
            success: data.success,
            statusCode: 201,
            message: data.message,
            payload: { faq: data.data }
        };
    },

    async updateFaq(id: string, faqData: UpdateFAQRequest): Promise<ApiResponse<{ faq: FAQ }>> {
        const { data } = await axios.put<{ success: boolean; message: string; data: FAQ }>(`/faqs/${id}`, faqData);
        return {
            success: data.success,
            statusCode: 200,
            message: data.message,
            payload: { faq: data.data }
        };
    },

    async deleteFaq(id: string): Promise<ApiResponse> {
        const { data } = await axios.delete<{ success: boolean; message: string }>(`/faqs/${id}`);
        return {
            success: data.success,
            statusCode: 200,
            message: data.message
        };
    }
};

// Legacy export for backward compatibility
export const getAllFaqs = faqService.getAllFaqs;
export const getFaqById = faqService.getFaqById;
export const createFaq = faqService.createFaq;
export const updateFaq = faqService.updateFaq;
export const deleteFaq = faqService.deleteFaq;
