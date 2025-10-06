import mongoose from 'mongoose';
import { Project, IProject } from '../models/Project';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { AuditAction, EntityType } from '../constants/enums';
import { AppError } from '../utils/errors';
import { CreateProjectInput, UpdateProjectInput, ListProjectsQuery, AddMemberInput } from '../validators/project.validator';

export class ProjectService {
  /**
   * Create a new project
   */
  async createProject(
    data: CreateProjectInput,
    userId: string,
    orgId: string
  ): Promise<IProject> {
    // Validate manager exists if provided
    if (data.managerUserId) {
      const manager = await User.findOne({
        _id: data.managerUserId,
        orgId,
        deletedAt: null,
      });
      if (!manager) {
        throw new AppError(404, 'Manager not found');
      }
    }

    // Validate members exist if provided
    if (data.members && data.members.length > 0) {
      const memberIds = data.members.map((m) => m.userId);
      const users = await User.find({
        _id: { $in: memberIds },
        orgId,
        deletedAt: null,
      });

      if (users.length !== memberIds.length) {
        throw new AppError(404, 'One or more members not found');
      }
    }

    // Create project
    const project = await Project.create({
      ...data,
      orgId,
    });

    // Create audit log
    await AuditLog.create({
      orgId,
      userId,
      action: AuditAction.CREATE,
      entityType: EntityType.PROJECT,
      entityId: project._id,
      metadata: {
        projectName: project.name,
      },
    });

    return project;
  }

  /**
   * List projects with filtering, search, and pagination
   */
  async listProjects(
    query: ListProjectsQuery,
    orgId: string
  ): Promise<{
    items: IProject[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      status,
      managerId,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Build filter
    const filter: any = {
      orgId,
      deletedAt: null,
    };

    if (status) {
      filter.status = status;
    }

    if (managerId) {
      filter.managerUserId = managerId;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [projects, total] = await Promise.all([
      Project.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('managerUserId', 'name email')
        .populate('leadId', 'title company')
        .populate('members.userId', 'name email'),
      Project.countDocuments(filter),
    ]);

    return {
      items: projects as IProject[],
      page,
      pageSize: limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get project by ID
   */
  async getProjectById(projectId: string, orgId: string): Promise<IProject> {
    const project = await Project.findOne({
      _id: projectId,
      orgId,
      deletedAt: null,
    })
      .populate('managerUserId', 'name email')
      .populate('leadId', 'title company contactName email phone')
      .populate('members.userId', 'name email');

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    return project as IProject;
  }

  /**
   * Update project
   */
  async updateProject(
    projectId: string,
    data: UpdateProjectInput,
    userId: string,
    orgId: string
  ): Promise<IProject> {
    // Check if project exists
    const project = await Project.findOne({
      _id: projectId,
      orgId,
      deletedAt: null,
    });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    // Validate manager exists if provided
    if (data.managerUserId) {
      const manager = await User.findOne({
        _id: data.managerUserId,
        orgId,
        deletedAt: null,
      });
      if (!manager) {
        throw new AppError(404, 'Manager not found');
      }
    }

    // Track changes for audit
    const changes: any = {};
    Object.keys(data).forEach((key) => {
      const oldValue = (project as any)[key];
      const newValue = (data as any)[key];
      if (oldValue !== newValue) {
        changes[key] = { old: oldValue, new: newValue };
      }
    });

    // Update project
    Object.assign(project, data);
    await project.save();

    // Create audit log
    await AuditLog.create({
      orgId,
      userId,
      action: AuditAction.UPDATE,
      entityType: EntityType.PROJECT,
      entityId: project._id,
      metadata: {
        projectName: project.name,
        changes,
      },
    });

    return project;
  }

  /**
   * Delete project (soft delete)
   */
  async deleteProject(
    projectId: string,
    userId: string,
    orgId: string
  ): Promise<void> {
    const project = await Project.findOne({
      _id: projectId,
      orgId,
      deletedAt: null,
    });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    // Soft delete
    project.deletedAt = new Date();
    await project.save();

    // Create audit log
    await AuditLog.create({
      orgId,
      userId,
      action: AuditAction.DELETE,
      entityType: EntityType.PROJECT,
      entityId: project._id,
      metadata: {
        projectName: project.name,
      },
    });
  }

  /**
   * Add member to project
   */
  async addMember(
    projectId: string,
    memberData: AddMemberInput,
    userId: string,
    orgId: string
  ): Promise<IProject> {
    const project = await Project.findOne({
      _id: projectId,
      orgId,
      deletedAt: null,
    });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    // Validate user exists
    const user = await User.findOne({
      _id: memberData.userId,
      orgId,
      deletedAt: null,
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Check if user is already a member
    const existingMember = project.members.find(
      (m) => m.userId.toString() === memberData.userId
    );

    if (existingMember) {
      throw new AppError(400, 'User is already a member of this project');
    }

    // Add member
    project.members.push({
      userId: new mongoose.Types.ObjectId(memberData.userId),
      role: memberData.role || 'Member',
      addedAt: new Date(),
    });

    await project.save();

    // Create audit log
    await AuditLog.create({
      orgId,
      userId,
      action: AuditAction.ASSIGN,
      entityType: EntityType.PROJECT,
      entityId: project._id,
      metadata: {
        projectName: project.name,
        memberName: user.name,
        memberRole: memberData.role,
      },
    });

    return project;
  }

  /**
   * Remove member from project
   */
  async removeMember(
    projectId: string,
    memberUserId: string,
    userId: string,
    orgId: string
  ): Promise<IProject> {
    const project = await Project.findOne({
      _id: projectId,
      orgId,
      deletedAt: null,
    });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    // Find member
    const memberIndex = project.members.findIndex(
      (m) => m.userId.toString() === memberUserId
    );

    if (memberIndex === -1) {
      throw new AppError(404, 'Member not found in project');
    }

    // Get member info for audit
    const member = await User.findById(memberUserId);

    // Remove member
    project.members.splice(memberIndex, 1);
    await project.save();

    // Create audit log
    await AuditLog.create({
      orgId,
      userId,
      action: AuditAction.UPDATE,
      entityType: EntityType.PROJECT,
      entityId: project._id,
      metadata: {
        projectName: project.name,
        action: 'remove_member',
        memberName: member?.name,
      },
    });

    return project;
  }
}