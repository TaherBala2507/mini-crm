import apiClient from './client';
import type { ApiResponse, PaginatedResponse, Project, ProjectFormData, ProjectFilters } from '../types';

export const projectsApi = {
  // Get all projects with filters
  getProjects: async (filters?: ProjectFilters): Promise<ApiResponse<PaginatedResponse<Project>>> => {
    const response = await apiClient.get('/projects', { params: filters });
    return response.data;
  },

  // Get project by ID
  getProject: async (id: string): Promise<ApiResponse<Project>> => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },

  // Create project
  createProject: async (data: ProjectFormData): Promise<ApiResponse<Project>> => {
    const response = await apiClient.post('/projects', data);
    return response.data;
  },

  // Update project
  updateProject: async (id: string, data: Partial<ProjectFormData>): Promise<ApiResponse<Project>> => {
    const response = await apiClient.patch(`/projects/${id}`, data);
    return response.data;
  },

  // Delete project
  deleteProject: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data;
  },

  // Add project member
  addMember: async (id: string, userId: string): Promise<ApiResponse<Project>> => {
    const response = await apiClient.post(`/projects/${id}/members`, { userId });
    return response.data;
  },

  // Remove project member
  removeMember: async (id: string, userId: string): Promise<ApiResponse<Project>> => {
    const response = await apiClient.delete(`/projects/${id}/members/${userId}`);
    return response.data;
  },
};