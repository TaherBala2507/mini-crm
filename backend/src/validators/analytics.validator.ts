import { z } from 'zod';

/**
 * Validator for date range queries
 */
export const dateRangeSchema = z.object({
  query: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

/**
 * Validator for lead analytics query
 */
export const leadAnalyticsSchema = z.object({
  query: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    groupBy: z.enum(['status', 'source', 'owner']).optional(),
  }),
});

/**
 * Validator for project analytics query
 */
export const projectAnalyticsSchema = z.object({
  query: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    groupBy: z.enum(['status', 'manager']).optional(),
  }),
});

/**
 * Validator for task analytics query
 */
export const taskAnalyticsSchema = z.object({
  query: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    groupBy: z.enum(['status', 'priority', 'assignee', 'project']).optional(),
  }),
});

/**
 * Validator for user activity query
 */
export const userActivitySchema = z.object({
  query: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
  }),
});

// Type exports
export type DateRangeQuery = z.infer<typeof dateRangeSchema>['query'];
export type LeadAnalyticsQuery = z.infer<typeof leadAnalyticsSchema>['query'];
export type ProjectAnalyticsQuery = z.infer<typeof projectAnalyticsSchema>['query'];
export type TaskAnalyticsQuery = z.infer<typeof taskAnalyticsSchema>['query'];
export type UserActivityQuery = z.infer<typeof userActivitySchema>['query'];