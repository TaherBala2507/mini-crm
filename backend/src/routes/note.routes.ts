import { Router } from 'express';
import { NoteController } from '../controllers/note.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { validate } from '../middleware/validation';
import { Permission } from '../constants/permissions';
import {
  createNoteSchema,
  updateNoteSchema,
  getNoteSchema,
  deleteNoteSchema,
  listNotesByEntitySchema,
  listNotesSchema,
} from '../validators/note.validator';

const router = Router();
const noteController = new NoteController();

/**
 * @route   POST /api/notes
 * @desc    Create a new note
 * @access  Private (NOTE_CREATE permission required)
 */
router.post(
  '/',
  authenticate,
  requirePermission(Permission.NOTE_CREATE),
  validate(createNoteSchema),
  noteController.createNote
);

/**
 * @route   GET /api/notes
 * @desc    List all notes with filters
 * @access  Private (NOTE_VIEW permission required)
 */
router.get(
  '/',
  authenticate,
  requirePermission(Permission.NOTE_VIEW),
  validate(listNotesSchema),
  noteController.listNotes
);

/**
 * @route   GET /api/notes/:entityType/:entityId
 * @desc    List notes by entity
 * @access  Private (NOTE_VIEW permission required)
 */
router.get(
  '/:entityType/:entityId',
  authenticate,
  requirePermission(Permission.NOTE_VIEW),
  validate(listNotesByEntitySchema),
  noteController.listNotesByEntity
);

/**
 * @route   GET /api/notes/:entityType/:entityId/count
 * @desc    Get note count by entity
 * @access  Private (NOTE_VIEW permission required)
 */
router.get(
  '/:entityType/:entityId/count',
  authenticate,
  requirePermission(Permission.NOTE_VIEW),
  noteController.getNoteCount
);

/**
 * @route   GET /api/notes/:id
 * @desc    Get note by ID
 * @access  Private (NOTE_VIEW permission required)
 */
router.get(
  '/:id',
  authenticate,
  requirePermission(Permission.NOTE_VIEW),
  validate(getNoteSchema),
  noteController.getNote
);

/**
 * @route   PATCH /api/notes/:id
 * @desc    Update note (author only)
 * @access  Private (NOTE_UPDATE permission required)
 */
router.patch(
  '/:id',
  authenticate,
  requirePermission(Permission.NOTE_UPDATE),
  validate(updateNoteSchema),
  noteController.updateNote
);

/**
 * @route   DELETE /api/notes/:id
 * @desc    Delete note (author only)
 * @access  Private (NOTE_DELETE permission required)
 */
router.delete(
  '/:id',
  authenticate,
  requirePermission(Permission.NOTE_DELETE),
  validate(deleteNoteSchema),
  noteController.deleteNote
);

export default router;