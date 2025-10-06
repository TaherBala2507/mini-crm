import '../../tests/setup';
import request from 'supertest';
import { createApp } from '../../app';
import { Organization } from '../../models/Organization';
import { User } from '../../models/User';
import { Role } from '../../models/Role';
import { AuditLog } from '../../models/AuditLog';
import { RoleName } from '../../constants/roles';
import { UserStatus, AuditAction } from '../../constants/enums';
import { Permission } from '../../constants/permissions';
import { generateTestToken } from '../../tests/helpers/testData';
import mongoose from 'mongoose';

const app = createApp();

describe('Role Routes', () => {
  let testOrgId: mongoose.Types.ObjectId;
  let adminUserId: mongoose.Types.ObjectId;
  let userUserId: mongoose.Types.ObjectId;
  let adminRoleId: mongoose.Types.ObjectId;
  let userRoleId: mongoose.Types.ObjectId;
  let adminToken: string;
  let userToken: string;

  beforeEach(async () => {
    testOrgId = new mongoose.Types.ObjectId();
    adminUserId = new mongoose.Types.ObjectId();
    userUserId = new mongoose.Types.ObjectId();
    adminRoleId = new mongoose.Types.ObjectId();
    userRoleId = new mongoose.Types.ObjectId();

    // Create organization
    await Organization.create({
      _id: testOrgId,
      name: 'Test Org',
      domain: 'test-org',
    });

    // Create roles
    await Role.create([
      {
        _id: adminRoleId,
        orgId: testOrgId,
        name: RoleName.ADMIN,
        permissions: [
          Permission.ROLE_MANAGE,
          Permission.PERMISSION_VIEW,
        ],
        isSystem: true,
      },
      {
        _id: userRoleId,
        orgId: testOrgId,
        name: RoleName.AGENT,
        permissions: [Permission.PERMISSION_VIEW],
        isSystem: true,
      },
    ]);

    // Create users
    await User.create([
      {
        _id: adminUserId,
        orgId: testOrgId,
        name: 'Admin User',
        email: 'admin@test.com',
        passwordHash: 'Password123!',
        status: UserStatus.ACTIVE,
        roleIds: [adminRoleId],
      },
      {
        _id: userUserId,
        orgId: testOrgId,
        name: 'Regular User',
        email: 'user@test.com',
        passwordHash: 'Password123!',
        status: UserStatus.ACTIVE,
        roleIds: [userRoleId],
      },
    ]);

    // Generate tokens
    adminToken = generateTestToken(adminUserId, testOrgId);
    userToken = generateTestToken(userUserId, testOrgId);
  });

  describe('POST /api/roles', () => {
    it('should create a new role', async () => {
      const response = await request(app)
        .post('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Sales Manager',
          description: 'Sales team manager role',
          permissions: [Permission.LEAD_VIEW_ALL, Permission.LEAD_EDIT_ALL],
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Sales Manager');
      expect(response.body.data.permissions).toContain(Permission.LEAD_VIEW_ALL);

      // Verify role was created
      const role = await Role.findOne({ name: 'Sales Manager' });
      expect(role).toBeTruthy();
      expect(role?.isSystem).toBe(false);

      // Verify audit log was created
      const auditLog = await AuditLog.findOne({ action: AuditAction.CREATE, entityId: role?._id });
      expect(auditLog).toBeTruthy();
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .post('/api/roles')
        .send({
          name: 'Sales Manager',
          description: 'Sales team manager role',
          permissions: [Permission.LEAD_VIEW_ALL],
        })
        .expect(401);
    });

    it('should return 403 without ROLE_MANAGE permission', async () => {
      const response = await request(app)
        .post('/api/roles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Sales Manager',
          description: 'Sales team manager role',
          permissions: [Permission.LEAD_VIEW_ALL],
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '', // Empty name
          permissions: [Permission.LEAD_VIEW_ALL],
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 409 for duplicate role name', async () => {
      const response = await request(app)
        .post('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: RoleName.ADMIN, // Already exists
          description: 'Duplicate role',
          permissions: [Permission.LEAD_VIEW_ALL],
        })
        .expect(409);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid permissions', async () => {
      const response = await request(app)
        .post('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Invalid Role',
          description: 'Role with invalid permissions',
          permissions: ['INVALID_PERMISSION'],
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/roles', () => {
    beforeEach(async () => {
      // Create additional test roles
      await Role.create([
        {
          orgId: testOrgId,
          name: 'Sales Manager',
          description: 'Sales team manager',
          permissions: [Permission.LEAD_VIEW_ALL, Permission.LEAD_EDIT_ALL],
          isSystem: false,
        },
        {
          orgId: testOrgId,
          name: 'Project Manager',
          description: 'Project team manager',
          permissions: [Permission.PROJECT_VIEW, Permission.PROJECT_UPDATE],
          isSystem: false,
        },
      ]);
    });

    it('should list all roles', async () => {
      const response = await request(app)
        .get('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(4); // 2 from beforeEach + 2 new
      expect(response.body.meta.total).toBe(4);
    });

    it('should filter roles by isSystem', async () => {
      // Test filtering out system roles (includeSystem=false)
      const response = await request(app)
        .get('/api/roles?includeSystem=false')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((r: any) => r.isSystem === false)).toBe(true);
    });

    it('should search roles by name', async () => {
      const response = await request(app)
        .get('/api/roles?search=Sales')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Sales Manager');
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/roles?page=1&pageSize=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.pageSize).toBe(2);
      expect(response.body.meta.totalPages).toBe(2);
    });

    it('should sort roles by name', async () => {
      const response = await request(app)
        .get('/api/roles?sortBy=name&sortOrder=asc')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      const names = response.body.data.map((r: any) => r.name);
      expect(names).toEqual([...names].sort());
    });

    it('should return 401 without authentication', async () => {
      await request(app).get('/api/roles').expect(401);
    });
  });

  describe('GET /api/roles/permissions', () => {
    it('should list all available permissions', async () => {
      const response = await request(app)
        .get('/api/roles/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('permissions');
      expect(response.body.data).toHaveProperty('categories');
      expect(Array.isArray(response.body.data.permissions)).toBe(true);
      expect(response.body.data.permissions.length).toBeGreaterThan(0);
      expect(response.body.data.permissions).toContain(Permission.LEAD_VIEW_ALL);
    });

    it('should return 401 without authentication', async () => {
      await request(app).get('/api/roles/permissions').expect(401);
    });
  });

  describe('GET /api/roles/:id', () => {
    it('should get role by id', async () => {
      const response = await request(app)
        .get(`/api/roles/${adminRoleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(RoleName.ADMIN);
      expect(response.body.data.permissions).toBeDefined();
      expect(response.body.data.userCount).toBeDefined();
    });

    it('should return 401 without authentication', async () => {
      await request(app).get(`/api/roles/${adminRoleId}`).expect(401);
    });

    it('should return 403 without PERMISSION_VIEW permission', async () => {
      // Create a user without view permission
      const noPermRoleId = new mongoose.Types.ObjectId();
      await Role.create({
        _id: noPermRoleId,
        orgId: testOrgId,
        name: 'NoPermRole',
        permissions: [],
        isSystem: false,
      });

      const noPermUserId = new mongoose.Types.ObjectId();
      await User.create({
        _id: noPermUserId,
        orgId: testOrgId,
        name: 'No Perm User',
        email: 'noperm@test.com',
        passwordHash: 'Password123!',
        status: UserStatus.ACTIVE,
        roleIds: [noPermRoleId],
      });

      const noPermToken = generateTestToken(noPermUserId, testOrgId);

      const response = await request(app)
        .get(`/api/roles/${adminRoleId}`)
        .set('Authorization', `Bearer ${noPermToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent role', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/roles/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/roles/:id', () => {
    let customRoleId: mongoose.Types.ObjectId;

    beforeEach(async () => {
      customRoleId = new mongoose.Types.ObjectId();
      await Role.create({
        _id: customRoleId,
        orgId: testOrgId,
        name: 'Custom Role',
        description: 'Custom role for testing',
        permissions: [Permission.LEAD_VIEW_ALL],
        isSystem: false,
      });
    });

    it('should update role name', async () => {
      const response = await request(app)
        .patch(`/api/roles/${customRoleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Role Name' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Role Name');

      // Verify audit log was created
      const auditLog = await AuditLog.findOne({ action: AuditAction.UPDATE, entityId: customRoleId });
      expect(auditLog).toBeTruthy();
    });

    it('should update role permissions', async () => {
      const response = await request(app)
        .patch(`/api/roles/${customRoleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ permissions: [Permission.LEAD_VIEW_ALL, Permission.LEAD_EDIT_ALL] })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.permissions).toContain(Permission.LEAD_EDIT_ALL);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .patch(`/api/roles/${customRoleId}`)
        .send({ name: 'Updated Name' })
        .expect(401);
    });

    it('should return 403 without ROLE_MANAGE permission', async () => {
      const response = await request(app)
        .patch(`/api/roles/${customRoleId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated Name' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 403 when trying to update system role', async () => {
      const response = await request(app)
        .patch(`/api/roles/${adminRoleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Admin' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent role', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .patch(`/api/roles/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/roles/:id', () => {
    let customRoleId: mongoose.Types.ObjectId;

    beforeEach(async () => {
      customRoleId = new mongoose.Types.ObjectId();
      await Role.create({
        _id: customRoleId,
        orgId: testOrgId,
        name: 'Custom Role',
        description: 'Custom role for testing',
        permissions: [Permission.LEAD_VIEW_ALL],
        isSystem: false,
      });
    });

    it('should delete role', async () => {
      const response = await request(app)
        .delete(`/api/roles/${customRoleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify role was deleted
      const role = await Role.findById(customRoleId);
      expect(role).toBeNull();

      // Verify audit log was created
      const auditLog = await AuditLog.findOne({ action: AuditAction.DELETE, entityId: customRoleId });
      expect(auditLog).toBeTruthy();
    });

    it('should return 401 without authentication', async () => {
      await request(app).delete(`/api/roles/${customRoleId}`).expect(401);
    });

    it('should return 403 without ROLE_MANAGE permission', async () => {
      const response = await request(app)
        .delete(`/api/roles/${customRoleId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 403 when trying to delete system role', async () => {
      const response = await request(app)
        .delete(`/api/roles/${adminRoleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 403 when trying to delete role assigned to users', async () => {
      // Assign custom role to a user
      const testUserId = new mongoose.Types.ObjectId();
      await User.create({
        _id: testUserId,
        orgId: testOrgId,
        name: 'Test User',
        email: 'testuser@test.com',
        passwordHash: 'Password123!',
        status: UserStatus.ACTIVE,
        roleIds: [customRoleId],
      });

      const response = await request(app)
        .delete(`/api/roles/${customRoleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});