import '../../tests/setup';
import { AuthService } from '../auth.service';
import { Organization } from '../../models/Organization';
import { User } from '../../models/User';
import { UserStatus } from '../../constants/enums';
import { AppError } from '../../utils/errors';
import mongoose from 'mongoose';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('register', () => {
    it.skip('should register a new organization and super admin user', async () => {
      // Skipped: MongoDB Memory Server doesn't support transactions
      const registerData = {
        organizationName: 'Test Org',
        organizationDomain: 'test-org',
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'Password123!',
      };

      const result = await authService.register(registerData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('organization');
      expect(result).toHaveProperty('tokens');
      expect(result.user.email).toBe(registerData.email);
      expect(result.user.roles).toContain('SuperAdmin');
      expect(result.organization.name).toBe(registerData.organizationName);
    });

    it('should throw error if organization domain already exists', async () => {
      await Organization.create({
        name: 'Existing Org',
        domain: 'test-org',
      });

      const registerData = {
        organizationName: 'Test Org',
        organizationDomain: 'test-org',
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'Password123!',
      };

      await expect(authService.register(registerData)).rejects.toThrow(AppError);
    });
  });

  describe('login', () => {
    let testOrgId: mongoose.Types.ObjectId;
    let testUser: any;

    beforeEach(async () => {
      testOrgId = new mongoose.Types.ObjectId();
      
      await Organization.create({
        _id: testOrgId,
        name: 'Test Org',
        domain: 'test-org',
      });

      testUser = await User.create({
        orgId: testOrgId,
        name: 'Test User',
        email: 'test@test.com',
        passwordHash: 'Password123!', // Will be hashed by pre-save hook
        status: UserStatus.ACTIVE,
        roleIds: [],
        isEmailVerified: true,
      });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@test.com',
        password: 'Password123!',
      };

      const result = await authService.login(loginData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user.email).toBe(loginData.email);
    });

    it('should throw error for invalid email', async () => {
      const loginData = {
        email: 'wrong@test.com',
        password: 'Password123!',
      };

      await expect(authService.login(loginData)).rejects.toThrow(AppError);
    });

    it('should throw error for invalid password', async () => {
      const loginData = {
        email: 'test@test.com',
        password: 'WrongPassword123!',
      };

      await expect(authService.login(loginData)).rejects.toThrow(AppError);
    });

    it('should throw error for inactive user', async () => {
      await User.updateOne(
        { _id: testUser._id },
        { status: UserStatus.INACTIVE }
      );

      const loginData = {
        email: 'test@test.com',
        password: 'Password123!',
      };

      await expect(authService.login(loginData)).rejects.toThrow(AppError);
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token with valid refresh token', async () => {
      const testOrgId = new mongoose.Types.ObjectId();
      const testUserId = new mongoose.Types.ObjectId();

      await Organization.create({
        _id: testOrgId,
        name: 'Test Org',
        domain: 'test-org',
      });

      await User.create({
        _id: testUserId,
        orgId: testOrgId,
        name: 'Test User',
        email: 'test@test.com',
        passwordHash: 'Password123!', // Will be hashed by pre-save hook
        status: UserStatus.ACTIVE,
        roleIds: [],
        isEmailVerified: true,
      });

      // Generate tokens
      const tokens = await authService['generateTokenPair'](
        testUserId.toString(),
        testOrgId.toString()
      );

      const result = await authService.refreshToken(tokens.refreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw error for invalid refresh token', async () => {
      await expect(authService.refreshToken('invalid-token')).rejects.toThrow(AppError);
    });
  });

  describe('logout', () => {
    it('should logout user and revoke refresh token', async () => {
      const testOrgId = new mongoose.Types.ObjectId();
      const testUserId = new mongoose.Types.ObjectId();

      await Organization.create({
        _id: testOrgId,
        name: 'Test Org',
        domain: 'test-org',
      });

      await User.create({
        _id: testUserId,
        orgId: testOrgId,
        name: 'Test User',
        email: 'test@test.com',
        passwordHash: 'Password123!', // Will be hashed by pre-save hook
        status: UserStatus.ACTIVE,
        roleIds: [],
        isEmailVerified: true,
      });

      // Generate tokens
      const tokens = await authService['generateTokenPair'](
        testUserId.toString(),
        testOrgId.toString()
      );

      const result = await authService.logout(testUserId.toString(), tokens.refreshToken);

      expect(result).toHaveProperty('message');
      expect(result.message).toBe('Logged out successfully');
    });
  });
});