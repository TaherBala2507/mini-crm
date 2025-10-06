import apiClient from './client';
import type {
  ApiResponse,
  AuthResponse,
  LoginFormData,
  RegisterFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
} from '../types';

export const authApi = {
  // Register new organization
  register: async (data: RegisterFormData): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  // Login
  login: async (data: LoginFormData): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  // Logout
  logout: async (refreshToken: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post('/auth/logout', { refreshToken });
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ tokens: { accessToken: string; refreshToken: string } }>> => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<AuthResponse['user']>> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Forgot password
  forgotPassword: async (data: ForgotPasswordFormData): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post('/auth/password/forgot', data);
    return response.data;
  },

  // Reset password
  resetPassword: async (data: ResetPasswordFormData): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post('/auth/password/reset', data);
    return response.data;
  },

  // Verify email
  verifyEmail: async (token: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/auth/verify-email', { token, password });
    return response.data;
  },

  // Change password
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post('/auth/password/change', data);
    return response.data;
  },
};