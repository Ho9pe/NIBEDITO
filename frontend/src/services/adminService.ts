import axios from '@/utils/axios';
import { 
    AdminService, 
    AdminLoginCredentials, 
    Admin, 
    GetAllUsersParams, 
    GetAllUsersResponse,
    UserStats,
    OrderParams,
    ApiResponse 
} from '@/types';

export const adminService: AdminService = {
    async login(credentials: AdminLoginCredentials): Promise<Admin> {
        const response = await axios.post<ApiResponse<{ adminInfo: Admin; accessToken?: string }>>('/admin/login', credentials, {
            withCredentials: true
        });
        const { data } = response;
        
        if (data.success && data.payload?.adminInfo) {
            // Store admin info in localStorage
            localStorage.setItem('admin', JSON.stringify(data.payload.adminInfo));
            
            // Store token separately if provided
            if (data.payload.accessToken) {
                localStorage.setItem('adminToken', data.payload.accessToken);
            }
            
            // Clear any user data to prevent conflicts
            localStorage.removeItem('user');
            
            return data.payload.adminInfo;
        }
        throw new Error(data.message || 'Login failed');
    },

    async logout(): Promise<void> {
        await axios.post('/admin/logout', {}, {
            withCredentials: true
        });
        // Clear all relevant localStorage items
        localStorage.removeItem('admin');
        localStorage.removeItem('adminToken');
        
        // Clear cookies manually as well
        document.cookie = "accessToken=; Max-Age=0; path=/; domain=" + window.location.hostname;
        document.cookie = "refreshToken=; Max-Age=0; path=/; domain=" + window.location.hostname;
    },

    async getCurrentAdmin(): Promise<Admin | null> {
        try {
            // First check localStorage
            const adminStr = localStorage.getItem('admin');
            if (!adminStr) return null;

            // Verify session with server
            const { data } = await axios.get<ApiResponse<{ adminInfo?: Admin }>>('/admin/verify-session', {
                withCredentials: true
            });

            if (data.success) {
                // If we have a new admin info in the response, update localStorage
                if (data.payload?.adminInfo) {
                    localStorage.setItem('admin', JSON.stringify(data.payload.adminInfo));
                    return data.payload.adminInfo;
                }
                return JSON.parse(adminStr) as Admin;
            } else {
                // If server session is invalid, clear localStorage
                localStorage.removeItem('admin');
                localStorage.removeItem('adminToken');
                return null;
            }
        } catch (error) {
            // If there's any error, clear localStorage and return null
            console.error('Error verifying admin session:', error);
            localStorage.removeItem('admin');
            localStorage.removeItem('adminToken');
            return null;
        }
    },

    async getUserStats(): Promise<UserStats> {
        const { data } = await axios.get<ApiResponse<UserStats>>('/admin/users/stats');
        return data.payload!;
    },

    async getRecentOrders(): Promise<any> {
        const { data } = await axios.get<ApiResponse>('/admin/orders/recent');
        return data.payload;
    },

    async getDashboardStats(): Promise<any> {
        const { data } = await axios.get<ApiResponse>('/admin/stats/dashboard');
        return data.payload;
    },

    async getAllUsers(params: GetAllUsersParams): Promise<ApiResponse<GetAllUsersResponse>> {
        const { page, limit, search, filter, sortBy, order } = params;
        const query = new URLSearchParams({
            page: (page || 1).toString(),
            limit: (limit || 10).toString(),
            ...(search && { search }),
            ...(filter && { filter }),
            ...(sortBy && { sortBy }),
            ...(order && { order })
        });

        const { data } = await axios.get<ApiResponse<GetAllUsersResponse>>(`/admin/users?${query}`);
        return data;
    },

    async banUser(userId: string): Promise<any> {
        const { data } = await axios.put<ApiResponse>(`/admin/users/${userId}/ban`);
        if (data.success) {
            return data.payload;
        }
        throw new Error(data.message || 'Failed to ban user');
    },

    async unbanUser(userId: string): Promise<any> {
        const { data } = await axios.put<ApiResponse>(`/admin/users/${userId}/unban`);
        if (data.success) {
            return data.payload;
        }
        throw new Error(data.message || 'Failed to unban user');
    },

    async deleteUser(userId: string): Promise<ApiResponse> {
        const { data } = await axios.delete<ApiResponse>(`/admin/users/${userId}`);
        return data;
    },

    async getUserById(userId: string): Promise<ApiResponse<{ user: any }>> {
        const { data } = await axios.get<ApiResponse<{ user: any }>>(`/admin/users/${userId}`);
        return data;
    },

    async updateUser(userId: string, userData: any): Promise<ApiResponse> {
        const { data } = await axios.put<ApiResponse>(`/admin/users/${userId}`, userData);
        return data;
    },

    // Order Management API calls
    async getAllOrders(params: OrderParams = {}): Promise<ApiResponse> {
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

        const { data } = await axios.get<ApiResponse>(`/orders?${query}`);
        return data;
    },

    async getOrderById(orderId: string): Promise<ApiResponse> {
        const { data } = await axios.get<ApiResponse>(`/orders/${orderId}`);
        return data;
    },

    async updateOrderStatus(orderId: string, status: string): Promise<ApiResponse> {
        const { data } = await axios.put<ApiResponse>(`/orders/${orderId}`, { status });
        return data;
    },

    async updateOrderPaidStatus(orderId: string, isPaid: boolean): Promise<ApiResponse> {
        const { data } = await axios.put<ApiResponse>(`/orders/${orderId}/payment-status`, { isPaid });
        return data;
    },

    async deleteOrder(orderId: string): Promise<ApiResponse> {
        const { data } = await axios.delete<ApiResponse>(`/orders/${orderId}`);
        return data;
    }
};