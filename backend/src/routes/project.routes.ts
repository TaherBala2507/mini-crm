import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { validate } from '../middleware/validation';
import { Permission } from '../constants/permissions';
import {
  createProjectSchema,
  updateProjectSchema,
  getProjectSchema,
  deleteProjectSchema,
  listProjectsSchema,
  addMemberSchema,
  removeMemberSchema,
} from '../validators/project.validator';

const router = Router();
const projectController = new ProjectController();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private (PROJECT_CREATE permission)
 */
router.post(
  '/',
  requirePermission(Permission.PROJECT_CREATE),
  validate(createProjectSchema),
  projectController.createProject
);

/**
 * @route   GET /api/projects
 * @desc    List projects with filtering and pagination
 * @access  Private (PROJECT_VIEW permission)
 */
router.get(
  '/',
  requirePermission(Permission.PROJECT_VIEW),
  validate(listProjectsSchema),
  projectController.listProjects
);

/**
 * @route   GET /api/projects/:id
 * @desc    Get project by ID
 * @access  Private (PROJECT_VIEW permission)
 */
router.get(
  '/:id',
  requirePermission(Permission.PROJECT_VIEW),
  validate(getProjectSchema),
  projectController.getProject
);

/**
 * @route   PATCH /api/projects/:id
 * @desc    Update project
 * @access  Private (PROJECT_UPDATE permission)
 */
router.patch(
  '/:id',
  requirePermission(Permission.PROJECT_UPDATE),
  validate(updateProjectSchema),
  projectController.updateProject
);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project (soft delete)
 * @access  Private (PROJECT_DELETE permission)
 */
router.delete(
  '/:id',
  requirePermission(Permission.PROJECT_DELETE),
  validate(deleteProjectSchema),
  projectController.deleteProject
);

/**
 * @route   POST /api/projects/:id/members
 * @desc    Add member to project
 * @access  Private (PROJECT_UPDATE permission)
 */
router.post(
  '/:id/members',
  requirePermission(Permission.PROJECT_UPDATE),
  validate(addMemberSchema),
  projectController.addMember
);

/**
 * @route   DELETE /api/projects/:id/members/:userId
 * @desc    Remove member from project
 * @access  Private (PROJECT_UPDATE permission)
 */
router.delete(
  '/:id/members/:userId',
  requirePermission(Permission.PROJECT_UPDATE),
  validate(removeMemberSchema),
  projectController.removeMember
);

export default router;