import { z } from 'zod';
import { EntityType } from '../constants/enums';

// Upload attachment schema
export const uploadAttachmentSchema = z.object({
  body: z.object({
    entityType: z.nativeEnum(EntityType, {
      errorMap: () => ({ message: 'Invalid entity type' }),
    }),
    entityId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid entity ID format'),
    description: z.string().max(500).optional(),
  }),
});

// List attachments schema
export const listAttachmentsSchema = z.object({
  query: z.object({
    entityType: z.nativeEnum(EntityType).optional(),
    entityId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    uploadedBy: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
    search: z.string().optional(),
  }),
});

// Get attachment by ID schema
export const getAttachmentByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid attachment ID'),
  }),
});

// Delete attachment schema
export const deleteAttachmentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid attachment ID'),
  }),
});

// Export types
export type UploadAttachmentInput = z.infer<typeof uploadAttachmentSchema>['body'];
export type ListAttachmentsInput = z.infer<typeof listAttachmentsSchema>['query'];
export type GetAttachmentByIdInput = z.infer<typeof getAttachmentByIdSchema>['params'];
export type DeleteAttachmentInput = z.infer<typeof deleteAttachmentSchema>['params'];