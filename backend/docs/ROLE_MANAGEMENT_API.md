# Role Management API Documentation

## Overview

The Role Management API enables dynamic creation, modification, and deletion of custom roles with fine-grained permission control. This allows organizations to create roles tailored to their specific needs beyond the default system roles (SuperAdmin, Admin, Manager, Agent, Auditor).

## Key Features

- ✅ **Dynamic Role Creation** - Create custom roles with specific permissions
- ✅ **Permission Management** - Assign granular permissions to roles
- ✅ **System Role Protection** - Prevent modification/deletion of built-in roles
- ✅ **User Assignment Tracking** - View which users have each role
- ✅ **Permission Discovery** - List all available permissions
- ✅ **Audit Logging** - Track all role changes
- ✅ **RBAC Protection** - Only authorized users can manage roles

---

## Endpoints

### 1. Create Custom Role

**POST** `/api/roles`

Create a new custom role with specific permissions.

#### Request

**Headers:**
```
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Customer Success Manager",
  "description": "Manages customer relationships and support tickets",
  "permissions": [
    "lead.view.all",
    "lead.edit.own",
    "project.view",
    "task.view",
    "task.update",
    "note.create",
    "note.view",
    "note.update"
  ]
}
```

**Validation Rules:**
- `name`: Required, 2-50 characters, unique per organization
- `description`: Optional, max 200 characters
- `permissions`: Required, array of valid permissions, at least 1, no duplicates

#### Response

**Success (201 Created):**
```json
{
  "success": true,
  "message": "Role created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Customer Success Manager",
    "description": "Manages customer relationships and support tickets",
    "permissions": [
      "lead.view.all",
      "lead.edit.own",
      "project.view",
      "task.view",
      "task.update",
      "note.create",
      "note.view",
      "note.update"
    ],
    "isSystem": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Validation error:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Role name must be at least 2 characters"
    }
  ]
}
```

**401 Unauthorized** - Not authenticated:
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**403 Forbidden** - Missing ROLE_MANAGE permission:
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

**409 Conflict** - Role name already exists:
```json
{
  "success": false,
  "message": "Role with this name already exists in the organization"
}
```

---

### 2. List Roles

**GET** `/api/roles`

List all roles with optional filtering and pagination.

#### Request

**Headers:**
```
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page, 1-100 (default: 20)
- `search` (optional): Search in role name or description
- `includeSystem` (optional): Include system roles (default: true)

**Example:**
```
GET /api/roles?page=1&pageSize=20&search=manager&includeSystem=false
```

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Roles retrieved successfully",
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Customer Success Manager",
      "description": "Manages customer relationships",
      "permissions": ["lead.view.all", "lead.edit.own", "..."],
      "isSystem": false,
      "userCount": 5,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "SuperAdmin",
      "description": "Full system access",
      "permissions": ["*"],
      "isSystem": true,
      "userCount": 2,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 8,
    "totalPages": 1
  }
}
```

---

### 3. Get Role by ID

**GET** `/api/roles/:id`

Get detailed information about a specific role, including assigned users.

#### Request

**Headers:**
```
Authorization: Bearer <access-token>
```

**URL Parameters:**
- `id`: Role ID

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Role retrieved successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Customer Success Manager",
    "description": "Manages customer relationships and support tickets",
    "permissions": [
      "lead.view.all",
      "lead.edit.own",
      "project.view",
      "task.view",
      "task.update",
      "note.create",
      "note.view",
      "note.update"
    ],
    "isSystem": false,
    "userCount": 5,
    "users": [
      {
        "id": "507f1f77bcf86cd799439021",
        "name": "Jane Smith",
        "email": "jane@company.com",
        "status": "active"
      },
      {
        "id": "507f1f77bcf86cd799439022",
        "name": "John Doe",
        "email": "john@company.com",
        "status": "active"
      }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

**404 Not Found** - Role doesn't exist:
```json
{
  "success": false,
  "message": "Role not found"
}
```

---

### 4. Update Role

**PATCH** `/api/roles/:id`

Update a custom role's name, description, or permissions.

#### Request

**Headers:**
```
Authorization: Bearer <access-token>
Content-Type: application/json
```

**URL Parameters:**
- `id`: Role ID

**Body:**
```json
{
  "name": "Senior Customer Success Manager",
  "description": "Senior-level customer relationship management",
  "permissions": [
    "lead.view.all",
    "lead.edit.all",
    "lead.assign",
    "project.view",
    "project.update",
    "task.view",
    "task.update",
    "note.create",
    "note.view",
    "note.update"
  ]
}
```

**Validation Rules:**
- At least one field must be provided
- `name`: 2-50 characters, unique per organization
- `description`: Max 200 characters
- `permissions`: Array of valid permissions, at least 1, no duplicates

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Role updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Senior Customer Success Manager",
    "description": "Senior-level customer relationship management",
    "permissions": [
      "lead.view.all",
      "lead.edit.all",
      "lead.assign",
      "project.view",
      "project.update",
      "task.view",
      "task.update",
      "note.create",
      "note.view",
      "note.update"
    ],
    "isSystem": false,
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

**Error Responses:**

**403 Forbidden** - Attempting to modify system role:
```json
{
  "success": false,
  "message": "System roles cannot be modified"
}
```

**404 Not Found** - Role doesn't exist:
```json
{
  "success": false,
  "message": "Role not found"
}
```

**409 Conflict** - New name already exists:
```json
{
  "success": false,
  "message": "Role with this name already exists in the organization"
}
```

---

### 5. Delete Role

**DELETE** `/api/roles/:id`

Delete a custom role. System roles cannot be deleted.

#### Request

**Headers:**
```
Authorization: Bearer <access-token>
```

**URL Parameters:**
- `id`: Role ID

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Role deleted successfully"
  }
}
```

**Error Responses:**

**403 Forbidden** - System role:
```json
{
  "success": false,
  "message": "System roles cannot be deleted"
}
```

**403 Forbidden** - Role assigned to users:
```json
{
  "success": false,
  "message": "Cannot delete role. It is currently assigned to 5 user(s). Please reassign users before deleting."
}
```

**404 Not Found** - Role doesn't exist:
```json
{
  "success": false,
  "message": "Role not found"
}
```

---

### 6. Get All Permissions

**GET** `/api/roles/permissions`

Get a list of all available permissions grouped by category.

#### Request

**Headers:**
```
Authorization: Bearer <access-token>
```

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Permissions retrieved successfully",
  "data": {
    "permissions": [
      "lead.create",
      "lead.view.all",
      "lead.view.own",
      "lead.edit.all",
      "lead.edit.own",
      "lead.delete.all",
      "lead.delete.own",
      "lead.assign",
      "project.create",
      "project.view",
      "project.update",
      "project.delete",
      "task.create",
      "task.view",
      "task.update",
      "task.delete",
      "user.invite",
      "user.view",
      "user.update",
      "user.delete",
      "role.manage",
      "permission.view",
      "note.create",
      "note.view",
      "note.update",
      "note.delete",
      "file.upload",
      "file.view",
      "file.delete",
      "org.manage",
      "org.view",
      "audit.view",
      "analytics.view"
    ],
    "categories": {
      "lead": [
        "lead.create",
        "lead.view.all",
        "lead.view.own",
        "lead.edit.all",
        "lead.edit.own",
        "lead.delete.all",
        "lead.delete.own",
        "lead.assign"
      ],
      "project": [
        "project.create",
        "project.view",
        "project.update",
        "project.delete"
      ],
      "task": [
        "task.create",
        "task.view",
        "task.update",
        "task.delete"
      ],
      "user": [
        "user.invite",
        "user.view",
        "user.update",
        "user.delete"
      ],
      "role": [
        "role.manage"
      ],
      "permission": [
        "permission.view"
      ],
      "note": [
        "note.create",
        "note.view",
        "note.update",
        "note.delete"
      ],
      "file": [
        "file.upload",
        "file.view",
        "file.delete"
      ],
      "org": [
        "org.manage",
        "org.view"
      ],
      "audit": [
        "audit.view"
      ],
      "analytics": [
        "analytics.view"
      ]
    }
  }
}
```

---

## Permission Categories

### Lead Permissions
- `lead.create` - Create new leads
- `lead.view.all` - View all leads in organization
- `lead.view.own` - View only assigned leads
- `lead.edit.all` - Edit all leads
- `lead.edit.own` - Edit only assigned leads
- `lead.delete.all` - Delete any lead
- `lead.delete.own` - Delete only assigned leads
- `lead.assign` - Assign leads to users

### Project Permissions
- `project.create` - Create new projects
- `project.view` - View projects
- `project.update` - Update projects
- `project.delete` - Delete projects

### Task Permissions
- `task.create` - Create new tasks
- `task.view` - View tasks
- `task.update` - Update tasks
- `task.delete` - Delete tasks

### User Permissions
- `user.invite` - Invite new users
- `user.view` - View user profiles
- `user.update` - Update user profiles
- `user.delete` - Delete users

### Role Permissions
- `role.manage` - Create, update, delete custom roles
- `permission.view` - View available permissions

### Note Permissions
- `note.create` - Create notes
- `note.view` - View notes
- `note.update` - Update notes
- `note.delete` - Delete notes

### File Permissions
- `file.upload` - Upload files
- `file.view` - View/download files
- `file.delete` - Delete files

### Organization Permissions
- `org.manage` - Manage organization settings
- `org.view` - View organization details

### Audit Permissions
- `audit.view` - View audit logs

### Analytics Permissions
- `analytics.view` - View analytics dashboards

---

## System Roles

The following roles are created automatically and cannot be modified or deleted:

### SuperAdmin
- **Description:** Full system access
- **Permissions:** All permissions
- **Use Case:** Organization owner, technical administrator

### Admin
- **Description:** Administrative access (except org management)
- **Permissions:** All except `org.manage`
- **Use Case:** Department heads, senior managers

### Manager
- **Description:** Team management capabilities
- **Permissions:** Lead/project/task management, user viewing
- **Use Case:** Team leads, project managers

### Agent
- **Description:** Individual contributor access
- **Permissions:** Own leads/tasks, view projects
- **Use Case:** Sales reps, support agents

### Auditor
- **Description:** Read-only access with audit logs
- **Permissions:** View-only access, audit log access
- **Use Case:** Compliance officers, auditors

---

## Use Cases

### 1. Customer Success Team

**Scenario:** Create a role for customer success managers who need to view all leads but only edit their own, plus manage projects and tasks.

```bash
curl -X POST http://localhost:3000/api/roles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Customer Success Manager",
    "description": "Manages customer relationships and projects",
    "permissions": [
      "lead.view.all",
      "lead.edit.own",
      "project.view",
      "project.update",
      "task.create",
      "task.view",
      "task.update",
      "note.create",
      "note.view",
      "analytics.view"
    ]
  }'
```

### 2. Sales Team Lead

**Scenario:** Create a role for sales team leads who can manage leads and assign them to team members.

```bash
curl -X POST http://localhost:3000/api/roles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sales Team Lead",
    "description": "Manages sales team and lead distribution",
    "permissions": [
      "lead.create",
      "lead.view.all",
      "lead.edit.all",
      "lead.assign",
      "user.view",
      "analytics.view",
      "note.create",
      "note.view"
    ]
  }'
```

### 3. Project Coordinator

**Scenario:** Create a role for project coordinators who focus on project and task management.

```bash
curl -X POST http://localhost:3000/api/roles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Project Coordinator",
    "description": "Coordinates projects and tasks",
    "permissions": [
      "project.create",
      "project.view",
      "project.update",
      "task.create",
      "task.view",
      "task.update",
      "note.create",
      "note.view",
      "note.update",
      "file.upload",
      "file.view"
    ]
  }'
```

---

## Security Considerations

### 1. System Role Protection
- System roles (SuperAdmin, Admin, Manager, Agent, Auditor) cannot be modified or deleted
- Prevents accidental removal of critical roles
- Ensures consistent permission structure

### 2. Permission Validation
- All permissions are validated against the Permission enum
- Invalid permissions are rejected
- Duplicate permissions are not allowed

### 3. User Assignment Check
- Roles with assigned users cannot be deleted
- Prevents orphaned user accounts
- Forces explicit user reassignment

### 4. RBAC Protection
- Only users with `role.manage` permission can create/update/delete roles
- Only users with `permission.view` can list roles and permissions
- Typically limited to SuperAdmin and Admin roles

### 5. Audit Logging
- All role changes are logged with before/after state
- IP address and user agent captured
- Complete audit trail for compliance

---

## Best Practices

### 1. Principle of Least Privilege
- Grant only the minimum permissions required
- Start with fewer permissions and add as needed
- Regularly review and audit role permissions

### 2. Role Naming
- Use clear, descriptive names
- Follow consistent naming conventions
- Avoid abbreviations that may be unclear

### 3. Permission Grouping
- Group related permissions together
- Consider workflow requirements
- Balance granularity with usability

### 4. Regular Audits
- Review role assignments quarterly
- Remove unused custom roles
- Update permissions as requirements change

### 5. Documentation
- Document the purpose of each custom role
- Maintain a permission matrix
- Train users on role capabilities

---

## Frontend Integration Example

```javascript
// Fetch all available permissions
const fetchPermissions = async () => {
  const response = await fetch('http://localhost:3000/api/roles/permissions', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  const result = await response.json();
  return result.data;
};

// Create a custom role
const createRole = async (roleData) => {
  const response = await fetch('http://localhost:3000/api/roles', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(roleData),
  });
  const result = await response.json();
  return result.data;
};

// List all roles
const listRoles = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`http://localhost:3000/api/roles?${params}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  const result = await response.json();
  return result.data;
};

// Update a role
const updateRole = async (roleId, updates) => {
  const response = await fetch(`http://localhost:3000/api/roles/${roleId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  const result = await response.json();
  return result.data;
};

// Delete a role
const deleteRole = async (roleId) => {
  const response = await fetch(`http://localhost:3000/api/roles/${roleId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  const result = await response.json();
  return result.data;
};
```

---

## Testing

### Manual Testing with cURL

**1. Get all permissions:**
```bash
curl -X GET http://localhost:3000/api/roles/permissions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**2. Create a custom role:**
```bash
curl -X POST http://localhost:3000/api/roles \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Role",
    "description": "A test role",
    "permissions": ["lead.view.all", "task.view"]
  }'
```

**3. List all roles:**
```bash
curl -X GET "http://localhost:3000/api/roles?includeSystem=true" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**4. Get role details:**
```bash
curl -X GET http://localhost:3000/api/roles/ROLE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**5. Update role:**
```bash
curl -X PATCH http://localhost:3000/api/roles/ROLE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description",
    "permissions": ["lead.view.all", "task.view", "task.update"]
  }'
```

**6. Delete role:**
```bash
curl -X DELETE http://localhost:3000/api/roles/ROLE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Related Endpoints

- `POST /api/users/invite` - Invite user with role assignment
- `PATCH /api/users/:id` - Update user's roles
- `GET /api/auth/me` - Get current user's roles and permissions

---

## Future Enhancements

1. **Role Templates** - Pre-defined role templates for common use cases
2. **Permission Inheritance** - Hierarchical role structure
3. **Conditional Permissions** - Context-based permission rules
4. **Role Expiry** - Time-limited role assignments
5. **Permission Bundles** - Grouped permissions for easier management
6. **Role Analytics** - Usage statistics and permission effectiveness

---

**Last Updated:** January 2024  
**API Version:** 1.0  
**Status:** ✅ Production Ready