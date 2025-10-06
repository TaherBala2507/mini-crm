import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/response';

const authService = new AuthService();

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await authService.register(req.body, ip, userAgent);

    res.status(201).json(ApiResponse.success(result, 'Registration successful'));
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await authService.login(req.body, ip, userAgent);

    res.json(ApiResponse.success(result, 'Login successful'));
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    const tokens = await authService.refreshToken(refreshToken);

    res.json(ApiResponse.success(tokens, 'Token refreshed successfully'));
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await authService.logout(req.user!._id.toString(), refreshToken, ip, userAgent);

    res.json(ApiResponse.success(result, 'Logged out successfully'));
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    const result = await authService.forgotPassword(email);

    res.json(ApiResponse.success(result));
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;

    const result = await authService.resetPassword(token, password);

    res.json(ApiResponse.success(result));
  });

  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await authService.verifyEmail(token, password, ip, userAgent);

    res.json(ApiResponse.success(result, 'Email verified successfully. You are now logged in.'));
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await authService.changePassword(
      req.user!._id.toString(),
      currentPassword,
      newPassword,
      ip,
      userAgent
    );

    res.json(ApiResponse.success(result));
  });

  me = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;
    
    // Populate roles with their permissions
    const populatedUser = await user.populate('roleIds');
    
    res.json(ApiResponse.success({
      id: user._id,
      name: user.name,
      email: user.email,
      orgId: user.orgId,
      status: user.status,
      roleIds: user.roleIds.map((id: any) => id.toString()),
      roles: populatedUser.roleIds,
      lastLoginAt: user.lastLoginAt,
    }));
  });
}