import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/response';
import { InviteUserInput, ListUsersQuery, UpdateUserInput } from '../validators/user.validator';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Invite a new user
   * POST /api/users/invite
   */
  inviteUser = asyncHandler(async (req: Request, res: Response) => {
    const data: InviteUserInput = req.body;
    const orgId = req.user!.orgId;
    const actorUserId = req.user!._id;
    const ip = req.ip;
    const userAgent = req.get('user-agent');

    const user = await this.userService.inviteUser(orgId, data, actorUserId, ip, userAgent);

    res.status(201).json(
      ApiResponse.success(user, 'User invited successfully')
    );
  });

  /**
   * List users with filters
   * GET /api/users
   */
  listUsers = asyncHandler(async (req: Request, res: Response) => {
    const query: ListUsersQuery = req.query as any;
    const orgId = req.user!.orgId;

    const result = await this.userService.listUsers(orgId, query);

    res.json(ApiResponse.success(result, 'Users retrieved successfully'));
  });

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const orgId = req.user!.orgId;

    const user = await this.userService.getUserById(orgId, id);

    res.json(ApiResponse.success(user, 'User retrieved successfully'));
  });

  /**
   * Update user
   * PATCH /api/users/:id
   */
  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data: UpdateUserInput = req.body;
    const orgId = req.user!.orgId;
    const actorUserId = req.user!._id;
    const ip = req.ip;
    const userAgent = req.get('user-agent');

    const user = await this.userService.updateUser(orgId, id, data, actorUserId, ip, userAgent);

    res.json(ApiResponse.success(user, 'User updated successfully'));
  });

  /**
   * Delete user
   * DELETE /api/users/:id
   */
  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const orgId = req.user!.orgId;
    const actorUserId = req.user!._id;
    const ip = req.ip;
    const userAgent = req.get('user-agent');

    const result = await this.userService.deleteUser(orgId, id, actorUserId, ip, userAgent);

    res.json(ApiResponse.success(result, result.message));
  });
}