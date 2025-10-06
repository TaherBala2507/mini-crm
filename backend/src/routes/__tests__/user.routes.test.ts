import '../../tests/setup';
import request from 'supertest';
import { createApp } from '../../app';
import { Organization } from '../../models/Organization';
import { User } from '../../models/User';
import { Role } from '../../models/Role';
import { Token } from '../../models/Token';
import { AuditLog } from '../../models/AuditLog';
import { RoleName } from '../../constants/roles';
import { UserStatus, TokenType, AuditAction } from '../../constants/enums';
import { Permission } from '../../constants/permissions';
import { generateTestToken } from '../../tests/helpers/testData';
import mongoose from 'mongoose';

const app = createApp();

describe('User Routes', () => {
  let testOrgId: mongoose.Types.ObjectId;
  let adminUserId: mongoose.Types.ObjectId;
  let user1Id: mongoose.Types.ObjectId;
  let adminRoleId: mongoose.Types.ObjectId;
  let userRoleId: mongoose.Types.ObjectId;
  let adminToken: string;
  let userToken: string;

  beforeEach(async () => {
    testOrgId = new mongoose.Types.ObjectId();
    adminUserId = new mongoose.Types.ObjectId();
    user1Id = new mongoose.Types.ObjectId();
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
          Permission.USER_INVITE,
          Permission.USER_VIEW,
          Permission.USER_UPDATE,
          Permission.USER_DELETE,
        ],
        isSystem: true,
      },
      {
        _id: userRoleId,
        orgId: testOrgId,
        name: RoleName.AGENT,
        permissions: [Permission.USER_VIEW],
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
        _id: user1Id,
        orgId: testOrgId,
        name: 'Regular User',
        email: 'user1@test.com',
        passwordHash: 'Password123!',
        status: UserStatus.ACTIVE,
        roleIds: [userRoleId],
      },
    ]);

    // Generate tokens
    adminToken = generateTestToken(adminUserId, testOrgId);
    userToken = generateTestToken(user1Id, testOrgId);
  });

  describe('POST /api/users/invite', () => {
    it('should invite a new user', async () => {
      const response = await request(app)
        .post('/api/users/invite')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New User',
          email: 'newuser@test.com',
          roleNames: [RoleName.AGENT],
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('newuser@test.com');
      expect(response.body.data.status).toBe(UserStatus.PENDING);

      // Verify user was created
      const user = await User.findOne({ email: 'newuser@test.com' });
      expect(user).toBeTruthy();
      expect(user?.status).toBe(UserStatus.PENDING);

      // Verify email verification token was created
      const token = await Token.findOne({ userId: user?._id, type: TokenType.EMAIL_VERIFY });
      expect(token).toBeTruthy();

      // Verify audit log was created
      const auditLog = await AuditLog.findOne({ action: AuditAction.INVITE, entityId: user?._id });
      expect(auditLog).toBeTruthy();
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .post('/api/users/invite')
        .send({
          name: 'New User',
          email: 'newuser@test.com',
          roleNames: [RoleName.AGENT],
        })
        .expect(401);
    });

    it('should return 403 without USER_INVITE permission', async () => {
      const response = await request(app)
        .post('/api/users/invite')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'New User',
          email: 'newuser@test.com',
          roleNames: [RoleName.AGENT],
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/users/invite')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New User',
          email: 'invalid-email',
          roleNames: [RoleName.AGENT],
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 409 for duplicate email', async () => {
      const response = await request(app)
        .post('/api/users/invite')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Duplicate User',
          email: 'admin@test.com',
          roleNames: [RoleName.AGENT],
        })
        .expect(409);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid role', async () => {
      const response = await request(app)
        .post('/api/users/invite')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New User',
          email: 'newuser@test.com',
          roleNames: ['NonExistentRole'],
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users', () => {
    beforeEach(async () => {
      // Create additional test users
      await User.create([
        {
          orgId: testOrgId,
          name: 'Alice Smith',
          email: 'alice@test.com',
          passwordHash: 'Password123!',
          status: UserStatus.ACTIVE,
          roleIds: [userRoleId],
        },
        {
          orgId: testOrgId,
          name: 'Bob Johnson',
          email: 'bob@test.com',
          passwordHash: 'Password123!',
          status: UserStatus.PENDING,
          roleIds: [userRoleId],
        },
        {
          orgId: testOrgId,
          name: 'Charlie Brown',
          email: 'charlie@test.com',
          passwordHash: 'Password123!',
          status: UserStatus.INACTIVE,
          roleIds: [adminRoleId],
        },
      ]);
    });

    it('should list all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(5); // 2 from beforeEach + 3 new
      expect(response.body.data.pagination.total).toBe(5);
    });

    it('should filter users by status', async () => {
      const response = await request(app)
        .get('/api/users?status=active')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(3);
      expect(response.body.data.data.every((u: any) => u.status === UserStatus.ACTIVE)).toBe(true);
    });

    it('should filter users by role', async () => {
      const response = await request(app)
        .get(`/api/users?role=${RoleName.ADMIN}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(2); // Admin User + Charlie Brown
    });

    it('should search users by name', async () => {
      const response = await request(app)
        .get('/api/users?search=Alice')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(1);
      expect(response.body.data.data[0].name).toBe('Alice Smith');
    });

    it('should search users by email', async () => {
      const response = await request(app)
        .get('/api/users?search=bob@test.com')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(1);
      expect(response.body.data.data[0].email).toBe('bob@test.com');
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/users?page=1&pageSize=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(2);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.pageSize).toBe(2);
      expect(response.body.data.pagination.totalPages).toBe(3);
    });

    it('should sort users by name ascending', async () => {
      const response = await request(app)
        .get('/api/users?sortBy=name&sortOrder=asc')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      const names = response.body.data.data.map((u: any) => u.name);
      expect(names).toEqual([...names].sort());
    });

    it('should sort users by createdAt descending', async () => {
      const response = await request(app)
        .get('/api/users?sortBy=createdAt&sortOrder=desc')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(5);
    });

    it('should return 401 without authentication', async () => {
      await request(app).get('/api/users').expect(401);
    });

    it('should return 403 without USER_VIEW permission', async () => {
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
        .get('/api/users')
        .set('Authorization', `Bearer ${noPermToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by id', async () => {
      const response = await request(app)
        .get(`/api/users/${user1Id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('user1@test.com');
      expect(response.body.data.stats).toBeDefined();
      expect(response.body.data.stats.leadsOwned).toBeDefined();
    });

    it('should return 401 without authentication', async () => {
      await request(app).get(`/api/users/${user1Id}`).expect(401);
    });

    it('should return 403 without USER_VIEW permission', async () => {
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
        .get(`/api/users/${user1Id}`)
        .set('Authorization', `Bearer ${noPermToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('should update user name', async () => {
      const response = await request(app)
        .patch(`/api/users/${user1Id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');

      // Verify audit log was created
      const auditLog = await AuditLog.findOne({ action: AuditAction.UPDATE, entityId: user1Id });
      expect(auditLog).toBeTruthy();
    });

    it('should update user email', async () => {
      const response = await request(app)
        .patch(`/api/users/${user1Id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'newemail@test.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('newemail@test.com');
    });

    it('should update user status', async () => {
      const response = await request(app)
        .patch(`/api/users/${user1Id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: UserStatus.INACTIVE })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(UserStatus.INACTIVE);
    });

    it('should update user roles', async () => {
      const response = await request(app)
        .patch(`/api/users/${user1Id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ roleNames: [RoleName.ADMIN] })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.roles.some((r: any) => r.name === RoleName.ADMIN)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .patch(`/api/users/${user1Id}`)
        .send({ name: 'Updated Name' })
        .expect(401);
    });

    it('should return 403 without USER_UPDATE permission', async () => {
      const response = await request(app)
        .patch(`/api/users/${user1Id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated Name' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .patch(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user (soft delete)', async () => {
      const response = await request(app)
        .delete(`/api/users/${user1Id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify user status was set to INACTIVE
      const user = await User.findById(user1Id);
      expect(user?.status).toBe(UserStatus.INACTIVE);

      // Verify audit log was created
      const auditLog = await AuditLog.findOne({ action: AuditAction.DELETE, entityId: user1Id });
      expect(auditLog).toBeTruthy();
    });

    it('should return 401 without authentication', async () => {
      await request(app).delete(`/api/users/${user1Id}`).expect(401);
    });

    it('should return 403 without USER_DELETE permission', async () => {
      const response = await request(app)
        .delete(`/api/users/${user1Id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when trying to delete yourself', async () => {
      const response = await request(app)
        .delete(`/api/users/${adminUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});