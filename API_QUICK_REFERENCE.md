# Mini-CRM/PMS API - Quick Reference Card

## 🚀 Quick Start

```bash
# Base URL
http://localhost:5000/api

# Import Postman Collection
Mini-CRM-Complete-API.postman_collection.json
```

## 🔐 Authentication

### Register Organization
```http
POST /api/auth/register
{
  "organizationName": "Acme Corp",
  "organizationDomain": "acme",
  "name": "John Doe",
  "email": "admin@acme.com",
  "password": "SecurePass123!"
}
```

### Login
```http
POST /api/auth/login
{
  "email": "admin@acme.com",
  "password": "SecurePass123!"
}
```

### Use Token
```http
Authorization: Bearer <access-token>
```

## 📊 Common Endpoints

### Leads
```http
POST   /api/leads              # Create lead
GET    /api/leads              # List leads (paginated)
GET    /api/leads/:id          # Get lead by ID
PATCH  /api/leads/:id          # Update lead
DELETE /api/leads/:id          # Delete lead
POST   /api/leads/:id/assign   # Assign lead
```

### Projects
```http
POST   /api/projects                    # Create project
GET    /api/projects                    # List projects
GET    /api/projects/:id                # Get project
PATCH  /api/projects/:id                # Update project
DELETE /api/projects/:id                # Delete project
POST   /api/projects/:id/members        # Add member
DELETE /api/projects/:id/members/:userId # Remove member
```

### Tasks
```http
POST   /api/tasks                # Create task
GET    /api/tasks                # List all tasks
GET    /api/tasks/my             # Get my tasks
GET    /api/tasks/project/:id    # Get tasks by project
GET    /api/tasks/:id            # Get task by ID
PATCH  /api/tasks/:id            # Update task
DELETE /api/tasks/:id            # Delete task
```

### Users
```http
POST   /api/users/invite    # Invite user
GET    /api/users           # List users
GET    /api/users/:id       # Get user
PATCH  /api/users/:id       # Update user
DELETE /api/users/:id       # Delete user
```

## 🎯 Common Query Parameters

### Pagination
```http
?page=1&pageSize=10
```

### Sorting
```http
?sortBy=createdAt&sortOrder=desc
```

### Filtering
```http
# Leads
?status=NEW&source=WEBSITE&ownerUserId=user-id

# Tasks
?status=TODO&priority=HIGH&projectId=project-id&assignedTo=user-id

# Projects
?status=ACTIVE&search=website
```

### Search
```http
?search=keyword
```

## 📝 Common Request Bodies

### Create Lead
```json
{
  "name": "John Customer",
  "email": "john@customer.com",
  "phone": "+1234567890",
  "company": "Customer Corp",
  "source": "WEBSITE",
  "status": "NEW"
}
```

### Create Project
```json
{
  "name": "Website Redesign",
  "description": "Complete website redesign",
  "clientId": "lead-id",
  "status": "PLANNING",
  "startDate": "2024-01-01",
  "endDate": "2024-06-30",
  "budget": 50000
}
```

### Create Task
```json
{
  "title": "Design Homepage",
  "description": "Create mockups",
  "projectId": "project-id",
  "assignedTo": "user-id",
  "priority": "HIGH",
  "status": "TODO",
  "dueDate": "2024-02-01"
}
```

### Invite User
```json
{
  "name": "Jane Smith",
  "email": "jane@acme.com",
  "roleNames": ["Manager"]
}
```

## 🎭 Roles & Permissions

| Role | Permissions |
|------|-------------|
| **SuperAdmin** | Full access (24 permissions) |
| **Admin** | All except org.manage (23 permissions) |
| **Manager** | Team management (17 permissions) |
| **Agent** | Own records only (11 permissions) |
| **Auditor** | Read-only (12 permissions) |

### Key Permissions
```
lead.create, lead.view.all, lead.view.own, lead.edit.all, lead.edit.own
project.create, project.view, project.update, project.delete
task.create, task.view, task.update, task.delete
user.invite, user.view, user.update, user.delete
role.manage, permission.view
file.upload, file.view, file.download, file.delete
org.manage, org.view
audit.view, analytics.view
```

## 📎 File Uploads

### Single File
```http
POST /api/attachments
Content-Type: multipart/form-data

file: <file>
entityType: Lead
entityId: lead-id
```

### Multiple Files (max 5)
```http
POST /api/attachments/bulk
Content-Type: multipart/form-data

files: <file1>, <file2>, ...
entityType: Project
entityId: project-id
```

## 📈 Analytics

```http
GET /api/analytics/overview?startDate=2024-01-01&endDate=2024-12-31
GET /api/analytics/leads?groupBy=status
GET /api/analytics/projects
GET /api/analytics/tasks
GET /api/analytics/activity?userId=user-id
```

## 🔧 Organization

```http
GET   /api/org        # Get organization
PATCH /api/org        # Update settings (SuperAdmin only)
```

### Update Settings
```json
{
  "name": "Acme Corporation",
  "settings": {
    "dateFormat": "MM/DD/YYYY",
    "timezone": "America/New_York",
    "features": {
      "enableEmailNotifications": true,
      "enableTaskReminders": true
    }
  }
}
```

## ⚠️ Error Codes

| Code | Status | Description |
|------|--------|-------------|
| VALIDATION_ERROR | 400 | Invalid request data |
| UNAUTHORIZED | 401 | Missing/invalid auth |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Duplicate resource |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

## 🔄 Token Lifecycle

```
Access Token:  15 minutes
Refresh Token: 7 days

# Refresh tokens
POST /api/auth/refresh
{
  "refreshToken": "current-refresh-token"
}
```

## 📊 Response Format

### Success
```json
{
  "success": true,
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": { ... }
  }
}
```

### Paginated
```json
{
  "success": true,
  "data": {
    "data": [ ... ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

## 🎯 Common Workflows

### 1. Lead to Project
```
1. POST /api/leads (create lead)
2. PATCH /api/leads/:id (qualify lead)
3. POST /api/projects (convert to project, use leadId as clientId)
4. POST /api/tasks (create project tasks)
```

### 2. User Onboarding
```
1. POST /api/users/invite (invite user)
2. POST /api/auth/verify-email (user sets password)
3. POST /api/auth/login (user logs in)
```

### 3. Task Management
```
1. GET /api/tasks/my (get my tasks)
2. PATCH /api/tasks/:id (update status to IN_PROGRESS)
3. POST /api/notes (add progress note)
4. PATCH /api/tasks/:id (update status to DONE)
```

## 🔍 Useful Filters

### Lead Status
```
NEW, QUALIFIED, CONTACTED, PROPOSAL_SENT, WON, LOST
```

### Lead Source
```
WEBSITE, REFERRAL, COLD_CALL, SOCIAL_MEDIA, EMAIL_CAMPAIGN, OTHER
```

### Project Status
```
PLANNING, ACTIVE, ON_HOLD, COMPLETED, CANCELLED
```

### Task Status
```
TODO, IN_PROGRESS, DONE, CANCELLED
```

### Task Priority
```
LOW, MEDIUM, HIGH, URGENT
```

### User Status
```
ACTIVE, INACTIVE, PENDING
```

## 📚 Documentation Links

- **[Complete API Docs](./backend/API_DOCUMENTATION.md)** - Full endpoint reference
- **[Postman Guide](./POSTMAN_GUIDE.md)** - Collection usage guide
- **[Backend README](./backend/README.md)** - Setup & configuration
- **[Test Coverage](./backend/TEST_FIXES_SUMMARY.md)** - Testing docs

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Current coverage: 98.33% (50/50 tests passing)
```

## 🚦 Rate Limits

| Endpoint | Limit |
|----------|-------|
| Login | 5 requests / 15 min |
| Register | 3 requests / hour |
| Password Reset | 3 requests / hour |

## 💡 Tips

1. **Use Postman Collection** - Auto-saves tokens and IDs
2. **Check Permissions** - Each endpoint requires specific permissions
3. **Pagination** - Always use pagination for list endpoints
4. **Soft Deletes** - DELETE sets status to INACTIVE
5. **Multi-tenant** - All data scoped to organization
6. **Audit Trail** - All changes are logged automatically

---

**Base URL**: `http://localhost:5000/api`  
**Postman Collection**: `Mini-CRM-Complete-API.postman_collection.json`  
**Total Endpoints**: 54  
**Test Coverage**: 98.33%