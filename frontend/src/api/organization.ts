import apiClient from './client';
import type { ApiResponse, Organization } from '../types';

export const organizationApi = {
  // Get current organization
  getOrganization: async (): Promise<ApiResponse<Organization>> => {
    const response = await apiClient.get('/org');
    return response.data;
  },

  // Update organization
  updateOrganization: async (data: {
    name?: string;
    domain?: string;
    settings?: {
      timezone?: string;
      dateFormat?: string;
      currency?: string;
      language?: string;
    };
  }): Promise<ApiResponse<Organization>> => {
    const response = await apiClient.patch('/org', data);
    return response.data;
  },
};