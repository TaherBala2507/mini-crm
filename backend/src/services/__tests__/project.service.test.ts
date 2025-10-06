import '../../tests/setup';
import { ProjectService } from '../project.service';
import { Organization } from '../../models/Organization';
import { User } from '../../models/User';
import { Project } from '../../models/Project';
import { AuditLog } from '../../models/AuditLog';
import { ProjectStatus, UserStatus, AuditAction, EntityType } from '../../constants/enums';
import mongoose from 'mongoose';

describe('ProjectService', () => {
  let projectService: ProjectService;
  let testOrgId: mongoose.Types.ObjectId;
  let testUserId: mongoose.Types.ObjectId;
  let testUser2Id: mongoose.Types.ObjectId;

  beforeEach(async () => {
    projectService = new ProjectService();
    testOrgId = new mongoose.Types.ObjectId();
    testUserId = new mongoose.Types.ObjectId();
    testUser2Id = new mongoose.Types.ObjectId();

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
  });

  describe('createProject', () => {
    it('should create a new project', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'Test project description',
        status: ProjectStatus.ACTIVE,
        managerUserId: testUserId.toString(),
        startDate: new Date('2025-01-01').toISOString(),
        endDate: new Date('2025-12-31').toISOString(),
      };

      const result = await projectService.createProject(
        projectData,
        testUserId.toString(),
        testOrgId.toString()
      );

      expect(result.name).toBe(projectData.name);
      expect(result.description).toBe(projectData.description);
      expect(result.status).toBe(projectData.status);
      expect(result.orgId.toString()).toBe(testOrgId.toString());

      // Verify audit log was created
      const auditLog = await AuditLog.findOne({
        action: AuditAction.CREATE,
        entityType: EntityType.PROJECT,
        entityId: result._id,
      });
      expect(auditLog).toBeDefined();
      expect(auditLog?.metadata.projectName).toBe(projectData.name);
    });

    it('should create project with members', async () => {
      const projectData = {
        name: 'Project with Members',
        description: 'Test description',
        status: ProjectStatus.ACTIVE,
        managerUserId: testUserId.toString(),
        members: [
          { userId: testUser2Id.toString(), role: 'Developer' },
        ],
      };

      const result = await projectService.createProject(
        projectData,
        testUserId.toString(),
        testOrgId.toString()
      );

      expect(result.members).toHaveLength(1);
      expect(result.members[0].userId.toString()).toBe(testUser2Id.toString());
      expect(result.members[0].role).toBe('Developer');
    });

    it('should create project without manager', async () => {
      const projectData = {
        name: 'Project without Manager',
        description: 'Test description',
        status: ProjectStatus.ACTIVE,
      };

      const result = await projectService.createProject(
        projectData,
        testUserId.toString(),
        testOrgId.toString()
      );

      expect(result.name).toBe(projectData.name);
      expect(result.managerUserId).toBeUndefined();
    });

    it('should throw error if manager not found', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'Test description',
        status: ProjectStatus.ACTIVE,
        managerUserId: new mongoose.Types.ObjectId().toString(),
      };

      await expect(
        projectService.createProject(
          projectData,
          testUserId.toString(),
          testOrgId.toString()
        )
      ).rejects.toThrow('Manager not found');
    });

    it('should throw error if member not found', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'Test description',
        status: ProjectStatus.ACTIVE,
        members: [
          { userId: new mongoose.Types.ObjectId().toString(), role: 'Developer' },
        ],
      };

      await expect(
        projectService.createProject(
          projectData,
          testUserId.toString(),
          testOrgId.toString()
        )
      ).rejects.toThrow('One or more members not found');
    });
  });

  describe('listProjects', () => {
    beforeEach(async () => {
      await Project.create([
        {
          orgId: testOrgId,
          name: 'Project 1',
          description: 'Description 1',
          status: ProjectStatus.ACTIVE,
          managerUserId: testUserId,
        },
        {
          orgId: testOrgId,
          name: 'Project 2',
          description: 'Description 2',
          status: ProjectStatus.ON_HOLD,
          managerUserId: testUser2Id,
        },
        {
          orgId: testOrgId,
          name: 'Project 3',
          description: 'Description 3',
          status: ProjectStatus.COMPLETED,
          managerUserId: testUserId,
        },
      ]);
    });

    it('should list all projects with pagination', async () => {
      const result = await projectService.listProjects(
        { page: 1, limit: 10 },
        testOrgId.toString()
      );

      expect(result.projects).toHaveLength(3);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.pages).toBe(1);
    });

    it('should filter projects by status', async () => {
      const result = await projectService.listProjects(
        { page: 1, limit: 10, status: ProjectStatus.ACTIVE },
        testOrgId.toString()
      );

      expect(result.projects).toHaveLength(1);
      expect(result.projects[0].status).toBe(ProjectStatus.ACTIVE);
    });

    it('should filter projects by manager', async () => {
      const result = await projectService.listProjects(
        { page: 1, limit: 10, managerId: testUserId.toString() },
        testOrgId.toString()
      );

      expect(result.projects).toHaveLength(2);
    });

    it('should sort projects by name ascending', async () => {
      const result = await projectService.listProjects(
        { page: 1, limit: 10, sortBy: 'name', sortOrder: 'asc' },
        testOrgId.toString()
      );

      expect(result.projects[0].name).toBe('Project 1');
      expect(result.projects[1].name).toBe('Project 2');
      expect(result.projects[2].name).toBe('Project 3');
    });

    it('should handle pagination correctly', async () => {
      const result = await projectService.listProjects(
        { page: 2, limit: 2 },
        testOrgId.toString()
      );

      expect(result.projects).toHaveLength(1);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.pages).toBe(2);
    });
  });

  describe('getProjectById', () => {
    let projectId: mongoose.Types.ObjectId;

    beforeEach(async () => {
      const project = await Project.create({
        orgId: testOrgId,
        name: 'Test Project',
        description: 'Test description',
        status: ProjectStatus.ACTIVE,
        managerUserId: testUserId,
      });
      projectId = project._id as mongoose.Types.ObjectId;
    });

    it('should get project by id', async () => {
      const result = await projectService.getProjectById(
        projectId.toString(),
        testOrgId.toString()
      );

      expect(result._id.toString()).toBe(projectId.toString());
      expect(result.name).toBe('Test Project');
    });

    it('should throw error if project not found', async () => {
      await expect(
        projectService.getProjectById(
          new mongoose.Types.ObjectId().toString(),
          testOrgId.toString()
        )
      ).rejects.toThrow('Project not found');
    });

    it('should not return deleted projects', async () => {
      await Project.findByIdAndUpdate(projectId, { deletedAt: new Date() });

      await expect(
        projectService.getProjectById(projectId.toString(), testOrgId.toString())
      ).rejects.toThrow('Project not found');
    });
  });

  describe('updateProject', () => {
    let projectId: mongoose.Types.ObjectId;

    beforeEach(async () => {
      const project = await Project.create({
        orgId: testOrgId,
        name: 'Original Name',
        description: 'Original description',
        status: ProjectStatus.ACTIVE,
        managerUserId: testUserId,
      });
      projectId = project._id as mongoose.Types.ObjectId;
    });

    it('should update project name', async () => {
      const result = await projectService.updateProject(
        projectId.toString(),
        { name: 'Updated Name' },
        testUserId.toString(),
        testOrgId.toString()
      );

      expect(result.name).toBe('Updated Name');

      // Verify audit log
      const auditLog = await AuditLog.findOne({
        action: AuditAction.UPDATE,
        entityType: EntityType.PROJECT,
        entityId: projectId,
      });
      expect(auditLog).toBeDefined();
      expect(auditLog?.metadata.changes.name.old).toBe('Original Name');
      expect(auditLog?.metadata.changes.name.new).toBe('Updated Name');
    });

    it('should update project status', async () => {
      const result = await projectService.updateProject(
        projectId.toString(),
        { status: ProjectStatus.COMPLETED },
        testUserId.toString(),
        testOrgId.toString()
      );

      expect(result.status).toBe(ProjectStatus.COMPLETED);
    });

    it('should update project manager', async () => {
      const result = await projectService.updateProject(
        projectId.toString(),
        { managerUserId: testUser2Id.toString() },
        testUserId.toString(),
        testOrgId.toString()
      );

      expect(result.managerUserId?.toString()).toBe(testUser2Id.toString());
    });

    it('should throw error if project not found', async () => {
      await expect(
        projectService.updateProject(
          new mongoose.Types.ObjectId().toString(),
          { name: 'Updated' },
          testUserId.toString(),
          testOrgId.toString()
        )
      ).rejects.toThrow('Project not found');
    });

    it('should throw error if manager not found', async () => {
      await expect(
        projectService.updateProject(
          projectId.toString(),
          { managerUserId: new mongoose.Types.ObjectId().toString() },
          testUserId.toString(),
          testOrgId.toString()
        )
      ).rejects.toThrow('Manager not found');
    });
  });

  describe('deleteProject', () => {
    let projectId: mongoose.Types.ObjectId;

    beforeEach(async () => {
      const project = await Project.create({
        orgId: testOrgId,
        name: 'Project to Delete',
        description: 'Test description',
        status: ProjectStatus.ACTIVE,
      });
      projectId = project._id as mongoose.Types.ObjectId;
    });

    it('should soft delete project', async () => {
      await projectService.deleteProject(
        projectId.toString(),
        testUserId.toString(),
        testOrgId.toString()
      );

      const project = await Project.findById(projectId);
      expect(project?.deletedAt).toBeDefined();

      // Verify audit log
      const auditLog = await AuditLog.findOne({
        action: AuditAction.DELETE,
        entityType: EntityType.PROJECT,
        entityId: projectId,
      });
      expect(auditLog).toBeDefined();
    });

    it('should throw error if project not found', async () => {
      await expect(
        projectService.deleteProject(
          new mongoose.Types.ObjectId().toString(),
          testUserId.toString(),
          testOrgId.toString()
        )
      ).rejects.toThrow('Project not found');
    });

    it('should not delete already deleted project', async () => {
      await Project.findByIdAndUpdate(projectId, { deletedAt: new Date() });

      await expect(
        projectService.deleteProject(
          projectId.toString(),
          testUserId.toString(),
          testOrgId.toString()
        )
      ).rejects.toThrow('Project not found');
    });
  });

  describe('addMember', () => {
    let projectId: mongoose.Types.ObjectId;

    beforeEach(async () => {
      const project = await Project.create({
        orgId: testOrgId,
        name: 'Test Project',
        description: 'Test description',
        status: ProjectStatus.ACTIVE,
        members: [],
      });
      projectId = project._id as mongoose.Types.ObjectId;
    });

    it('should add member to project', async () => {
      const result = await projectService.addMember(
        projectId.toString(),
        { userId: testUserId.toString(), role: 'Developer' },
        testUser2Id.toString(),
        testOrgId.toString()
      );

      expect(result.members).toHaveLength(1);
      expect(result.members[0].userId.toString()).toBe(testUserId.toString());
      expect(result.members[0].role).toBe('Developer');

      // Verify audit log
      const auditLog = await AuditLog.findOne({
        action: AuditAction.ASSIGN,
        entityType: EntityType.PROJECT,
        entityId: projectId,
      });
      expect(auditLog).toBeDefined();
    });

    it('should add member with specified role', async () => {
      const result = await projectService.addMember(
        projectId.toString(),
        { userId: testUserId.toString(), role: 'Tester' },
        testUser2Id.toString(),
        testOrgId.toString()
      );

      expect(result.members).toHaveLength(1);
      expect(result.members[0].role).toBe('Tester');
    });

    it('should throw error if project not found', async () => {
      await expect(
        projectService.addMember(
          new mongoose.Types.ObjectId().toString(),
          { userId: testUserId.toString(), role: 'Developer' },
          testUser2Id.toString(),
          testOrgId.toString()
        )
      ).rejects.toThrow('Project not found');
    });

    it('should throw error if user not found', async () => {
      await expect(
        projectService.addMember(
          projectId.toString(),
          { userId: new mongoose.Types.ObjectId().toString(), role: 'Developer' },
          testUser2Id.toString(),
          testOrgId.toString()
        )
      ).rejects.toThrow('User not found');
    });

    it('should throw error if user is already a member', async () => {
      await projectService.addMember(
        projectId.toString(),
        { userId: testUserId.toString(), role: 'Developer' },
        testUser2Id.toString(),
        testOrgId.toString()
      );

      await expect(
        projectService.addMember(
          projectId.toString(),
          { userId: testUserId.toString(), role: 'Developer' },
          testUser2Id.toString(),
          testOrgId.toString()
        )
      ).rejects.toThrow('User is already a member of this project');
    });
  });

  describe('removeMember', () => {
    let projectId: mongoose.Types.ObjectId;

    beforeEach(async () => {
      const project = await Project.create({
        orgId: testOrgId,
        name: 'Test Project',
        description: 'Test description',
        status: ProjectStatus.ACTIVE,
        members: [
          {
            userId: testUserId,
            role: 'Developer',
            addedAt: new Date(),
          },
        ],
      });
      projectId = project._id as mongoose.Types.ObjectId;
    });

    it('should remove member from project', async () => {
      const result = await projectService.removeMember(
        projectId.toString(),
        testUserId.toString(),
        testUser2Id.toString(),
        testOrgId.toString()
      );

      expect(result.members).toHaveLength(0);

      // Verify audit log
      const auditLog = await AuditLog.findOne({
        action: AuditAction.UPDATE,
        entityType: EntityType.PROJECT,
        entityId: projectId,
      });
      expect(auditLog).toBeDefined();
      expect(auditLog?.metadata.action).toBe('remove_member');
    });

    it('should throw error if project not found', async () => {
      await expect(
        projectService.removeMember(
          new mongoose.Types.ObjectId().toString(),
          testUserId.toString(),
          testUser2Id.toString(),
          testOrgId.toString()
        )
      ).rejects.toThrow('Project not found');
    });

    it('should throw error if member not found in project', async () => {
      await expect(
        projectService.removeMember(
          projectId.toString(),
          testUser2Id.toString(),
          testUserId.toString(),
          testOrgId.toString()
        )
      ).rejects.toThrow('Member not found in project');
    });
  });
});