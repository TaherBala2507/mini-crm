import { Request, Response, NextFunction } from 'express';
import { AttachmentService } from '../services/attachment.service';
import { BadRequestError } from '../utils/errors';
import {
  UploadAttachmentInput,
  ListAttachmentsInput,
  GetAttachmentByIdInput,
  DeleteAttachmentInput,
} from '../validators/attachment.validator';
import { fileExists } from '../config/multer';

const attachmentService = new AttachmentService();

export class AttachmentController {
  /**
   * Upload attachment
   * POST /api/attachments
   */
  async uploadAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      // Check if file was uploaded
      if (!req.file) {
        throw new BadRequestError('No file uploaded');
      }

      const data = req.body as UploadAttachmentInput;
      const orgId = req.user!.orgId.toString();
      const userId = req.user!._id.toString();
      const ip = req.ip;
      const userAgent = req.get('user-agent');

      const attachment = await attachmentService.uploadAttachment(
        req.file,
        data,
        orgId,
        userId,
        ip,
        userAgent
      );

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: attachment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload multiple attachments
   * POST /api/attachments/bulk
   */
  async uploadMultipleAttachments(req: Request, res: Response, next: NextFunction) {
    try {
      // Check if files were uploaded
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new BadRequestError('No files uploaded');
      }

      const data = req.body as UploadAttachmentInput;
      const orgId = req.user!.orgId.toString();
      const userId = req.user!._id.toString();
      const ip = req.ip;
      const userAgent = req.get('user-agent');

      // Upload all files
      const uploadPromises = (req.files as Express.Multer.File[]).map((file) =>
        attachmentService.uploadAttachment(file, data, orgId, userId, ip, userAgent)
      );

      const attachments = await Promise.all(uploadPromises);

      res.status(201).json({
        success: true,
        message: `${attachments.length} file(s) uploaded successfully`,
        data: attachments,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List attachments
   * GET /api/attachments
   */
  async listAttachments(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.query as unknown as ListAttachmentsInput;
      const orgId = req.user!.orgId.toString();

      const result = await attachmentService.listAttachments(filters, orgId);

      res.json({
        success: true,
        data: result.attachments,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get attachment by ID
   * GET /api/attachments/:id
   */
  async getAttachmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as GetAttachmentByIdInput;
      const orgId = req.user!.orgId.toString();

      const attachment = await attachmentService.getAttachmentById(id, orgId);

      res.json({
        success: true,
        data: attachment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download attachment
   * GET /api/attachments/:id/download
   */
  async downloadAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as GetAttachmentByIdInput;
      const orgId = req.user!.orgId.toString();

      const attachment = await attachmentService.getAttachmentById(id, orgId);
      const filePath = attachmentService.getFilePath(attachment);

      // Check if file exists
      if (!fileExists(filePath)) {
        throw new BadRequestError('File not found on server');
      }

      // Set headers for download
      res.setHeader('Content-Type', attachment.mimeType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${attachmentService.getDownloadFilename(attachment)}"`
      );
      res.setHeader('Content-Length', attachment.sizeBytes);

      // Stream file to response
      res.sendFile(filePath);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete attachment
   * DELETE /api/attachments/:id
   */
  async deleteAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as DeleteAttachmentInput;
      const orgId = req.user!.orgId.toString();
      const userId = req.user!._id.toString();
      const ip = req.ip;
      const userAgent = req.get('user-agent');

      const result = await attachmentService.deleteAttachment(
        id,
        orgId,
        userId,
        ip,
        userAgent
      );

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get entity attachment statistics
   * GET /api/attachments/stats/:entityType/:entityId
   */
  async getEntityStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { entityType, entityId } = req.params;
      const orgId = req.user!.orgId.toString();

      const stats = await attachmentService.getEntityAttachmentStats(
        entityType as any,
        entityId,
        orgId
      );

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}