import { ApiResponse } from './api';
import { Order } from './order';

export interface Payment {
  _id: string;
  order: string | Order;
  paymentMethod: 'Cash on Delivery';
  amount: number;
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessPaymentRequest {
  orderId: string;
  paymentMethod: string;
}

export interface UpdatePaymentStatusRequest {
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
}

export interface GetAllPaymentsParams {
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetPaymentStatsParams {
  startDate?: string;
  endDate?: string;
}

export interface GetRefundReportsParams {
  days?: number;
}

export interface PaymentStats {
  overview: {
    totalPayments: number;
    totalAmount: number;
    averagePaymentAmount: number;
    completedPayments: number;
    pendingPayments: number;
    refundedPayments: number;
    refundedAmount: number;
  };
  paymentMethods: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
}

export interface RefundReports {
  refunds: Payment[];
  summary: {
    totalRefunds: number;
    totalRefundAmount: number;
  };
  period: string;
}

export interface PaymentService {
  processPayment(paymentData: ProcessPaymentRequest): Promise<ApiResponse<Payment>>;
  getUserPayments(): Promise<{ success: boolean; data?: Payment[]; error?: string }>;
  getPaymentById(paymentId: string): Promise<ApiResponse<Payment>>;
  getAllPayments?(params?: GetAllPaymentsParams): Promise<ApiResponse<Payment[]>>;
  updatePaymentStatus?(paymentId: string, status: string): Promise<ApiResponse<Payment>>;
  cancelPayment?(paymentId: string): Promise<ApiResponse<Payment>>;
  getPaymentStats?(params?: GetPaymentStatsParams): Promise<ApiResponse<PaymentStats>>;
  getRefundReports?(params?: GetRefundReportsParams): Promise<ApiResponse<RefundReports>>;
}
