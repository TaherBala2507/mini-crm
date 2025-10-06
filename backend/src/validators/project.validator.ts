import { z } from 'zod';
import { ProjectStatus } from '../constants/enums';
import mongoose from 'mongoose';

// Custom validator for MongoDB ObjectId
const objectIdSchema = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  { message: 'Invalid ObjectId format' }
);

// Project member schema
const projectMemberSchema = z.object({
  userId: objectIdSchema,
  role: z.string().min(2).max(50).trim().default('Member'),
});

// Create project validator
export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(150).trim(),
    description: z.string().max(2000).trim().optional(),
    client: z.string().max(150).trim().optional(),
    status: z.nativeEnum(ProjectStatus).optional(),
    leadId: objectIdSchema.optional(),
    budget: z.number().min(0, 'Budget must be a positive number').optional(),
    startDate: z.string().datetime().or(z.date()).optional(),
    endDate: z.string().datetime().or(z.date()).optional(),
    managerUserId: objectIdSchema.optional(),
    members: z.array(projectMemberSchema).optional(),
    memberIds: z.array(objectIdSchema).optional(), // Accept memberIds from frontend
  }).refine(
    (data) => {
      // If both dates provided, endDate must be after startDate
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return end > start;
      }
      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  ),
});

// Update project validator
export const updateProjectSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    name: z.string().min(2).max(150).trim().optional(),
    description: z.string().max(2000).trim().optional(),
    client: z.string().max(150).trim().optional(),
    status: z.nativeEnum(ProjectStatus).optional(),
    leadId: objectIdSchema.optional(),
    budget: z.number().min(0).optional(),
    startDate: z.string().datetime().or(z.date()).optional(),
    endDate: z.string().datetime().or(z.date()).optional(),
    managerUserId: objectIdSchema.optional(),
  }).refine(
    (data) => {
      // If both dates provided, endDate must be after startDate
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return end > start;
      }
      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  ),
});

// Get project by ID validator
export const getProjectSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

// Delete project validator
export const deleteProjectSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

// List projects validator
export const listProjectsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    status: z.nativeEnum(ProjectStatus).optional(),
    managerId: objectIdSchema.optional(),
    search: z.string().trim().optional(),
    sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'startDate', 'endDate', 'budget']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

// Add member validator
export const addMemberSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    userId: objectIdSchema,
    role: z.string().min(2).max(50).trim().default('Member'),
  }),
});

// Remove member validator
export const removeMemberSchema = z.object({
  params: z.object({
    id: objectIdSchema,
    userId: objectIdSchema,
  }),
});

// Type exports for TypeScript
export type CreateProjectInput = z.infer<typeof createProjectSchema>['body'];
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>['body'];
export type ListProjectsQuery = z.infer<typeof listProjectsSchema>['query'];
export type AddMemberInput = z.infer<typeof addMemberSchema>['body'];