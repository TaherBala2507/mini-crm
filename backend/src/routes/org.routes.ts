import { Router } from 'express';
import { OrgController } from '../controllers/org.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { validate } from '../middleware/validation';
import { Permission } from '../constants/permissions';
import { updateOrgSchema } from '../validators/org.validator';

const router = Router();
const orgController = new OrgController();

/**
 * @route   GET /api/org
 * @desc    Get current organization profile with statistics
 * @access  Private (requires org.view permission)
 */
router.get(
  '/',
  authenticate,
  requirePermission(Permission.ORG_VIEW),
  orgController.getOrganization
);

/**
 * @route   PATCH /api/org
 * @desc    Update organization settings
 * @access  Private (requires org.manage permission - SuperAdmin/Admin only)
 */
router.patch(
  '/',
  authenticate,
  requirePermission(Permission.ORG_MANAGE),
  validate(updateOrgSchema),
  orgController.updateOrganization
);

export default router;