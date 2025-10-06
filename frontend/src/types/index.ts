// Enums
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

export enum LeadStatus {
  NEW = 'new',
  QUALIFIED = 'qualified',
  WON = 'won',
  LOST = 'lost',
}

export enum LeadSource {
  REFERRAL = 'referral',
  WEBSITE = 'website',
  ADS = 'ads',
  EVENT = 'event',
  OTHER = 'other',
}

export enum ProjectStatus {
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
}

// Role Names
export enum RoleName {
  SUPER_ADMIN = 'SuperAdmin',
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  AGENT = 'Agent',
  VIEWER = 'Viewer',
}

// Entities
export interface Organization {
  id: string;
  name: string;
  domain: string;
  status: string;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  orgId: string;
  name: string;
  email: string;
  status: UserStatus;
  roleIds: string[];
  roles?: Role[];
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

// Lead entity type
export interface Lead {
  id: string;
  orgId: string;
  title: string;
  company: string;
  contactName: string;
  email?: string;
  phone?: string;
  source: LeadSource;
  status: LeadStatus;
  ownerUserId?: string;
  owner?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  budget?: number;
  client?: string;
  memberIds: string[];
  members?: User[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  orgId: string;
  projectId: string;
  project?: Project;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeUserId?: string;
  assignee?: User;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  orgId: string;
  entityType: string;
  entityId: string;
  content: string;
  authorId: string;
  author?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  orgId: string;
  entityType: string;
  entityId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedById: string;
  uploadedBy?: User;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  orgId: string;
  actorUserId: string;
  actor?: User;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  beforeJson?: Record<string, any>;
  afterJson?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    orgId: string;
    roles: string[];
  };
  organization?: {
    id: string;
    name: string;
    domain: string;
  };
  tokens: AuthTokens;
}

// Form Data Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  organizationName: string;
  organizationDomain: string;
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  token: string;
  password: string;
}

export interface LeadFormData {
  title: string;
  company: string;
  contactName: string;
  email?: string;
  phone?: string;
  source: LeadSource;
  status?: LeadStatus;
  ownerUserId?: string;
}

export interface ProjectFormData {
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  budget?: number;
  client?: string;
  memberIds?: string[];
}

export interface TaskFormData {
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeUserId?: string;
  dueDate?: string;
}

export interface UserInviteFormData {
  name: string;
  email: string;
  roleNames: string[];
}

export interface RoleFormData {
  name: string;
  description?: string;
  permissions: string[];
}

export interface NoteFormData {
  entityType: 'Lead' | 'Project' | 'Task';
  entityId: string;
  content: string;
}

// Filter Types
export interface LeadFilters {
  status?: LeadStatus[];
  source?: LeadSource[];
  ownerId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProjectFilters {
  status?: ProjectStatus[];
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TaskFilters {
  projectId?: string;
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigneeUserId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserFilters {
  status?: UserStatus[];
  roleId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AuditFilters {
  actorUserId?: string;
  action?: AuditAction[];
  entityType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

// Analytics Types
export interface AnalyticsOverview {
  summary: {
    totalLeads: number;
    totalProjects: number;
    totalTasks: number;
    activeProjects: number;
    completedProjects: number;
    openTasks: number;
    completedTasks: number;
    overdueTasks: number;
    conversionRate: number;
    taskCompletionRate: number;
  };
  breakdowns: {
    leadsByStatus: Array<{ status: string; count: number }>;
    tasksByPriority: Array<{ priority: string; count: number }>;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    user: {
      _id: string;
      name: string;
      email: string;
    };
    timestamp: string;
    metadata?: Record<string, any>;
  }>;
}

export interface LeadAnalytics {
  totalLeads: number;
  leadsByStatus: Record<string, number>;
  leadsBySource: Record<string, number>;
  conversionRate: number;
  averageValue: number;
}

export interface ProjectAnalytics {
  totalProjects: number;
  projectsByStatus: Record<string, number>;
  averageBudget: number;
  completionRate: number;
}

export interface TaskAnalytics {
  totalTasks: number;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
  completionRate: number;
  overdueTasks: number;
}