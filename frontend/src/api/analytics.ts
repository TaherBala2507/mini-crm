import apiClient from './client';
import type { ApiResponse, AnalyticsOverview, LeadAnalytics, ProjectAnalytics, TaskAnalytics } from '../types';

export const analyticsApi = {
  // Get overview analytics
  getOverview: async (): Promise<ApiResponse<AnalyticsOverview>> => {
    const response = await apiClient.get('/analytics/overview');
    return response.data;
  },

  // Get lead analytics
  getLeadAnalytics: async (
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<LeadAnalytics>> => {
    const response = await apiClient.get('/analytics/leads', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Get project analytics
  getProjectAnalytics: async (
    projectId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<ProjectAnalytics>> => {
    const response = await apiClient.get('/analytics/projects', {
      params: { projectId, startDate, endDate },
    });
    return response.data;
  },

  // Get task analytics
  getTaskAnalytics: async (
    projectId?: string,
    userId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<TaskAnalytics>> => {
    const response = await apiClient.get('/analytics/tasks', {
      params: { projectId, userId, startDate, endDate },
    });
    return response.data;
  },

  // Get recent activity
  getRecentActivity: async (
    limit = 10
  ): Promise<ApiResponse<Array<{
    action: string;
    entityType: string;
    entityId: string;
    user: { _id: string; name: string; email: string };
    timestamp: string;
    changes?: Record<string, any>;
  }>>> => {
    const response = await apiClient.get('/analytics/activity', {
      params: { limit },
    });
    return response.data;
  },
};