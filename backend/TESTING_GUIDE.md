# Mini-CRM API Testing Guide

## Prerequisites

1. **MongoDB Atlas Connection**: Update `.env` file with your MongoDB Atlas connection string
2. **Node.js**: Ensure Node.js is installed (v18+ recommended)
3. **Dependencies**: Run `npm install` in the backend directory
4. **Build**: Run `npm run build` to compile TypeScript

## Quick Start

### 1. Start the Server

```bash
cd backend
npm run dev
```

The server will start on `http://localhost:5000`

### 2. Seed the Database (Optional)

To populate the database with demo data:

```bash
npm run seed
```

This creates:
- Demo organization: "Acme Corp" (domain: acme)
- 5 demo users with different roles:
  - `superadmin@acme.test` - Super Admin
  - `admin@acme.test` - Admin
  - `manager@acme.test` - Manager
  - `agent@acme.test` - Agent
  - `auditor@acme.test` - Auditor
- All passwords: `Passw0rd!`
- Sample leads, projects, and tasks

## Testing Methods

### Option 1: VS Code REST Client Extension

1. Install the "REST Client" extension in VS Code
2. Open `api-tests.http` file
3. Click "Send Request" above each request

### Option 2: Postman

1. Import the requests from `api-tests.http` into Postman
2. Create environment variables for `baseUrl`, `accessToken`, `refreshToken`
3. Execute requests

### Option 3: cURL

See examples below in the "API Endpoints" section.

## Authentication Flow

### 1. Register a New Organization

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "organizationName": "My Company",
    "organizationDomain": "mycompany",
    "name": "John Doe",
    "email": "john@mycompany.com",
    "password": "Passw0rd!"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@mycompany.com",
      "orgId": "...",
      "status": "active"
    },
    "organization": {
      "id": "...",
      "name": "My Company",
      "domain": "mycompany"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@mycompany.com",
    "password": "Passw0rd!"
  }'
```

**Save the `accessToken` from the response for subsequent requests.**

### 3. Get Current User

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Lead Management API

### 1. Create Lead

```bash
curl -X POST http://localhost:5000/api/leads \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Enterprise Software Solution",
    "company": "TechCorp Inc",
    "contactName": "Jane Smith",
    "email": "jane@techcorp.com",
    "phone": "+1-555-0123",
    "status": "new",
    "source": "website",
    "value": 50000,
    "notes": "Interested in our enterprise package"
  }'
```

**Required Fields:**
- `title` (string, 1-200 chars)
- `status` (enum: new, contacted, qualified, proposal, negotiation, won, lost)

**Optional Fields:**
- `company` (string, max 200 chars)
- `contactName` (string, max 100 chars)
- `email` (valid email)
- `phone` (string, max 20 chars)
- `source` (enum: website, referral, cold_call, social_media, event, other)
- `value` (number, min 0)
- `notes` (string, max 2000 chars)
- `ownerUserId` (ObjectId, defaults to creator)

### 2. Get All Leads

```bash
# Basic request
curl -X GET http://localhost:5000/api/leads \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# With pagination
curl -X GET "http://localhost:5000/api/leads?page=1&pageSize=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# With filters
curl -X GET "http://localhost:5000/api/leads?status=new&source=website" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# With search
curl -X GET "http://localhost:5000/api/leads?search=TechCorp" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# With sorting
curl -X GET "http://localhost:5000/api/leads?sortBy=createdAt&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Query Parameters:**
- `page` (number, default: 1)
- `pageSize` (number, default: 10, max: 100)
- `status` (enum: new, contacted, qualified, proposal, negotiation, won, lost)
- `source` (enum: website, referral, cold_call, social_media, event, other)
- `ownerUserId` (ObjectId)
- `search` (string, searches title, company, contactName)
- `sortBy` (string: title, company, value, createdAt, updatedAt)
- `sortOrder` (asc or desc, default: desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Enterprise Software Solution",
      "company": "TechCorp Inc",
      "contactName": "Jane Smith",
      "email": "jane@techcorp.com",
      "status": "new",
      "source": "website",
      "value": 50000,
      "ownerUserId": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@mycompany.com"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 10,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### 3. Get Lead by ID

```bash
curl -X GET http://localhost:5000/api/leads/LEAD_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Update Lead

```bash
curl -X PUT http://localhost:5000/api/leads/LEAD_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Enterprise Software Solution - Updated",
    "status": "contacted",
    "value": 75000,
    "notes": "Had initial call, very interested"
  }'
```

**Note:** All fields are optional. Only provided fields will be updated.

### 5. Assign Lead to User

```bash
curl -X PATCH http://localhost:5000/api/leads/LEAD_ID/assign \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ownerUserId": "USER_ID"
  }'
```

**Required Permission:** `lead.assign` (Manager, Admin, SuperAdmin)

### 6. Delete Lead (Soft Delete)

```bash
curl -X DELETE http://localhost:5000/api/leads/LEAD_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## RBAC Testing Scenarios

### Scenario 1: Agent Access (Ownership-Based)

**Agent Role Permissions:**
- `lead.view.own` - Can only view their own leads
- `lead.create` - Can create leads (automatically becomes owner)
- `lead.edit.own` - Can only edit their own leads
- `lead.delete.own` - Can only delete their own leads

**Test:**
1. Login as Agent
2. Create a lead (agent becomes owner)
3. View all leads (should only see own leads)
4. Try to view another agent's lead (should fail with 403)
5. Update own lead (should succeed)
6. Try to update another agent's lead (should fail with 403)

### Scenario 2: Manager Access (Full Access)

**Manager Role Permissions:**
- `lead.view.all` - Can view all leads
- `lead.create` - Can create leads
- `lead.edit.all` - Can edit any lead
- `lead.delete.all` - Can delete any lead
- `lead.assign` - Can assign leads to users

**Test:**
1. Login as Manager
2. View all leads (should see all leads in organization)
3. Update any lead (should succeed)
4. Assign lead to another user (should succeed)
5. Delete any lead (should succeed)

### Scenario 3: Auditor Access (Read-Only)

**Auditor Role Permissions:**
- `lead.view.all` - Can view all leads
- No create, edit, delete, or assign permissions

**Test:**
1. Login as Auditor
2. View all leads (should succeed)
3. Try to create lead (should fail with 403)
4. Try to update lead (should fail with 403)
5. Try to delete lead (should fail with 403)

## Error Responses

### 400 Bad Request - Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "code": 400,
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized - Authentication Required
```json
{
  "success": false,
  "message": "Authentication required",
  "code": 401
}
```

### 403 Forbidden - Insufficient Permissions
```json
{
  "success": false,
  "message": "Insufficient permissions",
  "code": 403
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Lead not found",
  "code": 404
}
```

### 409 Conflict - Duplicate Entry
```json
{
  "success": false,
  "message": "Email already exists",
  "code": 409
}
```

### 429 Too Many Requests - Rate Limit
```json
{
  "success": false,
  "message": "Too many requests, please try again later",
  "code": 429
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "code": 500
}
```

## Audit Logging

All write operations (create, update, delete, assign) are automatically logged to the `auditlogs` collection.

**Audit Log Entry Example:**
```json
{
  "_id": "...",
  "orgId": "...",
  "userId": "...",
  "action": "update",
  "entityType": "lead",
  "entityId": "...",
  "before": { /* lead state before update */ },
  "after": { /* lead state after update */ },
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## Performance Testing

### Load Testing with Apache Bench

```bash
# Test login endpoint
ab -n 1000 -c 10 -p login.json -T application/json \
  http://localhost:5000/api/auth/login

# Test get leads endpoint (requires auth token)
ab -n 1000 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/leads
```

### Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Auth Endpoints**: 5 requests per 15 minutes per IP

Test rate limiting:
```bash
# Send multiple requests quickly
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
```

## Troubleshooting

### Issue: "Authentication required"
**Solution:** Ensure you're including the `Authorization: Bearer YOUR_TOKEN` header

### Issue: "Insufficient permissions"
**Solution:** Check user role and permissions. Use a user with appropriate role (Manager/Admin)

### Issue: "Lead not found"
**Solution:** 
- Verify the lead ID is correct
- If you're an Agent, ensure you own the lead
- Check if lead was soft-deleted

### Issue: "Invalid lead ID"
**Solution:** Ensure the ID is a valid MongoDB ObjectId (24 hex characters)

### Issue: "Validation failed"
**Solution:** Check the error details for specific field validation errors

### Issue: Connection refused
**Solution:** 
- Ensure MongoDB Atlas connection string is correct in `.env`
- Check if server is running (`npm run dev`)
- Verify firewall/network settings allow connection to MongoDB Atlas

## Next Steps

After testing the Lead Management API, you can proceed with:

1. **Project Management API** - Similar CRUD operations for projects
2. **Task Management API** - Task creation, assignment, status tracking
3. **User Management API** - User CRUD, role assignment
4. **Role Management API** - Custom role creation and permission management
5. **File Upload API** - Document attachments for leads/projects/tasks
6. **Audit Log API** - Query and filter audit logs
7. **Dashboard API** - Analytics and reporting endpoints

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Verify MongoDB Atlas connection
3. Ensure all environment variables are set correctly
4. Review the API documentation in this guide