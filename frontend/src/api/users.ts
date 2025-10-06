import apiClient from './client';
import type { ApiResponse, User, UserInviteFormData, UserFilters } from '../types';

export const usersApi = {
  // Get all users with filters
  getUsers: async (filters?: UserFilters): Promise<ApiResponse<User[]>> => {
    const response = await apiClient.get('/users', { params: filters });
    return response.data;
  },

  // Get user by ID
  getUser: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // Invite user
  inviteUser: async (data: UserInviteFormData): Promise<ApiResponse<User>> => {
    const response = await apiClient.post('/users/invite', data);
    return response.data;
  },

  // Update user
  updateUser: async (id: string, data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch(`/users/${id}`, data);
    return response.data;
  },

  // Delete user
  deleteUser: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
};