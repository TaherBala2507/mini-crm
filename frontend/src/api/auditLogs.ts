import apiClient from './client';
import type { ApiResponse, PaginatedResponse, AuditLog, AuditAction } from '../types';

export const auditLogsApi = {
  // Get audit logs with filters
  getAuditLogs: async (filters?: {
    page?: number;
    pageSize?: number;
    entityType?: string;
    entityId?: string;
    action?: AuditAction;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<PaginatedResponse<AuditLog>>> => {
    const response = await apiClient.get('/audit-logs', { params: filters });
    return response.data;
  },

  // Get audit log by ID
  getAuditLog: async (id: string): Promise<ApiResponse<AuditLog>> => {
    const response = await apiClient.get(`/audit-logs/${id}`);
    return response.data;
  },
};