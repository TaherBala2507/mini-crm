import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { Permission } from '../constants/permissions';
import { createRoleSchema, updateRoleSchema, listRolesSchema } from '../validators/role.validator';

const router = Router();
const roleController = new RoleController();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/roles
 * @desc    Create a new custom role
 * @access  Private (ROLE_MANAGE permission required)
 */
router.post(
  '/',
  requirePermission(Permission.ROLE_MANAGE),
  validate(createRoleSchema),
  roleController.createRole
);

/**
 * @route   GET /api/roles
 * @desc    List all roles with filters and pagination
 * @access  Private (PERMISSION_VIEW permission required)
 */
router.get(
  '/',
  requirePermission(Permission.PERMISSION_VIEW),
  validate(listRolesSchema),
  roleController.listRoles
);

/**
 * @route   GET /api/roles/permissions
 * @desc    Get all available permissions
 * @access  Private (PERMISSION_VIEW permission required)
 */
router.get(
  '/permissions',
  requirePermission(Permission.PERMISSION_VIEW),
  roleController.getAllPermissions
);

/**
 * @route   GET /api/roles/:id
 * @desc    Get role details by ID
 * @access  Private (PERMISSION_VIEW permission required)
 */
router.get(
  '/:id',
  requirePermission(Permission.PERMISSION_VIEW),
  roleController.getRoleById
);

/**
 * @route   PATCH /api/roles/:id
 * @desc    Update role
 * @access  Private (ROLE_MANAGE permission required)
 */
router.patch(
  '/:id',
  requirePermission(Permission.ROLE_MANAGE),
  validate(updateRoleSchema),
  roleController.updateRole
);

/**
 * @route   DELETE /api/roles/:id
 * @desc    Delete role
 * @access  Private (ROLE_MANAGE permission required)
 */
router.delete(
  '/:id',
  requirePermission(Permission.ROLE_MANAGE),
  roleController.deleteRole
);

export default router;