import '../../tests/setup';
import { NoteService } from '../note.service';
import { Organization } from '../../models/Organization';
import { User } from '../../models/User';
import { Lead } from '../../models/Lead';
import { Project } from '../../models/Project';
import { Task } from '../../models/Task';
import { Note } from '../../models/Note';
import { AuditLog } from '../../models/AuditLog';
import {
  EntityType,
  UserStatus,
  LeadStatus,
  LeadSource,
  ProjectStatus,
  TaskStatus,
  TaskPriority,
} from '../../constants/enums';
import mongoose from 'mongoose';

describe('NoteService', () => {
  let noteService: NoteService;
  let testOrgId: mongoose.Types.ObjectId;
  let testUserId: mongoose.Types.ObjectId;
  let testUser2Id: mongoose.Types.ObjectId;
  let testLeadId: mongoose.Types.ObjectId;
  let testProjectId: mongoose.Types.ObjectId;
  let testTaskId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    noteService = new NoteService();
    testOrgId = new mongoose.Types.ObjectId();
    testUserId = new mongoose.Types.ObjectId();
    testUser2Id = new mongoose.Types.ObjectId();
    testLeadId = new mongoose.Types.ObjectId();
    testProjectId = new mongoose.Types.ObjectId();
    testTaskId = new mongoose.Types.ObjectId();

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

    // Create test lead
    await Lead.create({
      _id: testLeadId,
      orgId: testOrgId,
      title: 'Test Lead',
      company: 'Test Company',
      contactName: 'John Doe',
      source: LeadSource.WEBSITE,
      status: LeadStatus.NEW,
    });

    // Create test project
    await Project.create({
      _id: testProjectId,
      orgId: testOrgId,
      name: 'Test Project',
      description: 'Test description',
      status: ProjectStatus.ACTIVE,
    });

    // Create test task
    await Task.create({
      _id: testTaskId,
      orgId: testOrgId,
      projectId: testProjectId,
      title: 'Test Task',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
    });
  });

  describe('createNote', () => {
    it('should create a note for a lead', async () => {
      const noteData = {
        entityType: EntityType.LEAD,
        entityId: testLeadId.toString(),
        body: 'This is a test note for a lead',
      };

      const result = await noteService.createNote(
        noteData,
        testUserId.toString(),
        testOrgId.toString()
      );

      expect(result.body).toBe(noteData.body);
      expect(result.entityType).toBe(EntityType.LEAD);
      expect(result.entityId.toString()).toBe(testLeadId.toString());
      expect(result.authorUserId).toBeDefined();

      // Verify audit log was created
      const auditLog = await AuditLog.findOne({
        action: 'note.created',
      });
      expect(auditLog).toBeDefined();
    });

    it('should create a note for a project', async () => {
      const noteData = {
        entityType: EntityType.PROJECT,
        entityId: testProjectId.toString(),
        body: 'This is a test note for a project',
      };

      const result = await noteService.createNote(
        noteData,
        testUserId.toString(),
        testOrgId.toString()
      );

      expect(result.entityType).toBe(EntityType.PROJECT);
      expect(result.entityId.toString()).toBe(testProjectId.toString());
    });

    it('should create a note for a task', async () => {
      const noteData = {
        entityType: EntityType.TASK,
        entityId: testTaskId.toString(),
        body: 'This is a test note for a task',
      };

      const result = await noteService.createNote(
        noteData,
        testUserId.toString(),
        testOrgId.toString()
      );

      expect(result.entityType).toBe(EntityType.TASK);
      expect(result.entityId.toString()).toBe(testTaskId.toString());
    });

    it('should throw error if lead not found', async () => {
      const noteData = {
        entityType: EntityType.LEAD,
        entityId: new mongoose.Types.ObjectId().toString(),
        body: 'Test note',
      };

      await expect(
        noteService.createNote(noteData, testUserId.toString(), testOrgId.toString())
      ).rejects.toThrow('Lead not found');
    });

    it('should throw error if project not found', async () => {
      const noteData = {
        entityType: EntityType.PROJECT,
        entityId: new mongoose.Types.ObjectId().toString(),
        body: 'Test note',
      };

      await expect(
        noteService.createNote(noteData, testUserId.toString(), testOrgId.toString())
      ).rejects.toThrow('Project not found');
    });

    it('should throw error if task not found', async () => {
      const noteData = {
        entityType: EntityType.TASK,
        entityId: new mongoose.Types.ObjectId().toString(),
        body: 'Test note',
      };

      await expect(
        noteService.createNote(noteData, testUserId.toString(), testOrgId.toString())
      ).rejects.toThrow('Task not found');
    });
  });

  describe('listNotesByEntity', () => {
    beforeEach(async () => {
      // Create multiple notes for the lead
      await Note.create([
        {
          orgId: testOrgId,
          entityType: EntityType.LEAD,
          entityId: testLeadId,
          authorUserId: testUserId,
          body: 'Note 1',
        },
        {
          orgId: testOrgId,
          entityType: EntityType.LEAD,
          entityId: testLeadId,
          authorUserId: testUser2Id,
          body: 'Note 2',
        },
        {
          orgId: testOrgId,
          entityType: EntityType.LEAD,
          entityId: testLeadId,
          authorUserId: testUserId,
          body: 'Note 3',
        },
      ]);
    });

    it('should list all notes for an entity', async () => {
      const result = await noteService.listNotesByEntity(
        EntityType.LEAD,
        testLeadId.toString(),
        { page: 1, limit: 20 },
        testOrgId.toString()
      );

      expect(result.notes).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should handle pagination correctly', async () => {
      const result = await noteService.listNotesByEntity(
        EntityType.LEAD,
        testLeadId.toString(),
        { page: 2, limit: 2 },
        testOrgId.toString()
      );

      expect(result.notes).toHaveLength(1);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(2);
    });

    it('should throw error if entity not found', async () => {
      await expect(
        noteService.listNotesByEntity(
          EntityType.LEAD,
          new mongoose.Types.ObjectId().toString(),
          { page: 1, limit: 20 },
          testOrgId.toString()
        )
      ).rejects.toThrow('Lead not found');
    });
  });

  describe('listNotes', () => {
    beforeEach(async () => {
      await Note.create([
        {
          orgId: testOrgId,
          entityType: EntityType.LEAD,
          entityId: testLeadId,
          authorUserId: testUserId,
          body: 'Lead note',
        },
        {
          orgId: testOrgId,
          entityType: EntityType.PROJECT,
          entityId: testProjectId,
          authorUserId: testUser2Id,
          body: 'Project note',
        },
        {
          orgId: testOrgId,
          entityType: EntityType.TASK,
          entityId: testTaskId,
          authorUserId: testUserId,
          body: 'Task note',
        },
      ]);
    });

    it('should list all notes', async () => {
      const result = await noteService.listNotes(
        { page: 1, limit: 20 },
        testOrgId.toString()
      );

      expect(result.notes).toHaveLength(3);
      expect(result.total).toBe(3);
    });

    it('should filter notes by entity type', async () => {
      const result = await noteService.listNotes(
        { page: 1, limit: 20, entityType: EntityType.LEAD },
        testOrgId.toString()
      );

      expect(result.notes).toHaveLength(1);
      expect(result.notes[0].entityType).toBe(EntityType.LEAD);
    });

    it('should filter notes by entity id', async () => {
      const result = await noteService.listNotes(
        { page: 1, limit: 20, entityId: testProjectId.toString() },
        testOrgId.toString()
      );

      expect(result.notes).toHaveLength(1);
      expect(result.notes[0].entityId.toString()).toBe(testProjectId.toString());
    });

    it('should filter notes by author', async () => {
      const result = await noteService.listNotes(
        { page: 1, limit: 20, authorUserId: testUserId.toString() },
        testOrgId.toString()
      );

      expect(result.notes).toHaveLength(2);
    });
  });

  describe('getNoteById', () => {
    let noteId: mongoose.Types.ObjectId;

    beforeEach(async () => {
      const note = await Note.create({
        orgId: testOrgId,
        entityType: EntityType.LEAD,
        entityId: testLeadId,
        authorUserId: testUserId,
        body: 'Test note',
      });
      noteId = note._id as mongoose.Types.ObjectId;
    });

    it('should get note by id', async () => {
      const result = await noteService.getNoteById(
        noteId.toString(),
        testOrgId.toString()
      );

      expect(result._id.toString()).toBe(noteId.toString());
      expect(result.body).toBe('Test note');
    });

    it('should throw error if note not found', async () => {
      await expect(
        noteService.getNoteById(
          new mongoose.Types.ObjectId().toString(),
          testOrgId.toString()
        )
      ).rejects.toThrow('Note not found');
    });
  });

  describe('updateNote', () => {
    let noteId: mongoose.Types.ObjectId;

    beforeEach(async () => {
      const note = await Note.create({
        orgId: testOrgId,
        entityType: EntityType.LEAD,
        entityId: testLeadId,
        authorUserId: testUserId,
        body: 'Original note body',
      });
      noteId = note._id as mongoose.Types.ObjectId;
    });

    it('should update note body', async () => {
      const result = await noteService.updateNote(
        noteId.toString(),
        { body: 'Updated note body' },
        testUserId.toString(),
        testOrgId.toString()
      );

      expect(result.body).toBe('Updated note body');

      // Verify audit log
      const auditLog = await AuditLog.findOne({
        action: 'note.updated',
      });
      expect(auditLog).toBeDefined();
    });

    it('should throw error if note not found', async () => {
      await expect(
        noteService.updateNote(
          new mongoose.Types.ObjectId().toString(),
          { body: 'Updated' },
          testUserId.toString(),
          testOrgId.toString()
        )
      ).rejects.toThrow('Note not found');
    });

    it('should throw error if user is not the author', async () => {
      await expect(
        noteService.updateNote(
          noteId.toString(),
          { body: 'Updated' },
          testUser2Id.toString(),
          testOrgId.toString()
        )
      ).rejects.toThrow('You can only edit your own notes');
    });
  });

  describe('deleteNote', () => {
    let noteId: mongoose.Types.ObjectId;

    beforeEach(async () => {
      const note = await Note.create({
        orgId: testOrgId,
        entityType: EntityType.LEAD,
        entityId: testLeadId,
        authorUserId: testUserId,
        body: 'Note to delete',
      });
      noteId = note._id as mongoose.Types.ObjectId;
    });

    it('should delete note (hard delete)', async () => {
      await noteService.deleteNote(
        noteId.toString(),
        testUserId.toString(),
        testOrgId.toString()
      );

      const note = await Note.findById(noteId);
      expect(note).toBeNull();

      // Verify audit log
      const auditLog = await AuditLog.findOne({
        action: 'note.deleted',
      });
      expect(auditLog).toBeDefined();
    });

    it('should throw error if note not found', async () => {
      await expect(
        noteService.deleteNote(
          new mongoose.Types.ObjectId().toString(),
          testUserId.toString(),
          testOrgId.toString()
        )
      ).rejects.toThrow('Note not found');
    });

    it('should throw error if user is not the author', async () => {
      await expect(
        noteService.deleteNote(
          noteId.toString(),
          testUser2Id.toString(),
          testOrgId.toString()
        )
      ).rejects.toThrow('You can only delete your own notes');
    });
  });

  describe('getNoteCountByEntity', () => {
    beforeEach(async () => {
      await Note.create([
        {
          orgId: testOrgId,
          entityType: EntityType.LEAD,
          entityId: testLeadId,
          authorUserId: testUserId,
          body: 'Note 1',
        },
        {
          orgId: testOrgId,
          entityType: EntityType.LEAD,
          entityId: testLeadId,
          authorUserId: testUser2Id,
          body: 'Note 2',
        },
        {
          orgId: testOrgId,
          entityType: EntityType.PROJECT,
          entityId: testProjectId,
          authorUserId: testUserId,
          body: 'Project note',
        },
      ]);
    });

    it('should get note count for lead', async () => {
      const count = await noteService.getNoteCountByEntity(
        EntityType.LEAD,
        testLeadId.toString(),
        testOrgId.toString()
      );

      expect(count).toBe(2);
    });

    it('should get note count for project', async () => {
      const count = await noteService.getNoteCountByEntity(
        EntityType.PROJECT,
        testProjectId.toString(),
        testOrgId.toString()
      );

      expect(count).toBe(1);
    });

    it('should return 0 for entity with no notes', async () => {
      const count = await noteService.getNoteCountByEntity(
        EntityType.TASK,
        testTaskId.toString(),
        testOrgId.toString()
      );

      expect(count).toBe(0);
    });
  });
});