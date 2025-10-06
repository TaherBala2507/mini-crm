import { z } from 'zod';

/**
 * Schema for updating organization settings
 */
export const updateOrgSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    domain: z.string().min(2).max(100).toLowerCase().optional(),
    settings: z.object({
      // Business settings
      timezone: z.string().optional(),
      currency: z.string().length(3).optional(), // ISO 4217 currency code (USD, EUR, etc.)
      dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).optional(),
      timeFormat: z.enum(['12h', '24h']).optional(),
      
      // Lead settings
      customLeadStatuses: z.array(z.string().min(1).max(50)).optional(),
      customLeadSources: z.array(z.string().min(1).max(50)).optional(),
      
      // Required fields configuration
      requiredFields: z.object({
        lead: z.object({
          company: z.boolean().optional(),
          phone: z.boolean().optional(),
          source: z.boolean().optional(),
        }).optional(),
        project: z.object({
          client: z.boolean().optional(),
          description: z.boolean().optional(),
        }).optional(),
      }).optional(),
      
      // Feature flags
      features: z.object({
        enableEmailNotifications: z.boolean().optional(),
        enableTaskReminders: z.boolean().optional(),
        enableAuditLog: z.boolean().optional(),
      }).optional(),
    }).optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  ),
});

export type UpdateOrgInput = z.infer<typeof updateOrgSchema>['body'];