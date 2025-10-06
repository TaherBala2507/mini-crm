import apiClient from './client';
import type { ApiResponse, PaginatedResponse, Attachment } from '../types';

export const attachmentsApi = {
  // Upload single attachment
  uploadAttachment: async (
    file: File,
    entityType: 'Lead' | 'Project' | 'Task',
    entityId: string
  ): Promise<ApiResponse<Attachment>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);
    formData.append('entityId', entityId);

    const response = await apiClient.post('/attachments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload multiple attachments
  uploadMultipleAttachments: async (
    files: File[],
    entityType: 'Lead' | 'Project' | 'Task',
    entityId: string
  ): Promise<ApiResponse<Attachment[]>> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('entityType', entityType);
    formData.append('entityId', entityId);

    const response = await apiClient.post('/attachments/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get attachments for an entity
  getAttachments: async (
    entityType: 'Lead' | 'Project' | 'Task',
    entityId: string,
    page = 1,
    pageSize = 20
  ): Promise<ApiResponse<PaginatedResponse<Attachment>>> => {
    const response = await apiClient.get('/attachments', {
      params: { entityType, entityId, page, pageSize },
    });
    return response.data;
  },

  // Get attachment by ID
  getAttachment: async (id: string): Promise<ApiResponse<Attachment>> => {
    const response = await apiClient.get(`/attachments/${id}`);
    return response.data;
  },

  // Download attachment
  downloadAttachment: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/attachments/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Delete attachment
  deleteAttachment: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete(`/attachments/${id}`);
    return response.data;
  },

  // Get storage stats
  getStorageStats: async (): Promise<ApiResponse<{
    totalSize: number;
    totalFiles: number;
    filesByType: Record<string, number>;
  }>> => {
    const response = await apiClient.get('/attachments/stats');
    return response.data;
  },
};