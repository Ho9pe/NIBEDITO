import axios from '@/utils/axios';
import { 
    PaymentService, 
    ProcessPaymentRequest, 
    Payment, 
    GetAllPaymentsParams,
    GetPaymentStatsParams,
    GetRefundReportsParams,
    PaymentStats,
    RefundReports,
    ApiResponse 
} from '@/types';

export const paymentService: PaymentService = {
    async processPayment(paymentData: ProcessPaymentRequest): Promise<ApiResponse<Payment>> {
        const { data } = await axios.post<ApiResponse<Payment>>('/payments/process', paymentData);
        return data;
    },

    async getUserPayments(): Promise<{ success: boolean; data?: Payment[]; error?: string }> {
        const { data } = await axios.get<ApiResponse<Payment[]>>('/payments/user-payments');
        return {
            success: true,
            data: data.payload
        };
    },

    async getPaymentById(paymentId: string): Promise<ApiResponse<Payment>> {
        const { data } = await axios.get<ApiResponse<Payment>>(`/payments/${paymentId}`);
        return data;
    },

    async getAllPayments(params: GetAllPaymentsParams = {}): Promise<ApiResponse<Payment[]>> {
        const { status, startDate, endDate } = params;
        const query = new URLSearchParams({
            ...(status && { status }),
            ...(startDate && { startDate }),
            ...(endDate && { endDate })
        });

        const { data } = await axios.get<ApiResponse<Payment[]>>(`/payments?${query}`);
        return data;
    },

    async updatePaymentStatus(paymentId: string, status: string): Promise<ApiResponse<Payment>> {
        const { data } = await axios.put<ApiResponse<Payment>>(`/payments/${paymentId}`, { status });
        return data;
    },

    async cancelPayment(paymentId: string): Promise<ApiResponse<Payment>> {
        const { data } = await axios.put<ApiResponse<Payment>>(`/payments/${paymentId}/cancel`);
        return data;
    },

    async getPaymentStats(params: GetPaymentStatsParams = {}): Promise<ApiResponse<PaymentStats>> {
        const { startDate, endDate } = params;
        const query = new URLSearchParams({
            ...(startDate && { startDate }),
            ...(endDate && { endDate })
        });

        const { data } = await axios.get<ApiResponse<PaymentStats>>(`/payments/analytics/stats?${query}`);
        return data;
    },

    async getRefundReports(params: GetRefundReportsParams = {}): Promise<ApiResponse<RefundReports>> {
        const { days } = params;
        const query = new URLSearchParams({
            ...(days && { days: days.toString() })
        });

        const { data } = await axios.get<ApiResponse<RefundReports>>(`/payments/analytics/refunds?${query}`);
        return data;
    }
};
