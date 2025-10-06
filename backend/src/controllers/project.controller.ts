import { Request, Response } from 'express';
import { ProjectService } from '../services/project.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/response';

const projectService = new ProjectService();

export class ProjectController {
  /**
   * Create a new project
   * POST /api/projects
   */
  createProject = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const orgId = req.user!.orgId.toString();

    // Transform memberIds array to members array format
    const projectData = { ...req.body };
    if (projectData.memberIds && Array.isArray(projectData.memberIds)) {
      projectData.members = projectData.memberIds.map((userId: string) => ({
        userId,
        role: 'Member',
      }));
      delete projectData.memberIds;
    }

    const project = await projectService.createProject(projectData, userId, orgId);

    res.status(201).json(
      ApiResponse.success(project, 'Project created successfully')
    );
  });

  /**
   * List projects with filtering and pagination
   * GET /api/projects
   */
  listProjects = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.user!.orgId.toString();

    const result = await projectService.listProjects(req.query, orgId);

    res.json(
      ApiResponse.success(result, 'Projects retrieved successfully')
    );
  });

  /**
   * Get project by ID
   * GET /api/projects/:id
   */
  getProject = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const orgId = req.user!.orgId.toString();

    const project = await projectService.getProjectById(id, orgId);

    res.json(
      ApiResponse.success(project, 'Project retrieved successfully')
    );
  });

  /**
   * Update project
   * PATCH /api/projects/:id
   */
  updateProject = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!._id.toString();
    const orgId = req.user!.orgId.toString();

    const project = await projectService.updateProject(id, req.body, userId, orgId);

    res.json(
      ApiResponse.success(project, 'Project updated successfully')
    );
  });

  /**
   * Delete project (soft delete)
   * DELETE /api/projects/:id
   */
  deleteProject = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!._id.toString();
    const orgId = req.user!.orgId.toString();

    await projectService.deleteProject(id, userId, orgId);

    res.json(
      ApiResponse.success(null, 'Project deleted successfully')
    );
  });

  /**
   * Add member to project
   * POST /api/projects/:id/members
   */
  addMember = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!._id.toString();
    const orgId = req.user!.orgId.toString();

    const project = await projectService.addMember(id, req.body, userId, orgId);

    res.json(
      ApiResponse.success(project, 'Member added successfully')
    );
  });

  /**
   * Remove member from project
   * DELETE /api/projects/:id/members/:userId
   */
  removeMember = asyncHandler(async (req: Request, res: Response) => {
    const { id, userId: memberUserId } = req.params;
    const userId = req.user!._id.toString();
    const orgId = req.user!.orgId.toString();

    const project = await projectService.removeMember(id, memberUserId, userId, orgId);

    res.json(
      ApiResponse.success(project, 'Member removed successfully')
    );
  });
}