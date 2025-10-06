import { Request, Response } from 'express';
import { OrgService } from '../services/org.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/response';
import { UpdateOrgInput } from '../validators/org.validator';

export class OrgController {
  private orgService: OrgService;

  constructor() {
    this.orgService = new OrgService();
  }

  /**
   * Get current organization
   * GET /api/org
   */
  getOrganization = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.user!.orgId;

    const [org, stats] = await Promise.all([
      this.orgService.getOrganization(orgId),
      this.orgService.getOrganizationStats(orgId),
    ]);

    res.json(
      ApiResponse.success(
        {
          ...org.toObject(),
          stats,
        },
        'Organization retrieved successfully'
      )
    );
  });

  /**
   * Update organization
   * PATCH /api/org
   */
  updateOrganization = asyncHandler(async (req: Request, res: Response) => {
    const data: UpdateOrgInput = req.body;
    const orgId = req.user!.orgId;
    const actorUserId = req.user!._id;
    const ip = req.ip;
    const userAgent = req.get('user-agent');

    const org = await this.orgService.updateOrganization(
      orgId,
      data,
      actorUserId,
      ip,
      userAgent
    );

    res.json(
      ApiResponse.success(org, 'Organization updated successfully')
    );
  });
}