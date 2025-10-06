import { z } from 'zod';
import { Permission } from '../constants/permissions';

export const createRoleSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Role name must be at least 2 characters')
      .max(50, 'Role name must not exceed 50 characters')
      .trim(),
    description: z
      .string()
      .max(200, 'Description must not exceed 200 characters')
      .trim()
      .optional(),
    permissions: z
      .array(z.nativeEnum(Permission))
      .min(1, 'At least one permission is required')
      .refine((perms) => new Set(perms).size === perms.length, {
        message: 'Duplicate permissions are not allowed',
      }),
  }),
});

export const updateRoleSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .min(2, 'Role name must be at least 2 characters')
        .max(50, 'Role name must not exceed 50 characters')
        .trim()
        .optional(),
      description: z
        .string()
        .max(200, 'Description must not exceed 200 characters')
        .trim()
        .optional(),
      permissions: z
        .array(z.nativeEnum(Permission))
        .min(1, 'At least one permission is required')
        .refine((perms) => new Set(perms).size === perms.length, {
          message: 'Duplicate permissions are not allowed',
        })
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

export const listRolesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1).optional(),
    pageSize: z.coerce.number().int().min(1).max(100).default(20).optional(),
    search: z.string().trim().optional(),
    includeSystem: z
      .union([z.string(), z.boolean()])
      .transform((val) => {
        if (typeof val === 'boolean') return val;
        return val === 'true';
      })
      .optional(),
  }),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>['body'];
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>['body'];
export type ListRolesQuery = z.infer<typeof listRolesSchema>['query'];