import '../../tests/setup';
import { AttachmentService } from '../attachment.service';
import { Organization } from '../../models/Organization';
import { User } from '../../models/User';
import { Lead } from '../../models/Lead';
import { Project } from '../../models/Project';
import { Task } from '../../models/Task';
import { Attachment } from '../../models/Attachment';
import { AuditLog } from '../../models/AuditLog';
import { 
  EntityType, 
  UserStatus, 
  LeadStatus,
  LeadSource, 
  ProjectStatus, 
  TaskStatus,
  AuditAction 
} from '../../constants/enums';
import { NotFoundError } from '../../utils/errors';
import mongoose from 'mongoose';

// Mock the multer deleteFile function
jest.mock('../../config/multer', () => ({
  deleteFile: jest.fn(),
}));

import { deleteFile } from '../../config/multer';

describe('AttachmentService', () => {
  let attachmentService: AttachmentService;
  let testOrgId: mongoose.Types.ObjectId;
  let testUserId: mongoose.Types.ObjectId;
  let testLeadId: mongoose.Types.ObjectId;
  let testProjectId: mongoose.Types.ObjectId;
  let testTaskId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    attachmentService = new AttachmentService();
    testOrgId = new mongoose.Types.ObjectId();
    testUserId = new mongoose.Types.ObjectId();
    testLeadId = new mongoose.Types.ObjectId();
    testProjectId = new mongoose.Types.ObjectId();
    testTaskId = new mongoose.Types.ObjectId();

    // Clear mock
    (deleteFile as jest.Mock).mockClear();

    // Create test organization
    await Organization.create({
      _id: testOrgId,
      name: 'Test Org',
      domain: 'test-attachment-org',
    });

    // Create test user
    await User.create({
      _id: testUserId,
      orgId: testOrgId,
      name: 'Test User',
      email: 'attachment@test.com',
      passwordHash: 'Password123!',
      status: UserStatus.ACTIVE,
      roleIds: [],
      isEmailVerified: true,
    });

    // Create test entities
    await Lead.create({
      _id: testLeadId,
      orgId: testOrgId,
      title: 'Test Lead',
      company: 'Test Company',
      contactName: 'Test Contact',
      email: 'lead@test.com',
      source: LeadSource.WEBSITE,
      status: LeadStatus.NEW,
    });

    await Project.create({
      _id: testProjectId,
      orgId: testOrgId,
      name: 'Test Project',
      status: ProjectStatus.ACTIVE,
      managerUserId: testUserId,
      members: [],
    });

    await Task.create({
      _id: testTaskId,
      orgId: testOrgId,
      projectId: testProjectId,
      title: 'Test Task',
      status: TaskStatus.TODO,
    });
  });

  describe('uploadAttachment', () => {
    it('should upload attachment to lead', async () => {
      const mockFile: Express.Multer.File = {
        originalname: 'test-document.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        path: '/uploads/test-document.pdf',
      } as Express.Multer.File;

      const uploadData = {
        entityType: EntityType.LEAD,
        entityId: testLeadId.toString(),
      };

      const result = await attachmentService.uploadAttachment(
        mockFile,
        uploadData,
        testOrgId.toString(),
        testUserId.toString()
      );

      expect(result).toBeDefined();
      expect(result.filename).toBe('test-document.pdf');
      expect(result.mimeType).toBe('application/pdf');
      expect(result.sizeBytes).toBe(1024);
      expect(result.entityType).toBe(EntityType.LEAD);
      expect(result.entityId.toString()).toBe(testLeadId.toString());
      expect(result.uploadedBy).toBeDefined();
    });

    it('should upload attachment to project', async () => {
      const mockFile: Express.Multer.File = {
        originalname: 'project-plan.docx',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 2048,
        path: '/uploads/project-plan.docx',
      } as Express.Multer.File;

      const uploadData = {
        entityType: EntityType.PROJECT,
        entityId: testProjectId.toString(),
      };

      const result = await attachmentService.uploadAttachment(
        mockFile,
        uploadData,
        testOrgId.toString(),
        testUserId.toString()
      );

      expect(result.entityType).toBe(EntityType.PROJECT);
      expect(result.entityId.toString()).toBe(testProjectId.toString());
    });

    it('should upload attachment to task', async () => {
      const mockFile: Express.Multer.File = {
        originalname: 'screenshot.png',
        mimetype: 'image/png',
        size: 512,
        path: '/uploads/screenshot.png',
      } as Express.Multer.File;

      const uploadData = {
        entityType: EntityType.TASK,
        entityId: testTaskId.toString(),
      };

      const result = await attachmentService.uploadAttachment(
        mockFile,
        uploadData,
        testOrgId.toString(),
        testUserId.toString()
      );

      expect(result.entityType).toBe(EntityType.TASK);
      expect(result.entityId.toString()).toBe(testTaskId.toString());
    });

    it('should create audit log on upload', async () => {
      const mockFile: Express.Multer.File = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        path: '/uploads/test.pdf',
      } as Express.Multer.File;

      const uploadData = {
        entityType: EntityType.LEAD,
        entityId: testLeadId.toString(),
      };

      await attachmentService.uploadAttachment(
        mockFile,
        uploadData,
        testOrgId.toString(),
        testUserId.toString(),
        '127.0.0.1',
        'Test User Agent'
      );

      const auditLog = await AuditLog.findOne({
        orgId: testOrgId,
        action: AuditAction.CREATE,
        entityType: 'attachment',
      });

      expect(auditLog).toBeDefined();
      expect(auditLog!.userId!.toString()).toBe(testUserId.toString());
      expect(auditLog!.ip).toBe('127.0.0.1');
      expect(auditLog!.userAgent).toBe('Test User Agent');
      expect(auditLog!.after).toBeDefined();
    });

    it('should throw NotFoundError if entity does not exist', async () => {
      const mockFile: Express.Multer.File = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        path: '/uploads/test.pdf',
      } as Express.Multer.File;

      const nonExistentId = new mongoose.Types.ObjectId();
      const uploadData = {
        entityType: EntityType.LEAD,
        entityId: nonExistentId.toString(),
      };

      await expect(
        attachmentService.uploadAttachment(
          mockFile,
          uploadData,
          testOrgId.toString(),
          testUserId.toString()
        )
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if entity belongs to different org', async () => {
      const otherOrgId = new mongoose.Types.ObjectId();
      await Organization.create({
        _id: otherOrgId,
        name: 'Other Org',
        domain: 'other-org',
      });

      const mockFile: Express.Multer.File = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        path: '/uploads/test.pdf',
      } as Express.Multer.File;

      const uploadData = {
        entityType: EntityType.LEAD,
        entityId: testLeadId.toString(),
      };

      await expect(
        attachmentService.uploadAttachment(
          mockFile,
          uploadData,
          otherOrgId.toString(),
          testUserId.toString()
        )
      ).rejects.toThrow(NotFoundError);
    });

    it('should delete file on transaction failure', async () => {
      const mockFile: Express.Multer.File = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        path: '/uploads/test.pdf',
      } as Express.Multer.File;

      const nonExistentId = new mongoose.Types.ObjectId();
      const uploadData = {
        entityType: EntityType.LEAD,
        entityId: nonExistentId.toString(),
      };

      try {
        await attachmentService.uploadAttachment(
          mockFile,
          uploadData,
          testOrgId.toString(),
          testUserId.toString()
        );
      } catch (error) {
        // Expected to fail
      }

      expect(deleteFile).toHaveBeenCalledWith('/uploads/test.pdf');
    });
  });

  describe('listAttachments', () => {
    beforeEach(async () => {
      // Create test attachments with different timestamps
      const now = new Date();
      await Attachment.create([
        {
          orgId: testOrgId,
          entityType: EntityType.LEAD,
          entityId: testLeadId,
          filename: 'lead-doc.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 1024,
          storageUrl: '/uploads/lead-doc.pdf',
          uploadedBy: testUserId,
          createdAt: new Date(now.getTime() - 2000), // 2 seconds ago
        },
        {
          orgId: testOrgId,
          entityType: EntityType.PROJECT,
          entityId: testProjectId,
          filename: 'project-plan.docx',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          sizeBytes: 2048,
          storageUrl: '/uploads/project-plan.docx',
          uploadedBy: testUserId,
          createdAt: new Date(now.getTime() - 1000), // 1 second ago
        },
        {
          orgId: testOrgId,
          entityType: EntityType.TASK,
          entityId: testTaskId,
          filename: 'screenshot.png',
          mimeType: 'image/png',
          sizeBytes: 512,
          storageUrl: '/uploads/screenshot.png',
          uploadedBy: testUserId,
          createdAt: now, // Most recent
        },
      ]);
    });

    it('should list all attachments for organization', async () => {
      const result = await attachmentService.listAttachments(
        { page: 1, limit: 10 },
        testOrgId.toString()
      );

      expect(result.attachments.length).toBe(3);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.pages).toBe(1);
    });

    it('should filter by entity type', async () => {
      const result = await attachmentService.listAttachments(
        { entityType: EntityType.LEAD, page: 1, limit: 10 },
        testOrgId.toString()
      );

      expect(result.attachments.length).toBe(1);
      expect(result.attachments[0].entityType).toBe(EntityType.LEAD);
    });

    it('should filter by entity ID', async () => {
      const result = await attachmentService.listAttachments(
        { entityId: testProjectId.toString(), page: 1, limit: 10 },
        testOrgId.toString()
      );

      expect(result.attachments.length).toBe(1);
      expect(result.attachments[0].entityId.toString()).toBe(testProjectId.toString());
    });

    it('should filter by uploader', async () => {
      const result = await attachmentService.listAttachments(
        { uploadedBy: testUserId.toString(), page: 1, limit: 10 },
        testOrgId.toString()
      );

      expect(result.attachments.length).toBe(3);
    });

    it('should search by filename', async () => {
      const result = await attachmentService.listAttachments(
        { search: 'screenshot', page: 1, limit: 10 },
        testOrgId.toString()
      );

      expect(result.attachments.length).toBe(1);
      expect(result.attachments[0].filename).toBe('screenshot.png');
    });

    it('should search case-insensitively', async () => {
      const result = await attachmentService.listAttachments(
        { search: 'SCREENSHOT', page: 1, limit: 10 },
        testOrgId.toString()
      );

      expect(result.attachments.length).toBe(1);
    });

    it('should paginate results', async () => {
      const result = await attachmentService.listAttachments(
        { page: 1, limit: 2 },
        testOrgId.toString()
      );

      expect(result.attachments.length).toBe(2);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.pages).toBe(2);
    });

    it('should sort by createdAt descending', async () => {
      const result = await attachmentService.listAttachments(
        { page: 1, limit: 10 },
        testOrgId.toString()
      );

      // Most recent first
      expect(result.attachments[0].filename).toBe('screenshot.png');
    });

    it('should populate uploader information', async () => {
      const result = await attachmentService.listAttachments(
        { page: 1, limit: 10 },
        testOrgId.toString()
      );

      expect(result.attachments[0].uploadedBy).toBeDefined();
      expect((result.attachments[0].uploadedBy as any).name).toBe('Test User');
    });
  });

  describe('getAttachmentById', () => {
    let attachmentId: mongoose.Types.ObjectId;

    beforeEach(async () => {
      const attachment = await Attachment.create({
        orgId: testOrgId,
        entityType: EntityType.LEAD,
        entityId: testLeadId,
        filename: 'test.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1024,
        storageUrl: '/uploads/test.pdf',
        uploadedBy: testUserId,
      });
      attachmentId = attachment._id;
    });

    it('should get attachment by ID', async () => {
      const result = await attachmentService.getAttachmentById(
        attachmentId.toString(),
        testOrgId.toString()
      );

      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(attachmentId.toString());
      expect(result.filename).toBe('test.pdf');
    });

    it('should populate uploader information', async () => {
      const result = await attachmentService.getAttachmentById(
        attachmentId.toString(),
        testOrgId.toString()
      );

      expect(result.uploadedBy).toBeDefined();
      expect((result.uploadedBy as any).name).toBe('Test User');
    });

    it('should throw NotFoundError if attachment does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      await expect(
        attachmentService.getAttachmentById(
          nonExistentId.toString(),
          testOrgId.toString()
        )
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if attachment belongs to different org', async () => {
      const otherOrgId = new mongoose.Types.ObjectId();

      await expect(
        attachmentService.getAttachmentById(
          attachmentId.toString(),
          otherOrgId.toString()
        )
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteAttachment', () => {
    let attachmentId: mongoose.Types.ObjectId;

    beforeEach(async () => {
      const attachment = await Attachment.create({
        orgId: testOrgId,
        entityType: EntityType.LEAD,
        entityId: testLeadId,
        filename: 'test.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1024,
        storageUrl: '/uploads/test.pdf',
        uploadedBy: testUserId,
      });
      attachmentId = attachment._id;
    });

    it('should delete attachment', async () => {
      const result = await attachmentService.deleteAttachment(
        attachmentId.toString(),
        testOrgId.toString(),
        testUserId.toString()
      );

      expect(result.message).toBe('Attachment deleted successfully');

      const deletedAttachment = await Attachment.findById(attachmentId);
      expect(deletedAttachment).toBeNull();
    });

    it('should delete physical file', async () => {
      await attachmentService.deleteAttachment(
        attachmentId.toString(),
        testOrgId.toString(),
        testUserId.toString()
      );

      expect(deleteFile).toHaveBeenCalledWith('/uploads/test.pdf');
    });

    it('should create audit log on delete', async () => {
      await attachmentService.deleteAttachment(
        attachmentId.toString(),
        testOrgId.toString(),
        testUserId.toString(),
        '127.0.0.1',
        'Test User Agent'
      );

      const auditLog = await AuditLog.findOne({
        orgId: testOrgId,
        action: AuditAction.DELETE,
        entityType: 'attachment',
      });

      expect(auditLog).toBeDefined();
      expect(auditLog!.userId!.toString()).toBe(testUserId.toString());
      expect(auditLog!.entityId!.toString()).toBe(attachmentId.toString());
      expect(auditLog!.before).toBeDefined();
      expect(auditLog!.ip).toBe('127.0.0.1');
      expect(auditLog!.userAgent).toBe('Test User Agent');
    });

    it('should throw NotFoundError if attachment does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      await expect(
        attachmentService.deleteAttachment(
          nonExistentId.toString(),
          testOrgId.toString(),
          testUserId.toString()
        )
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if attachment belongs to different org', async () => {
      const otherOrgId = new mongoose.Types.ObjectId();

      await expect(
        attachmentService.deleteAttachment(
          attachmentId.toString(),
          otherOrgId.toString(),
          testUserId.toString()
        )
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getEntityAttachmentStats', () => {
    it('should return attachment statistics for entity', async () => {
      await Attachment.create([
        {
          orgId: testOrgId,
          entityType: EntityType.LEAD,
          entityId: testLeadId,
          filename: 'doc1.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 1024,
          storageUrl: '/uploads/doc1.pdf',
          uploadedBy: testUserId,
        },
        {
          orgId: testOrgId,
          entityType: EntityType.LEAD,
          entityId: testLeadId,
          filename: 'doc2.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 2048,
          storageUrl: '/uploads/doc2.pdf',
          uploadedBy: testUserId,
        },
        {
          orgId: testOrgId,
          entityType: EntityType.LEAD,
          entityId: testLeadId,
          filename: 'image.png',
          mimeType: 'image/png',
          sizeBytes: 512,
          storageUrl: '/uploads/image.png',
          uploadedBy: testUserId,
        },
      ]);

      const result = await attachmentService.getEntityAttachmentStats(
        EntityType.LEAD,
        testLeadId.toString(),
        testOrgId.toString()
      );

      expect(result.totalFiles).toBe(3);
      expect(result.totalSize).toBe(3584); // 1024 + 2048 + 512
      expect(result.fileTypes).toContain('application/pdf');
      expect(result.fileTypes).toContain('image/png');
      expect(result.fileTypes.length).toBe(2);
    });

    it('should return zero stats for entity with no attachments', async () => {
      const result = await attachmentService.getEntityAttachmentStats(
        EntityType.PROJECT,
        testProjectId.toString(),
        testOrgId.toString()
      );

      expect(result.totalFiles).toBe(0);
      expect(result.totalSize).toBe(0);
      expect(result.fileTypes).toEqual([]);
    });

    it('should only count attachments for specific entity', async () => {
      await Attachment.create([
        {
          orgId: testOrgId,
          entityType: EntityType.LEAD,
          entityId: testLeadId,
          filename: 'lead-doc.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 1024,
          storageUrl: '/uploads/lead-doc.pdf',
          uploadedBy: testUserId,
        },
        {
          orgId: testOrgId,
          entityType: EntityType.PROJECT,
          entityId: testProjectId,
          filename: 'project-doc.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 2048,
          storageUrl: '/uploads/project-doc.pdf',
          uploadedBy: testUserId,
        },
      ]);

      const result = await attachmentService.getEntityAttachmentStats(
        EntityType.LEAD,
        testLeadId.toString(),
        testOrgId.toString()
      );

      expect(result.totalFiles).toBe(1);
      expect(result.totalSize).toBe(1024);
    });
  });

  describe('getFilePath', () => {
    it('should return storage URL as file path', () => {
      const attachment = {
        storageUrl: '/uploads/test.pdf',
      } as any;

      const result = attachmentService.getFilePath(attachment);

      expect(result).toBe('/uploads/test.pdf');
    });
  });

  describe('getDownloadFilename', () => {
    it('should return original filename', () => {
      const attachment = {
        filename: 'test-document.pdf',
      } as any;

      const result = attachmentService.getDownloadFilename(attachment);

      expect(result).toBe('test-document.pdf');
    });
  });
});