import mongoose from 'mongoose';
import { Lead } from '../models/Lead';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { AuditLog } from '../models/AuditLog';
import { LeadStatus, ProjectStatus, TaskStatus, TaskPriority } from '../constants/enums';
import { DateRangeQuery, LeadAnalyticsQuery, ProjectAnalyticsQuery, TaskAnalyticsQuery, UserActivityQuery } from '../validators/analytics.validator';

export class AnalyticsService {
  /**
   * Get overview dashboard statistics
   */
  async getOverview(orgId: string, dateRange?: DateRangeQuery) {
    const orgObjectId = new mongoose.Types.ObjectId(orgId);
    const dateFilter = this.buildDateFilter(dateRange);

    // Run all queries in parallel
    const [
      totalLeads,
      totalProjects,
      totalTasks,
      activeProjects,
      completedProjects,
      openTasks,
      completedTasks,
      overdueTasks,
      leadsByStatus,
      tasksByPriority,
      recentActivity,
    ] = await Promise.all([
      // Lead metrics
      Lead.countDocuments({ orgId: orgObjectId, deletedAt: null, ...dateFilter }),
      
      // Project metrics
      Project.countDocuments({ orgId: orgObjectId, deletedAt: null, ...dateFilter }),
      
      // Task metrics
      Task.countDocuments({ orgId: orgObjectId, deletedAt: null, ...dateFilter }),
      
      // Active projects
      Project.countDocuments({ 
        orgId: orgObjectId, 
        deletedAt: null, 
        status: ProjectStatus.ACTIVE,
        ...dateFilter 
      }),
      
      // Completed projects
      Project.countDocuments({ 
        orgId: orgObjectId, 
        deletedAt: null, 
        status: ProjectStatus.COMPLETED,
        ...dateFilter 
      }),
      
      // Open tasks (TODO + IN_PROGRESS)
      Task.countDocuments({ 
        orgId: orgObjectId, 
        deletedAt: null, 
        status: { $in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] },
        ...dateFilter 
      }),
      
      // Completed tasks
      Task.countDocuments({ 
        orgId: orgObjectId, 
        deletedAt: null, 
        status: TaskStatus.DONE,
        ...dateFilter 
      }),
      
      // Overdue tasks
      Task.countDocuments({ 
        orgId: orgObjectId, 
        deletedAt: null, 
        status: { $ne: TaskStatus.DONE },
        dueDate: { $lt: new Date() },
        ...dateFilter 
      }),
      
      // Leads by status
      Lead.aggregate([
        { $match: { orgId: orgObjectId, deletedAt: null, ...dateFilter } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      
      // Tasks by priority
      Task.aggregate([
        { $match: { orgId: orgObjectId, deletedAt: null, ...dateFilter } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      
      // Recent activity (last 10 actions)
      AuditLog.find({ orgId: orgObjectId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('userId', 'name email')
        .lean(),
    ]);

    // Calculate conversion rate (WON leads)
    const convertedLeads = await Lead.countDocuments({
      orgId: orgObjectId,
      deletedAt: null,
      status: 'won',
      ...dateFilter,
    });
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Calculate task completion rate
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Format leads by status
    const leadsStatusBreakdown = Object.values(LeadStatus).map(status => ({
      status,
      count: leadsByStatus.find(item => item._id === status)?.count || 0,
    }));

    // Format tasks by priority
    const tasksPriorityBreakdown = Object.values(TaskPriority).map(priority => ({
      priority,
      count: tasksByPriority.find(item => item._id === priority)?.count || 0,
    }));

    return {
      summary: {
        totalLeads,
        totalProjects,
        totalTasks,
        activeProjects,
        completedProjects,
        openTasks,
        completedTasks,
        overdueTasks,
        conversionRate: Math.round(conversionRate * 100) / 100,
        taskCompletionRate: Math.round(taskCompletionRate * 100) / 100,
      },
      breakdowns: {
        leadsByStatus: leadsStatusBreakdown,
        tasksByPriority: tasksPriorityBreakdown,
      },
      recentActivity: recentActivity.map(log => ({
        id: log._id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        user: log.userId,
        timestamp: log.createdAt,
        metadata: log.metadata,
      })),
    };
  }

  /**
   * Get lead analytics
   */
  async getLeadAnalytics(orgId: string, query: LeadAnalyticsQuery) {
    const orgObjectId = new mongoose.Types.ObjectId(orgId);
    const dateFilter = this.buildDateFilter(query);

    // Total leads
    const totalLeads = await Lead.countDocuments({ 
      orgId: orgObjectId, 
      deletedAt: null,
      ...dateFilter 
    });

    // Leads by status
    const leadsByStatus = await Lead.aggregate([
      { $match: { orgId: orgObjectId, deletedAt: null, ...dateFilter } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Leads by source
    const leadsBySource = await Lead.aggregate([
      { $match: { orgId: orgObjectId, deletedAt: null, ...dateFilter } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Conversion metrics (WON leads)
    const convertedLeads = await Lead.countDocuments({
      orgId: orgObjectId,
      deletedAt: null,
      status: 'won',
      ...dateFilter,
    });
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Top lead owners
    const topOwners = await Lead.aggregate([
      { $match: { orgId: orgObjectId, deletedAt: null, ownerUserId: { $exists: true }, ...dateFilter } },
      { $group: { _id: '$ownerUserId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'owner',
        },
      },
      { $unwind: '$owner' },
      {
        $project: {
          userId: '$_id',
          name: '$owner.name',
          email: '$owner.email',
          leadCount: '$count',
        },
      },
    ]);

    // Lead creation trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const leadTrend = await Lead.aggregate([
      { 
        $match: { 
          orgId: orgObjectId, 
          deletedAt: null,
          createdAt: { $gte: thirtyDaysAgo },
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      summary: {
        totalLeads,
        convertedLeads,
        conversionRate: Math.round(conversionRate * 100) / 100,
      },
      breakdowns: {
        byStatus: leadsByStatus.map(item => ({ status: item._id, count: item.count })),
        bySource: leadsBySource.map(item => ({ source: item._id, count: item.count })),
      },
      topOwners,
      trend: leadTrend.map(item => ({ date: item._id, count: item.count })),
    };
  }

  /**
   * Get project analytics
   */
  async getProjectAnalytics(orgId: string, query: ProjectAnalyticsQuery) {
    const orgObjectId = new mongoose.Types.ObjectId(orgId);
    const dateFilter = this.buildDateFilter(query);

    // Total projects
    const totalProjects = await Project.countDocuments({ 
      orgId: orgObjectId, 
      deletedAt: null,
      ...dateFilter 
    });

    // Projects by status
    const projectsByStatus = await Project.aggregate([
      { $match: { orgId: orgObjectId, deletedAt: null, ...dateFilter } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Total budget
    const budgetStats = await Project.aggregate([
      { $match: { orgId: orgObjectId, deletedAt: null, budget: { $exists: true }, ...dateFilter } },
      {
        $group: {
          _id: null,
          totalBudget: { $sum: '$budget' },
          avgBudget: { $avg: '$budget' },
          minBudget: { $min: '$budget' },
          maxBudget: { $max: '$budget' },
        },
      },
    ]);

    // Top project managers
    const topManagers = await Project.aggregate([
      { $match: { orgId: orgObjectId, deletedAt: null, managerUserId: { $exists: true }, ...dateFilter } },
      { $group: { _id: '$managerUserId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'manager',
        },
      },
      { $unwind: '$manager' },
      {
        $project: {
          userId: '$_id',
          name: '$manager.name',
          email: '$manager.email',
          projectCount: '$count',
        },
      },
    ]);

    // Projects with overdue end dates
    const overdueProjects = await Project.countDocuments({
      orgId: orgObjectId,
      deletedAt: null,
      status: { $ne: ProjectStatus.COMPLETED },
      endDate: { $lt: new Date() },
      ...dateFilter,
    });

    return {
      summary: {
        totalProjects,
        overdueProjects,
        totalBudget: budgetStats[0]?.totalBudget || 0,
        avgBudget: Math.round(budgetStats[0]?.avgBudget || 0),
      },
      breakdowns: {
        byStatus: projectsByStatus.map(item => ({ status: item._id, count: item.count })),
      },
      topManagers,
      budgetStats: budgetStats[0] || { totalBudget: 0, avgBudget: 0, minBudget: 0, maxBudget: 0 },
    };
  }

  /**
   * Get task analytics
   */
  async getTaskAnalytics(orgId: string, query: TaskAnalyticsQuery) {
    const orgObjectId = new mongoose.Types.ObjectId(orgId);
    const dateFilter = this.buildDateFilter(query);

    // Total tasks
    const totalTasks = await Task.countDocuments({ 
      orgId: orgObjectId, 
      deletedAt: null,
      ...dateFilter 
    });

    // Tasks by status
    const tasksByStatus = await Task.aggregate([
      { $match: { orgId: orgObjectId, deletedAt: null, ...dateFilter } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Tasks by priority
    const tasksByPriority = await Task.aggregate([
      { $match: { orgId: orgObjectId, deletedAt: null, ...dateFilter } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Completion metrics
    const completedTasks = await Task.countDocuments({
      orgId: orgObjectId,
      deletedAt: null,
      status: TaskStatus.DONE,
      ...dateFilter,
    });
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Overdue tasks
    const overdueTasks = await Task.countDocuments({
      orgId: orgObjectId,
      deletedAt: null,
      status: { $ne: TaskStatus.DONE },
      dueDate: { $lt: new Date() },
      ...dateFilter,
    });

    // Top assignees
    const topAssignees = await Task.aggregate([
      { $match: { orgId: orgObjectId, deletedAt: null, assigneeUserId: { $exists: true }, ...dateFilter } },
      { $group: { _id: '$assigneeUserId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'assignee',
        },
      },
      { $unwind: '$assignee' },
      {
        $project: {
          userId: '$_id',
          name: '$assignee.name',
          email: '$assignee.email',
          taskCount: '$count',
        },
      },
    ]);

    // Tasks by project
    const tasksByProject = await Task.aggregate([
      { $match: { orgId: orgObjectId, deletedAt: null, ...dateFilter } },
      { $group: { _id: '$projectId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: '_id',
          as: 'project',
        },
      },
      { $unwind: '$project' },
      {
        $project: {
          projectId: '$_id',
          projectName: '$project.name',
          taskCount: '$count',
        },
      },
    ]);

    return {
      summary: {
        totalTasks,
        completedTasks,
        overdueTasks,
        completionRate: Math.round(completionRate * 100) / 100,
      },
      breakdowns: {
        byStatus: tasksByStatus.map(item => ({ status: item._id, count: item.count })),
        byPriority: tasksByPriority.map(item => ({ priority: item._id, count: item.count })),
      },
      topAssignees,
      tasksByProject,
    };
  }

  /**
   * Get user activity analytics
   */
  async getUserActivity(orgId: string, query: UserActivityQuery) {
    const orgObjectId = new mongoose.Types.ObjectId(orgId);
    const dateFilter = this.buildDateFilter(query);
    const limit = query.limit || 20;

    // Most active users
    const mostActiveUsers = await AuditLog.aggregate([
      { $match: { orgId: orgObjectId, ...dateFilter } },
      { $group: { _id: '$userId', actionCount: { $sum: 1 } } },
      { $sort: { actionCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          name: '$user.name',
          email: '$user.email',
          actionCount: 1,
        },
      },
    ]);

    // Activity by action type
    const activityByAction = await AuditLog.aggregate([
      { $match: { orgId: orgObjectId, ...dateFilter } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Activity by entity type
    const activityByEntity = await AuditLog.aggregate([
      { $match: { orgId: orgObjectId, ...dateFilter } },
      { $group: { _id: '$entity', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Recent activity timeline (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activityTimeline = await AuditLog.aggregate([
      { 
        $match: { 
          orgId: orgObjectId,
          createdAt: { $gte: sevenDaysAgo },
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      mostActiveUsers,
      breakdowns: {
        byAction: activityByAction.map(item => ({ action: item._id, count: item.count })),
        byEntity: activityByEntity.map(item => ({ entity: item._id, count: item.count })),
      },
      timeline: activityTimeline.map(item => ({ date: item._id, count: item.count })),
    };
  }

  /**
   * Helper: Build date filter for queries
   */
  private buildDateFilter(dateRange?: DateRangeQuery) {
    const filter: any = {};
    
    if (dateRange?.startDate || dateRange?.endDate) {
      filter.createdAt = {};
      if (dateRange.startDate) {
        filter.createdAt.$gte = new Date(dateRange.startDate);
      }
      if (dateRange.endDate) {
        filter.createdAt.$lte = new Date(dateRange.endDate);
      }
    }
    
    return filter;
  }
}