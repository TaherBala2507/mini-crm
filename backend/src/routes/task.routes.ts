import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { validate } from '../middleware/validation';
import { Permission } from '../constants/permissions';
import {
  createTaskSchema,
  updateTaskSchema,
  getTaskSchema,
  deleteTaskSchema,
  listTasksSchema,
} from '../validators/task.validator';

const router = Router();
const taskController = new TaskController();

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private (TASK_CREATE permission required)
 */
router.post(
  '/',
  authenticate,
  requirePermission(Permission.TASK_CREATE),
  validate(createTaskSchema),
  taskController.createTask
);

/**
 * @route   GET /api/tasks
 * @desc    List tasks with filters
 * @access  Private (TASK_VIEW permission required)
 */
router.get(
  '/',
  authenticate,
  requirePermission(Permission.TASK_VIEW),
  validate(listTasksSchema),
  taskController.listTasks
);

/**
 * @route   GET /api/tasks/my
 * @desc    Get my assigned tasks
 * @access  Private (TASK_VIEW permission required)
 */
router.get(
  '/my',
  authenticate,
  requirePermission(Permission.TASK_VIEW),
  taskController.getMyTasks
);

/**
 * @route   GET /api/tasks/project/:projectId
 * @desc    Get tasks by project
 * @access  Private (TASK_VIEW permission required)
 */
router.get(
  '/project/:projectId',
  authenticate,
  requirePermission(Permission.TASK_VIEW),
  taskController.getTasksByProject
);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get task by ID
 * @access  Private (TASK_VIEW permission required)
 */
router.get(
  '/:id',
  authenticate,
  requirePermission(Permission.TASK_VIEW),
  validate(getTaskSchema),
  taskController.getTask
);

/**
 * @route   PATCH /api/tasks/:id
 * @desc    Update task
 * @access  Private (TASK_UPDATE permission required)
 */
router.patch(
  '/:id',
  authenticate,
  requirePermission(Permission.TASK_UPDATE),
  validate(updateTaskSchema),
  taskController.updateTask
);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task
 * @access  Private (TASK_DELETE permission required)
 */
router.delete(
  '/:id',
  authenticate,
  requirePermission(Permission.TASK_DELETE),
  validate(deleteTaskSchema),
  taskController.deleteTask
);

export default router;