# Architecture Documentation - Mini-CRM/PMS

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│                         [Coming Soon]                            │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST API
                             │ JWT Authentication
┌────────────────────────────┴────────────────────────────────────┐
│                      Backend API (Node.js)                       │
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │   Routes    │→ │ Controllers  │→ │     Services        │   │
│  │  (Express)  │  │  (Handlers)  │  │ (Business Logic)    │   │
│  └─────────────┘  └──────────────┘  └──────────┬──────────┘   │
│                                                  │               │
│  ┌──────────────────────────────────────────────┴──────────┐   │
│  │                    Middleware Layer                      │   │
│  │  • Authentication  • RBAC  • Validation  • Error        │   │
│  └──────────────────────────────────────────────┬──────────┘   │
│                                                  │               │
│  ┌──────────────────────────────────────────────┴──────────┐   │
│  │                  Data Access Layer                       │   │
│  │              (Mongoose Models & Schemas)                 │   │
│  └──────────────────────────────────────────────┬──────────┘   │
└─────────────────────────────────────────────────┼──────────────┘
                                                   │
                             ┌─────────────────────┴─────────────────────┐
                             │         MongoDB Database                  │
                             │  • Organizations  • Users  • Roles        │
                             │  • Leads  • Projects  • Tasks             │
                             │  • Notes  • Attachments  • AuditLogs      │
                             └───────────────────────────────────────────┘
```

## Backend Architecture

### Layered Architecture Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Routes     │  │ Controllers  │  │  Validators  │         │
│  │ (Endpoints)  │  │  (Handlers)  │  │    (Zod)     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                             │
┌─────────────────────────────────────────────────────────────────┐
│                        Middleware Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │     Auth     │  │     RBAC     │  │  Validation  │         │
│  │  (JWT Check) │  │ (Permissions)│  │   (Schema)   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Rate Limit   │  │ Error Handler│  │ Correlation  │         │
│  │   (Protect)  │  │  (Catch All) │  │     (ID)     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                             │
┌─────────────────────────────────────────────────────────────────┐
│                       Business Logic Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ AuthService  │  │ LeadService  │  │ProjectService│         │
│  │              │  │              │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ UserService  │  │ TaskService  │  │ AuditService │         │
│  │              │  │              │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                             │
┌─────────────────────────────────────────────────────────────────┐
│                      Data Access Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │Organization  │  │     User     │  │     Role     │         │
│  │    Model     │  │    Model     │  │    Model     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │     Lead     │  │   Project    │  │     Task     │         │
│  │    Model     │  │    Model     │  │    Model     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow

### Authentication Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │ 1. POST /api/auth/login
     │    { email, password }
     ▼
┌─────────────────┐
│  Auth Routes    │
└────┬────────────┘
     │ 2. Validate request
     ▼
┌─────────────────┐
│ Auth Controller │
└────┬────────────┘
     │ 3. Process login
     ▼
┌─────────────────┐
│  Auth Service   │
└────┬────────────┘
     │ 4. Find user
     │ 5. Verify password
     │ 6. Generate tokens
     ▼
┌─────────────────┐
│   User Model    │
│   Token Model   │
└────┬────────────┘
     │ 7. Return tokens
     ▼
┌──────────┐
│  Client  │ ← { accessToken, refreshToken }
└──────────┘
```

### Protected Request Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │ 1. GET /api/leads
     │    Authorization: Bearer <token>
     ▼
┌─────────────────────┐
│  Auth Middleware    │ ← Verify JWT
└────┬────────────────┘
     │ 2. Token valid?
     ▼
┌─────────────────────┐
│  RBAC Middleware    │ ← Check permissions
└────┬────────────────┘
     │ 3. Has permission?
     ▼
┌─────────────────────┐
│  Lead Controller    │
└────┬────────────────┘
     │ 4. Process request
     ▼
┌─────────────────────┐
│   Lead Service      │ ← Business logic
└────┬────────────────┘
     │ 5. Query with org_id
     ▼
┌─────────────────────┐
│    Lead Model       │ ← Database query
└────┬────────────────┘
     │ 6. Return data
     ▼
┌──────────┐
│  Client  │ ← { success: true, data: [...] }
└──────────┘
```

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐
│  Organization   │
│─────────────────│
│ _id             │◄─────────┐
│ name            │          │
│ domain (unique) │          │
│ status          │          │
└─────────────────┘          │
                             │ orgId
                   ┌─────────┴─────────┐
                   │                   │
         ┌─────────┴────────┐  ┌───────┴────────┐
         │      User        │  │      Role      │
         │──────────────────│  │────────────────│
         │ _id              │  │ _id            │
         │ orgId            │  │ orgId          │
         │ name             │  │ name           │
         │ email            │  │ description    │
         │ passwordHash     │  │ permissions[]  │
         │ status           │  │ isSystem       │
         │ roleIds[]        │◄─┤                │
         │ lastLoginAt      │  └────────────────┘
         └──────┬───────────┘
                │
                │ ownerUserId / assigneeUserId
                │
    ┌───────────┼───────────┬───────────┐
    │           │           │           │
┌───┴────┐  ┌───┴────┐  ┌───┴────┐  ┌──┴──────┐
│  Lead  │  │Project │  │  Task  │  │AuditLog │
│────────│  │────────│  │────────│  │─────────│
│ _id    │  │ _id    │  │ _id    │  │ _id     │
│ orgId  │  │ orgId  │  │ orgId  │  │ orgId   │
│ title  │  │ name   │  │ title  │  │ action  │
│ company│  │ client │  │ status │  │ entity  │
│ status │  │ status │  │priority│  │ before  │
│ owner  │  └────┬───┘  │ project│  │ after   │
└────────┘       │      │ assignee│ └─────────┘
                 │      └────────┘
                 │ projectId
                 └──────────┘

┌──────────────┐         ┌──────────────┐
│     Note     │         │  Attachment  │
│──────────────│         │──────────────│
│ _id          │         │ _id          │
│ orgId        │         │ orgId        │
│ entityType   │         │ entityType   │
│ entityId     │         │ entityId     │
│ authorUserId │         │ filename     │
│ body         │         │ storageUrl   │
└──────────────┘         └──────────────┘
```

### Key Relationships

1. **Organization → Users** (1:N)
   - One organization has many users
   - Users belong to one organization

2. **Organization → Roles** (1:N)
   - One organization has many roles
   - Roles belong to one organization

3. **User → Roles** (N:N)
   - Users can have multiple roles
   - Roles can be assigned to multiple users

4. **Organization → Leads/Projects/Tasks** (1:N)
   - All entities belong to one organization
   - Multi-tenant isolation

5. **User → Leads** (1:N as owner)
   - User can own multiple leads
   - Lead has one owner

6. **Project → Tasks** (1:N)
   - Project has many tasks
   - Task belongs to one project

7. **User → Tasks** (1:N as assignee)
   - User can be assigned multiple tasks
   - Task has one assignee

## Security Architecture

### Authentication & Authorization Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Security Layers                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Layer 1: Network Security                                       │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ • CORS (Cross-Origin Resource Sharing)                 │    │
│  │ • Helmet (Security Headers)                            │    │
│  │ • Rate Limiting (DDoS Protection)                      │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
│  Layer 2: Authentication                                         │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ • JWT Token Verification                               │    │
│  │ • Token Expiry Check                                   │    │
│  │ • User Status Validation                               │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
│  Layer 3: Authorization (RBAC)                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ • Role-Based Permissions                               │    │
│  │ • Fine-Grained Access Control                          │    │
│  │ • Resource Ownership Validation                        │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
│  Layer 4: Multi-Tenant Isolation                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ • Organization ID Scoping                              │    │
│  │ • Automatic Query Filtering                            │    │
│  │ • Tenant Data Isolation                                │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
│  Layer 5: Input Validation                                       │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ • Schema Validation (Zod)                              │    │
│  │ • Sanitization                                         │    │
│  │ • Type Safety (TypeScript)                             │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
│  Layer 6: Data Security                                          │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ • Password Hashing (bcrypt)                            │    │
│  │ • Token Hashing (SHA-256)                              │    │
│  │ • Sensitive Data Exclusion                             │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### RBAC Permission System

```
┌─────────────────────────────────────────────────────────────────┐
│                    Permission Hierarchy                          │
└─────────────────────────────────────────────────────────────────┘

SuperAdmin (All Permissions)
    │
    ├─ org.manage ────────────────────────────┐
    ├─ org.view                               │
    ├─ user.invite                            │
    ├─ user.view                              │
    ├─ user.update                            │
    ├─ user.delete                            │
    ├─ role.manage                            │
    ├─ permission.view                        │
    ├─ lead.create                            │
    ├─ lead.view                              │
    ├─ lead.update                            │
    ├─ lead.delete                            │
    ├─ lead.assign                            │
    ├─ project.create                         │
    ├─ project.view                           │
    ├─ project.update                         │
    ├─ project.delete                         │
    ├─ task.create                            │
    ├─ task.view                              │
    ├─ task.update                            │
    ├─ task.delete                            │
    ├─ note.create                            │
    ├─ note.view                              │
    ├─ file.upload                            │
    ├─ file.view                              │
    └─ audit.view                             │
                                              │
Admin (All except org.manage) ◄───────────────┘
    │
    └─ (Same as SuperAdmin minus org.manage)
                                              │
Manager (Team Management) ◄───────────────────┘
    │
    ├─ lead.create
    ├─ lead.view
    ├─ lead.update
    ├─ lead.assign
    ├─ project.create
    ├─ project.view
    ├─ project.update
    ├─ task.create
    ├─ task.view
    ├─ task.update
    └─ ...
                                              │
Agent (Own Records Only) ◄────────────────────┘
    │
    ├─ lead.create
    ├─ lead.view (own)
    ├─ lead.update (own)
    ├─ task.view (assigned)
    ├─ task.update (assigned)
    └─ ...
                                              │
Auditor (Read-Only + Audit) ◄─────────────────┘
    │
    ├─ lead.view
    ├─ project.view
    ├─ task.view
    ├─ user.view
    └─ audit.view
```

## Multi-Tenant Architecture

### Tenant Isolation Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    Request Processing                            │
└─────────────────────────────────────────────────────────────────┘

1. User Authentication
   ┌──────────────────────────────────────────┐
   │ JWT Token → Extract userId & orgId       │
   └──────────────────────────────────────────┘
                    │
                    ▼
2. Load User Context
   ┌──────────────────────────────────────────┐
   │ Fetch User with orgId from database      │
   │ Attach to req.user                       │
   └──────────────────────────────────────────┘
                    │
                    ▼
3. Automatic Tenant Scoping
   ┌──────────────────────────────────────────┐
   │ All queries automatically include:       │
   │ { orgId: req.user.orgId }               │
   └──────────────────────────────────────────┘
                    │
                    ▼
4. Data Access
   ┌──────────────────────────────────────────┐
   │ User can ONLY access data from their org │
   │ Cross-tenant access is impossible        │
   └──────────────────────────────────────────┘

Example Query:
─────────────
// Without tenant scoping (WRONG)
Lead.find({ status: 'new' })

// With tenant scoping (CORRECT)
Lead.find({ 
  orgId: req.user.orgId,
  status: 'new' 
})
```

## Audit Logging System

### Audit Trail Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Audit Log Capture                             │
└─────────────────────────────────────────────────────────────────┘

Write Operation (Create/Update/Delete)
    │
    ├─ Capture Before State
    │  └─ Fetch current record from DB
    │
    ├─ Perform Operation
    │  └─ Execute create/update/delete
    │
    ├─ Capture After State
    │  └─ Get new record state
    │
    └─ Create Audit Log
       ├─ orgId: Current organization
       ├─ actorUserId: Who performed action
       ├─ action: create/update/delete/assign
       ├─ entityType: lead/project/task/user
       ├─ entityId: ID of affected record
       ├─ beforeJson: Previous state
       ├─ afterJson: New state
       ├─ ip: Request IP address
       ├─ userAgent: Browser/client info
       └─ timestamp: When it happened

Example Audit Log:
─────────────────
{
  "orgId": "org_123",
  "actorUserId": "user_456",
  "action": "update",
  "entityType": "lead",
  "entityId": "lead_789",
  "beforeJson": {
    "status": "new",
    "ownerUserId": "user_111"
  },
  "afterJson": {
    "status": "qualified",
    "ownerUserId": "user_456"
  },
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

## Deployment Architecture

### Production Deployment (Recommended)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Load Balancer                            │
│                         (Nginx/HAProxy)                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐     ┌────▼────┐     ┌───▼─────┐
    │ Node.js │     │ Node.js │     │ Node.js │
    │Instance │     │Instance │     │Instance │
    │   #1    │     │   #2    │     │   #3    │
    └────┬────┘     └────┬────┘     └────┬────┘
         │               │               │
         └───────────────┼───────────────┘
                         │
                    ┌────▼────┐
                    │ MongoDB │
                    │ Replica │
                    │   Set   │
                    └─────────┘
```

### Docker Compose (Development)

```
┌─────────────────────────────────────────────────────────────────┐
│                      Docker Compose                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────┐         ┌────────────────────┐         │
│  │   Backend Service  │         │  MongoDB Service   │         │
│  │                    │         │                    │         │
│  │  Port: 5000        │◄────────┤  Port: 27017       │         │
│  │  Volume: ./backend │         │  Volume: mongo_data│         │
│  └────────────────────┘         └────────────────────┘         │
│                                                                   │
│  Network: mini-crm-network                                       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Performance Considerations

### Database Indexes

```
Organization:
  - domain (unique)
  - status

User:
  - { orgId, email } (unique compound)
  - orgId
  - status
  - roleIds

Role:
  - { orgId, name } (unique compound)
  - orgId

Lead:
  - orgId
  - { orgId, status }
  - { orgId, ownerUserId }
  - { orgId, source }
  - deletedAt
  - createdAt (desc)
  - Text index: { title, company, contactName }

Project:
  - orgId
  - { orgId, status }
  - deletedAt
  - updatedAt (desc)
  - Text index: { name, client }

Task:
  - orgId
  - projectId
  - { orgId, status }
  - { orgId, assigneeUserId }
  - { orgId, priority }
  - deletedAt
  - dueDate
  - Text index: { title, description }

AuditLog:
  - orgId
  - actorUserId
  - action
  - { entityType, entityId }
  - createdAt (desc)
```

### Caching Strategy (Future)

```
┌─────────────────────────────────────────────────────────────────┐
│                      Caching Layers                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  L1: Application Cache (In-Memory)                               │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ • User permissions (5 min TTL)                         │    │
│  │ • Role definitions (10 min TTL)                        │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
│  L2: Redis Cache (Distributed)                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ • Session data                                         │    │
│  │ • Frequently accessed data                             │    │
│  │ • Rate limiting counters                               │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Decisions

### Why These Technologies?

1. **Node.js + Express**
   - Fast, scalable, non-blocking I/O
   - Large ecosystem
   - JavaScript/TypeScript across stack

2. **TypeScript**
   - Type safety
   - Better IDE support
   - Fewer runtime errors

3. **MongoDB + Mongoose**
   - Flexible schema for multi-tenant
   - Good performance for document-based data
   - Easy to scale horizontally

4. **JWT Authentication**
   - Stateless authentication
   - Scalable across multiple servers
   - Industry standard

5. **Zod Validation**
   - Type-safe validation
   - Great TypeScript integration
   - Runtime type checking

---

**Last Updated**: January 2024  
**Version**: 1.0  
**Status**: Backend Core Architecture Implemented