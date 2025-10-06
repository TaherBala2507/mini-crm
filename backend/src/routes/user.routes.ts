import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { validate } from '../middleware/validation';
import { Permission } from '../constants/permissions';
import {
  inviteUserSchema,
  listUsersSchema,
  getUserByIdSchema,
  updateUserSchema,
  deleteUserSchema,
} from '../validators/user.validator';

const router = Router();
const userController = new UserController();

/**
 * @route   POST /api/users/invite
 * @desc    Invite a new user to the organization
 * @access  Private (requires user.invite permission)
 */
router.post(
  '/invite',
  authenticate,
  requirePermission(Permission.USER_INVITE),
  validate(inviteUserSchema),
  userController.inviteUser
);

/**
 * @route   GET /api/users
 * @desc    List users with filters and pagination
 * @access  Private (requires user.view permission)
 */
router.get(
  '/',
  authenticate,
  requirePermission(Permission.USER_VIEW),
  validate(listUsersSchema),
  userController.listUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user details by ID
 * @access  Private (requires user.view permission)
 */
router.get(
  '/:id',
  authenticate,
  requirePermission(Permission.USER_VIEW),
  validate(getUserByIdSchema),
  userController.getUserById
);

/**
 * @route   PATCH /api/users/:id
 * @desc    Update user profile, roles, or status
 * @access  Private (requires user.update permission)
 */
router.patch(
  '/:id',
  authenticate,
  requirePermission(Permission.USER_UPDATE),
  validate(updateUserSchema),
  userController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (soft delete by setting status to INACTIVE)
 * @access  Private (requires user.delete permission)
 */
router.delete(
  '/:id',
  authenticate,
  requirePermission(Permission.USER_DELETE),
  validate(deleteUserSchema),
  userController.deleteUser
);

export default router;