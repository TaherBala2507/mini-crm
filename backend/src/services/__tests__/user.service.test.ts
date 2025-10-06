import '../../tests/setup';
import { UserService } from '../user.service';
import { Organization } from '../../models/Organization';
import { User } from '../../models/User';
import { Role } from '../../models/Role';
import { RoleName } from '../../constants/roles';
import { UserStatus } from '../../constants/enums';
import { AppError } from '../../utils/errors';
import mongoose from 'mongoose';

describe('UserService', () => {
  let userService: UserService;
  let testOrgId: mongoose.Types.ObjectId;
  let testRoleId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    userService = new UserService();
    testOrgId = new mongoose.Types.ObjectId();
    testRoleId = new mongoose.Types.ObjectId();

    await Organization.create({
      _id: testOrgId,
      name: 'Test Org',
      domain: 'test-org',
    });

    await Role.create({
      _id: testRoleId,
      orgId: testOrgId,
      name: RoleName.ADMIN,
      permissions: [],
      isSystem: true,
    });
  });

  describe('inviteUser', () => {
    it.skip('should invite a new user', async () => {
      // Skipped: inviteUser uses transactions which require replica set
      const actorUserId = new mongoose.Types.ObjectId();
      const inviteData = {
        email: 'newuser@test.com',
        name: 'New User',
        roleNames: [RoleName.ADMIN],
      };

      const result = await userService.inviteUser(
        testOrgId,
        inviteData,
        actorUserId
      );

      expect(result).toHaveProperty('id');
      expect(result.email).toBe(inviteData.email);
      expect(result.status).toBe(UserStatus.PENDING);
    });

    it.skip('should throw error if email already exists', async () => {
      // Skipped: inviteUser uses transactions which require replica set
      const actorUserId = new mongoose.Types.ObjectId();
      await User.create({
        orgId: testOrgId,
        name: 'Existing User',
        email: 'existing@test.com',
        passwordHash: 'Password123!', // Will be hashed by pre-save hook
        status: UserStatus.ACTIVE,
        roleIds: [testRoleId],
      });

      const inviteData = {
        email: 'existing@test.com',
        name: 'New User',
        roleNames: [RoleName.ADMIN],
      };

      await expect(
        userService.inviteUser(testOrgId, inviteData, actorUserId)
      ).rejects.toThrow(AppError);
    });
  });

  describe('listUsers', () => {
    beforeEach(async () => {
      await User.create([
        {
          orgId: testOrgId,
          name: 'User 1',
          email: 'user1@test.com',
          passwordHash: 'Password123!', // Will be hashed by pre-save hook
          status: UserStatus.ACTIVE,
          roleIds: [testRoleId],
        },
        {
          orgId: testOrgId,
          name: 'User 2',
          email: 'user2@test.com',
          passwordHash: 'Password123!', // Will be hashed by pre-save hook
          status: UserStatus.ACTIVE,
          roleIds: [testRoleId],
        },
        {
          orgId: testOrgId,
          name: 'User 3',
          email: 'user3@test.com',
          passwordHash: 'Password123!', // Will be hashed by pre-save hook
          status: UserStatus.PENDING,
          roleIds: [testRoleId],
        },
      ]);
    });

    it('should list all users for organization', async () => {
      const result = await userService.listUsers(testOrgId, {
        page: 1,
        pageSize: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.data).toHaveLength(3);
      expect(result.pagination.total).toBe(3);
    });

    it('should filter users by status', async () => {
      const result = await userService.listUsers(testOrgId, {
        page: 1,
        pageSize: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        status: UserStatus.ACTIVE,
      });

      expect(result.data).toHaveLength(2);
    });

    it('should search users by name', async () => {
      const result = await userService.listUsers(testOrgId, {
        page: 1,
        pageSize: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: 'User 2',
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('User 2');
    });
  });

  describe('getUserById', () => {
    it('should get user by id', async () => {
      const user = await User.create({
        orgId: testOrgId,
        name: 'Test User',
        email: 'test@test.com',
        passwordHash: 'Password123!', // Will be hashed by pre-save hook
        status: UserStatus.ACTIVE,
        roleIds: [testRoleId],
      });

      const result = await userService.getUserById(
        testOrgId,
        user._id.toString()
      );

      expect(result.id.toString()).toBe(user._id.toString());
      expect(result.name).toBe('Test User');
      expect(result).toHaveProperty('stats');
    });

    it('should throw error if user not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await expect(
        userService.getUserById(testOrgId, fakeId.toString())
      ).rejects.toThrow(AppError);
    });
  });
});