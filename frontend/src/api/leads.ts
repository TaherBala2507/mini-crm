import apiClient from './client';
import type { ApiResponse, Lead, LeadFormData, LeadFilters } from '../types';

export const leadsApi = {
  // Get all leads with filters
  getLeads: async (filters?: LeadFilters): Promise<ApiResponse<Lead[]>> => {
    const response = await apiClient.get('/leads', { params: filters });
    return response.data;
  },

  // Get lead by ID
  getLead: async (id: string): Promise<ApiResponse<Lead>> => {
    const response = await apiClient.get(`/leads/${id}`);
    return response.data;
  },

  // Create lead
  createLead: async (data: LeadFormData): Promise<ApiResponse<Lead>> => {
    const response = await apiClient.post('/leads', data);
    return response.data;
  },

  // Update lead
  updateLead: async (id: string, data: Partial<LeadFormData>): Promise<ApiResponse<Lead>> => {
    const response = await apiClient.patch(`/leads/${id}`, data);
    return response.data;
  },

  // Delete lead
  deleteLead: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete(`/leads/${id}`);
    return response.data;
  },

  // Assign lead
  assignLead: async (id: string, userId: string): Promise<ApiResponse<Lead>> => {
    const response = await apiClient.post(`/leads/${id}/assign`, { userId });
    return response.data;
  },
};