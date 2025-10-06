import { Router } from 'express';
import { AttachmentController } from '../controllers/attachment.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { validate } from '../middleware/validation';
import { Permission } from '../constants/permissions';
import { upload } from '../config/multer';
import {
  uploadAttachmentSchema,
  listAttachmentsSchema,
  getAttachmentByIdSchema,
  deleteAttachmentSchema,
} from '../validators/attachment.validator';

const router = Router();
const controller = new AttachmentController();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/attachments
 * @desc    Upload a single attachment
 * @access  Private (requires FILE_UPLOAD permission)
 */
router.post(
  '/',
  requirePermission(Permission.FILE_UPLOAD),
  upload.single('file'),
  validate(uploadAttachmentSchema),
  controller.uploadAttachment.bind(controller)
);

/**
 * @route   POST /api/attachments/bulk
 * @desc    Upload multiple attachments
 * @access  Private (requires FILE_UPLOAD permission)
 */
router.post(
  '/bulk',
  requirePermission(Permission.FILE_UPLOAD),
  upload.array('files', 5),
  validate(uploadAttachmentSchema),
  controller.uploadMultipleAttachments.bind(controller)
);

/**
 * @route   GET /api/attachments
 * @desc    List attachments with filters
 * @access  Private (requires FILE_VIEW permission)
 */
router.get(
  '/',
  requirePermission(Permission.FILE_VIEW),
  validate(listAttachmentsSchema),
  controller.listAttachments.bind(controller)
);

/**
 * @route   GET /api/attachments/stats/:entityType/:entityId
 * @desc    Get attachment statistics for an entity
 * @access  Private (requires FILE_VIEW permission)
 */
router.get(
  '/stats/:entityType/:entityId',
  requirePermission(Permission.FILE_VIEW),
  controller.getEntityStats.bind(controller)
);

/**
 * @route   GET /api/attachments/:id
 * @desc    Get attachment details by ID
 * @access  Private (requires FILE_VIEW permission)
 */
router.get(
  '/:id',
  requirePermission(Permission.FILE_VIEW),
  validate(getAttachmentByIdSchema),
  controller.getAttachmentById.bind(controller)
);

/**
 * @route   GET /api/attachments/:id/download
 * @desc    Download attachment file
 * @access  Private (requires FILE_DOWNLOAD permission)
 */
router.get(
  '/:id/download',
  requirePermission(Permission.FILE_DOWNLOAD),
  validate(getAttachmentByIdSchema),
  controller.downloadAttachment.bind(controller)
);

/**
 * @route   DELETE /api/attachments/:id
 * @desc    Delete attachment
 * @access  Private (requires FILE_DELETE permission)
 */
router.delete(
  '/:id',
  requirePermission(Permission.FILE_DELETE),
  validate(deleteAttachmentSchema),
  controller.deleteAttachment.bind(controller)
);

export default router;