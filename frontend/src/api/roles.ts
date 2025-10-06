import apiClient from './client';
import type { ApiResponse, PaginatedResponse, Role, RoleFormData } from '../types';

export const rolesApi = {
  // Get all roles
  getRoles: async (page = 1, pageSize = 100): Promise<ApiResponse<PaginatedResponse<Role>>> => {
    const response = await apiClient.get('/roles', { params: { page, pageSize } });
    return response.data;
  },

  // Get all permissions
  getPermissions: async (): Promise<ApiResponse<string[]>> => {
    const response = await apiClient.get('/roles/permissions');
    return response.data;
  },

  // Get role by ID
  getRole: async (id: string): Promise<ApiResponse<Role>> => {
    const response = await apiClient.get(`/roles/${id}`);
    return response.data;
  },

  // Create role
  createRole: async (data: RoleFormData): Promise<ApiResponse<Role>> => {
    const response = await apiClient.post('/roles', data);
    return response.data;
  },

  // Update role
  updateRole: async (id: string, data: Partial<RoleFormData>): Promise<ApiResponse<Role>> => {
    const response = await apiClient.patch(`/roles/${id}`, data);
    return response.data;
  },

  // Delete role
  deleteRole: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete(`/roles/${id}`);
    return response.data;
  },
};