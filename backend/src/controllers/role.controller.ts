import { Request, Response } from 'express';
import { RoleService } from '../services/role.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/response';

const roleService = new RoleService();

export class RoleController {
  /**
   * Create a new role
   */
  createRole = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.user!.orgId;
    const actorUserId = req.user!._id;
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const role = await roleService.createRole(orgId, req.body, actorUserId, ip, userAgent);

    res.status(201).json(ApiResponse.success(role, 'Role created successfully'));
  });

  /**
   * List all roles
   */
  listRoles = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.user!.orgId;

    const result = await roleService.listRoles(orgId, req.query);

    res.json(ApiResponse.success(result.roles, 'Roles retrieved successfully', result.pagination));
  });

  /**
   * Get role by ID
   */
  getRoleById = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.user!.orgId;
    const { id } = req.params;

    const role = await roleService.getRoleById(orgId, id);

    res.json(ApiResponse.success(role, 'Role retrieved successfully'));
  });

  /**
   * Update role
   */
  updateRole = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.user!.orgId;
    const actorUserId = req.user!._id;
    const { id } = req.params;
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const role = await roleService.updateRole(orgId, id, req.body, actorUserId, ip, userAgent);

    res.json(ApiResponse.success(role, 'Role updated successfully'));
  });

  /**
   * Delete role
   */
  deleteRole = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.user!.orgId;
    const actorUserId = req.user!._id;
    const { id } = req.params;
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await roleService.deleteRole(orgId, id, actorUserId, ip, userAgent);

    res.json(ApiResponse.success(result));
  });

  /**
   * Get all available permissions
   */
  getAllPermissions = asyncHandler(async (_req: Request, res: Response) => {
    const result = await roleService.getAllPermissions();

    res.json(ApiResponse.success(result, 'Permissions retrieved successfully'));
  });
}