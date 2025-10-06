import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/response';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  /**
   * Get overview dashboard statistics
   * GET /api/analytics/overview
   */
  getOverview = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.user!.orgId.toString();
    const dateRange = req.query;

    const data = await analyticsService.getOverview(orgId, dateRange);

    res.json(ApiResponse.success(data, 'Overview retrieved successfully'));
  });

  /**
   * Get lead analytics
   * GET /api/analytics/leads
   */
  getLeadAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.user!.orgId.toString();
    const query = req.query;

    const data = await analyticsService.getLeadAnalytics(orgId, query);

    res.json(ApiResponse.success(data, 'Lead analytics retrieved successfully'));
  });

  /**
   * Get project analytics
   * GET /api/analytics/projects
   */
  getProjectAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.user!.orgId.toString();
    const query = req.query;

    const data = await analyticsService.getProjectAnalytics(orgId, query);

    res.json(ApiResponse.success(data, 'Project analytics retrieved successfully'));
  });

  /**
   * Get task analytics
   * GET /api/analytics/tasks
   */
  getTaskAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.user!.orgId.toString();
    const query = req.query;

    const data = await analyticsService.getTaskAnalytics(orgId, query);

    res.json(ApiResponse.success(data, 'Task analytics retrieved successfully'));
  });

  /**
   * Get user activity analytics
   * GET /api/analytics/activity
   */
  getUserActivity = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.user!.orgId.toString();
    const query = req.query;

    const data = await analyticsService.getUserActivity(orgId, query);

    res.json(ApiResponse.success(data, 'User activity retrieved successfully'));
  });
}