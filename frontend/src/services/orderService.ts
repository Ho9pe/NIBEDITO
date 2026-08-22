import axios from '@/utils/axios';
import { 
    OrderService, 
    CreateOrderRequest, 
    Order, 
    GetAllOrdersParams,
    OrdersResponse,
    ApiResponse,
    OrderStats,
    RegionStats,
    GetOrderStatsParams,
    GetOrdersByRegionParams
} from '@/types';

export const orderService: OrderService = {
    async createOrder(orderData: CreateOrderRequest): Promise<{ success: boolean; data?: Order; error?: string }> {
        const { data } = await axios.post<ApiResponse<Order>>('/orders', orderData);
        return {
            success: true,
            data: data.payload
        };
    },

    async getUserOrders(): Promise<{ success: boolean; data?: Order[]; error?: string }> {
        const { data } = await axios.get<ApiResponse<Order[]>>('/orders/user-orders');
        return {
            success: true,
            data: data.payload
        };
    },

    async getOrderById(orderId: string): Promise<{ success: boolean; data?: Order; error?: string }> {
        const { data } = await axios.get<ApiResponse<Order>>(`/orders/${orderId}`);
        return {
            success: true,
            data: data.payload
        };
    },

    async getAllOrders(params: GetAllOrdersParams = {}): Promise<ApiResponse<OrdersResponse>> {
        const { status, userId, isGift, page, limit, sortBy, order } = params;
        const query = new URLSearchParams({
            ...(status && { status }),
            ...(userId && { userId }),
            ...(isGift !== undefined && { isGift: isGift.toString() }),
            page: (page || 1).toString(),
            limit: (limit || 10).toString(),
            ...(sortBy && { sortBy }),
            ...(order && { order })
        });

        const { data } = await axios.get<ApiResponse<OrdersResponse>>(`/orders?${query}`);
        return data;
    },

    async updateOrderStatus(orderId: string, status: string): Promise<ApiResponse<{ order: Order }>> {
        const { data } = await axios.put<ApiResponse<{ order: Order }>>(`/orders/${orderId}`, { status });
        return data;
    },

    async updateOrderPaymentStatus(orderId: string, isPaid: boolean): Promise<ApiResponse<{ order: Order }>> {
        const { data } = await axios.put<ApiResponse<{ order: Order }>>(`/orders/${orderId}/payment-status`, { isPaid });
        return data;
    },

    async deleteOrder(orderId: string): Promise<ApiResponse> {
        const { data } = await axios.delete<ApiResponse>(`/orders/${orderId}`);
        return data;
    },

    async getOrderStats(params: GetOrderStatsParams = {}): Promise<ApiResponse<OrderStats>> {
        const { startDate, endDate } = params;
        const query = new URLSearchParams({
            ...(startDate && { startDate }),
            ...(endDate && { endDate })
        });

        const { data } = await axios.get<ApiResponse<OrderStats>>(`/orders/analytics/stats?${query}`);
        return data;
    },

    async getOrdersByRegion(params: GetOrdersByRegionParams = {}): Promise<ApiResponse<RegionStats>> {
        const { startDate, endDate } = params;
        const query = new URLSearchParams({
            ...(startDate && { startDate }),
            ...(endDate && { endDate })
        });

        const { data } = await axios.get<ApiResponse<RegionStats>>(`/orders/analytics/regions?${query}`);
        return data;
    }
};
