import apiClient from './client';
import type { ApiResponse, PaginatedResponse, Task, TaskFormData, TaskFilters } from '../types';

export const tasksApi = {
  // Get all tasks with filters
  getTasks: async (filters?: TaskFilters): Promise<ApiResponse<PaginatedResponse<Task>>> => {
    const response = await apiClient.get('/tasks', { params: filters });
    return response.data;
  },

  // Get my tasks
  getMyTasks: async (filters?: TaskFilters): Promise<ApiResponse<PaginatedResponse<Task>>> => {
    const response = await apiClient.get('/tasks/my', { params: filters });
    return response.data;
  },

  // Get tasks by project
  getTasksByProject: async (projectId: string, filters?: TaskFilters): Promise<ApiResponse<PaginatedResponse<Task>>> => {
    const response = await apiClient.get(`/tasks/project/${projectId}`, { params: filters });
    return response.data;
  },

  // Get task by ID
  getTask: async (id: string): Promise<ApiResponse<Task>> => {
    const response = await apiClient.get(`/tasks/${id}`);
    return response.data;
  },

  // Create task
  createTask: async (data: TaskFormData): Promise<ApiResponse<Task>> => {
    const response = await apiClient.post('/tasks', data);
    return response.data;
  },

  // Update task
  updateTask: async (id: string, data: Partial<TaskFormData>): Promise<ApiResponse<Task>> => {
    const response = await apiClient.patch(`/tasks/${id}`, data);
    return response.data;
  },

  // Delete task
  deleteTask: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete(`/tasks/${id}`);
    return response.data;
  },
};