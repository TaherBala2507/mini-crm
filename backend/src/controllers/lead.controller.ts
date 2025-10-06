import { Request, Response } from 'express';
import { LeadService } from '../services/lead.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/response';

const leadService = new LeadService();

/**
 * Create a new lead
 * POST /api/leads
 */
export const createLead = asyncHandler(async (req: Request, res: Response) => {
  const lead = await leadService.createLead(
    req.body,
    req.user!.orgId.toString(),
    req.user!._id.toString(),
    req.user!.permissions
  );

  res.status(201).json(ApiResponse.success(lead, 'Lead created successfully'));
});

/**
 * Get lead by ID
 * GET /api/leads/:id
 */
export const getLeadById = asyncHandler(async (req: Request, res: Response) => {
  const lead = await leadService.getLeadById(
    req.params.id,
    req.user!.orgId.toString(),
    req.user!._id.toString(),
    req.user!.permissions
  );

  res.json(ApiResponse.success(lead));
});

/**
 * List leads with filters and pagination
 * GET /api/leads
 */
export const listLeads = asyncHandler(async (req: Request, res: Response) => {
  const query = {
    page: parseInt(req.query.page as string) || 1,
    pageSize: parseInt(req.query.pageSize as string) || 25,
    status: req.query.status as any,
    source: req.query.source as any,
    ownerUserId: req.query.ownerUserId as string,
    search: req.query.search as string,
    sortBy: (req.query.sortBy as string) || 'createdAt',
    sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
  };

  const result = await leadService.listLeads(
    query,
    req.user!.orgId.toString(),
    req.user!._id.toString(),
    req.user!.permissions
  );

  res.json(
    ApiResponse.paginated(
      result.leads,
      result.page,
      result.pageSize,
      result.total,
      result.totalPages
    )
  );
});

/**
 * Update lead
 * PATCH /api/leads/:id
 */
export const updateLead = asyncHandler(async (req: Request, res: Response) => {
  const lead = await leadService.updateLead(
    req.params.id,
    req.body,
    req.user!.orgId.toString(),
    req.user!._id.toString(),
    req.user!.permissions
  );

  res.json(ApiResponse.success(lead, 'Lead updated successfully'));
});

/**
 * Delete lead (soft delete)
 * DELETE /api/leads/:id
 */
export const deleteLead = asyncHandler(async (req: Request, res: Response) => {
  await leadService.deleteLead(
    req.params.id,
    req.user!.orgId.toString(),
    req.user!._id.toString(),
    req.user!.permissions
  );

  res.json(ApiResponse.success(null, 'Lead deleted successfully'));
});

/**
 * Assign lead to a user
 * POST /api/leads/:id/assign
 */
export const assignLead = asyncHandler(async (req: Request, res: Response) => {
  const lead = await leadService.assignLead(
    req.params.id,
    req.body.ownerUserId,
    req.user!.orgId.toString(),
    req.user!._id.toString()
  );

  res.json(ApiResponse.success(lead, 'Lead assigned successfully'));
});