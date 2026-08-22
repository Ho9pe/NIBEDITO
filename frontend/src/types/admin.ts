import {  ApiResponse, PaginationInfo } from './api';
import { User } from './user';

export interface Admin {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'superadmin';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminLoginCredentials {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  adminInfo: Admin;
  accessToken?: string;
}

export interface CreateAdminRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'admin' | 'superadmin';
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  recentRegistrations: number;
  verificationStats: {
    emailVerified: number;
    phoneVerified: number;
  };
}

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  growthStats?: {
    usersGrowth: number;
    ordersGrowth: number;
    revenueGrowth: number;
    productsGrowth: number;
  };
}

export interface GetAllUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  filter?: 'all' | 'active' | 'banned';
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface GetAllUsersResponse {
  users: User[];
  pagination: PaginationInfo;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  isBanned?: boolean;
}

export interface OrderParams {
  status?: string;
  userId?: string;
  isGift?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface AdminService {
  login(credentials: AdminLoginCredentials): Promise<Admin>;
  logout(): Promise<void>;
  getCurrentAdmin(): Promise<Admin | null>;
  getUserStats(): Promise<UserStats>;
  getRecentOrders(): Promise<any>;
  getDashboardStats(): Promise<DashboardStats>;
  getAllUsers(params: GetAllUsersParams): Promise<ApiResponse<GetAllUsersResponse>>;
  banUser(userId: string): Promise<any>;
  unbanUser(userId: string): Promise<any>;
  deleteUser(userId: string): Promise<ApiResponse>;
  getUserById(userId: string): Promise<ApiResponse<{ user: User }>>;
  updateUser(userId: string, userData: UpdateUserRequest): Promise<ApiResponse>;
  getAllOrders(params?: OrderParams): Promise<ApiResponse>;
  getOrderById(orderId: string): Promise<ApiResponse>;
  updateOrderStatus(orderId: string, status: string): Promise<ApiResponse>;
  updateOrderPaidStatus(orderId: string, isPaid: boolean): Promise<ApiResponse>;
  deleteOrder(orderId: string): Promise<ApiResponse>;
}
