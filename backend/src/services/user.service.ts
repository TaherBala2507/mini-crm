import mongoose from 'mongoose';
import crypto from 'crypto';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { Token } from '../models/Token';
import { AuditLog } from '../models/AuditLog';
import { ConflictError, NotFoundError, BadRequestError } from '../utils/errors';
import { UserStatus, TokenType, AuditAction } from '../constants/enums';
import { InviteUserInput, ListUsersQuery, UpdateUserInput } from '../validators/user.validator';

export class UserService {
  /**
   * Invite a new user to the organization
   */
  async inviteUser(
    orgId: mongoose.Types.ObjectId,
    data: InviteUserInput,
    actorUserId: mongoose.Types.ObjectId,
    ip?: string,
    userAgent?: string
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check if user with email already exists in this organization
      const existingUser = await User.findOne({ orgId, email: data.email });
      if (existingUser) {
        throw new ConflictError('User with this email already exists in the organization');
      }

      // Validate roles exist in the organization
      const roles = await Role.find({
        orgId,
        name: { $in: data.roleNames },
      });

      if (roles.length !== data.roleNames.length) {
        throw new BadRequestError('One or more roles not found');
      }

      // Generate temporary password
      const tempPassword = crypto.randomBytes(16).toString('hex');

      // Create user with PENDING status
      const [user] = await User.create(
        [
          {
            orgId,
            name: data.name,
            email: data.email,
            passwordHash: tempPassword,
            status: UserStatus.PENDING,
            roleIds: roles.map((r) => r._id),
          },
        ],
        { session }
      );

      // Generate email verification token
      const verifyToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = (Token as any).hashToken(verifyToken);

      await Token.create(
        [
          {
            userId: user._id,
            type: TokenType.EMAIL_VERIFY,
            tokenHash,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          },
        ],
        { session }
      );

      // Create audit log
      await AuditLog.create(
        [
          {
            orgId,
            actorUserId,
            action: AuditAction.INVITE,
            entityType: 'user',
            entityId: user._id,
            afterJson: {
              name: user.name,
              email: user.email,
              roles: data.roleNames,
              status: UserStatus.PENDING,
            },
            ip,
            userAgent,
          },
        ],
        { session }
      );

      await session.commitTransaction();

      // In production, send invitation email here
      console.log(`\n=== User Invitation ===`);
      console.log(`Email: ${data.email}`);
      console.log(`Temporary Password: ${tempPassword}`);
      console.log(`Verification Token: ${verifyToken}`);
      console.log(`Verification Link: http://localhost:5173/verify-email?token=${verifyToken}`);
      console.log(`=======================\n`);

      return {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        roles: roles.map((r) => r.name),
        createdAt: user.createdAt,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * List users with filters and pagination
   */
  async listUsers(orgId: mongoose.Types.ObjectId, query: ListUsersQuery) {
    const { page, pageSize, search, status, role, sortBy, sortOrder } = query;

    // Build filter
    const filter: any = { orgId };

    // Search by name or email
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by status
    if (status) {
      const statuses = status.split(',');
      filter.status = { $in: statuses };
    }

    // Filter by role
    let roleFilter: mongoose.Types.ObjectId[] | undefined;
    if (role) {
      const roleNames = role.split(',');
      const roles = await Role.find({ orgId, name: { $in: roleNames } });
      roleFilter = roles.map((r) => r._id);
      if (roleFilter.length > 0) {
        filter.roleIds = { $in: roleFilter };
      }
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * pageSize;
    const [users, total] = await Promise.all([
      User.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .populate('roleIds', 'name description')
        .lean(),
      User.countDocuments(filter),
    ]);

    return {
      data: users.map((user: any) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        roles: user.roleIds.map((r: any) => ({
          id: r._id,
          name: r.name,
          description: r.description,
        })),
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(orgId: mongoose.Types.ObjectId, userId: string) {
    const user = await User.findOne({
      _id: userId,
      orgId,
    })
      .populate('roleIds', 'name description permissions')
      .lean();

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Get user activity stats
    const [leadsCount, projectsCount, tasksCount, activityCount] = await Promise.all([
      mongoose.model('Lead').countDocuments({ orgId, ownerUserId: userId }),
      mongoose.model('Project').countDocuments({ orgId, managerUserId: userId }),
      mongoose.model('Task').countDocuments({ orgId, assigneeUserId: userId }),
      AuditLog.countDocuments({ orgId, actorUserId: userId }),
    ]);

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      status: user.status,
      roles: (user.roleIds as any[]).map((r: any) => ({
        id: r._id,
        name: r.name,
        description: r.description,
        permissions: r.permissions,
      })),
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      stats: {
        leadsOwned: leadsCount,
        projectsManaged: projectsCount,
        tasksAssigned: tasksCount,
        totalActions: activityCount,
      },
    };
  }

  /**
   * Update user
   */
  async updateUser(
    orgId: mongoose.Types.ObjectId,
    userId: string,
    data: UpdateUserInput,
    actorUserId: mongoose.Types.ObjectId,
    ip?: string,
    userAgent?: string
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find user
      const user = await User.findOne({ _id: userId, orgId }).session(session);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Store before state
      const beforeJson = {
        name: user.name,
        email: user.email,
        status: user.status,
        roleIds: user.roleIds,
      };

      // Check if email is being changed and if it's already taken
      if (data.email && data.email !== user.email) {
        const existingUser = await User.findOne({
          orgId,
          email: data.email,
          _id: { $ne: userId },
        });
        if (existingUser) {
          throw new ConflictError('Email already in use by another user');
        }
        user.email = data.email;
      }

      // Update basic fields
      if (data.name) user.name = data.name;
      if (data.status) user.status = data.status;

      // Update roles if provided
      if (data.roleNames) {
        const roles = await Role.find({
          orgId,
          name: { $in: data.roleNames },
        }).session(session);

        if (roles.length !== data.roleNames.length) {
          throw new BadRequestError('One or more roles not found');
        }

        user.roleIds = roles.map((r) => r._id);
      }

      await user.save({ session });

      // Get updated roles for response
      const updatedRoles = await Role.find({ _id: { $in: user.roleIds } }).session(session);

      // Create audit log
      await AuditLog.create(
        [
          {
            orgId,
            actorUserId,
            action: AuditAction.UPDATE,
            entityType: 'user',
            entityId: user._id,
            beforeJson,
            afterJson: {
              name: user.name,
              email: user.email,
              status: user.status,
              roleIds: user.roleIds,
            },
            ip,
            userAgent,
          },
        ],
        { session }
      );

      await session.commitTransaction();

      return {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        roles: updatedRoles.map((r) => ({
          id: r._id,
          name: r.name,
          description: r.description,
        })),
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Delete user (soft delete by setting status to INACTIVE)
   */
  async deleteUser(
    orgId: mongoose.Types.ObjectId,
    userId: string,
    actorUserId: mongoose.Types.ObjectId,
    ip?: string,
    userAgent?: string
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find user
      const user = await User.findOne({ _id: userId, orgId }).session(session);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Prevent deleting yourself
      if (user._id.toString() === actorUserId.toString()) {
        throw new BadRequestError('Cannot delete your own account');
      }

      // Store before state
      const beforeJson = {
        name: user.name,
        email: user.email,
        status: user.status,
      };

      // Soft delete by setting status to INACTIVE
      user.status = UserStatus.INACTIVE;
      await user.save({ session });

      // Revoke all active tokens
      await Token.updateMany(
        {
          userId: user._id,
          revokedAt: null,
        },
        {
          revokedAt: new Date(),
        },
        { session }
      );

      // Create audit log
      await AuditLog.create(
        [
          {
            orgId,
            actorUserId,
            action: AuditAction.DELETE,
            entityType: 'user',
            entityId: user._id,
            beforeJson,
            afterJson: {
              status: UserStatus.INACTIVE,
            },
            ip,
            userAgent,
          },
        ],
        { session }
      );

      await session.commitTransaction();

      return { message: 'User deleted successfully' };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}