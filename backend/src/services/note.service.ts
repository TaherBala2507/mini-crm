import { Note, INote } from '../models/Note';
import { Lead } from '../models/Lead';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { AuditLog } from '../models/AuditLog';
import { AppError } from '../utils/errors';
import { CreateNoteInput, UpdateNoteInput, ListNotesQuery, ListNotesByEntityQuery } from '../validators/note.validator';
import { EntityType, AuditAction } from '../constants/enums';

export class NoteService {
  /**
   * Verify entity exists
   */
  private async verifyEntityExists(
    entityType: EntityType,
    entityId: string,
    orgId: string
  ): Promise<void> {
    let exists = false;

    switch (entityType) {
      case EntityType.LEAD:
        exists = !!(await Lead.findOne({ _id: entityId, orgId, deletedAt: null }));
        break;
      case EntityType.PROJECT:
        exists = !!(await Project.findOne({ _id: entityId, orgId, deletedAt: null }));
        break;
      case EntityType.TASK:
        exists = !!(await Task.findOne({ _id: entityId, orgId, deletedAt: null }));
        break;
    }

    if (!exists) {
      throw new AppError(404, `${entityType} not found`);
    }
  }

  /**
   * Create a new note
   */
  async createNote(
    data: CreateNoteInput,
    userId: string,
    orgId: string
  ): Promise<INote> {
    // Verify entity exists
    await this.verifyEntityExists(data.entityType, data.entityId, orgId);

    // Create note
    const note = await Note.create({
      ...data,
      orgId,
      authorUserId: userId,
    });

    // Log audit
    await AuditLog.create({
      orgId,
      userId,
      action: AuditAction.CREATE,
      entityType: EntityType.NOTE,
      entityId: note._id,
      metadata: {
        noteEntityType: note.entityType,
        noteEntityId: note.entityId,
      },
    });

    // Return populated note
    return await Note.findById(note._id)
      .populate('authorUserId', 'name email')
      .exec() as INote;
  }

  /**
   * List notes by entity
   */
  async listNotesByEntity(
    entityType: EntityType,
    entityId: string,
    query: ListNotesByEntityQuery,
    orgId: string
  ): Promise<{ notes: INote[]; total: number; page: number; limit: number }> {
    // Verify entity exists
    await this.verifyEntityExists(entityType, entityId, orgId);

    const { page = 1, limit = 20 } = query;

    const filter = {
      orgId,
      entityType,
      entityId,
    };

    const skip = (page - 1) * limit;

    const [notes, total] = await Promise.all([
      Note.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('authorUserId', 'name email')
        .exec(),
      Note.countDocuments(filter),
    ]);

    return {
      notes,
      total,
      page,
      limit,
    };
  }

  /**
   * List all notes with filters
   */
  async listNotes(
    query: ListNotesQuery,
    orgId: string
  ): Promise<{ notes: INote[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, entityType, entityId, authorUserId } = query;

    const filter: any = { orgId };

    if (entityType) {
      filter.entityType = entityType;
    }

    if (entityId) {
      filter.entityId = entityId;
    }

    if (authorUserId) {
      filter.authorUserId = authorUserId;
    }

    const skip = (page - 1) * limit;

    const [notes, total] = await Promise.all([
      Note.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('authorUserId', 'name email')
        .exec(),
      Note.countDocuments(filter),
    ]);

    return {
      notes,
      total,
      page,
      limit,
    };
  }

  /**
   * Get note by ID
   */
  async getNoteById(noteId: string, orgId: string): Promise<INote> {
    const note = await Note.findOne({
      _id: noteId,
      orgId,
    })
      .populate('authorUserId', 'name email')
      .exec();

    if (!note) {
      throw new AppError(404, 'Note not found');
    }

    return note;
  }

  /**
   * Update note
   */
  async updateNote(
    noteId: string,
    data: UpdateNoteInput,
    userId: string,
    orgId: string
  ): Promise<INote> {
    const note = await Note.findOne({
      _id: noteId,
      orgId,
    });

    if (!note) {
      throw new AppError(404, 'Note not found');
    }

    // Check if user is the author
    if (note.authorUserId.toString() !== userId) {
      throw new AppError(403, 'You can only edit your own notes');
    }

    // Track changes for audit
    const oldBody = note.body;

    // Update note
    note.body = data.body;
    await note.save();

    // Log audit
    await AuditLog.create({
      orgId,
      userId,
      action: AuditAction.UPDATE,
      entityType: EntityType.NOTE,
      entityId: note._id,
      metadata: {
        oldBody: oldBody.substring(0, 100), // Store first 100 chars
        newBody: data.body.substring(0, 100),
      },
    });

    // Return populated note
    return await Note.findById(note._id)
      .populate('authorUserId', 'name email')
      .exec() as INote;
  }

  /**
   * Delete note
   */
  async deleteNote(noteId: string, userId: string, orgId: string): Promise<void> {
    const note = await Note.findOne({
      _id: noteId,
      orgId,
    });

    if (!note) {
      throw new AppError(404, 'Note not found');
    }

    // Check if user is the author
    if (note.authorUserId.toString() !== userId) {
      throw new AppError(403, 'You can only delete your own notes');
    }

    // Delete note (hard delete for notes)
    await note.deleteOne();

    // Log audit
    await AuditLog.create({
      orgId,
      userId,
      action: AuditAction.DELETE,
      entityType: EntityType.NOTE,
      entityId: note._id,
      metadata: {
        noteEntityType: note.entityType,
        noteEntityId: note.entityId,
      },
    });
  }

  /**
   * Get note count by entity
   */
  async getNoteCountByEntity(
    entityType: EntityType,
    entityId: string,
    orgId: string
  ): Promise<number> {
    return await Note.countDocuments({
      orgId,
      entityType,
      entityId,
    });
  }
}