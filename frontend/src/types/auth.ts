import { ApiResponse } from './api';
import { Address, User } from './user';

export interface LoginCredentials {
  emailOrPhone: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  street: string;
  city: string;
  state: string;
  postalCode?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  email: string;
}

export interface ForgotPasswordRequest {
  emailOrPhone: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ActivateAccountRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface AuthService {
  login(formData: LoginCredentials): Promise<LoginResponse>;
  register(userData: RegisterData): Promise<RegisterResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  forgotPassword(email: string): Promise<ApiResponse>;
  resetPassword(data: ResetPasswordRequest): Promise<ApiResponse>;
  activateAccount(token: string): Promise<ApiResponse>;
  resendVerificationEmail(data: ResendVerificationRequest): Promise<ApiResponse>;
  changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }>;
  addAddress(userId: string, addressData: Omit<Address, '_id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  updateAddress(userId: string, addressId: string, addressData: Partial<Address>): Promise<User>;
  deleteAddress(userId: string, addressId: string): Promise<User>;
}
