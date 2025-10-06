import '../../tests/setup';
import request from 'supertest';
import { createApp } from '../../app';
import { Organization } from '../../models/Organization';
import { User } from '../../models/User';
import { Role } from '../../models/Role';
import { Token } from '../../models/Token';
import { RoleName } from '../../constants/roles';
import { UserStatus, TokenType } from '../../constants/enums';
import mongoose from 'mongoose';

const app = createApp();

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it.skip('should register new organization and user (requires replica set)', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          organizationName: 'Test Organization',
          organizationDomain: 'test-org',
          email: 'admin@test.com',
          password: 'Password123!',
          name: 'Admin User',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('organization');
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe('admin@test.com');
      expect(response.body.data.user.roles).toContain(RoleName.SUPER_ADMIN);
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          organizationName: 'Test Organization',
          organizationDomain: 'test-org',
          email: 'invalid-email',
          password: 'Password123!',
          name: 'Admin User',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          organizationName: 'Test Organization',
          organizationDomain: 'test-org',
          email: 'admin@test.com',
          password: 'weak',
          name: 'Admin User',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 409 for duplicate organization domain', async () => {
      await Organization.create({
        name: 'Existing Org',
        domain: 'test-org',
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          organizationName: 'Test Organization',
          organizationDomain: 'test-org',
          email: 'admin@test.com',
          password: 'Password123!',
          name: 'Admin User',
        })
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const orgId = new mongoose.Types.ObjectId();
      const roleId = new mongoose.Types.ObjectId();
      
      await Organization.create({
        _id: orgId,
        name: 'Test Org',
        domain: 'test-org',
      });

      await Role.create({
        _id: roleId,
        orgId,
        name: RoleName.ADMIN,
        permissions: [],
        isSystemRole: true,
      });

      await User.create({
        orgId,
        email: 'user@test.com',
        passwordHash: 'Password123!',
        name: 'Test User',
        roleIds: [roleId],
        status: UserStatus.ACTIVE,
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'Password123!',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
    });

    it('should return 401 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@test.com',
          password: 'Password123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 for invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it.skip('should refresh access token with valid refresh token (requires replica set)', async () => {
      // First register
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          organizationName: 'Test Organization',
          organizationDomain: 'test-org',
          email: 'admin@test.com',
          password: 'Password123!',
          name: 'Admin User',
        });

      const { refreshToken } = registerResponse.body.data.tokens;

      // Then refresh
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it.skip('should logout authenticated user (requires replica set)', async () => {
      // First register
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          organizationName: 'Test Organization',
          organizationDomain: 'test-org',
          email: 'admin@test.com',
          password: 'Password123!',
          name: 'Admin User',
        });

      const { accessToken, refreshToken } = registerResponse.body.data.tokens;

      // Then logout
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logged out successfully');
    });

    it('should return 401 without authentication', async () => {
      await request(app).post('/api/auth/logout').expect(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it.skip('should get current user profile (requires replica set)', async () => {
      // First register
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          organizationName: 'Test Organization',
          organizationDomain: 'test-org',
          email: 'admin@test.com',
          password: 'Password123!',
          name: 'Admin User',
        });

      const { accessToken } = registerResponse.body.data.tokens;

      // Then get profile
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('admin@test.com');
      expect(response.body.data.name).toBe('Admin User');
    });

    it('should return 401 without authentication', async () => {
      await request(app).get('/api/auth/me').expect(401);
    });
  });

  describe('POST /api/auth/verify-email', () => {
    it.skip('should verify email with valid token (requires replica set)', async () => {
      const orgId = new mongoose.Types.ObjectId();
      const roleId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();
      
      await Organization.create({
        _id: orgId,
        name: 'Test Org',
        domain: 'test-org',
      });

      await Role.create({
        _id: roleId,
        orgId,
        name: RoleName.AGENT,
        permissions: [],
        isSystemRole: true,
      });

      const user = await User.create({
        _id: userId,
        orgId,
        email: 'pending@test.com',
        passwordHash: 'TempPassword123!',
        name: 'Pending User',
        roleIds: [roleId],
        status: UserStatus.PENDING,
      });

      const verificationToken = 'test-verification-token-12345';
      const tokenHash = require('crypto')
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

      await Token.create({
        userId: user._id,
        type: TokenType.EMAIL_VERIFY,
        tokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ 
          token: verificationToken,
          password: 'NewPassword123!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
    });

    it('should return 400 for invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'invalid-token' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});