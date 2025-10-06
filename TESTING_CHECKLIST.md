# Testing Checklist - Lead Management API

## ✅ Pre-Testing Setup

- [ ] Updated `.env` with MongoDB Atlas connection string
- [ ] Ran `npm install` in backend directory
- [ ] Ran `npm run build` successfully (no errors)
- [ ] Decided: Seed database or register fresh? (Choose one below)

### Option A: Use Seeded Data
- [ ] Ran `npm run seed` successfully
- [ ] Have demo user credentials ready:
  - SuperAdmin: `superadmin@acme.test` / `Passw0rd!`
  - Admin: `admin@acme.test` / `Passw0rd!`
  - Manager: `manager@acme.test` / `Passw0rd!`
  - Agent: `agent@acme.test` / `Passw0rd!`
  - Auditor: `auditor@acme.test` / `Passw0rd!`

### Option B: Fresh Registration
- [ ] Prepared organization details for registration
- [ ] Ready to register first user (becomes SuperAdmin)

## 🚀 Server Startup

- [ ] Ran `npm run dev` in backend directory
- [ ] Server started successfully on `http://localhost:5000`
- [ ] No error messages in console
- [ ] MongoDB connection successful

## 🔐 Authentication Tests

### Test 1: Login
- [ ] Opened `backend/api-tests.http` in VS Code
- [ ] Sent login request (or register if fresh)
- [ ] Received 200 OK response
- [ ] Got `accessToken` and `refreshToken` in response
- [ ] Copied `accessToken` value
- [ ] Updated `@accessToken` variable in `api-tests.http`

### Test 2: Get Current User
- [ ] Sent "Get Current User" request
- [ ] Received 200 OK response
- [ ] User details match logged-in user
- [ ] Roles and permissions included

### Test 3: Token Refresh (Optional)
- [ ] Sent refresh token request
- [ ] Received new access and refresh tokens
- [ ] Updated `@accessToken` with new token

## 📋 Lead Management Tests

### Test 4: Create Lead
- [ ] Sent "Create Lead" request
- [ ] Received 201 Created response
- [ ] Lead data returned with `_id`
- [ ] Saved lead ID for later tests
- [ ] `ownerUserId` is set (to creator or specified user)

### Test 5: Get All Leads
- [ ] Sent "Get All Leads" request
- [ ] Received 200 OK response
- [ ] Array of leads returned
- [ ] Pagination metadata included (page, pageSize, total, etc.)
- [ ] Created lead appears in list

### Test 6: Get Lead by ID
- [ ] Updated request with actual lead ID
- [ ] Sent "Get Lead by ID" request
- [ ] Received 200 OK response
- [ ] Correct lead details returned
- [ ] Owner information populated

### Test 7: Update Lead
- [ ] Updated request with lead ID and new data
- [ ] Sent "Update Lead" request
- [ ] Received 200 OK response
- [ ] Lead updated successfully
- [ ] Only specified fields changed

### Test 8: Search Leads
- [ ] Sent search request with search term
- [ ] Received 200 OK response
- [ ] Results match search term
- [ ] Search works across title, company, contactName

### Test 9: Filter Leads
- [ ] Sent filter request (by status)
- [ ] Received 200 OK response
- [ ] All results match filter criteria
- [ ] Tried filtering by source
- [ ] Tried filtering by owner

### Test 10: Sort Leads
- [ ] Sent request with sortBy and sortOrder
- [ ] Received 200 OK response
- [ ] Results sorted correctly
- [ ] Tried different sort fields (createdAt, value, etc.)

### Test 11: Pagination
- [ ] Sent request with page=1, pageSize=5
- [ ] Received correct number of results
- [ ] Meta shows correct pagination info
- [ ] Tried page=2 to see next results
- [ ] `hasNextPage` and `hasPrevPage` correct

## 🔒 RBAC Tests

### Test 12: Agent - Own Leads Only
- [ ] Logged in as Agent (or created agent user)
- [ ] Created a lead (agent becomes owner)
- [ ] Sent "Get All Leads" request
- [ ] Only sees own leads (not other agents' leads)
- [ ] Can view own lead by ID
- [ ] Can update own lead
- [ ] Can delete own lead

### Test 13: Agent - Cannot Access Others' Leads
- [ ] Logged in as Agent 1
- [ ] Created a lead (saved ID)
- [ ] Logged in as Agent 2
- [ ] Tried to get Agent 1's lead by ID
- [ ] Received 403 Forbidden or 404 Not Found
- [ ] Tried to update Agent 1's lead
- [ ] Received 403 Forbidden
- [ ] Tried to delete Agent 1's lead
- [ ] Received 403 Forbidden

### Test 14: Manager - Full Access
- [ ] Logged in as Manager
- [ ] Sent "Get All Leads" request
- [ ] Sees all leads (from all users)
- [ ] Can view any lead by ID
- [ ] Can update any lead
- [ ] Can delete any lead
- [ ] Can assign leads to users

### Test 15: Auditor - Read Only
- [ ] Logged in as Auditor
- [ ] Can view all leads
- [ ] Can view lead by ID
- [ ] Tried to create lead
- [ ] Received 403 Forbidden
- [ ] Tried to update lead
- [ ] Received 403 Forbidden
- [ ] Tried to delete lead
- [ ] Received 403 Forbidden

### Test 16: Lead Assignment
- [ ] Logged in as Manager
- [ ] Created a lead
- [ ] Got user ID of an Agent
- [ ] Sent "Assign Lead" request
- [ ] Received 200 OK response
- [ ] Lead `ownerUserId` updated
- [ ] Logged in as that Agent
- [ ] Agent can now see the assigned lead

### Test 17: Agent Cannot Assign
- [ ] Logged in as Agent
- [ ] Tried to assign own lead to another user
- [ ] Received 403 Forbidden
- [ ] Lead ownership unchanged

## 🐛 Error Handling Tests

### Test 18: Invalid Data
- [ ] Sent create lead with empty title
- [ ] Received 400 Bad Request
- [ ] Error message explains validation failure
- [ ] Sent create lead with invalid email
- [ ] Received 400 Bad Request

### Test 19: Missing Authentication
- [ ] Removed Authorization header
- [ ] Sent "Get All Leads" request
- [ ] Received 401 Unauthorized
- [ ] Error message: "Authentication required"

### Test 20: Invalid Token
- [ ] Set Authorization header to "Bearer invalid-token"
- [ ] Sent "Get All Leads" request
- [ ] Received 401 Unauthorized
- [ ] Error message about invalid token

### Test 21: Not Found
- [ ] Sent get lead request with non-existent ID
- [ ] Used valid ObjectId format: `000000000000000000000000`
- [ ] Received 404 Not Found
- [ ] Error message: "Lead not found"

### Test 22: Invalid ID Format
- [ ] Sent get lead request with invalid ID: `invalid-id`
- [ ] Received 400 Bad Request
- [ ] Error message: "Invalid lead ID"

### Test 23: Soft Delete
- [ ] Created a lead
- [ ] Deleted the lead
- [ ] Received 200 OK response
- [ ] Tried to get deleted lead by ID
- [ ] Received 404 Not Found
- [ ] Deleted lead doesn't appear in list

## 📊 Audit Logging Tests

### Test 24: Check Audit Logs in Database
- [ ] Connected to MongoDB Atlas (Compass or CLI)
- [ ] Opened `auditlogs` collection
- [ ] Found audit log for lead creation
  - [ ] Has `userId`
  - [ ] Has `action: "create"`
  - [ ] Has `entityType: "lead"`
  - [ ] Has `entityId` (lead ID)
  - [ ] Has `after` (lead data)
  - [ ] Has `orgId`
- [ ] Found audit log for lead update
  - [ ] Has `before` (old data)
  - [ ] Has `after` (new data)
- [ ] Found audit log for lead deletion
  - [ ] Has `before` (lead data before delete)
- [ ] Found audit log for lead assignment
  - [ ] Has `metadata` with assignment info

## 🎯 Advanced Tests

### Test 25: Pagination Edge Cases
- [ ] Requested page beyond total pages
- [ ] Received empty array
- [ ] Meta shows correct info
- [ ] Requested pageSize > 100
- [ ] Limited to 100 results

### Test 26: Combined Filters
- [ ] Sent request with multiple filters
- [ ] Example: `?status=new&source=website&search=Tech`
- [ ] Results match all criteria
- [ ] Pagination works with filters

### Test 27: Performance Test (Optional)
- [ ] Created 50+ leads (use loop or script)
- [ ] Tested list endpoint performance
- [ ] Tested search performance
- [ ] Tested pagination with large dataset

### Test 28: Concurrent Requests (Optional)
- [ ] Sent multiple requests simultaneously
- [ ] All requests completed successfully
- [ ] No race conditions
- [ ] Data consistency maintained

## 📱 Postman Tests (Optional)

If using Postman instead of REST Client:
- [ ] Imported `postman_collection.json`
- [ ] Collection variables set up
- [ ] Ran authentication requests
- [ ] Tokens auto-updated in variables
- [ ] Ran all lead management requests
- [ ] All tests passed

## 🎉 Final Verification

### Code Quality
- [ ] No errors in server console
- [ ] No warnings in server console
- [ ] TypeScript compilation clean
- [ ] All endpoints responding correctly

### Functionality
- [ ] All CRUD operations work
- [ ] RBAC permissions enforced correctly
- [ ] Ownership validation working
- [ ] Search and filters functional
- [ ] Pagination working correctly
- [ ] Audit logs created properly

### Security
- [ ] Authentication required on all endpoints
- [ ] Authorization enforced (RBAC)
- [ ] Tenant isolation working (no cross-org access)
- [ ] Input validation preventing bad data
- [ ] Error messages don't leak sensitive info

### Documentation
- [ ] API responses match documentation
- [ ] Error codes match documentation
- [ ] All endpoints documented
- [ ] Examples work as described

## 📝 Issues Found

Document any issues encountered:

### Issue 1:
- **Description:** 
- **Steps to Reproduce:** 
- **Expected:** 
- **Actual:** 
- **Severity:** (Critical/High/Medium/Low)

### Issue 2:
- **Description:** 
- **Steps to Reproduce:** 
- **Expected:** 
- **Actual:** 
- **Severity:** 

## ✅ Testing Complete!

- [ ] All critical tests passed
- [ ] All RBAC scenarios verified
- [ ] Audit logging confirmed
- [ ] Ready to proceed with next API implementation

---

**Testing Date:** _______________  
**Tested By:** _______________  
**MongoDB Atlas Cluster:** _______________  
**Overall Status:** ⬜ Pass / ⬜ Fail / ⬜ Pass with Issues

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________

---

## 🚀 Next Steps After Testing

Once all tests pass:
1. [ ] Document any issues found
2. [ ] Fix critical issues
3. [ ] Commit changes to git
4. [ ] Start implementing Project Management API
5. [ ] Follow same pattern as Lead API

**Happy Testing! 🎉**