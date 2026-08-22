import axios from '@/utils/axios';
import type { ApiResponse } from '@/types/api';
import type {
  User,
  UpdateUserInfoRequest,
  UpdateAddressRequest,
  AddAddressRequest
} from '@/types/user';

const userService = {
  async getUserById(userId: string): Promise<ApiResponse<{ user: User }>> {
    const { data } = await axios.get<ApiResponse<{ user: User }>>(`/users/${userId}`);
    return data;
  },

  async updateProfile(userId: string, userData: UpdateUserInfoRequest): Promise<ApiResponse<{ user: User }>> {
    const { data } = await axios.put<ApiResponse<{ user: User }>>(`/users/update/${userId}`, userData);
    if (data.success && data.payload?.user) {
      localStorage.setItem('user', JSON.stringify(data.payload.user));
    }
    return data;
  },

  async updateAddress(userId: string, addressId: string, addressData: UpdateAddressRequest): Promise<ApiResponse<{ user: User }>> {
    const { data } = await axios.put<ApiResponse<{ user: User }>>(`/users/${userId}/addresses/${addressId}`, addressData);
    if (data.success && data.payload?.user) {
      localStorage.setItem('user', JSON.stringify(data.payload.user));
    }
    return data;
  },

  async addAddress(userId: string, addressData: AddAddressRequest): Promise<ApiResponse<{ user: User }>> {
    const { data } = await axios.post<ApiResponse<{ user: User }>>(`/users/${userId}/addresses`, addressData);
    if (data.success && data.payload?.user) {
      localStorage.setItem('user', JSON.stringify(data.payload.user));
    }
    return data;
  },

  async deleteAddress(userId: string, addressId: string): Promise<ApiResponse<{ user: User }>> {
    const { data } = await axios.delete<ApiResponse<{ user: User }>>(`/users/${userId}/addresses/${addressId}`);
    if (data.success && data.payload?.user) {
      localStorage.setItem('user', JSON.stringify(data.payload.user));
    }
    return data;
  }
};

export default userService;