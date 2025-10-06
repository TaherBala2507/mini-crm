export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

export enum OrganizationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
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
  DONE = 'done',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum EntityType {
  LEAD = 'lead',
  PROJECT = 'project',
  TASK = 'task',
  NOTE = 'note',
}

export enum TokenType {
  REFRESH = 'refresh',
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFY = 'email_verify',
}

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  ASSIGN = 'assign',
  LOGIN = 'login',
  LOGOUT = 'logout',
  INVITE = 'invite',
}