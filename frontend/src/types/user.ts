import { ApiResponse } from './api';

export interface Address {
  _id?: string;
  street: string;
  city: string;
  state: string;
  postalCode?: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface VerificationStatus {
  email: boolean;
  phone: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profilePicture?: string;
  addresses: Address[];
  wishlist?: string[];
  isBanned: boolean;
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
  newEmail?: string;
}
export interface UpdateUserInfoRequest {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
  newEmail?: string;
  phone?: string;
}

export interface UpdateProfilePictureRequest {
  profilePicture: File;
}

export interface AddAddressRequest extends Omit<Address, '_id' | 'createdAt' | 'updatedAt'> {}

export interface UpdateAddressRequest extends Partial<Address> {}

export interface UserService {
  getUserById(userId: string): Promise<ApiResponse<{ user: User }>>;
  updateUserInfo(userId: string, data: UpdateUserInfoRequest): Promise<ApiResponse<{ user: User }>>;
  updateUserProfilePicture(userId: string, file: File): Promise<ApiResponse<{ user: User }>>;
  addUserAddress(userId: string, addressData: AddAddressRequest): Promise<ApiResponse<{ user: User }>>;
  updateUserAddress(userId: string, addressId: string, addressData: UpdateAddressRequest): Promise<ApiResponse<{ user: User }>>;
  deleteUserAddress(userId: string, addressId: string): Promise<ApiResponse<{ user: User }>>;
}
