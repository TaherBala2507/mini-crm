import apiClient from './client';
import type { ApiResponse, PaginatedResponse, Note, NoteFormData } from '../types';

export const notesApi = {
  // Get notes for an entity
  getNotes: async (
    entityType: 'Lead' | 'Project' | 'Task',
    entityId: string,
    page = 1,
    pageSize = 20
  ): Promise<ApiResponse<PaginatedResponse<Note>>> => {
    const response = await apiClient.get('/notes', {
      params: { entityType, entityId, page, pageSize },
    });
    return response.data;
  },

  // Get note by ID
  getNote: async (id: string): Promise<ApiResponse<Note>> => {
    const response = await apiClient.get(`/notes/${id}`);
    return response.data;
  },

  // Create note
  createNote: async (data: NoteFormData): Promise<ApiResponse<Note>> => {
    const response = await apiClient.post('/notes', data);
    return response.data;
  },

  // Update note
  updateNote: async (id: string, data: Partial<NoteFormData>): Promise<ApiResponse<Note>> => {
    const response = await apiClient.patch(`/notes/${id}`, data);
    return response.data;
  },

  // Delete note
  deleteNote: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete(`/notes/${id}`);
    return response.data;
  },
};