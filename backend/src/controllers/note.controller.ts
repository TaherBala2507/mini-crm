import { Request, Response } from 'express';
import { NoteService } from '../services/note.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/response';
import { EntityType } from '../constants/enums';

const noteService = new NoteService();

export class NoteController {
  /**
   * Create a new note
   * POST /api/notes
   */
  createNote = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const orgId = req.user!.orgId.toString();

    const note = await noteService.createNote(req.body, userId, orgId);

    res.status(201).json(ApiResponse.success(note, 'Note created successfully'));
  });

  /**
   * List notes by entity
   * GET /api/notes/:entityType/:entityId
   */
  listNotesByEntity = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.user!.orgId.toString();
    const { entityType, entityId } = req.params;

    const result = await noteService.listNotesByEntity(
      entityType as EntityType,
      entityId,
      req.query,
      orgId
    );

    res.json(ApiResponse.success(result));
  });

  /**
   * List all notes with filters
   * GET /api/notes
   */
  listNotes = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.user!.orgId.toString();

    const result = await noteService.listNotes(req.query, orgId);

    res.json(ApiResponse.success(result));
  });

  /**
   * Get note by ID
   * GET /api/notes/:id
   */
  getNote = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.user!.orgId.toString();
    const { id } = req.params;

    const note = await noteService.getNoteById(id, orgId);

    res.json(ApiResponse.success(note));
  });

  /**
   * Update note
   * PATCH /api/notes/:id
   */
  updateNote = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const orgId = req.user!.orgId.toString();
    const { id } = req.params;

    const note = await noteService.updateNote(id, req.body, userId, orgId);

    res.json(ApiResponse.success(note, 'Note updated successfully'));
  });

  /**
   * Delete note
   * DELETE /api/notes/:id
   */
  deleteNote = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const orgId = req.user!.orgId.toString();
    const { id } = req.params;

    await noteService.deleteNote(id, userId, orgId);

    res.json(ApiResponse.success(null, 'Note deleted successfully'));
  });

  /**
   * Get note count by entity
   * GET /api/notes/:entityType/:entityId/count
   */
  getNoteCount = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.user!.orgId.toString();
    const { entityType, entityId } = req.params;

    const count = await noteService.getNoteCountByEntity(
      entityType as EntityType,
      entityId,
      orgId
    );

    res.json(ApiResponse.success({ count }));
  });
}