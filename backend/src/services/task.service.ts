import { Task, ITask } from '../models/Task';
import { Project } from '../models/Project';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { AppError } from '../utils/errors';
import { CreateTaskInput, UpdateTaskInput, ListTasksQuery } from '../validators/task.validator';
import { TaskStatus, AuditAction, EntityType } from '../constants/enums';

export class TaskService {
  /**
   * Create a new task
   */
  async createTask(
    data: CreateTaskInput,
    userId: string,
    orgId: string
  ): Promise<ITask> {
    // Verify project exists and belongs to organization
    const project = await Project.findOne({
      _id: data.projectId,
      orgId,
      deletedAt: null,
    });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    // Verify assignee exists if provided
    if (data.assigneeUserId) {
      const assignee = await User.findOne({
        _id: data.assigneeUserId,
        orgId,
      });

      if (!assignee) {
        throw new AppError(404, 'Assignee user not found');
      }
    }

    // Create task
    const task = await Task.create({
      ...data,
      orgId,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    });

    // Log audit
    await AuditLog.create({
      orgId,
      userId,
      action: AuditAction.CREATE,
      entityType: EntityType.TASK,
      entityId: task._id,
      metadata: {
        title: task.title,
        projectId: task.projectId,
        status: task.status,
        priority: task.priority,
      },
    });

    // Return populated task
    return await Task.findById(task._id)
      .populate('projectId', 'name status')
      .populate('assigneeUserId', 'name email')
      .exec() as ITask;
  }

  /**
   * List tasks with filters and pagination
   */
  async listTasks(
    query: ListTasksQuery,
    orgId: string
  ): Promise<{ tasks: ITask[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 10,
      projectId,
      status,
      priority,
      assigneeUserId,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Build filter
    const filter: any = {
      orgId,
      deletedAt: null,
    };

    if (projectId) {
      filter.projectId = projectId;
    }

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (assigneeUserId) {
      filter.assigneeUserId = assigneeUserId;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('projectId', 'name status')
        .populate('assigneeUserId', 'name email')
        .exec(),
      Task.countDocuments(filter),
    ]);

    return {
      tasks,
      total,
      page,
      limit,
    };
  }

  /**
   * Get task by ID
   */
  async getTaskById(taskId: string, orgId: string): Promise<ITask> {
    const task = await Task.findOne({
      _id: taskId,
      orgId,
      deletedAt: null,
    })
      .populate('projectId', 'name status client')
      .populate('assigneeUserId', 'name email')
      .exec();

    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    return task;
  }

  /**
   * Update task
   */
  async updateTask(
    taskId: string,
    data: UpdateTaskInput,
    userId: string,
    orgId: string
  ): Promise<ITask> {
    const task = await Task.findOne({
      _id: taskId,
      orgId,
      deletedAt: null,
    });

    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    // Verify assignee exists if provided
    if (data.assigneeUserId !== undefined && data.assigneeUserId !== null) {
      const assignee = await User.findOne({
        _id: data.assigneeUserId,
        orgId,
      });

      if (!assignee) {
        throw new AppError(404, 'Assignee user not found');
      }
    }

    // Track changes for audit
    const changes: any = {};
    if (data.title !== undefined && data.title !== task.title) {
      changes.title = { old: task.title, new: data.title };
    }
    if (data.description !== undefined && data.description !== task.description) {
      changes.description = { old: task.description, new: data.description };
    }
    if (data.status !== undefined && data.status !== task.status) {
      changes.status = { old: task.status, new: data.status };
    }
    if (data.priority !== undefined && data.priority !== task.priority) {
      changes.priority = { old: task.priority, new: data.priority };
    }
    if (data.assigneeUserId !== undefined) {
      const oldAssignee = task.assigneeUserId?.toString();
      const newAssignee = data.assigneeUserId?.toString();
      if (oldAssignee !== newAssignee) {
        changes.assigneeUserId = { old: oldAssignee, new: newAssignee };
      }
    }
    if (data.dueDate !== undefined) {
      const oldDueDate = task.dueDate?.toISOString();
      const newDueDate = data.dueDate ? new Date(data.dueDate).toISOString() : null;
      if (oldDueDate !== newDueDate) {
        changes.dueDate = { old: oldDueDate, new: newDueDate };
      }
    }

    // Update task
    Object.assign(task, {
      ...data,
      dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : task.dueDate,
      assigneeUserId: data.assigneeUserId !== undefined ? (data.assigneeUserId || null) : task.assigneeUserId,
    });

    await task.save();

    // Log audit if there are changes
    if (Object.keys(changes).length > 0) {
      await AuditLog.create({
        orgId,
        userId,
        action: AuditAction.UPDATE,
        entityType: EntityType.TASK,
        entityId: task._id,
        metadata: { changes },
      });
    }

    // Return populated task
    return await Task.findById(task._id)
      .populate('projectId', 'name status')
      .populate('assigneeUserId', 'name email')
      .exec() as ITask;
  }

  /**
   * Delete task (soft delete)
   */
  async deleteTask(taskId: string, userId: string, orgId: string): Promise<void> {
    const task = await Task.findOne({
      _id: taskId,
      orgId,
      deletedAt: null,
    });

    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    // Soft delete
    task.deletedAt = new Date();
    await task.save();

    // Log audit
    await AuditLog.create({
      orgId,
      userId,
      action: AuditAction.DELETE,
      entityType: EntityType.TASK,
      entityId: task._id,
      metadata: {
        title: task.title,
        projectId: task.projectId,
      },
    });
  }

  /**
   * Get tasks by project
   */
  async getTasksByProject(
    projectId: string,
    orgId: string,
    status?: TaskStatus
  ): Promise<ITask[]> {
    // Verify project exists
    const project = await Project.findOne({
      _id: projectId,
      orgId,
      deletedAt: null,
    });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    const filter: any = {
      projectId,
      orgId,
      deletedAt: null,
    };

    if (status) {
      filter.status = status;
    }

    return await Task.find(filter)
      .sort({ createdAt: -1 })
      .populate('assigneeUserId', 'name email')
      .exec();
  }

  /**
   * Get tasks assigned to user
   */
  async getMyTasks(
    userId: string,
    orgId: string,
    status?: TaskStatus
  ): Promise<ITask[]> {
    const filter: any = {
      assigneeUserId: userId,
      orgId,
      deletedAt: null,
    };

    if (status) {
      filter.status = status;
    }

    return await Task.find(filter)
      .sort({ dueDate: 1, priority: -1 })
      .populate('projectId', 'name status')
      .exec();
  }
}