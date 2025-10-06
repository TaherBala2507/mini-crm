import { Router } from 'express';
import {
  createLead,
  getLeadById,
  listLeads,
  updateLead,
  deleteLead,
  assignLead,
} from '../controllers/lead.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { validate } from '../middleware/validation';
import {
  createLeadSchema,
  getLeadSchema,
  listLeadsSchema,
  updateLeadSchema,
  deleteLeadSchema,
  assignLeadSchema,
} from '../validators/lead.validator';
import { PERMISSIONS } from '../constants/permissions';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/leads
 * @desc    Create a new lead
 * @access  Private (lead.create permission)
 */
router.post(
  '/',
  requirePermission(PERMISSIONS.LEAD_CREATE),
  validate(createLeadSchema),
  createLead
);

/**
 * @route   GET /api/leads
 * @desc    List leads with filters and pagination
 * @access  Private (lead.view.all or lead.view.own permission)
 */
router.get(
  '/',
  requirePermission([PERMISSIONS.LEAD_VIEW_ALL, PERMISSIONS.LEAD_VIEW_OWN]),
  validate(listLeadsSchema),
  listLeads
);

/**
 * @route   GET /api/leads/:id
 * @desc    Get lead by ID
 * @access  Private (lead.view.all or lead.view.own permission)
 */
router.get(
  '/:id',
  requirePermission([PERMISSIONS.LEAD_VIEW_ALL, PERMISSIONS.LEAD_VIEW_OWN]),
  validate(getLeadSchema),
  getLeadById
);

/**
 * @route   PATCH /api/leads/:id
 * @desc    Update lead
 * @access  Private (lead.edit.all or lead.edit.own permission)
 */
router.patch(
  '/:id',
  requirePermission([PERMISSIONS.LEAD_EDIT_ALL, PERMISSIONS.LEAD_EDIT_OWN]),
  validate(updateLeadSchema),
  updateLead
);

/**
 * @route   DELETE /api/leads/:id
 * @desc    Delete lead (soft delete)
 * @access  Private (lead.delete.all or lead.delete.own permission)
 */
router.delete(
  '/:id',
  requirePermission([PERMISSIONS.LEAD_DELETE_ALL, PERMISSIONS.LEAD_DELETE_OWN]),
  validate(deleteLeadSchema),
  deleteLead
);

/**
 * @route   POST /api/leads/:id/assign
 * @desc    Assign lead to a user
 * @access  Private (lead.assign permission)
 */
router.post(
  '/:id/assign',
  requirePermission(PERMISSIONS.LEAD_ASSIGN),
  validate(assignLeadSchema),
  assignLead
);

export default router;