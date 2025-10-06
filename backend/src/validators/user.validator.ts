import { z } from 'zod';
import { UserStatus } from '../constants/enums';
import { RoleName } from '../constants/roles';

/**
 * Validator for inviting a new user
 */
export const inviteUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters'),
    email: z.string().email('Invalid email address'),
    roleNames: z.array(z.nativeEnum(RoleName)).min(1, 'At least one role is required'),
  }),
});

/**
 * Validator for listing users with filters
 */
export const listUsersSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1').transform(Number),
    pageSize: z.string().optional().default('25').transform(Number),
    search: z.string().optional(),
    status: z.string().optional(),
    role: z.string().optional(),
    sortBy: z.enum(['name', 'email', 'createdAt', 'lastLoginAt']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

/**
 * Validator for getting user by ID
 */
export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
  }),
});

/**
 * Validator for updating user
 */
export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
    status: z.nativeEnum(UserStatus).optional(),
    roleNames: z.array(z.nativeEnum(RoleName)).min(1).optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  }),
});

/**
 * Validator for deleting user
 */
export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
  }),
});

// Export types
export type InviteUserInput = z.infer<typeof inviteUserSchema>['body'];
export type ListUsersQuery = z.infer<typeof listUsersSchema>['query'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];