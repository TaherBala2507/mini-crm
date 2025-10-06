import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import { Permission } from '../constants/permissions';
import { Role } from '../models/Role';
import { IRole } from '../models/Role';

export const requirePermission = (permissions: Permission | Permission[]) => {
  const permArray = Array.isArray(permissions) ? permissions : [permissions];
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      // Fetch user's roles with permissions
      const userRoles = await Role.find({
        _id: { $in: req.user.roleIds },
        orgId: req.user.orgId,
      });

      // Collect all permissions from user's roles
      const userPermissions = new Set<string>();
      userRoles.forEach((role: IRole) => {
        role.permissions.forEach((permission) => {
          userPermissions.add(permission);
        });
      });

      // Check if user has at least one of the required permissions
      const hasPermission = permArray.some((permission) => userPermissions.has(permission));

      if (!hasPermission) {
        throw new ForbiddenError(
          `Missing required permission(s): ${permArray.join(', ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireAllPermissions = (...permissions: Permission[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const userRoles = await Role.find({
        _id: { $in: req.user.roleIds },
        orgId: req.user.orgId,
      });

      const userPermissions = new Set<string>();
      userRoles.forEach((role: IRole) => {
        role.permissions.forEach((permission) => {
          userPermissions.add(permission);
        });
      });

      // Check if user has all required permissions
      const hasAllPermissions = permissions.every((permission) => userPermissions.has(permission));

      if (!hasAllPermissions) {
        throw new ForbiddenError(
          `Missing required permission(s): ${permissions.join(', ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Helper function to check permissions programmatically
export const hasPermission = async (
  user: any,
  ...permissions: Permission[]
): Promise<boolean> => {
  const userRoles = await Role.find({
    _id: { $in: user.roleIds },
    orgId: user.orgId,
  });

  const userPermissions = new Set<string>();
  userRoles.forEach((role: IRole) => {
    role.permissions.forEach((permission) => {
      userPermissions.add(permission);
    });
  });

  return permissions.some((permission) => userPermissions.has(permission));
};