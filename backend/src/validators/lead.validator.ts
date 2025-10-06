import { z } from 'zod';
import { LeadStatus, LeadSource } from '../constants/enums';

export const createLeadSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(120, 'Title must not exceed 120 characters')
      .trim(),
    company: z.string().min(1, 'Company is required').trim(),
    contactName: z.string().min(1, 'Contact name is required').trim(),
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
    phone: z.string().trim().optional(),
    source: z.nativeEnum(LeadSource, {
      errorMap: () => ({ message: 'Invalid lead source' }),
    }),
    status: z.nativeEnum(LeadStatus).optional(),
    ownerUserId: z.string().optional(),
  }),
});

export const updateLeadSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Lead ID is required'),
  }),
  body: z.object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(120, 'Title must not exceed 120 characters')
      .trim()
      .optional(),
    company: z.string().min(1, 'Company is required').trim().optional(),
    contactName: z.string().min(1, 'Contact name is required').trim().optional(),
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
    phone: z.string().trim().optional(),
    source: z
      .nativeEnum(LeadSource, {
        errorMap: () => ({ message: 'Invalid lead source' }),
      })
      .optional(),
    status: z.nativeEnum(LeadStatus).optional(),
    ownerUserId: z.string().optional().nullable(),
  }),
});

export const getLeadSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Lead ID is required'),
  }),
});

export const deleteLeadSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Lead ID is required'),
  }),
});

export const listLeadsSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    pageSize: z.string().optional().default('25'),
    status: z.nativeEnum(LeadStatus).optional(),
    source: z.nativeEnum(LeadSource).optional(),
    ownerUserId: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'company']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const assignLeadSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Lead ID is required'),
  }),
  body: z.object({
    ownerUserId: z.string().min(1, 'Owner user ID is required'),
  }),
});