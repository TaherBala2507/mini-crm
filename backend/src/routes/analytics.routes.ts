import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { validate } from '../middleware/validation';
import { Permission } from '../constants/permissions';
import {
  dateRangeSchema,
  leadAnalyticsSchema,
  projectAnalyticsSchema,
  taskAnalyticsSchema,
  userActivitySchema,
} from '../validators/analytics.validator';

const router = Router();
const analyticsController = new AnalyticsController();

/**
 * @route   GET /api/analytics/overview
 * @desc    Get overview dashboard statistics
 * @access  Private (ANALYTICS_VIEW)
 */
router.get(
  '/overview',
  authenticate,
  requirePermission(Permission.ANALYTICS_VIEW),
  validate(dateRangeSchema),
  analyticsController.getOverview
);

/**
 * @route   GET /api/analytics/leads
 * @desc    Get lead analytics
 * @access  Private (ANALYTICS_VIEW)
 */
router.get(
  '/leads',
  authenticate,
  requirePermission(Permission.ANALYTICS_VIEW),
  validate(leadAnalyticsSchema),
  analyticsController.getLeadAnalytics
);

/**
 * @route   GET /api/analytics/projects
 * @desc    Get project analytics
 * @access  Private (ANALYTICS_VIEW)
 */
router.get(
  '/projects',
  authenticate,
  requirePermission(Permission.ANALYTICS_VIEW),
  validate(projectAnalyticsSchema),
  analyticsController.getProjectAnalytics
);

/**
 * @route   GET /api/analytics/tasks
 * @desc    Get task analytics
 * @access  Private (ANALYTICS_VIEW)
 */
router.get(
  '/tasks',
  authenticate,
  requirePermission(Permission.ANALYTICS_VIEW),
  validate(taskAnalyticsSchema),
  analyticsController.getTaskAnalytics
);

/**
 * @route   GET /api/analytics/activity
 * @desc    Get user activity analytics
 * @access  Private (ANALYTICS_VIEW)
 */
router.get(
  '/activity',
  authenticate,
  requirePermission(Permission.ANALYTICS_VIEW),
  validate(userActivitySchema),
  analyticsController.getUserActivity
);

export default router;