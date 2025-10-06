import '../../tests/setup';
import { AnalyticsService } from '../analytics.service';
import { Organization } from '../../models/Organization';
import { User } from '../../models/User';
import { Lead } from '../../models/Lead';
import { Project } from '../../models/Project';
import { Task } from '../../models/Task';
import { AuditLog } from '../../models/AuditLog';
import { 
  LeadStatus, 
  LeadSource,
  ProjectStatus, 
  TaskStatus, 
  TaskPriority, 
  UserStatus,
  AuditAction,
  EntityType 
} from '../../constants/enums';
import mongoose from 'mongoose';

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;
  let testOrgId: mongoose.Types.ObjectId;
  let testUserId: mongoose.Types.ObjectId;
  let testUser2Id: mongoose.Types.ObjectId;
  let testProjectId: mongoose.Types.ObjectId;
  let testLeadId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    analyticsService = new AnalyticsService();
    testOrgId = new mongoose.Types.ObjectId();
    testUserId = new mongoose.Types.ObjectId();
    testUser2Id = new mongoose.Types.ObjectId();
    testProjectId = new mongoose.Types.ObjectId();
    testLeadId = new mongoose.Types.ObjectId();

    // Create test organization
    await Organization.create({
      _id: testOrgId,
      name: 'Test Org',
      domain: 'test-analytics-org',
    });

    // Create test users
    await User.create({
      _id: testUserId,
      orgId: testOrgId,
      name: 'Test User',
      email: 'analytics@test.com',
      passwordHash: 'Password123!',
      status: UserStatus.ACTIVE,
      roleIds: [],
      isEmailVerified: true,
    });

    await User.create({
      _id: testUser2Id,
      orgId: testOrgId,
      name: 'Test User 2',
      email: 'analytics2@test.com',
      passwordHash: 'Password123!',
      status: UserStatus.ACTIVE,
      roleIds: [],
      isEmailVerified: true,
    });
  });

  describe('getOverview', () => {
    it('should return overview dashboard statistics', async () => {
      // Create test data
      await Lead.create([
        {
          orgId: testOrgId,
          title: 'Lead 1',
          company: 'Company 1',
          contactName: 'Contact 1',
          email: 'lead1@test.com',
          source: LeadSource.WEBSITE,
          status: LeadStatus.NEW,
          ownerUserId: testUserId,
        },
        {
          orgId: testOrgId,
          title: 'Lead 2',
          company: 'Company 2',
          contactName: 'Contact 2',
          email: 'lead2@test.com',
          source: LeadSource.REFERRAL,
          status: 'won',
          ownerUserId: testUserId,
        },
      ]);

      await Project.create([
        {
          _id: testProjectId,
          orgId: testOrgId,
          name: 'Project 1',
          status: ProjectStatus.ACTIVE,
          managerUserId: testUserId,
          members: [],
        },
        {
          orgId: testOrgId,
          name: 'Project 2',
          status: ProjectStatus.COMPLETED,
          managerUserId: testUserId,
          members: [],
        },
      ]);

      await Task.create([
        {
          orgId: testOrgId,
          projectId: testProjectId,
          title: 'Task 1',
          status: TaskStatus.TODO,
          priority: TaskPriority.HIGH,
          assigneeUserId: testUserId,
        },
        {
          orgId: testOrgId,
          projectId: testProjectId,
          title: 'Task 2',
          status: TaskStatus.DONE,
          priority: TaskPriority.MEDIUM,
          assigneeUserId: testUserId,
        },
        {
          orgId: testOrgId,
          projectId: testProjectId,
          title: 'Task 3',
          status: TaskStatus.TODO,
          priority: TaskPriority.LOW,
          assigneeUserId: testUserId,
          dueDate: new Date('2020-01-01'), // Overdue
        },
      ]);

      await AuditLog.create([
        {
          orgId: testOrgId,
          actorUserId: testUserId,
          action: AuditAction.CREATE,
          entityType: EntityType.LEAD,
          entityId: testLeadId,
        },
      ]);

      const result = await analyticsService.getOverview(testOrgId.toString());

      expect(result.summary).toBeDefined();
      expect(result.summary.totalLeads).toBe(2);
      expect(result.summary.totalProjects).toBe(2);
      expect(result.summary.totalTasks).toBe(3);
      expect(result.summary.activeProjects).toBe(1);
      expect(result.summary.completedProjects).toBe(1);
      expect(result.summary.openTasks).toBe(2);
      expect(result.summary.completedTasks).toBe(1);
      expect(result.summary.overdueTasks).toBe(1);
      expect(result.summary.conversionRate).toBe(50); // 1 won out of 2
      expect(result.summary.taskCompletionRate).toBe(33.33); // 1 done out of 3

      expect(result.breakdowns).toBeDefined();
      expect(result.breakdowns.leadsByStatus).toBeDefined();
      expect(result.breakdowns.tasksByPriority).toBeDefined();
      expect(result.recentActivity).toBeDefined();
      expect(result.recentActivity.length).toBe(1);
    });

    it('should filter by date range', async () => {
      const oldDate = new Date('2020-01-01');
      const newDate = new Date();

      await Lead.create([
        {
          orgId: testOrgId,
          title: 'Old Lead',
          company: 'Old Company',
          contactName: 'Old Contact',
          email: 'old@test.com',
          source: LeadSource.WEBSITE,
          status: LeadStatus.NEW,
          ownerUserId: testUserId,
          createdAt: oldDate,
        },
        {
          orgId: testOrgId,
          title: 'New Lead',
          company: 'New Company',
          contactName: 'New Contact',
          email: 'new@test.com',
          source: LeadSource.WEBSITE,
          status: LeadStatus.NEW,
          ownerUserId: testUserId,
          createdAt: newDate,
        },
      ]);

      const result = await analyticsService.getOverview(testOrgId.toString(), {
        startDate: '2021-01-01',
      });

      expect(result.summary.totalLeads).toBe(1);
    });

    it('should handle empty data gracefully', async () => {
      const result = await analyticsService.getOverview(testOrgId.toString());

      expect(result.summary.totalLeads).toBe(0);
      expect(result.summary.totalProjects).toBe(0);
      expect(result.summary.totalTasks).toBe(0);
      expect(result.summary.conversionRate).toBe(0);
      expect(result.summary.taskCompletionRate).toBe(0);
      expect(result.breakdowns.leadsByStatus).toBeDefined();
      expect(result.breakdowns.tasksByPriority).toBeDefined();
      expect(result.recentActivity).toEqual([]);
    });

    it('should exclude soft-deleted records', async () => {
      await Lead.create([
        {
          orgId: testOrgId,
          title: 'Active Lead',
          company: 'Active Company',
          contactName: 'Active Contact',
          email: 'active@test.com',
          source: LeadSource.WEBSITE,
          status: LeadStatus.NEW,
          ownerUserId: testUserId,
        },
        {
          orgId: testOrgId,
          title: 'Deleted Lead',
          company: 'Deleted Company',
          contactName: 'Deleted Contact',
          email: 'deleted@test.com',
          source: LeadSource.WEBSITE,
          status: LeadStatus.NEW,
          ownerUserId: testUserId,
          deletedAt: new Date(),
        },
      ]);

      const result = await analyticsService.getOverview(testOrgId.toString());

      expect(result.summary.totalLeads).toBe(1);
    });
  });

  describe('getLeadAnalytics', () => {
    it('should return lead analytics with breakdowns', async () => {
      await Lead.create([
        {
          orgId: testOrgId,
          title: 'Lead 1',
          company: 'Company 1',
          contactName: 'Contact 1',
          email: 'lead1@test.com',
          status: LeadStatus.NEW,
          source: LeadSource.WEBSITE,
          ownerUserId: testUserId,
        },
        {
          orgId: testOrgId,
          title: 'Lead 2',
          company: 'Company 2',
          contactName: 'Contact 2',
          email: 'lead2@test.com',
          status: 'won',
          source: LeadSource.REFERRAL,
          ownerUserId: testUserId,
        },
        {
          orgId: testOrgId,
          title: 'Lead 3',
          company: 'Company 3',
          contactName: 'Contact 3',
          email: 'lead3@test.com',
          status: LeadStatus.QUALIFIED,
          source: LeadSource.WEBSITE,
          ownerUserId: testUser2Id,
        },
      ]);

      const result = await analyticsService.getLeadAnalytics(testOrgId.toString(), {});

      expect(result.summary.totalLeads).toBe(3);
      expect(result.summary.convertedLeads).toBe(1);
      expect(result.summary.conversionRate).toBe(33.33);

      expect(result.breakdowns.byStatus).toBeDefined();
      expect(result.breakdowns.byStatus.length).toBeGreaterThan(0);
      
      expect(result.breakdowns.bySource).toBeDefined();
      expect(result.breakdowns.bySource.length).toBe(2);
      
      expect(result.topOwners).toBeDefined();
      expect(result.topOwners.length).toBe(2);
      expect(result.topOwners[0].leadCount).toBe(2);

      expect(result.trend).toBeDefined();
    });

    it('should filter leads by date range', async () => {
      const oldDate = new Date('2020-01-01');
      const newDate = new Date();

      await Lead.create([
        {
          orgId: testOrgId,
          title: 'Old Lead',
          company: 'Old Company',
          contactName: 'Old Contact',
          email: 'old@test.com',
          source: LeadSource.WEBSITE,
          status: LeadStatus.NEW,
          ownerUserId: testUserId,
          createdAt: oldDate,
        },
        {
          orgId: testOrgId,
          title: 'New Lead',
          company: 'New Company',
          contactName: 'New Contact',
          email: 'new@test.com',
          source: LeadSource.WEBSITE,
          status: LeadStatus.NEW,
          ownerUserId: testUserId,
          createdAt: newDate,
        },
      ]);

      const result = await analyticsService.getLeadAnalytics(testOrgId.toString(), {
        startDate: '2021-01-01',
      });

      expect(result.summary.totalLeads).toBe(1);
    });

    it('should return lead creation trend for last 30 days', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      await Lead.create([
        {
          orgId: testOrgId,
          title: 'Today Lead',
          company: 'Today Company',
          contactName: 'Today Contact',
          email: 'today@test.com',
          source: LeadSource.WEBSITE,
          status: LeadStatus.NEW,
          ownerUserId: testUserId,
          createdAt: today,
        },
        {
          orgId: testOrgId,
          title: 'Yesterday Lead',
          company: 'Yesterday Company',
          contactName: 'Yesterday Contact',
          email: 'yesterday@test.com',
          source: LeadSource.WEBSITE,
          status: LeadStatus.NEW,
          ownerUserId: testUserId,
          createdAt: yesterday,
        },
      ]);

      const result = await analyticsService.getLeadAnalytics(testOrgId.toString(), {});

      expect(result.trend).toBeDefined();
      expect(result.trend.length).toBeGreaterThan(0);
    });

    it('should handle leads without owners', async () => {
      await Lead.create([
        {
          orgId: testOrgId,
          title: 'No Owner Lead',
          company: 'No Owner Company',
          contactName: 'No Owner Contact',
          email: 'noowner@test.com',
          source: LeadSource.WEBSITE,
          status: LeadStatus.NEW,
        },
      ]);

      const result = await analyticsService.getLeadAnalytics(testOrgId.toString(), {});

      expect(result.summary.totalLeads).toBe(1);
      expect(result.topOwners.length).toBe(0);
    });
  });

  describe('getProjectAnalytics', () => {
    it('should return project analytics with budget stats', async () => {
      await Project.create([
        {
          orgId: testOrgId,
          name: 'Project 1',
          status: ProjectStatus.ACTIVE,
          managerUserId: testUserId,
          budget: 10000,
          members: [],
        },
        {
          orgId: testOrgId,
          name: 'Project 2',
          status: ProjectStatus.COMPLETED,
          managerUserId: testUserId,
          budget: 20000,
          members: [],
        },
        {
          orgId: testOrgId,
          name: 'Project 3',
          status: ProjectStatus.ACTIVE,
          managerUserId: testUser2Id,
          budget: 15000,
          members: [],
        },
      ]);

      const result = await analyticsService.getProjectAnalytics(testOrgId.toString(), {});

      expect(result.summary.totalProjects).toBe(3);
      expect(result.summary.totalBudget).toBe(45000);
      expect(result.summary.avgBudget).toBe(15000);

      expect(result.breakdowns.byStatus).toBeDefined();
      expect(result.breakdowns.byStatus.length).toBeGreaterThan(0);

      expect(result.topManagers).toBeDefined();
      expect(result.topManagers.length).toBe(2);
      expect(result.topManagers[0].projectCount).toBe(2);

      expect(result.budgetStats).toBeDefined();
      expect(result.budgetStats.minBudget).toBe(10000);
      expect(result.budgetStats.maxBudget).toBe(20000);
    });

    it('should count overdue projects', async () => {
      await Project.create([
        {
          orgId: testOrgId,
          name: 'Overdue Project',
          status: ProjectStatus.ACTIVE,
          managerUserId: testUserId,
          endDate: new Date('2020-01-01'),
          members: [],
        },
        {
          orgId: testOrgId,
          name: 'On Time Project',
          status: ProjectStatus.ACTIVE,
          managerUserId: testUserId,
          endDate: new Date('2030-01-01'),
          members: [],
        },
      ]);

      const result = await analyticsService.getProjectAnalytics(testOrgId.toString(), {});

      expect(result.summary.overdueProjects).toBe(1);
    });

    it('should handle projects without budget', async () => {
      await Project.create([
        {
          orgId: testOrgId,
          name: 'No Budget Project',
          status: ProjectStatus.ACTIVE,
          managerUserId: testUserId,
          members: [],
        },
      ]);

      const result = await analyticsService.getProjectAnalytics(testOrgId.toString(), {});

      expect(result.summary.totalProjects).toBe(1);
      expect(result.summary.totalBudget).toBe(0);
      expect(result.summary.avgBudget).toBe(0);
    });

    it('should filter projects by date range', async () => {
      const oldDate = new Date('2020-01-01');
      const newDate = new Date();

      await Project.create([
        {
          orgId: testOrgId,
          name: 'Old Project',
          status: ProjectStatus.ACTIVE,
          managerUserId: testUserId,
          createdAt: oldDate,
          members: [],
        },
        {
          orgId: testOrgId,
          name: 'New Project',
          status: ProjectStatus.ACTIVE,
          managerUserId: testUserId,
          createdAt: newDate,
          members: [],
        },
      ]);

      const result = await analyticsService.getProjectAnalytics(testOrgId.toString(), {
        startDate: '2021-01-01',
      });

      expect(result.summary.totalProjects).toBe(1);
    });
  });

  describe('getTaskAnalytics', () => {
    beforeEach(async () => {
      await Project.create({
        _id: testProjectId,
        orgId: testOrgId,
        name: 'Test Project',
        status: ProjectStatus.ACTIVE,
        managerUserId: testUserId,
        members: [],
      });
    });

    it('should return task analytics with breakdowns', async () => {
      await Task.create([
        {
          orgId: testOrgId,
          projectId: testProjectId,
          title: 'Task 1',
          status: TaskStatus.TODO,
          priority: TaskPriority.HIGH,
          assigneeUserId: testUserId,
        },
        {
          orgId: testOrgId,
          projectId: testProjectId,
          title: 'Task 2',
          status: TaskStatus.DONE,
          priority: TaskPriority.MEDIUM,
          assigneeUserId: testUserId,
        },
        {
          orgId: testOrgId,
          projectId: testProjectId,
          title: 'Task 3',
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.LOW,
          assigneeUserId: testUser2Id,
        },
      ]);

      const result = await analyticsService.getTaskAnalytics(testOrgId.toString(), {});

      expect(result.summary.totalTasks).toBe(3);
      expect(result.summary.completedTasks).toBe(1);
      expect(result.summary.completionRate).toBe(33.33);

      expect(result.breakdowns.byStatus).toBeDefined();
      expect(result.breakdowns.byStatus.length).toBeGreaterThan(0);

      expect(result.breakdowns.byPriority).toBeDefined();
      expect(result.breakdowns.byPriority.length).toBeGreaterThan(0);

      expect(result.topAssignees).toBeDefined();
      expect(result.topAssignees.length).toBe(2);
      expect(result.topAssignees[0].taskCount).toBe(2);

      expect(result.tasksByProject).toBeDefined();
      expect(result.tasksByProject.length).toBe(1);
      expect(result.tasksByProject[0].taskCount).toBe(3);
    });

    it('should count overdue tasks', async () => {
      await Task.create([
        {
          orgId: testOrgId,
          projectId: testProjectId,
          title: 'Overdue Task',
          status: TaskStatus.TODO,
          priority: TaskPriority.HIGH,
          assigneeUserId: testUserId,
          dueDate: new Date('2020-01-01'),
        },
        {
          orgId: testOrgId,
          projectId: testProjectId,
          title: 'On Time Task',
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          assigneeUserId: testUserId,
          dueDate: new Date('2030-01-01'),
        },
      ]);

      const result = await analyticsService.getTaskAnalytics(testOrgId.toString(), {});

      expect(result.summary.overdueTasks).toBe(1);
    });

    it('should not count completed tasks as overdue', async () => {
      await Task.create([
        {
          orgId: testOrgId,
          projectId: testProjectId,
          title: 'Completed Overdue Task',
          status: TaskStatus.DONE,
          priority: TaskPriority.HIGH,
          assigneeUserId: testUserId,
          dueDate: new Date('2020-01-01'),
        },
      ]);

      const result = await analyticsService.getTaskAnalytics(testOrgId.toString(), {});

      expect(result.summary.overdueTasks).toBe(0);
    });

    it('should filter tasks by date range', async () => {
      const oldDate = new Date('2020-01-01');
      const newDate = new Date();

      await Task.create([
        {
          orgId: testOrgId,
          projectId: testProjectId,
          title: 'Old Task',
          status: TaskStatus.TODO,
          priority: TaskPriority.HIGH,
          assigneeUserId: testUserId,
          createdAt: oldDate,
        },
        {
          orgId: testOrgId,
          projectId: testProjectId,
          title: 'New Task',
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          assigneeUserId: testUserId,
          createdAt: newDate,
        },
      ]);

      const result = await analyticsService.getTaskAnalytics(testOrgId.toString(), {
        startDate: '2021-01-01',
      });

      expect(result.summary.totalTasks).toBe(1);
    });

    it('should handle tasks without assignees', async () => {
      await Task.create([
        {
          orgId: testOrgId,
          projectId: testProjectId,
          title: 'Unassigned Task',
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
        },
      ]);

      const result = await analyticsService.getTaskAnalytics(testOrgId.toString(), {});

      expect(result.summary.totalTasks).toBe(1);
      expect(result.topAssignees.length).toBe(0);
    });
  });

  describe('getUserActivity', () => {
    it('should return user activity analytics', async () => {
      await AuditLog.create([
        {
          orgId: testOrgId,
          actorUserId: testUserId,
          action: AuditAction.CREATE,
          entityType: EntityType.LEAD,
          entityId: testLeadId,
        },
        {
          orgId: testOrgId,
          actorUserId: testUserId,
          action: AuditAction.UPDATE,
          entityType: EntityType.LEAD,
          entityId: testLeadId,
        },
        {
          orgId: testOrgId,
          actorUserId: testUser2Id,
          action: AuditAction.CREATE,
          entityType: EntityType.PROJECT,
          entityId: testProjectId,
        },
      ]);

      const result = await analyticsService.getUserActivity(testOrgId.toString(), {});

      expect(result.mostActiveUsers).toBeDefined();
      expect(result.mostActiveUsers.length).toBe(2);
      expect(result.mostActiveUsers[0].actionCount).toBe(2);

      expect(result.breakdowns.byAction).toBeDefined();
      expect(result.breakdowns.byAction.length).toBeGreaterThan(0);

      expect(result.breakdowns.byEntity).toBeDefined();

      expect(result.timeline).toBeDefined();
    });

    it('should respect limit parameter', async () => {
      // Clear existing data
      await AuditLog.deleteMany({});
      await User.deleteMany({ _id: { $nin: [testUserId, testUser2Id] } });
      
      // Create multiple users and audit logs
      const userIds = [];
      for (let i = 0; i < 25; i++) {
        const userId = new mongoose.Types.ObjectId();
        userIds.push(userId);
        
        await User.create({
          _id: userId,
          orgId: testOrgId,
          name: `User ${i}`,
          email: `user${i}@test.com`,
          passwordHash: 'Password123!',
          status: UserStatus.ACTIVE,
          roleIds: [],
          isEmailVerified: true,
        });

        await AuditLog.create({
          orgId: testOrgId,
          actorUserId: userId,
          action: AuditAction.CREATE,
          entityType: EntityType.LEAD,
          entityId: testLeadId,
        });
      }

      const result = await analyticsService.getUserActivity(testOrgId.toString(), {
        limit: 10,
      });

      expect(result.mostActiveUsers.length).toBe(10);
    });

    it('should filter by date range', async () => {
      // Clear existing audit logs
      await AuditLog.deleteMany({});
      
      const oldDate = new Date('2020-01-01');
      const newDate = new Date();

      await AuditLog.create([
        {
          orgId: testOrgId,
          actorUserId: testUserId,
          action: AuditAction.CREATE,
          entityType: EntityType.LEAD,
          entityId: testLeadId,
          createdAt: oldDate,
        },
        {
          orgId: testOrgId,
          actorUserId: testUserId,
          action: AuditAction.UPDATE,
          entityType: EntityType.LEAD,
          entityId: testLeadId,
          createdAt: newDate,
        },
      ]);

      const result = await analyticsService.getUserActivity(testOrgId.toString(), {
        startDate: '2021-01-01',
      });

      expect(result.mostActiveUsers[0].actionCount).toBe(1);
    });

    it('should return activity timeline for last 7 days', async () => {
      // Clear existing audit logs
      await AuditLog.deleteMany({});
      
      const today = new Date();
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      await AuditLog.create([
        {
          orgId: testOrgId,
          actorUserId: testUserId,
          action: AuditAction.CREATE,
          entityType: EntityType.LEAD,
          entityId: testLeadId,
          createdAt: today,
        },
        {
          orgId: testOrgId,
          actorUserId: testUserId,
          action: AuditAction.UPDATE,
          entityType: EntityType.LEAD,
          entityId: testLeadId,
          createdAt: threeDaysAgo,
        },
      ]);

      const result = await analyticsService.getUserActivity(testOrgId.toString(), {});

      expect(result.timeline).toBeDefined();
      expect(result.timeline.length).toBeGreaterThan(0);
    });
  });

  describe('buildDateFilter', () => {
    it('should build filter with start date only', async () => {
      await Lead.create([
        {
          orgId: testOrgId,
          title: 'Lead 1',
          company: 'Company 1',
          contactName: 'Contact 1',
          email: 'lead1@test.com',
          source: LeadSource.WEBSITE,
          status: LeadStatus.NEW,
          ownerUserId: testUserId,
          createdAt: new Date('2020-01-01'),
        },
        {
          orgId: testOrgId,
          title: 'Lead 2',
          company: 'Company 2',
          contactName: 'Contact 2',
          email: 'lead2@test.com',
          source: LeadSource.WEBSITE,
          status: LeadStatus.NEW,
          ownerUserId: testUserId,
          createdAt: new Date('2025-01-01'),
        },
      ]);

      const result = await analyticsService.getLeadAnalytics(testOrgId.toString(), {
        startDate: '2024-01-01',
      });

      expect(result.summary.totalLeads).toBe(1);
    });

    it('should build filter with end date only', async () => {
      await Lead.create([
        {
          orgId: testOrgId,
          title: 'Lead 1',
          company: 'Company 1',
          contactName: 'Contact 1',
          email: 'lead1@test.com',
          source: LeadSource.WEBSITE,
          status: LeadStatus.NEW,
          ownerUserId: testUserId,
          createdAt: new Date('2020-01-01'),
        },
        {
          orgId: testOrgId,
          title: 'Lead 2',
          company: 'Company 2',
          contactName: 'Contact 2',
          email: 'lead2@test.com',
          source: LeadSource.WEBSITE,
          status: LeadStatus.NEW,
          ownerUserId: testUserId,
          createdAt: new Date('2025-01-01'),
        },
      ]);

      const result = await analyticsService.getLeadAnalytics(testOrgId.toString(), {
        endDate: '2024-01-01',
      });

      expect(result.summary.totalLeads).toBe(1);
    });

    it('should build filter with both start and end dates', async () => {
      await Lead.create([
        {
          orgId: testOrgId,
          title: 'Lead 1',
          company: 'Company 1',
          contactName: 'Contact 1',
          email: 'lead1@test.com',
          source: LeadSource.WEBSITE,
          status: LeadStatus.NEW,
          ownerUserId: testUserId,
          createdAt: new Date('2020-01-01'),
        },
        {
          orgId: testOrgId,
          title: 'Lead 2',
          company: 'Company 2',
          contactName: 'Contact 2',
          email: 'lead2@test.com',
          source: LeadSource.WEBSITE,
          status: LeadStatus.NEW,
          ownerUserId: testUserId,
          createdAt: new Date('2023-06-01'),
        },
        {
          orgId: testOrgId,
          title: 'Lead 3',
          company: 'Company 3',
          contactName: 'Contact 3',
          email: 'lead3@test.com',
          source: LeadSource.WEBSITE,
          status: LeadStatus.NEW,
          ownerUserId: testUserId,
          createdAt: new Date('2025-01-01'),
        },
      ]);

      const result = await analyticsService.getLeadAnalytics(testOrgId.toString(), {
        startDate: '2023-01-01',
        endDate: '2024-01-01',
      });

      expect(result.summary.totalLeads).toBe(1);
    });
  });
});