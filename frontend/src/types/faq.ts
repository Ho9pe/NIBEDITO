import { ApiResponse } from './api';

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFAQRequest {
  question: string;
  answer: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateFAQRequest extends Partial<CreateFAQRequest> {}

export interface FAQService {
  getAllFaqs(): Promise<ApiResponse<{ faqs: FAQ[] }>>;
  getFaqById(id: string): Promise<ApiResponse<{ faq: FAQ }>>;
  createFaq(faqData: CreateFAQRequest): Promise<ApiResponse<{ faq: FAQ }>>;
  updateFaq(id: string, faqData: UpdateFAQRequest): Promise<ApiResponse<{ faq: FAQ }>>;
  deleteFaq(id: string): Promise<ApiResponse>;
}
