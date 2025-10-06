import mongoose from 'mongoose';
import { Attachment, IAttachment } from '../models/Attachment';
import { Lead } from '../models/Lead';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { AuditLog } from '../models/AuditLog';
import { EntityType, AuditAction } from '../constants/enums';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { deleteFile } from '../config/multer';
import {
  UploadAttachmentInput,
  ListAttachmentsInput,
} from '../validators/attachment.validator';

export class AttachmentService {
  /**
   * Upload a new attachment
   */
  async uploadAttachment(
    file: Express.Multer.File,
    data: UploadAttachmentInput,
    orgId: string,
    userId: string,
    ip?: string,
    userAgent?: string
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Verify entity exists and user has access
      await this.verifyEntityAccess(data.entityType, data.entityId, orgId);

      // Create attachment record
      const [attachment] = await Attachment.create(
        [
          {
            orgId,
            entityType: data.entityType,
            entityId: data.entityId,
            filename: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: file.size,
            storageUrl: file.path,
            uploadedBy: userId,
          },
        ],
        { session }
      );

      // Create audit log
      await AuditLog.create(
        [
          {
            orgId,
            userId: userId,
            action: AuditAction.CREATE,
            entityType: 'attachment',
            entityId: attachment._id,
            after: {
              filename: attachment.filename,
              entityType: attachment.entityType,
              entityId: attachment.entityId,
              sizeBytes: attachment.sizeBytes,
            },
            ip,
            userAgent,
          },
        ],
        { session }
      );

      await session.commitTransaction();

      // Populate uploader info
      await attachment.populate('uploadedBy', 'name email');

      return attachment;
    } catch (error) {
      await session.abortTransaction();
      // Delete uploaded file if transaction fails
      if (file.path) {
        deleteFile(file.path);
      }
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * List attachments with filters
   */
  async listAttachments(filters: ListAttachmentsInput, orgId: string) {
    const { entityType, entityId, uploadedBy, page, limit, search } = filters;

    // Build query
    const query: any = { orgId };

    if (entityType) {
      query.entityType = entityType;
    }

    if (entityId) {
      query.entityId = entityId;
    }

    if (uploadedBy) {
      query.uploadedBy = uploadedBy;
    }

    if (search) {
      query.filename = { $regex: search, $options: 'i' };
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;

    const [attachments, total] = await Promise.all([
      Attachment.find(query)
        .populate('uploadedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Attachment.countDocuments(query),
    ]);

    return {
      attachments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get attachment by ID
   */
  async getAttachmentById(attachmentId: string, orgId: string) {
    const attachment = await Attachment.findOne({
      _id: attachmentId,
      orgId,
    }).populate('uploadedBy', 'name email');

    if (!attachment) {
      throw new NotFoundError('Attachment not found');
    }

    return attachment;
  }

  /**
   * Delete attachment
   */
  async deleteAttachment(
    attachmentId: string,
    orgId: string,
    userId: string,
    ip?: string,
    userAgent?: string
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find attachment
      const attachment = await Attachment.findOne({
        _id: attachmentId,
        orgId,
      });

      if (!attachment) {
        throw new NotFoundError('Attachment not found');
      }

      // Store data for audit log before deletion
      const beforeData = {
        filename: attachment.filename,
        entityType: attachment.entityType,
        entityId: attachment.entityId,
        sizeBytes: attachment.sizeBytes,
      };

      // Delete from database
      await Attachment.deleteOne({ _id: attachmentId }, { session });

      // Create audit log
      await AuditLog.create(
        [
          {
            orgId,
            userId: userId,
            action: AuditAction.DELETE,
            entityType: 'attachment',
            entityId: attachment._id,
            before: beforeData,
            ip,
            userAgent,
          },
        ],
        { session }
      );

      await session.commitTransaction();

      // Delete physical file
      deleteFile(attachment.storageUrl);

      return { message: 'Attachment deleted successfully' };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get attachment statistics for an entity
   */
  async getEntityAttachmentStats(
    entityType: EntityType,
    entityId: string,
    orgId: string
  ) {
    const stats = await Attachment.aggregate([
      {
        $match: {
          orgId: new mongoose.Types.ObjectId(orgId),
          entityType,
          entityId: new mongoose.Types.ObjectId(entityId),
        },
      },
      {
        $group: {
          _id: null,
          totalFiles: { $sum: 1 },
          totalSize: { $sum: '$sizeBytes' },
          fileTypes: { $addToSet: '$mimeType' },
        },
      },
    ]);

    if (stats.length === 0) {
      return {
        totalFiles: 0,
        totalSize: 0,
        fileTypes: [],
      };
    }

    return {
      totalFiles: stats[0].totalFiles,
      totalSize: stats[0].totalSize,
      fileTypes: stats[0].fileTypes,
    };
  }

  /**
   * Verify entity exists and belongs to organization
   */
  private async verifyEntityAccess(
    entityType: EntityType,
    entityId: string,
    orgId: string
  ) {
    let entity;

    switch (entityType) {
      case EntityType.LEAD:
        entity = await Lead.findOne({ _id: entityId, orgId });
        break;
      case EntityType.PROJECT:
        entity = await Project.findOne({ _id: entityId, orgId });
        break;
      case EntityType.TASK:
        entity = await Task.findOne({ _id: entityId, orgId });
        break;
      default:
        throw new BadRequestError('Invalid entity type');
    }

    if (!entity) {
      throw new NotFoundError(`${entityType} not found or access denied`);
    }

    return entity;
  }

  /**
   * Get file path for download
   */
  getFilePath(attachment: IAttachment): string {
    return attachment.storageUrl;
  }

  /**
   * Get download filename
   */
  getDownloadFilename(attachment: IAttachment): string {
    return attachment.filename;
  }
}