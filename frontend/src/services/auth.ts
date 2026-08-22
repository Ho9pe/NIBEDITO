import axios from '@/utils/axios';
import { logger } from '@/utils/logger';
import { 
    AuthService, 
    LoginCredentials, 
    LoginResponse, 
    RegisterData, 
    RegisterResponse,
    User,
    Address,
    ApiResponse,
    ResetPasswordRequest,
    ResendVerificationRequest  // Add this import for the new type
} from '@/types';

export const authService: AuthService = {
    async login(formData: LoginCredentials): Promise<LoginResponse> {

        const { data } = await axios.post<ApiResponse<LoginResponse>>('/auth/login', {
            emailOrPhone: formData.emailOrPhone,
            password: formData.password
        });

        logger.debug('Login response:', data);

        if (data.success && data.payload?.user) {
            // Clear any existing admin data to prevent conflicts
            localStorage.removeItem('admin');
            localStorage.removeItem('adminToken');
            
            // Set user data
            localStorage.setItem('user', JSON.stringify(data.payload.user));
            
            return {
                success: true,
                user: data.payload.user,
                message: data.message
            } as LoginResponse;
        }
        throw new Error(data.message || 'Authentication failed');
    },

    async register(userData: RegisterData): Promise<RegisterResponse> {
        const { data } = await axios.post<ApiResponse>('/auth/process-register', {
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            password: userData.password,
            address: {
                street: userData.street,
                city: userData.city,
                state: userData.state,
                postalCode: userData.postalCode
            }
        });

        if (data.success) {
            return {
                success: true,
                message: data.message,
                email: userData.email
            };
        }
        throw new Error(data.message || 'Registration failed');
    },

    async addAddress(userId: string, addressData: Omit<Address, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
        const { data } = await axios.post<ApiResponse<{ user: User }>>(`/users/${userId}/addresses`, addressData);
        if (data.success && data.payload?.user) {
            localStorage.setItem('user', JSON.stringify(data.payload.user));
            return data.payload.user;
        }
        throw new Error(data.message || 'Failed to add address');
    },

    async updateAddress(userId: string, addressId: string, addressData: Partial<Address>): Promise<User> {
        const { data } = await axios.put<ApiResponse<{ user: User }>>(`/users/${userId}/addresses/${addressId}`, addressData);
        if (data.success && data.payload?.user) {
            localStorage.setItem('user', JSON.stringify(data.payload.user));
            return data.payload.user;
        }
        throw new Error(data.message || 'Failed to update address');
    },

    async deleteAddress(userId: string, addressId: string): Promise<User> {
        const { data } = await axios.delete<ApiResponse<{ user: User }>>(`/users/${userId}/addresses/${addressId}`);
        if (data.success && data.payload?.user) {
            localStorage.setItem('user', JSON.stringify(data.payload.user));
            return data.payload.user;
        }
        throw new Error(data.message || 'Failed to delete address');
    },

    async logout(): Promise<void> {
        await axios.post('/auth/logout');
        // Clear all relevant localStorage items
        localStorage.removeItem('user');
        // Just in case there are any admin data left
        localStorage.removeItem('admin');
        localStorage.removeItem('adminToken');
        
        // Clear cookies manually as well
        document.cookie = "accessToken=; Max-Age=0; path=/; domain=" + window.location.hostname;
        document.cookie = "refreshToken=; Max-Age=0; path=/; domain=" + window.location.hostname;
    },

    async getCurrentUser(): Promise<User | null> {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;

        // Parsed outside the request try/catch so the 401 refresh path below
        // can still read user._id when the initial request fails.
        let user: User;
        try {
            user = JSON.parse(userStr);
        } catch {
            this.logout();
            return null;
        }

        try {
            const { data } = await axios.get<ApiResponse<{ user: User }>>(`/users/${user._id}`);
            
            if (data.success && data.payload?.user) {
                localStorage.setItem('user', JSON.stringify(data.payload.user));
                return data.payload.user;
            }
            return null;
        } catch (error) {
            console.error('Error getting current user:', error);
            
            // Only attempt refresh token if status is 401 and it's not already a refresh attempt
            if ((error as any).response?.status === 401 && !(error as any).config?._isRefreshAttempt) {
                try {
                    // Mark this as a refresh attempt to prevent infinite loops
                    const refreshResponse = await axios.get<ApiResponse<{ token: string }>>('/auth/refresh-token', {
                        _isRefreshAttempt: true
                    } as any);
                    
                    if (refreshResponse.data.success) {
                        // Retry getting user data with a fresh request instead of recursion
                        const retryResponse = await axios.get<ApiResponse<{ user: User }>>(`/users/${user._id}`);
                        if (retryResponse.data.success && retryResponse.data.payload?.user) {
                            localStorage.setItem('user', JSON.stringify(retryResponse.data.payload.user));
                            return retryResponse.data.payload.user;
                        }
                    }
                    // If we get here, the refresh succeeded but getting user failed
                    this.logout();
                    return null;
                } catch (refreshError) {
                    // Refresh token failed
                    this.logout();
                    return null;
                }
            }
            
            // For other errors, logout and return null
            this.logout();
            return null;
        }
    },

    async forgotPassword(email: string): Promise<ApiResponse> {
        const { data } = await axios.post<ApiResponse>('/auth/forgot-password', { emailOrPhone: email });
        return data;
    },

    async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse> {  // Update to accept ResetPasswordRequest object
        const { data: response } = await axios.post<ApiResponse>('/auth/reset-password', data);
        return response;
    },

    async activateAccount(token: string): Promise<ApiResponse> {
        const { data } = await axios.post<ApiResponse>('/auth/activate-account', { token });
        return data;
    },

    async resendVerificationEmail(data: ResendVerificationRequest): Promise<ApiResponse> {  // Update to accept ResendVerificationRequest object
        const { data: response } = await axios.post<ApiResponse>('/auth/resend-verification', data);
        return response;
    },

    async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
        const { data } = await axios.post<ApiResponse>('/auth/change-password', {
            currentPassword,
            newPassword
        });
        
        if (data.success) {
            return {
                success: true,
                message: data.message
            };
        }
        throw new Error(data.message || 'Failed to change password');
    }
};