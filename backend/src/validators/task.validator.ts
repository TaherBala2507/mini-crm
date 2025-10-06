import { z } from 'zod';
import { TaskStatus, TaskPriority } from '../constants/enums';
import mongoose from 'mongoose';

// Custom ObjectId validator
const objectIdValidator = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId format',
});

/**
 * Validator for creating a new task
 */
export const createTaskSchema = z.object({
  body: z.object({
    projectId: objectIdValidator,
    title: z.string().min(2, 'Title must be at least 2 characters').max(200, 'Title must not exceed 200 characters'),
    description: z.string().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    assigneeUserId: objectIdValidator.optional(),
    dueDate: z.string().datetime().optional(),
  }),
});

/**
 * Validator for updating a task
 */
export const updateTaskSchema = z.object({
  params: z.object({
    id: objectIdValidator,
  }),
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters').max(200, 'Title must not exceed 200 characters').optional(),
    description: z.string().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    assigneeUserId: objectIdValidator.optional().nullable(),
    dueDate: z.string().datetime().optional().nullable(),
  }),
});

/**
 * Validator for getting a single task
 */
export const getTaskSchema = z.object({
  params: z.object({
    id: objectIdValidator,
  }),
});

/**
 * Validator for deleting a task
 */
export const deleteTaskSchema = z.object({
  params: z.object({
    id: objectIdValidator,
  }),
});

/**
 * Validator for listing tasks with filters
 */
export const listTasksSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
    projectId: objectIdValidator.optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    assigneeUserId: objectIdValidator.optional(),
    search: z.string().optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'dueDate', 'priority', 'title']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

// Export types for TypeScript
export type CreateTaskInput = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>['body'];
export type ListTasksQuery = z.infer<typeof listTasksSchema>['query'];