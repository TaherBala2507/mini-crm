import { z } from 'zod';
import { EntityType } from '../constants/enums';
import mongoose from 'mongoose';

// Custom ObjectId validator
const objectIdValidator = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId format',
});

/**
 * Validator for creating a new note
 */
export const createNoteSchema = z.object({
  body: z.object({
    entityType: z.nativeEnum(EntityType),
    entityId: objectIdValidator,
    body: z.string().min(1, 'Note body cannot be empty').max(5000, 'Note body must not exceed 5000 characters'),
  }),
});

/**
 * Validator for updating a note
 */
export const updateNoteSchema = z.object({
  params: z.object({
    id: objectIdValidator,
  }),
  body: z.object({
    body: z.string().min(1, 'Note body cannot be empty').max(5000, 'Note body must not exceed 5000 characters'),
  }),
});

/**
 * Validator for getting a single note
 */
export const getNoteSchema = z.object({
  params: z.object({
    id: objectIdValidator,
  }),
});

/**
 * Validator for deleting a note
 */
export const deleteNoteSchema = z.object({
  params: z.object({
    id: objectIdValidator,
  }),
});

/**
 * Validator for listing notes by entity
 */
export const listNotesByEntitySchema = z.object({
  params: z.object({
    entityType: z.nativeEnum(EntityType),
    entityId: objectIdValidator,
  }),
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
  }),
});

/**
 * Validator for listing all notes with filters
 */
export const listNotesSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
    entityType: z.nativeEnum(EntityType).optional(),
    entityId: objectIdValidator.optional(),
    authorUserId: objectIdValidator.optional(),
  }),
});

// Export types for TypeScript
export type CreateNoteInput = z.infer<typeof createNoteSchema>['body'];
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>['body'];
export type ListNotesQuery = z.infer<typeof listNotesSchema>['query'];
export type ListNotesByEntityQuery = z.infer<typeof listNotesByEntitySchema>['query'];