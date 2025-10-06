import mongoose from 'mongoose';
import { Role } from '../models/Role';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { ConflictError, NotFoundError, ForbiddenError } from '../utils/errors';
import { AuditAction } from '../constants/enums';
import { CreateRoleInput, UpdateRoleInput, ListRolesQuery } from '../validators/role.validator';
import { ALL_PERMISSIONS } from '../constants/permissions';

export class RoleService {
  /**
   * Create a new custom role
   */
  async createRole(
    orgId: mongoose.Types.ObjectId,
    data: CreateRoleInput,
    actorUserId: mongoose.Types.ObjectId,
    ip?: string,
    userAgent?: string
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check if role name already exists in organization
      const existingRole = await Role.findOne({ orgId, name: data.name });
      if (existingRole) {
        throw new ConflictError('Role with this name already exists in the organization');
      }

      // Create role
      const [role] = await Role.create(
        [
          {
            orgId,
            name: data.name,
            description: data.description || '',
            permissions: data.permissions,
            isSystem: false, // Custom roles are never system roles
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
            action: AuditAction.CREATE,
            entityType: 'role',
            entityId: role._id,
            afterJson: {
              name: role.name,
              description: role.description,
              permissions: role.permissions,
            },
            ip,
            userAgent,
          },
        ],
        { session }
      );

      await session.commitTransaction();

      return {
        id: role._id,
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        isSystem: role.isSystem,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * List roles with filters and pagination
   */
  async listRoles(orgId: mongoose.Types.ObjectId, query: ListRolesQuery) {
    const { page = 1, pageSize = 20, search, includeSystem } = query;

    // Ensure page and pageSize are numbers
    const pageNum = Number(page);
    const pageSizeNum = Number(pageSize);

    // Build filter
    const filter: any = { orgId };

    // Filter by search term
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter system roles
    if (includeSystem === false) {
      filter.isSystem = false;
    }

    // Execute query with pagination
    const skip = (pageNum - 1) * pageSizeNum;
    const [roles, total] = await Promise.all([
      Role.find(filter).sort({ isSystem: -1, name: 1 }).skip(skip).limit(pageSizeNum).lean(),
      Role.countDocuments(filter),
    ]);

    // Get user counts for each role
    const roleIds = roles.map((r) => r._id);
    const userCounts = await User.aggregate([
      { $match: { orgId, roleIds: { $in: roleIds } } },
      { $unwind: '$roleIds' },
      { $group: { _id: '$roleIds', count: { $sum: 1 } } },
    ]);

    const userCountMap = new Map(userCounts.map((uc) => [uc._id.toString(), uc.count]));

    const rolesWithCounts = roles.map((role) => ({
      id: role._id,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      isSystem: role.isSystem,
      userCount: userCountMap.get(role._id.toString()) || 0,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }));

    return {
      roles: rolesWithCounts,
      pagination: {
        page: pageNum,
        pageSize: pageSizeNum,
        total,
        totalPages: Math.ceil(total / pageSizeNum),
      },
    };
  }

  /**
   * Get role by ID
   */
  async getRoleById(orgId: mongoose.Types.ObjectId, roleId: string) {
    const role = await Role.findOne({ _id: roleId, orgId });

    if (!role) {
      throw new NotFoundError('Role not found');
    }

    // Get user count
    const userCount = await User.countDocuments({ orgId, roleIds: role._id });

    // Get list of users with this role
    const users = await User.find({ orgId, roleIds: role._id })
      .select('_id name email status')
      .limit(10)
      .lean();

    return {
      id: role._id,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      isSystem: role.isSystem,
      userCount,
      users: users.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        status: u.status,
      })),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  /**
   * Update role
   */
  async updateRole(
    orgId: mongoose.Types.ObjectId,
    roleId: string,
    data: UpdateRoleInput,
    actorUserId: mongoose.Types.ObjectId,
    ip?: string,
    userAgent?: string
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const role = await Role.findOne({ _id: roleId, orgId });

      if (!role) {
        throw new NotFoundError('Role not found');
      }

      // Prevent modification of system roles
      if (role.isSystem) {
        throw new ForbiddenError('System roles cannot be modified');
      }

      // Check for name conflict if name is being changed
      if (data.name && data.name !== role.name) {
        const existingRole = await Role.findOne({ orgId, name: data.name });
        if (existingRole) {
          throw new ConflictError('Role with this name already exists in the organization');
        }
      }

      // Capture before state
      const beforeJson = {
        name: role.name,
        description: role.description,
        permissions: role.permissions,
      };

      // Update role
      if (data.name !== undefined) role.name = data.name;
      if (data.description !== undefined) role.description = data.description;
      if (data.permissions !== undefined) role.permissions = data.permissions;

      await role.save({ session });

      // Capture after state
      const afterJson = {
        name: role.name,
        description: role.description,
        permissions: role.permissions,
      };

      // Create audit log
      await AuditLog.create(
        [
          {
            orgId,
            actorUserId,
            action: AuditAction.UPDATE,
            entityType: 'role',
            entityId: role._id,
            beforeJson,
            afterJson,
            ip,
            userAgent,
          },
        ],
        { session }
      );

      await session.commitTransaction();

      return {
        id: role._id,
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        isSystem: role.isSystem,
        updatedAt: role.updatedAt,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Delete role
   */
  async deleteRole(
    orgId: mongoose.Types.ObjectId,
    roleId: string,
    actorUserId: mongoose.Types.ObjectId,
    ip?: string,
    userAgent?: string
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const role = await Role.findOne({ _id: roleId, orgId });

      if (!role) {
        throw new NotFoundError('Role not found');
      }

      // Prevent deletion of system roles
      if (role.isSystem) {
        throw new ForbiddenError('System roles cannot be deleted');
      }

      // Check if role is assigned to any users
      const userCount = await User.countDocuments({ orgId, roleIds: role._id });
      if (userCount > 0) {
        throw new ForbiddenError(
          `Cannot delete role. It is currently assigned to ${userCount} user(s). Please reassign users before deleting.`
        );
      }

      // Delete role
      await role.deleteOne({ session });

      // Create audit log
      await AuditLog.create(
        [
          {
            orgId,
            actorUserId,
            action: AuditAction.DELETE,
            entityType: 'role',
            entityId: role._id,
            beforeJson: {
              name: role.name,
              description: role.description,
              permissions: role.permissions,
            },
            ip,
            userAgent,
          },
        ],
        { session }
      );

      await session.commitTransaction();

      return { message: 'Role deleted successfully' };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get all available permissions
   */
  async getAllPermissions() {
    // Group permissions by category
    const permissionsByCategory: Record<string, string[]> = {};

    ALL_PERMISSIONS.forEach((permission) => {
      const [category] = permission.split('.');
      if (!permissionsByCategory[category]) {
        permissionsByCategory[category] = [];
      }
      permissionsByCategory[category].push(permission);
    });

    return {
      permissions: ALL_PERMISSIONS,
      categories: permissionsByCategory,
    };
  }
}