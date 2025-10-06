import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/env';
import { Organization } from '../models/Organization';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { Token } from '../models/Token';
import { AuditLog } from '../models/AuditLog';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors';
import { RoleName, ROLE_PERMISSIONS, ROLE_DESCRIPTIONS } from '../constants/roles';
import { TokenType, AuditAction, UserStatus } from '../constants/enums';
import mongoose from 'mongoose';

interface RegisterData {
  organizationName: string;
  organizationDomain: string;
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async register(data: RegisterData, ip?: string, userAgent?: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check if organization domain already exists
      const existingOrg = await Organization.findOne({ domain: data.organizationDomain });
      if (existingOrg) {
        throw new ConflictError('Organization domain already exists');
      }

      // Create organization
      const [organization] = await Organization.create(
        [
          {
            name: data.organizationName,
            domain: data.organizationDomain,
            status: 'active',
          },
        ],
        { session }
      );

      // Create default roles for the organization
      const roles = await this.createDefaultRoles(organization._id, session);
      const superAdminRole = roles.find((r) => r.name === RoleName.SUPER_ADMIN);

      if (!superAdminRole) {
        throw new Error('Failed to create SuperAdmin role');
      }

      // Create SuperAdmin user
      const [user] = await User.create(
        [
          {
            orgId: organization._id,
            name: data.name,
            email: data.email,
            passwordHash: data.password,
            status: UserStatus.ACTIVE,
            roleIds: [superAdminRole._id],
          },
        ],
        { session }
      );

      // Create audit log
      await AuditLog.create(
        [
          {
            orgId: organization._id,
            actorUserId: user._id,
            action: AuditAction.CREATE,
            entityType: 'user',
            entityId: user._id,
            afterJson: {
              name: user.name,
              email: user.email,
              roles: [RoleName.SUPER_ADMIN],
            },
            ip,
            userAgent,
          },
        ],
        { session }
      );

      await session.commitTransaction();

      // Generate tokens
      const tokens = await this.generateTokenPair(user._id.toString(), organization._id.toString());

      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          orgId: organization._id,
          status: user.status,
          roleIds: [superAdminRole._id],
          roles: [{
            id: superAdminRole._id,
            orgId: superAdminRole.orgId,
            name: superAdminRole.name,
            description: superAdminRole.description,
            permissions: superAdminRole.permissions,
            isSystem: superAdminRole.isSystem,
            createdAt: superAdminRole.createdAt,
            updatedAt: superAdminRole.updatedAt,
          }],
        },
        organization: {
          id: organization._id,
          name: organization.name,
          domain: organization.domain,
        },
        tokens,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async login(data: LoginData, ip?: string, userAgent?: string) {
    // Find user by email (need to search across all orgs)
    const user = await User.findOne({ email: data.email })
      .select('+passwordHash')
      .populate('roleIds');

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check user status
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError('Account is not active');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Create audit log
    await AuditLog.create({
      orgId: user.orgId,
      actorUserId: user._id,
      action: AuditAction.LOGIN,
      ip,
      userAgent,
    });

    // Generate tokens
    const tokens = await this.generateTokenPair(user._id.toString(), user.orgId.toString());

    // Get roles
    const roles = await Role.find({ _id: { $in: user.roleIds } });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        orgId: user.orgId,
        status: user.status,
        roleIds: user.roleIds,
        roles: roles.map((r) => ({
          id: r._id,
          orgId: r.orgId,
          name: r.name,
          description: r.description,
          permissions: r.permissions,
          isSystem: r.isSystem,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })),
        lastLoginAt: user.lastLoginAt,
      },
      tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;

      // Check if token exists and is not revoked
      const tokenHash = (Token as any).hashToken(refreshToken);
      const tokenDoc = await Token.findOne({
        userId: decoded.userId,
        type: TokenType.REFRESH,
        tokenHash,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      });

      if (!tokenDoc) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Revoke old refresh token
      tokenDoc.revokedAt = new Date();
      await tokenDoc.save();

      // Generate new token pair
      const tokens = await this.generateTokenPair(decoded.userId, decoded.orgId);

      return tokens;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid refresh token');
      }
      throw error;
    }
  }

  async logout(userId: string, refreshToken: string, ip?: string, userAgent?: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Revoke refresh token
    const tokenHash = (Token as any).hashToken(refreshToken);
    await Token.updateOne(
      {
        userId,
        type: TokenType.REFRESH,
        tokenHash,
      },
      {
        revokedAt: new Date(),
      }
    );

    // Create audit log
    await AuditLog.create({
      orgId: user.orgId,
      actorUserId: user._id,
      action: AuditAction.LOGOUT,
      ip,
      userAgent,
    });

    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email: string) {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = (Token as any).hashToken(resetToken);

    // Save token
    await Token.create({
      userId: user._id,
      type: TokenType.PASSWORD_RESET,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    // In production, send email here
    console.log(`Password reset token for ${email}: ${resetToken}`);
    console.log(`Reset link: http://localhost:5173/reset-password?token=${resetToken}`);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = (Token as any).hashToken(token);

    const tokenDoc = await Token.findOne({
      type: TokenType.PASSWORD_RESET,
      tokenHash,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) {
      throw new UnauthorizedError('Invalid or expired reset token');
    }

    // Update password
    const user = await User.findById(tokenDoc.userId).select('+passwordHash');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.passwordHash = newPassword;
    await user.save();

    // Revoke token
    tokenDoc.revokedAt = new Date();
    await tokenDoc.save();

    // Revoke all refresh tokens for this user
    await Token.updateMany(
      {
        userId: user._id,
        type: TokenType.REFRESH,
        revokedAt: null,
      },
      {
        revokedAt: new Date(),
      }
    );

    return { message: 'Password reset successfully' };
  }

  async verifyEmail(token: string, password: string, ip?: string, userAgent?: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Verify token
      const tokenHash = (Token as any).hashToken(token);

      const tokenDoc = await Token.findOne({
        type: TokenType.EMAIL_VERIFY,
        tokenHash,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      });

      if (!tokenDoc) {
        throw new UnauthorizedError('Invalid or expired verification token');
      }

      // Get user
      const user = await User.findById(tokenDoc.userId).select('+passwordHash').populate('roleIds');
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Check if user is already active
      if (user.status === UserStatus.ACTIVE) {
        throw new ConflictError('Email already verified');
      }

      // Check if user is pending
      if (user.status !== UserStatus.PENDING) {
        throw new UnauthorizedError('User account is not in pending state');
      }

      // Update user: set password and activate account
      user.passwordHash = password;
      user.status = UserStatus.ACTIVE;
      user.lastLoginAt = new Date();
      await user.save({ session });

      // Revoke verification token
      tokenDoc.revokedAt = new Date();
      await tokenDoc.save({ session });

      // Create audit log
      await AuditLog.create(
        [
          {
            orgId: user.orgId,
            actorUserId: user._id,
            action: AuditAction.UPDATE,
            entityType: 'user',
            entityId: user._id,
            beforeJson: { status: UserStatus.PENDING },
            afterJson: { status: UserStatus.ACTIVE },
            ip,
            userAgent,
          },
        ],
        { session }
      );

      await session.commitTransaction();

      // Generate tokens for automatic login
      const tokens = await this.generateTokenPair(user._id.toString(), user.orgId.toString());

      // Get roles
      const roles = await Role.find({ _id: { $in: user.roleIds } });

      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          orgId: user.orgId,
          roles: roles.map((r) => r.name),
        },
        tokens,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string, ip?: string, userAgent?: string) {
    // Get user with password
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Check if new password is different from current password
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      throw new ConflictError('New password must be different from current password');
    }

    // Update password
    user.passwordHash = newPassword;
    await user.save();

    // Revoke all refresh tokens to force re-login on all devices
    await Token.updateMany(
      {
        userId: user._id,
        type: TokenType.REFRESH,
        revokedAt: null,
      },
      {
        revokedAt: new Date(),
      }
    );

    // Create audit log
    await AuditLog.create({
      orgId: user.orgId,
      actorUserId: user._id,
      action: AuditAction.UPDATE,
      entityType: 'user',
      entityId: user._id,
      afterJson: { passwordChanged: true },
      ip,
      userAgent,
    });

    return { message: 'Password changed successfully' };
  }

  private async generateTokenPair(userId: string, orgId: string): Promise<TokenPair> {
    // Generate access token
    const accessToken = jwt.sign(
      { userId, orgId },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiry } as jwt.SignOptions
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId, orgId },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiry } as jwt.SignOptions
    );

    // Store refresh token
    const tokenHash = (Token as any).hashToken(refreshToken);
    await Token.create({
      userId,
      type: TokenType.REFRESH,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return { accessToken, refreshToken };
  }

  private async createDefaultRoles(orgId: mongoose.Types.ObjectId, session: any) {
    const rolesData = Object.values(RoleName).map((roleName) => ({
      orgId,
      name: roleName,
      description: ROLE_DESCRIPTIONS[roleName],
      permissions: ROLE_PERMISSIONS[roleName],
      isSystem: true,
    }));

    // Create roles one by one within the session to avoid the ordered: true issue
    const createdRoles = [];
    for (const roleData of rolesData) {
      const [role] = await Role.create([roleData], { session });
      createdRoles.push(role);
    }
    
    return createdRoles;
  }
}