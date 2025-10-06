# API Testing Quick Reference

## 🚀 Quick Start

### 1. Update MongoDB Connection
Edit `.env` file and update the MongoDB Atlas connection string:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/mini-crm?retryWrites=true&w=majority
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build the Project
```bash
npm run build
```

### 4. Seed the Database (Optional)
```bash
npm run seed
```
This creates demo users with password: `Passw0rd!`
- `superadmin@acme.test` - Super Admin
- `admin@acme.test` - Admin
- `manager@acme.test` - Manager
- `agent@acme.test` - Agent
- `auditor@acme.test` - Auditor

### 5. Start the Server
```bash
npm run dev
```
Server runs on: `http://localhost:5000`

## 📁 Testing Files

### 1. `api-tests.http`
Use with VS Code REST Client extension:
- Install "REST Client" extension
- Open `api-tests.http`
- Click "Send Request" above each request
- Update `@accessToken` variable after login

### 2. `postman_collection.json`
Import into Postman:
- Open Postman
- Click Import → Upload Files
- Select `postman_collection.json`
- Collection variables auto-update after login

### 3. `TESTING_GUIDE.md`
Comprehensive guide with:
- All API endpoints documentation
- cURL examples
- RBAC testing scenarios
- Error response formats
- Troubleshooting tips

## 🔑 Authentication Flow

### Step 1: Register or Login
```bash
# Register new organization
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "organizationName": "My Company",
    "organizationDomain": "mycompany",
    "name": "John Doe",
    "email": "john@mycompany.com",
    "password": "Passw0rd!"
  }'

# OR Login with seeded user
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@acme.test",
    "password": "Passw0rd!"
  }'
```

### Step 2: Save Access Token
Copy the `accessToken` from the response.

### Step 3: Use Token in Requests
```bash
curl -X GET http://localhost:5000/api/leads \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🎯 Quick Test Scenarios

### Test 1: Create and View Lead
```bash
# 1. Login as Manager
# 2. Create a lead
curl -X POST http://localhost:5000/api/leads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Lead",
    "company": "Test Corp",
    "status": "new",
    "source": "website"
  }'

# 3. View all leads
curl -X GET http://localhost:5000/api/leads \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 2: RBAC - Agent Ownership
```bash
# 1. Login as Agent
# 2. Create a lead (agent becomes owner)
# 3. Try to view all leads (should only see own leads)
# 4. Login as another Agent
# 5. Try to view first agent's lead (should fail with 403)
```

### Test 3: Lead Assignment
```bash
# 1. Login as Manager
# 2. Create a lead
# 3. Assign lead to an Agent
curl -X PATCH http://localhost:5000/api/leads/LEAD_ID/assign \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ownerUserId": "AGENT_USER_ID"}'

# 4. Login as that Agent
# 5. Verify agent can now see the lead
```

### Test 4: Search and Filter
```bash
# Search by text
curl -X GET "http://localhost:5000/api/leads?search=TechCorp" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by status
curl -X GET "http://localhost:5000/api/leads?status=new" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Combine filters with pagination
curl -X GET "http://localhost:5000/api/leads?status=new&source=website&page=1&pageSize=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Available Endpoints

### Authentication
- `POST /api/auth/register` - Register organization & user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Leads
- `POST /api/leads` - Create lead
- `GET /api/leads` - List leads (with filters, search, pagination)
- `GET /api/leads/:id` - Get lead by ID
- `PUT /api/leads/:id` - Update lead
- `PATCH /api/leads/:id/assign` - Assign lead to user
- `DELETE /api/leads/:id` - Soft delete lead

## 🔐 Role Permissions

### SuperAdmin
- Full access to everything

### Admin
- All permissions except organization management

### Manager
- `lead.view.all` - View all leads
- `lead.create` - Create leads
- `lead.edit.all` - Edit any lead
- `lead.delete.all` - Delete any lead
- `lead.assign` - Assign leads to users

### Agent
- `lead.view.own` - View only own leads
- `lead.create` - Create leads (becomes owner)
- `lead.edit.own` - Edit only own leads
- `lead.delete.own` - Delete only own leads

### Auditor
- `lead.view.all` - View all leads (read-only)
- `audit.view` - View audit logs

## 🐛 Troubleshooting

### "Authentication required"
- Ensure you're including the Authorization header
- Check if token has expired (15 minutes for access token)
- Use refresh token to get new access token

### "Insufficient permissions"
- Check user role and permissions
- Use appropriate role for the operation (e.g., Manager for lead assignment)

### "Lead not found"
- Verify lead ID is correct
- If Agent, ensure you own the lead
- Check if lead was soft-deleted

### "Connection refused"
- Verify MongoDB Atlas connection string in `.env`
- Check if server is running (`npm run dev`)
- Ensure MongoDB Atlas allows connections from your IP

### "Validation failed"
- Check request body matches required schema
- Verify all required fields are provided
- Check field types and formats

## 📚 Additional Resources

- **Full Testing Guide**: See `TESTING_GUIDE.md` for comprehensive documentation
- **API Tests**: Use `api-tests.http` with VS Code REST Client
- **Postman Collection**: Import `postman_collection.json` into Postman
- **Project Status**: See `PROJECT_STATUS.md` for implementation progress

## 🎉 Next Steps

After testing the Lead Management API:
1. Implement Project Management API
2. Implement Task Management API
3. Implement User Management API
4. Implement Role Management API
5. Add comprehensive test coverage
6. Start frontend development

---

**Happy Testing! 🚀**