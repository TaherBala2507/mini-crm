import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/response';

const taskService = new TaskService();

export class TaskController {
  /**
   * Create a new task
   * POST /api/tasks
   */
  createTask = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const orgId = req.user!.orgId.toString();

    const task = await taskService.createTask(req.body, userId, orgId);

    res.status(201).json(ApiResponse.success(task, 'Task created successfully'));
  });

  /**
   * List tasks with filters
   * GET /api/tasks
   */
  listTasks = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.user!.orgId.toString();

    const result = await taskService.listTasks(req.query, orgId);
    
    // Transform to match frontend expected format
    const totalPages = Math.ceil(result.total / result.limit);
    const response = {
      items: result.tasks,
      total: result.total,
      page: result.page,
      pageSize: result.limit,
      totalPages,
    };

    res.json(ApiResponse.success(response));
  });

  /**
   * Get task by ID
   * GET /api/tasks/:id
   */
  getTask = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.user!.orgId.toString();
    const { id } = req.params;

    const task = await taskService.getTaskById(id, orgId);

    res.json(ApiResponse.success(task));
  });

  /**
   * Update task
   * PATCH /api/tasks/:id
   */
  updateTask = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const orgId = req.user!.orgId.toString();
    const { id } = req.params;

    const task = await taskService.updateTask(id, req.body, userId, orgId);

    res.json(ApiResponse.success(task, 'Task updated successfully'));
  });

  /**
   * Delete task
   * DELETE /api/tasks/:id
   */
  deleteTask = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const orgId = req.user!.orgId.toString();
    const { id } = req.params;

    await taskService.deleteTask(id, userId, orgId);

    res.json(ApiResponse.success(null, 'Task deleted successfully'));
  });

  /**
   * Get tasks by project
   * GET /api/tasks/project/:projectId
   */
  getTasksByProject = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.user!.orgId.toString();
    const { projectId } = req.params;
    const { status } = req.query;

    const tasks = await taskService.getTasksByProject(
      projectId,
      orgId,
      status as any
    );

    // Transform to match frontend expected format
    const response = {
      items: tasks,
      total: tasks.length,
      page: 1,
      pageSize: tasks.length,
      totalPages: 1,
    };

    res.json(ApiResponse.success(response));
  });

  /**
   * Get my assigned tasks
   * GET /api/tasks/my
   */
  getMyTasks = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const orgId = req.user!.orgId.toString();
    const { status } = req.query;

    const tasks = await taskService.getMyTasks(userId, orgId, status as any);

    // Transform to match frontend expected format
    const response = {
      items: tasks,
      total: tasks.length,
      page: 1,
      pageSize: tasks.length,
      totalPages: 1,
    };

    res.json(ApiResponse.success(response));
  });
}