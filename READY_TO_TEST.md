# 🎉 Lead Management API - Ready to Test!

## ✅ What's Complete

Your Mini-CRM backend now has a **fully functional Lead Management API** with:

- ✅ **6 API Endpoints** - Create, Read, Update, Delete, List, Assign
- ✅ **Granular RBAC** - Different permissions for different roles
- ✅ **Ownership Control** - Agents only see their own leads
- ✅ **Audit Logging** - All changes tracked automatically
- ✅ **Search & Filter** - Find leads quickly
- ✅ **Pagination** - Handle large datasets
- ✅ **TypeScript** - Fully compiled, no errors
- ✅ **Documentation** - Complete testing guides
- ✅ **Test Files** - Ready-to-use HTTP and Postman files

## 🚀 Quick Start (3 Steps)

### Step 1: Update MongoDB Connection (2 minutes)

Edit `backend/.env` file, line 7:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/mini-crm?retryWrites=true&w=majority
```

Replace with your MongoDB Atlas connection string.

### Step 2: Build & Seed (2 minutes)

```bash
cd backend
npm install
npm run build
npm run seed
```

This creates demo users:
- `manager@acme.test` / `Passw0rd!` (recommended for testing)
- `agent@acme.test` / `Passw0rd!`
- `admin@acme.test` / `Passw0rd!`

### Step 3: Start Server (1 minute)

```bash
npm run dev
```

Server starts at: `http://localhost:5000`

## 🧪 Test in 5 Minutes

### Using VS Code REST Client (Recommended)

1. **Install Extension**
   - Open VS Code Extensions (Ctrl+Shift+X)
   - Search "REST Client"
   - Install by Huachao Mao

2. **Open Test File**
   - Open `backend/api-tests.http`

3. **Login**
   - Find "### 2. Login" section
   - Click "Send Request" above it
   - Copy the `accessToken` from response

4. **Update Token**
   - Find `@accessToken = ` at top of file
   - Paste your token: `@accessToken = eyJhbGc...`

5. **Test Endpoints**
   - Scroll to "### 1. Create Lead"
   - Click "Send Request"
   - Try other endpoints!

### Using Postman

1. Import `backend/postman_collection.json`
2. Run "Login" request
3. Token auto-updates in collection variables
4. Test other endpoints!

### Using cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@acme.test","password":"Passw0rd!"}'

# Copy the accessToken, then:

# Create Lead
curl -X POST http://localhost:5000/api/leads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Lead",
    "company": "Test Corp",
    "status": "new",
    "source": "website"
  }'

# Get All Leads
curl -X GET http://localhost:5000/api/leads \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📚 Documentation Files

All documentation is in the `backend/` directory:

| File | Purpose |
|------|---------|
| `README_TESTING.md` | Quick testing reference |
| `TESTING_GUIDE.md` | Comprehensive guide with all endpoints |
| `api-tests.http` | VS Code REST Client test file |
| `postman_collection.json` | Postman collection |
| `TESTING_CHECKLIST.md` | Step-by-step testing checklist |

Root directory:
| File | Purpose |
|------|---------|
| `IMPLEMENTATION_SUMMARY.md` | What was built and how |
| `PROJECT_STATUS.md` | Overall project progress |
| `READY_TO_TEST.md` | This file |

## 🎯 What to Test

### Basic Flow (5 minutes)
1. ✅ Login as Manager
2. ✅ Create a lead
3. ✅ View all leads
4. ✅ Update the lead
5. ✅ Delete the lead

### RBAC Testing (10 minutes)
1. ✅ Login as Agent → Create lead → See only own leads
2. ✅ Login as another Agent → Cannot see first agent's lead
3. ✅ Login as Manager → See all leads
4. ✅ Manager assigns lead to Agent
5. ✅ Agent can now see assigned lead

### Advanced Features (10 minutes)
1. ✅ Search leads by company name
2. ✅ Filter by status (new, contacted, etc.)
3. ✅ Test pagination (page 1, page 2)
4. ✅ Sort by different fields
5. ✅ Combine filters + search + pagination

## 🔍 What to Check

### In API Responses
- ✅ Status codes (200, 201, 400, 401, 403, 404)
- ✅ Response format (success, data, message, meta)
- ✅ Pagination metadata (page, total, hasNextPage)
- ✅ Error messages are clear

### In MongoDB Atlas
- ✅ Leads collection has your test data
- ✅ AuditLogs collection has change history
- ✅ Each audit log has before/after states
- ✅ All data scoped by orgId (tenant isolation)

### In Server Console
- ✅ No error messages
- ✅ HTTP request logs show correct status codes
- ✅ MongoDB connection successful

## 🐛 Common Issues & Solutions

### "Connection refused"
**Solution:** Check MongoDB Atlas connection string in `.env`

### "Authentication required"
**Solution:** Include `Authorization: Bearer YOUR_TOKEN` header

### "Insufficient permissions"
**Solution:** Use Manager or Admin role for full access

### "Lead not found" (as Agent)
**Solution:** Agents only see own leads. Create a lead first or login as Manager.

### "Invalid lead ID"
**Solution:** Use actual lead ID from create response (24 hex characters)

## 📊 API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register organization
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Leads
- `POST /api/leads` - Create lead
- `GET /api/leads` - List leads (with filters, search, pagination)
- `GET /api/leads/:id` - Get lead by ID
- `PUT /api/leads/:id` - Update lead
- `PATCH /api/leads/:id/assign` - Assign lead
- `DELETE /api/leads/:id` - Delete lead

## 🎭 Demo Users (After Seeding)

| Email | Password | Role | Can Do |
|-------|----------|------|--------|
| `superadmin@acme.test` | `Passw0rd!` | SuperAdmin | Everything |
| `admin@acme.test` | `Passw0rd!` | Admin | Almost everything |
| `manager@acme.test` | `Passw0rd!` | Manager | Manage leads, assign |
| `agent@acme.test` | `Passw0rd!` | Agent | Own leads only |
| `auditor@acme.test` | `Passw0rd!` | Auditor | View only |

**Recommended for testing:** Start with `manager@acme.test`

## 🎉 Success Criteria

Your testing is successful if:

- ✅ You can login and get an access token
- ✅ You can create a lead
- ✅ You can view the lead you created
- ✅ You can update the lead
- ✅ You can search/filter leads
- ✅ Agent role only sees own leads
- ✅ Manager role sees all leads
- ✅ Audit logs appear in MongoDB

## 📞 Need Help?

### Check These First
1. `backend/TESTING_GUIDE.md` - Comprehensive guide
2. `backend/README_TESTING.md` - Quick reference
3. `TESTING_CHECKLIST.md` - Step-by-step checklist
4. Server console logs - Error messages
5. MongoDB Atlas - Data verification

### Common Questions

**Q: Which user should I test with?**  
A: Start with `manager@acme.test` - has full lead access.

**Q: Where do I find the access token?**  
A: In the login response, under `data.tokens.accessToken`.

**Q: How long is the token valid?**  
A: 15 minutes. Use refresh token to get a new one.

**Q: Can I use my own organization?**  
A: Yes! Use the register endpoint instead of seeded users.

**Q: Where are audit logs stored?**  
A: MongoDB Atlas, in the `auditlogs` collection.

## 🚀 After Testing

Once testing is complete:

### If Everything Works ✅
1. Celebrate! 🎉
2. Review `IMPLEMENTATION_SUMMARY.md`
3. Check `PROJECT_STATUS.md` for next steps
4. Ready to implement Project Management API

### If Issues Found 🐛
1. Document issues in `TESTING_CHECKLIST.md`
2. Check server console for errors
3. Verify MongoDB connection
4. Review error responses
5. Check if it's a configuration issue

## 📈 What's Next?

After successful testing, we'll implement:

1. **Project Management API** (similar to leads)
   - Create, read, update, delete projects
   - Link projects to leads
   - Assign team members

2. **Task Management API**
   - Create tasks within projects
   - Assign to users
   - Track status and priority

3. **User Management API**
   - Invite users
   - Manage roles
   - User CRUD operations

4. **Frontend Development**
   - React + Vite setup
   - Authentication UI
   - Lead management interface
   - Dashboard

## 🎊 You're All Set!

Everything is ready for testing. Just:

1. ✅ Update MongoDB connection string
2. ✅ Run `npm run build && npm run seed`
3. ✅ Run `npm run dev`
4. ✅ Open `api-tests.http` and start testing!

---

**Good luck with testing! 🚀**

If you encounter any issues, refer to the comprehensive guides in the `backend/` directory.

**Current Status:** ✅ Ready to Test  
**Build Status:** ✅ Successful  
**Documentation:** ✅ Complete  
**Next Step:** 🧪 Testing