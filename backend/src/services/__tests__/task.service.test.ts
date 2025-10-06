import '../../tests/setup';
import { TaskService } from '../task.service';
import { Organization } from '../../models/Organization';
import { User } from '../../models/User';
import { Project } from '../../models/Project';
import { Task } from '../../models/Task';
import { AuditLog } from '../../models/AuditLog';
import { TaskStatus, TaskPriority, ProjectStatus, UserStatus } from '../../constants/enums';
import mongoose from 'mongoose';

describe('TaskService', () => {
  let taskService: TaskService;
  let testOrgId: mongoose.Types.ObjectId;
  let testUserId: mongoose.Types.ObjectId;
  let testUser2Id: mongoose.Types.ObjectId;
  let testProjectId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    taskService = new TaskService();
    testOrgId = new mongoose.Types.ObjectId();
    testUserId = new mongoose.Types.ObjectId();
    testUser2Id = new mongoose.Types.ObjectId();
    testProjectId = new mongoose.Types.ObjectId();

    // Create test organization
    await Organization.create({
      _id: testOrgId,
      name: 'Test Org',
      domain: 'test-org',
    });

    // Create test users
    await User.create({
      _id: testUserId,
      orgId: testOrgId,
      name: 'Test User',
      email: 'test@test.com',
      passwordHash: 'Password123!',
      status: UserStatus.ACTIVE,
      roleIds: [],
      isEmailVerified: true,
    });

    await User.create({
      _id: testUser2Id,
      orgId: testOrgId,
      name: 'Test User 2',
      email: 'test2@test.com',
      passwordHash: 'Password123!',
      status: UserStatus.ACTIVE,
      roleIds: [],
      isEmailVerified: true,
    });

    // Create test project
    await Project.create({
      _id: testProjectId,
      orgId: testOrgId,
      name: 'Test Project',
      description: 'Test project description',
      status: ProjectStatus.ACTIVE,
      managerUserId: testUserId,
      members: [],
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const taskData = {
        projectId: testProjectId.toString(),
        title: 'Test Task',
        description: 'Test task description',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        assigneeUserId: testUserId.toString(),
        dueDate: new Date('2025-12-31').toISOString(),
      };

      const result = await taskService.createTask(
        taskData,
        testUserId.toString(),
        testOrgId.toString()
      );

      expect(result.title).toBe(taskData.title);
      expect(result.description).toBe(taskData.description);
      expect(result.status).toBe(taskData.status);
      expect(result.priority).toBe(taskData.priority);
      expect(result.projectId).toBeDefined();
      expect(result.assigneeUserId).toBeDefined();

      // Verify audit log was created
      const auditLog = await AuditLog.findOne({
        action: 'task.created',
      });
      expect(auditLog).toBeDefined();
    });

    it('should create a task without assignee', async () => {
      const taskData = {
        projectId: testProjectId.toString(),
        title: 'Unassigned Task',
        description: 'Task without assignee',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
      };

      const result = await taskService.createTask(
        taskData,
        testUserId.toString(),
        testOrgId.toString()
      );

      expect(result.title).toBe(taskData.title);
      expect(result.assigneeUserId).toBeUndefined();
    });

    it('should throw error if project not found', async () => {
      const taskData = {
        projectId: new mongoose.Types.ObjectId().toString(),
        title: 'Test Task',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
      };

      await expect(
        taskService.createTask(taskData, testUserId.toString(), testOrgId.toString())
      ).rejects.toThrow('Project not found');
    });

    it('should throw error if assignee not found', async () => {
      const taskData = {
        projectId: testProjectId.toString(),
        title: 'Test Task',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        assigneeUserId: new mongoose.Types.ObjectId().toString(),
      };

      await expect(
        taskService.createTask(taskData, testUserId.toString(), testOrgId.toString())
      ).rejects.toThrow('Assignee user not found');
    });
  });

  describe('listTasks', () => {
    beforeEach(async () => {
      // Create multiple tasks with different timestamps
      const now = new Date();
      await Task.create([
        {
          orgId: testOrgId,
          projectId: testProjectId,
          title: 'Task 1',
          description: 'Description 1',
          status: TaskStatus.TODO,
          priority: TaskPriority.HIGH,
          assigneeUserId: testUserId,
          createdAt: new Date(now.getTime() - 2000), // 2 seconds ago
        },
        {
          orgId: testOrgId,
          projectId: testProjectId,
          title: 'Task 2',
          description: 'Description 2',
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.MEDIUM,
          assigneeUserId: testUser2Id,
          createdAt: new Date(now.getTime() - 1000), // 1 second ago
        },
        {
          orgId: testOrgId,
          projectId: testProjectId,
          title: 'Task 3',
          description: 'Description 3',
          status: TaskStatus.DONE,
          priority: TaskPriority.LOW,
          assigneeUserId: testUserId,
          createdAt: now, // now
        },
      ]);
    });

    it('should list all tasks with pagination', async () => {
      const result = await taskService.listTasks(
        { page: 1, limit: 10 },
        testOrgId.toString()
      );

      expect(result.tasks).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter tasks by status', async () => {
      const result = await taskService.listTasks(
        { page: 1, limit: 10, status: TaskStatus.TODO },
        testOrgId.toString()
      );

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].status).toBe(TaskStatus.TODO);
    });

    it('should filter tasks by priority', async () => {
      const result = await taskService.listTasks(
        { page: 1, limit: 10, priority: TaskPriority.HIGH },
        testOrgId.toString()
      );

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].priority).toBe(TaskPriority.HIGH);
    });

    it('should filter tasks by assignee', async () => {
      const result = await taskService.listTasks(
        { page: 1, limit: 10, assigneeUserId: testUserId.toString() },
        testOrgId.toString()
      );

      expect(result.tasks).toHaveLength(2);
    });

    it('should filter tasks by project', async () => {
      const result = await taskService.listTasks(
        { page: 1, limit: 10, projectId: testProjectId.toString() },
        testOrgId.toString()
      );

      expect(result.tasks).toHaveLength(3);
    });

    it('should sort tasks by createdAt ascending', async () => {
      const result = await taskService.listTasks(
        { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'asc' },
        testOrgId.toString()
      );

      expect(result.tasks).toHaveLength(3);
      // First task should be the oldest one
      expect(result.tasks[0].title).toBe('Task 1');
      expect(result.tasks[2].title).toBe('Task 3');
    });

    it('should handle pagination correctly', async () => {
      const result = await taskService.listTasks(
        { page: 2, limit: 2 },
        testOrgId.toString()
      );

      expect(result.tasks).toHaveLength(1);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(2);
    });
  });

  describe('getTaskById', () => {
    let taskId: mongoose.Types.ObjectId;

    beforeEach(async () => {
      const task = await Task.create({
        orgId: testOrgId,
        projectId: testProjectId,
        title: 'Test Task',
        description: 'Test description',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        assigneeUserId: testUserId,
      });
      taskId = task._id as mongoose.Types.ObjectId;
    });

    it('should get task by id', async () => {
      const result = await taskService.getTaskById(
        taskId.toString(),
        testOrgId.toString()
      );

      expect(result._id.toString()).toBe(taskId.toString());
      expect(result.title).toBe('Test Task');
    });

    it('should throw error if task not found', async () => {
      await expect(
        taskService.getTaskById(
          new mongoose.Types.ObjectId().toString(),
          testOrgId.toString()
        )
      ).rejects.toThrow('Task not found');
    });

    it('should not return deleted tasks', async () => {
      await Task.findByIdAndUpdate(taskId, { deletedAt: new Date() });

      await expect(
        taskService.getTaskById(taskId.toString(), testOrgId.toString())
      ).rejects.toThrow('Task not found');
    });
  });

  describe('updateTask', () => {
    let taskId: mongoose.Types.ObjectId;

    beforeEach(async () => {
      const task = await Task.create({
        orgId: testOrgId,
        projectId: testProjectId,
        title: 'Original Title',
        description: 'Original description',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        assigneeUserId: testUserId,
      });
      taskId = task._id as mongoose.Types.ObjectId;
    });

    it('should update task title', async () => {
      const result = await taskService.updateTask(
        taskId.toString(),
        { title: 'Updated Title' },
        testUserId.toString(),
        testOrgId.toString()
      );

      expect(result.title).toBe('Updated Title');

      // Verify audit log
      const auditLog = await AuditLog.findOne({
        action: 'task.updated',
      });
      expect(auditLog).toBeDefined();
    });

    it('should update task status', async () => {
      const result = await taskService.updateTask(
        taskId.toString(),
        { status: TaskStatus.IN_PROGRESS },
        testUserId.toString(),
        testOrgId.toString()
      );

      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it('should update task priority', async () => {
      const result = await taskService.updateTask(
        taskId.toString(),
        { priority: TaskPriority.HIGH },
        testUserId.toString(),
        testOrgId.toString()
      );

      expect(result.priority).toBe(TaskPriority.HIGH);
    });

    it('should update task assignee', async () => {
      const result = await taskService.updateTask(
        taskId.toString(),
        { assigneeUserId: testUser2Id.toString() },
        testUserId.toString(),
        testOrgId.toString()
      );

      // assigneeUserId is populated, so we need to access _id
      const assigneeId = (result.assigneeUserId as any)?._id?.toString() || result.assigneeUserId?.toString();
      expect(assigneeId).toBe(testUser2Id.toString());
    });

    it('should update task due date', async () => {
      const newDueDate = new Date('2025-12-31').toISOString();
      const result = await taskService.updateTask(
        taskId.toString(),
        { dueDate: newDueDate },
        testUserId.toString(),
        testOrgId.toString()
      );

      expect(result.dueDate).toBeDefined();
    });

    it('should throw error if task not found', async () => {
      await expect(
        taskService.updateTask(
          new mongoose.Types.ObjectId().toString(),
          { title: 'Updated' },
          testUserId.toString(),
          testOrgId.toString()
        )
      ).rejects.toThrow('Task not found');
    });

    it('should throw error if assignee not found', async () => {
      await expect(
        taskService.updateTask(
          taskId.toString(),
          { assigneeUserId: new mongoose.Types.ObjectId().toString() },
          testUserId.toString(),
          testOrgId.toString()
        )
      ).rejects.toThrow('Assignee user not found');
    });

    it('should not create audit log if no changes', async () => {
      await taskService.updateTask(
        taskId.toString(),
        {},
        testUserId.toString(),
        testOrgId.toString()
      );

      const auditLogs = await AuditLog.find({
        action: 'task.updated',
        resourceId: taskId,
      });
      expect(auditLogs).toHaveLength(0);
    });
  });

  describe('deleteTask', () => {
    let taskId: mongoose.Types.ObjectId;

    beforeEach(async () => {
      const task = await Task.create({
        orgId: testOrgId,
        projectId: testProjectId,
        title: 'Task to Delete',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
      });
      taskId = task._id as mongoose.Types.ObjectId;
    });

    it('should soft delete task', async () => {
      await taskService.deleteTask(
        taskId.toString(),
        testUserId.toString(),
        testOrgId.toString()
      );

      const task = await Task.findById(taskId);
      expect(task?.deletedAt).toBeDefined();

      // Verify audit log
      const auditLog = await AuditLog.findOne({
        action: 'task.deleted',
      });
      expect(auditLog).toBeDefined();
    });

    it('should throw error if task not found', async () => {
      await expect(
        taskService.deleteTask(
          new mongoose.Types.ObjectId().toString(),
          testUserId.toString(),
          testOrgId.toString()
        )
      ).rejects.toThrow('Task not found');
    });

    it('should not delete already deleted task', async () => {
      await Task.findByIdAndUpdate(taskId, { deletedAt: new Date() });

      await expect(
        taskService.deleteTask(
          taskId.toString(),
          testUserId.toString(),
          testOrgId.toString()
        )
      ).rejects.toThrow('Task not found');
    });
  });

  describe('getTasksByProject', () => {
    beforeEach(async () => {
      await Task.create([
        {
          orgId: testOrgId,
          projectId: testProjectId,
          title: 'Task 1',
          status: TaskStatus.TODO,
          priority: TaskPriority.HIGH,
        },
        {
          orgId: testOrgId,
          projectId: testProjectId,
          title: 'Task 2',
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.MEDIUM,
        },
        {
          orgId: testOrgId,
          projectId: testProjectId,
          title: 'Task 3',
          status: TaskStatus.DONE,
          priority: TaskPriority.LOW,
        },
      ]);
    });

    it('should get all tasks for a project', async () => {
      const result = await taskService.getTasksByProject(
        testProjectId.toString(),
        testOrgId.toString()
      );

      expect(result).toHaveLength(3);
    });

    it('should filter tasks by status', async () => {
      const result = await taskService.getTasksByProject(
        testProjectId.toString(),
        testOrgId.toString(),
        TaskStatus.TODO
      );

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(TaskStatus.TODO);
    });

    it('should throw error if project not found', async () => {
      await expect(
        taskService.getTasksByProject(
          new mongoose.Types.ObjectId().toString(),
          testOrgId.toString()
        )
      ).rejects.toThrow('Project not found');
    });
  });

  describe('getMyTasks', () => {
    beforeEach(async () => {
      await Task.create([
        {
          orgId: testOrgId,
          projectId: testProjectId,
          title: 'My Task 1',
          status: TaskStatus.TODO,
          priority: TaskPriority.HIGH,
          assigneeUserId: testUserId,
          dueDate: new Date('2025-01-01'),
        },
        {
          orgId: testOrgId,
          projectId: testProjectId,
          title: 'My Task 2',
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.MEDIUM,
          assigneeUserId: testUserId,
          dueDate: new Date('2025-02-01'),
        },
        {
          orgId: testOrgId,
          projectId: testProjectId,
          title: 'Other Task',
          status: TaskStatus.TODO,
          priority: TaskPriority.LOW,
          assigneeUserId: testUser2Id,
        },
      ]);
    });

    it('should get all tasks assigned to user', async () => {
      const result = await taskService.getMyTasks(
        testUserId.toString(),
        testOrgId.toString()
      );

      expect(result).toHaveLength(2);
      expect(result[0].assigneeUserId?.toString()).toBe(testUserId.toString());
    });

    it('should filter by status', async () => {
      const result = await taskService.getMyTasks(
        testUserId.toString(),
        testOrgId.toString(),
        TaskStatus.TODO
      );

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(TaskStatus.TODO);
    });

    it('should sort by due date and priority', async () => {
      const result = await taskService.getMyTasks(
        testUserId.toString(),
        testOrgId.toString()
      );

      expect(result).toHaveLength(2);
      // Should be sorted by dueDate ascending, then priority descending
      expect(result[0].title).toBe('My Task 1');
    });
  });
});