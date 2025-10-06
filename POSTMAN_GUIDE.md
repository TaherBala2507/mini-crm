# Postman Collection Guide - Mini-CRM/PMS API

## Overview

This guide will help you get started with the Mini-CRM/PMS API using the comprehensive Postman collection.

## Quick Start

### 1. Import the Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select the file: `Mini-CRM-Complete-API.postman_collection.json`
4. Click **Import**

### 2. Configure Variables

The collection uses the following variables (already pre-configured):

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `baseUrl` | `http://localhost:5000/api` | API base URL |
| `accessToken` | (auto-saved) | JWT access token |
| `refreshToken` | (auto-saved) | JWT refresh token |
| `orgId` | (auto-saved) | Organization ID |
| `userId` | (auto-saved) | User ID |
| `leadId` | (auto-saved) | Lead ID for testing |
| `projectId` | (auto-saved) | Project ID for testing |
| `taskId` | (auto-saved) | Task ID for testing |

**To change the base URL:**
1. Click on the collection name
2. Go to **Variables** tab
3. Update `baseUrl` current value
4. Click **Save**

### 3. First Request - Register or Login

#### Option A: Register New Organization (First Time)

1. Navigate to **Auth > Register Organization**
2. Review the request body (update if needed):
   ```json
   {
     "organizationName": "Acme Corp",
     "organizationDomain": "acme",
     "name": "John Doe",
     "email": "admin@acme.com",
     "password": "SecurePass123!"
   }
   ```
3. Click **Send**
4. ✅ Access token and refresh token are **automatically saved**

#### Option B: Login (Existing User)

1. Navigate to **Auth > Login**
2. Update credentials in request body:
   ```json
   {
     "email": "admin@acme.com",
     "password": "SecurePass123!"
   }
   ```
3. Click **Send**
4. ✅ Tokens are **automatically saved**

### 4. Test Other Endpoints

Now you can test any endpoint! The collection is organized into 10 folders:

1. **Auth** - Authentication & authorization
2. **Users** - User management
3. **Leads** - Lead management
4. **Projects** - Project management
5. **Tasks** - Task management
6. **Notes** - Notes for entities
7. **Attachments** - File uploads
8. **Roles** - Role & permission management
9. **Organization** - Organization settings
10. **Analytics** - Analytics & reporting

## Collection Features

### 🔐 Auto-Authentication

All requests automatically use the saved `accessToken` in the Authorization header:
```
Authorization: Bearer {{accessToken}}
```

No need to manually copy/paste tokens!

### 🔄 Auto-Save IDs

When you create resources, their IDs are automatically saved:

- **Create Lead** → Saves `leadId`
- **Create Project** → Saves `projectId`
- **Create Task** → Saves `taskId`
- **Register/Login** → Saves `orgId`, `userId`, `accessToken`, `refreshToken`

These IDs are then used in subsequent requests (e.g., Get Lead by ID uses `{{leadId}}`).

### 📝 Pre-filled Examples

Every request includes realistic example data:

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

Just click **Send** to test!

### 🎯 Optional Parameters

Query parameters marked as optional are **disabled by default**. To use them:

1. Go to **Params** tab
2. Check the box next to the parameter you want to enable
3. Update the value if needed
4. Click **Send**

Example - List Leads with filters:
- ✅ `page` (enabled, required)
- ✅ `pageSize` (enabled, required)
- ☐ `status` (disabled, optional)
- ☐ `source` (disabled, optional)
- ☐ `search` (disabled, optional)

## Common Workflows

### Workflow 1: Complete Lead Management

1. **Auth > Login** - Get authenticated
2. **Leads > Create Lead** - Create a new lead (saves `leadId`)
3. **Leads > Get Lead by ID** - View the created lead
4. **Leads > Update Lead** - Update lead status
5. **Leads > Assign Lead** - Assign to a user
6. **Notes > Create Note** - Add a note to the lead
7. **Attachments > Upload Attachment** - Attach a file

### Workflow 2: Project & Task Management

1. **Auth > Login** - Get authenticated
2. **Projects > Create Project** - Create a project (saves `projectId`)
3. **Projects > Add Project Member** - Add team members
4. **Tasks > Create Task** - Create tasks for the project (saves `taskId`)
5. **Tasks > Get Tasks by Project** - View all project tasks
6. **Tasks > Update Task** - Update task status
7. **Analytics > Project Analytics** - View project metrics

### Workflow 3: User & Role Management

1. **Auth > Login** - Login as SuperAdmin
2. **Roles > Create Role** - Create a custom role
3. **Users > Invite User** - Invite a new user with the role
4. **Users > List Users** - View all users
5. **Users > Update User** - Update user roles/status

### Workflow 4: Organization Setup

1. **Auth > Register Organization** - Create organization
2. **Organization > Get Organization** - View org details
3. **Organization > Update Organization** - Configure settings
4. **Roles > List Roles** - View available roles
5. **Users > Invite User** - Add team members

## Testing Different Roles

To test role-based access control:

### 1. Create Users with Different Roles

```http
POST {{baseUrl}}/users/invite
{
  "name": "Manager User",
  "email": "manager@acme.com",
  "roleNames": ["Manager"]
}
```

```http
POST {{baseUrl}}/users/invite
{
  "name": "Agent User",
  "email": "agent@acme.com",
  "roleNames": ["Agent"]
}
```

### 2. Complete Email Verification

Use the verification token from the email (or database) to set password:

```http
POST {{baseUrl}}/auth/verify-email
{
  "token": "verification-token",
  "password": "SecurePass123!"
}
```

### 3. Login as Different Users

Update the Login request with different credentials and test permissions.

## File Upload Testing

### Upload Single File

1. Navigate to **Attachments > Upload Attachment**
2. Go to **Body** tab
3. Select **form-data**
4. For the `file` field, click **Select Files** and choose a file
5. Update `entityType` and `entityId` fields
6. Click **Send**

### Upload Multiple Files

1. Navigate to **Attachments > Upload Multiple Attachments**
2. For the `files` field, select multiple files (max 5)
3. Update `entityType` and `entityId`
4. Click **Send**

## Pagination & Filtering

Most list endpoints support pagination and filtering:

### Example: List Leads with Filters

```http
GET {{baseUrl}}/leads?page=1&pageSize=10&status=NEW&source=WEBSITE&search=acme
```

**Enable optional parameters:**
1. Go to **Params** tab
2. Check boxes for filters you want to use
3. Update values
4. Click **Send**

### Example: Sort Results

```http
GET {{baseUrl}}/leads?page=1&pageSize=10&sortBy=createdAt&sortOrder=desc
```

## Token Refresh

When your access token expires (after 15 minutes):

1. Navigate to **Auth > Refresh Token**
2. Click **Send**
3. ✅ New tokens are automatically saved
4. Continue testing with refreshed token

## Troubleshooting

### Issue: "Unauthorized" Error

**Solution:**
1. Check if you're logged in (run **Auth > Login**)
2. Verify `accessToken` is saved (check collection variables)
3. If token expired, run **Auth > Refresh Token**

### Issue: "Forbidden" Error

**Solution:**
- Your user role doesn't have required permissions
- Login as SuperAdmin or Admin for full access
- Check [API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md) for required permissions

### Issue: "Validation Error"

**Solution:**
- Review the request body format
- Check required fields are provided
- Verify data types match (e.g., dates in ISO format)

### Issue: Variables Not Saving

**Solution:**
1. Check the **Tests** tab in the request
2. Verify the test script is present
3. Check **Console** (bottom left) for errors
4. Manually set variables if needed:
   - Click collection name
   - Go to **Variables** tab
   - Update **Current Value**
   - Click **Save**

## Advanced Features

### Environment Variables

For different environments (dev, staging, production):

1. Click **Environments** (left sidebar)
2. Create new environment (e.g., "Production")
3. Add variables:
   - `baseUrl`: `https://api.yourapp.com/api`
4. Select the environment from dropdown (top right)

### Pre-request Scripts

Some requests include pre-request scripts for dynamic data:

```javascript
// Generate random email
pm.collectionVariables.set("randomEmail", 
  `user${Date.now()}@example.com`
);
```

### Test Scripts

All create/login requests include test scripts to save IDs:

```javascript
// Save access token
const response = pm.response.json();
if (response.data.tokens) {
  pm.collectionVariables.set("accessToken", 
    response.data.tokens.accessToken
  );
}
```

## API Endpoints Summary

### Total: 54 Endpoints

| Module | Endpoints | Key Features |
|--------|-----------|--------------|
| Auth | 8 | Register, Login, Refresh, Password Reset |
| Users | 5 | Invite, List, Update, Delete |
| Leads | 6 | CRUD + Assign |
| Projects | 7 | CRUD + Member Management |
| Tasks | 7 | CRUD + Project/User Filtering |
| Notes | 6 | CRUD + Entity Association |
| Attachments | 7 | Upload, Download, Stats |
| Roles | 6 | CRUD + Permissions |
| Organization | 2 | View, Update Settings |
| Analytics | 5 | Overview, Leads, Projects, Tasks, Activity |

## Best Practices

### 1. Use Environments

Create separate environments for:
- **Local Development**: `http://localhost:5000/api`
- **Staging**: `https://staging-api.yourapp.com/api`
- **Production**: `https://api.yourapp.com/api`

### 2. Organize Test Scenarios

Create folders for common workflows:
- "Smoke Tests" - Basic health checks
- "User Onboarding" - Registration → Verification → Login
- "Lead Lifecycle" - Create → Update → Convert → Close

### 3. Use Collection Runner

Test multiple requests in sequence:
1. Click collection name
2. Click **Run**
3. Select requests to run
4. Click **Run Mini-CRM-Complete-API**

### 4. Export Results

After testing:
1. Click **Runner** tab
2. Click **Export Results**
3. Save as JSON for documentation

### 5. Share with Team

Export and share:
1. Right-click collection
2. Click **Export**
3. Choose **Collection v2.1**
4. Share the JSON file

## Additional Resources

- **[API Documentation](./backend/API_DOCUMENTATION.md)** - Complete endpoint reference
- **[Backend README](./backend/README.md)** - Setup and configuration
- **[Test Coverage](./backend/TEST_FIXES_SUMMARY.md)** - Testing documentation

## Support

For issues or questions:
- Check the API documentation for endpoint details
- Review error messages in Postman Console
- Verify your user has required permissions
- Check backend logs for detailed error information

---

**Happy Testing! 🚀**