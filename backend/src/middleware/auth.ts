import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { UnauthorizedError } from '../utils/errors';
import { asyncHandler } from '../utils/asyncHandler';

interface JwtPayload {
  userId: string;
  orgId: string;
}

export const authenticate = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;

    const user = await User.findById(decoded.userId)
      .populate('roleIds')
      .select('+passwordHash');

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedError('User account is not active');
    }

    // Get permissions from roles
    const roles = await Role.find({ _id: { $in: user.roleIds } });
    const permissions = [...new Set(roles.flatMap((role) => role.permissions))];

    req.user = Object.assign(user.toObject(), { permissions });
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token expired');
    }
    throw error;
  }
});

export const optionalAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
    const user = await User.findById(decoded.userId).populate('roleIds');

    if (user && user.status === 'active') {
      // Get permissions from roles
      const roles = await Role.find({ _id: { $in: user.roleIds } });
      const permissions = [...new Set(roles.flatMap((role) => role.permissions))];
      
      req.user = Object.assign(user.toObject(), { permissions });
    }
  } catch (error) {
    // Silently fail for optional auth
  }

  next();
});