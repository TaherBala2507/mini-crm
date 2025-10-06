export enum Permission {
  // Lead permissions
  LEAD_CREATE = 'lead.create',
  LEAD_VIEW_ALL = 'lead.view.all',
  LEAD_VIEW_OWN = 'lead.view.own',
  LEAD_EDIT_ALL = 'lead.edit.all',
  LEAD_EDIT_OWN = 'lead.edit.own',
  LEAD_DELETE_ALL = 'lead.delete.all',
  LEAD_DELETE_OWN = 'lead.delete.own',
  LEAD_ASSIGN = 'lead.assign',

  // Project permissions
  PROJECT_CREATE = 'project.create',
  PROJECT_VIEW = 'project.view',
  PROJECT_UPDATE = 'project.update',
  PROJECT_DELETE = 'project.delete',

  // Task permissions
  TASK_CREATE = 'task.create',
  TASK_VIEW = 'task.view',
  TASK_UPDATE = 'task.update',
  TASK_DELETE = 'task.delete',

  // User permissions
  USER_INVITE = 'user.invite',
  USER_VIEW = 'user.view',
  USER_UPDATE = 'user.update',
  USER_DELETE = 'user.delete',

  // Role permissions
  ROLE_MANAGE = 'role.manage',
  PERMISSION_VIEW = 'permission.view',

  // Note permissions
  NOTE_CREATE = 'note.create',
  NOTE_VIEW = 'note.view',
  NOTE_UPDATE = 'note.update',
  NOTE_DELETE = 'note.delete',

  // File permissions
  FILE_UPLOAD = 'file.upload',
  FILE_VIEW = 'file.view',
  FILE_DOWNLOAD = 'file.download',
  FILE_DELETE = 'file.delete',

  // Organization permissions
  ORG_MANAGE = 'org.manage',
  ORG_VIEW = 'org.view',

  // Audit permissions
  AUDIT_VIEW = 'audit.view',

  // Analytics permissions
  ANALYTICS_VIEW = 'analytics.view',
}

export const ALL_PERMISSIONS = Object.values(Permission);

// Export as PERMISSIONS for backward compatibility
export const PERMISSIONS = Permission;