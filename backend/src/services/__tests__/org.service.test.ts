import '../../tests/setup';
import { OrgService } from '../org.service';
import { Organization } from '../../models/Organization';
import { User } from '../../models/User';
import { Lead } from '../../models/Lead';
import { Project } from '../../models/Project';
import { Task } from '../../models/Task';
import { AuditLog } from '../../models/AuditLog';
import { UserStatus, AuditAction, LeadStatus, LeadSource, ProjectStatus, TaskStatus } from '../../constants/enums';
import { NotFoundError, ConflictError } from '../../utils/errors';
import mongoose from 'mongoose';

describe('OrgService', () => {
  let orgService: OrgService;
  let testOrgId: mongoose.Types.ObjectId;
  let testUserId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    orgService = new OrgService();
    testOrgId = new mongoose.Types.ObjectId();
    testUserId = new mongoose.Types.ObjectId();

    // Create test organization
    await Organization.create({
      _id: testOrgId,
      name: 'Test Organization',
      domain: 'test-org-domain',
    });

    // Create test user
    await User.create({
      _id: testUserId,
      orgId: testOrgId,
      name: 'Test User',
      email: 'orgtest@test.com',
      passwordHash: 'Password123!',
      status: UserStatus.ACTIVE,
      roleIds: [],
      isEmailVerified: true,
    });
  });

  describe('getOrganization', () => {
    it('should get organization by ID', async () => {
      const result = await orgService.getOrganization(testOrgId);

      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(testOrgId.toString());
      expect(result.name).toBe('Test Organization');
      expect(result.domain).toBe('test-org-domain');
    });

    it('should throw NotFoundError if organization does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      await expect(
        orgService.getOrganization(nonExistentId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateOrganization', () => {
    it('should update organization name', async () => {
      const updateData = {
        name: 'Updated Organization Name',
      };

      const result = await orgService.updateOrganization(
        testOrgId,
        updateData,
        testUserId
      );

      expect(result.name).toBe('Updated Organization Name');
      expect(result.domain).toBe('test-org-domain'); // Unchanged
    });

    it('should update organization domain', async () => {
      const updateData = {
        domain: 'new-domain',
      };

      const result = await orgService.updateOrganization(
        testOrgId,
        updateData,
        testUserId
      );

      expect(result.domain).toBe('new-domain');
      expect(result.name).toBe('Test Organization'); // Unchanged
    });

    it('should update both name and domain', async () => {
      const updateData = {
        name: 'New Name',
        domain: 'new-domain',
      };

      const result = await orgService.updateOrganization(
        testOrgId,
        updateData,
        testUserId
      );

      expect(result.name).toBe('New Name');
      expect(result.domain).toBe('new-domain');
    });

    it('should throw ConflictError if domain is already in use', async () => {
      // Create another organization with a different domain
      const otherOrgId = new mongoose.Types.ObjectId();
      await Organization.create({
        _id: otherOrgId,
        name: 'Other Org',
        domain: 'existing-domain',
      });

      const updateData = {
        domain: 'existing-domain',
      };

      await expect(
        orgService.updateOrganization(testOrgId, updateData, testUserId)
      ).rejects.toThrow(ConflictError);
    });

    it('should allow updating to same domain (no change)', async () => {
      const updateData = {
        domain: 'test-org-domain', // Same as current
        name: 'Updated Name',
      };

      const result = await orgService.updateOrganization(
        testOrgId,
        updateData,
        testUserId
      );

      expect(result.domain).toBe('test-org-domain');
      expect(result.name).toBe('Updated Name');
    });

    it('should update organization settings', async () => {
      const updateData = {
        settings: {
          timezone: 'America/New_York',
          dateFormat: 'MM/DD/YYYY' as const,
        },
      };

      const result = await orgService.updateOrganization(
        testOrgId,
        updateData,
        testUserId
      );

      expect((result as any).settings).toBeDefined();
      expect((result as any).settings.timezone).toBe('America/New_York');
      expect((result as any).settings.dateFormat).toBe('MM/DD/YYYY');
    });

    it('should merge settings with existing settings', async () => {
      // First update with initial settings
      await orgService.updateOrganization(
        testOrgId,
        {
          settings: {
            timezone: 'UTC',
            dateFormat: 'YYYY-MM-DD' as const,
          },
        },
        testUserId
      );

      // Second update with partial settings
      const result = await orgService.updateOrganization(
        testOrgId,
        {
          settings: {
            timezone: 'America/New_York', // Update this
            // dateFormat should remain unchanged
          },
        },
        testUserId
      );

      expect((result as any).settings.timezone).toBe('America/New_York');
      expect((result as any).settings.dateFormat).toBe('YYYY-MM-DD');
    });

    it('should update required fields settings for leads', async () => {
      const updateData = {
        settings: {
          requiredFields: {
            lead: {
              phone: true,
              company: true,
            },
          },
        },
      };

      const result = await orgService.updateOrganization(
        testOrgId,
        updateData,
        testUserId
      );

      expect((result as any).settings.requiredFields).toBeDefined();
      expect((result as any).settings.requiredFields.lead).toBeDefined();
      expect((result as any).settings.requiredFields.lead.phone).toBe(true);
      expect((result as any).settings.requiredFields.lead.company).toBe(true);
    });

    it('should update required fields settings for projects', async () => {
      const updateData = {
        settings: {
          requiredFields: {
            project: {
              client: true,
              description: true,
            },
          },
        },
      };

      const result = await orgService.updateOrganization(
        testOrgId,
        updateData,
        testUserId
      );

      expect((result as any).settings.requiredFields).toBeDefined();
      expect((result as any).settings.requiredFields.project).toBeDefined();
      expect((result as any).settings.requiredFields.project.client).toBe(true);
      expect((result as any).settings.requiredFields.project.description).toBe(true);
    });

    it('should update feature flags', async () => {
      const updateData = {
        settings: {
          features: {
            enableEmailNotifications: true,
            enableTaskReminders: true,
            enableAuditLog: false,
          },
        },
      };

      const result = await orgService.updateOrganization(
        testOrgId,
        updateData,
        testUserId
      );

      expect((result as any).settings.features).toBeDefined();
      expect((result as any).settings.features.enableEmailNotifications).toBe(true);
      expect((result as any).settings.features.enableTaskReminders).toBe(true);
      expect((result as any).settings.features.enableAuditLog).toBe(false);
    });

    it('should merge feature flags with existing features', async () => {
      // First update
      await orgService.updateOrganization(
        testOrgId,
        {
          settings: {
            features: {
              enableEmailNotifications: true,
              enableTaskReminders: false,
            },
          },
        },
        testUserId
      );

      // Second update
      const result = await orgService.updateOrganization(
        testOrgId,
        {
          settings: {
            features: {
              enableTaskReminders: true, // Update this
              enableAuditLog: true, // Add new
            },
          },
        },
        testUserId
      );

      expect((result as any).settings.features.enableEmailNotifications).toBe(true);
      expect((result as any).settings.features.enableTaskReminders).toBe(true);
      expect((result as any).settings.features.enableAuditLog).toBe(true);
    });

    it('should create audit log on update', async () => {
      const updateData = {
        name: 'Updated Name',
      };

      await orgService.updateOrganization(
        testOrgId,
        updateData,
        testUserId,
        '127.0.0.1',
        'Test User Agent'
      );

      const auditLog = await AuditLog.findOne({
        orgId: testOrgId,
        action: AuditAction.UPDATE,
        entityType: 'organization',
      });

      expect(auditLog).toBeDefined();
      expect(auditLog!.userId!.toString()).toBe(testUserId.toString());
      expect(auditLog!.entityId!.toString()).toBe(testOrgId.toString());
      expect(auditLog!.before).toBeDefined();
      expect(auditLog!.after).toBeDefined();
      expect(auditLog!.ip).toBe('127.0.0.1');
      expect(auditLog!.userAgent).toBe('Test User Agent');
    });

    it('should throw NotFoundError if organization does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      await expect(
        orgService.updateOrganization(
          nonExistentId,
          { name: 'New Name' },
          testUserId
        )
      ).rejects.toThrow(NotFoundError);
    });

    it('should rollback on error', async () => {
      // Create another org with existing domain
      await Organization.create({
        name: 'Other Org',
        domain: 'existing-domain',
      });

      const originalOrg = await Organization.findById(testOrgId);

      try {
        await orgService.updateOrganization(
          testOrgId,
          { domain: 'existing-domain' },
          testUserId
        );
      } catch (error) {
        // Expected to fail
      }

      const orgAfterError = await Organization.findById(testOrgId);
      expect(orgAfterError!.name).toBe(originalOrg!.name);
      expect(orgAfterError!.domain).toBe(originalOrg!.domain);
    });
  });

  describe('getOrganizationStats', () => {
    it('should return organization statistics', async () => {
      // Create test data
      await User.create({
        orgId: testOrgId,
        name: 'User 2',
        email: 'user2@test.com',
        passwordHash: 'Password123!',
        status: UserStatus.ACTIVE,
        roleIds: [],
        isEmailVerified: true,
      });

      await Lead.create([
        {
          orgId: testOrgId,
          title: 'Lead 1',
          company: 'Company 1',
          contactName: 'Contact 1',
          email: 'lead1@test.com',
          source: LeadSource.WEBSITE,
          status: LeadStatus.NEW,
        },
        {
          orgId: testOrgId,
          title: 'Lead 2',
          company: 'Company 2',
          contactName: 'Contact 2',
          email: 'lead2@test.com',
          source: LeadSource.REFERRAL,
          status: LeadStatus.QUALIFIED,
        },
      ]);

      await Project.create([
        {
          orgId: testOrgId,
          name: 'Project 1',
          status: ProjectStatus.ACTIVE,
          managerUserId: testUserId,
          members: [],
        },
      ]);

      await Task.create([
        {
          orgId: testOrgId,
          projectId: new mongoose.Types.ObjectId(),
          title: 'Task 1',
          status: TaskStatus.TODO,
        },
        {
          orgId: testOrgId,
          projectId: new mongoose.Types.ObjectId(),
          title: 'Task 2',
          status: TaskStatus.DONE,
        },
      ]);

      const result = await orgService.getOrganizationStats(testOrgId);

      expect(result.users).toBe(2); // testUserId + User 2
      expect(result.leads).toBe(2);
      expect(result.projects).toBe(1);
      expect(result.tasks).toBe(2);
    });

    it('should exclude soft-deleted tasks from count', async () => {
      await Task.create([
        {
          orgId: testOrgId,
          projectId: new mongoose.Types.ObjectId(),
          title: 'Active Task',
          status: TaskStatus.TODO,
        },
        {
          orgId: testOrgId,
          projectId: new mongoose.Types.ObjectId(),
          title: 'Deleted Task',
          status: TaskStatus.TODO,
          deletedAt: new Date(),
        },
      ]);

      const result = await orgService.getOrganizationStats(testOrgId);

      expect(result.tasks).toBe(1);
    });

    it('should return zero counts for empty organization', async () => {
      const emptyOrgId = new mongoose.Types.ObjectId();
      await Organization.create({
        _id: emptyOrgId,
        name: 'Empty Org',
        domain: 'empty-org',
      });

      const result = await orgService.getOrganizationStats(emptyOrgId);

      expect(result.users).toBe(0);
      expect(result.leads).toBe(0);
      expect(result.projects).toBe(0);
      expect(result.tasks).toBe(0);
    });

    it('should only count entities for the specific organization', async () => {
      // Create another organization with data
      const otherOrgId = new mongoose.Types.ObjectId();
      await Organization.create({
        _id: otherOrgId,
        name: 'Other Org',
        domain: 'other-org',
      });

      await User.create({
        orgId: otherOrgId,
        name: 'Other User',
        email: 'other@test.com',
        passwordHash: 'Password123!',
        status: UserStatus.ACTIVE,
        roleIds: [],
        isEmailVerified: true,
      });

      await Lead.create({
        orgId: otherOrgId,
        title: 'Other Lead',
        company: 'Other Company',
        contactName: 'Other Contact',
        email: 'otherlead@test.com',
        source: LeadSource.WEBSITE,
        status: LeadStatus.NEW,
      });

      const result = await orgService.getOrganizationStats(testOrgId);

      expect(result.users).toBe(1); // Only testUserId
      expect(result.leads).toBe(0);
      expect(result.projects).toBe(0);
      expect(result.tasks).toBe(0);
    });
  });
});