# Full-Stack Assignment — RBAC Mini-CRM/PMS (React + Node.js)

Full‑Stack Assignment — RBAC Mini‑CRM/PMS

(React + Node.js)

Design and implement a production‑grade, role‑based Mini‑CRM/PMS with a strong backend focus.

1) Business Scenario

A B2B company tracks Leads and manages Projects/Tasks per Organization (tenant). Multiple teams

work under different roles. The app must be multi‑tenant, secure, and audited.

2) Tech Requirements

• 

Frontend: React (Vite or Next.js). TypeScript preferred.

• 

Backend: Node.js (Express/Fastify/NestJS ok). TypeScript preferred.

• 

Datastore: PostgreSQL (preferred) or MongoDB. If SQL, use migrations (Prisma/Knex/TypeORM).

If Mongo, define schemas/validation.

• 

Auth: Email + password (hashed, salted), JWT access + refresh tokens, role‑based access control

(RBAC), per‑tenant scoping.
Infra (local): Docker Compose recommended. Env via  .env .

• 

• 

Testing: API tests (Jest/Vitest or supertest).

• 

Docs: OpenAPI/Swagger or Postman collection.

3) Core Domain & Data Model

Entities - Organization: id, name, domain, status, created_at - User: id, org_id, name, email (unique per

org),   password_hash,   status,   last_login_at,   created_at   -  Role:   id,   org_id,   name   (SuperAdmin,   Admin,
  lead.create ),   label   -

Manager,   Agent,   Auditor),   description   -

 Permission:   id,   key   (e.g.,

RolePermission:   role_id,   permission_id   -  UserRole:   user_id,   role_id   (multi‑role   allowed)   -  Lead:   id,

org_id,   title,   company,   contact_name,   email,   phone,   source,   status   (new/qualified/won/lost),

owner_user_id,   created_at,   updated_at   -  Project:   id,   org_id,   name,   client   (optional),   status   (active/

on_hold/completed),   created_at,   updated_at   -  Task:   id,   project_id,   title,   description,   status   (todo/

in_progress/done), priority, assignee_user_id, due_date, created_at, updated_at -  Note: id, entity_type

(lead|project|task), entity_id, author_user_id, body, created_at - Attachment: id, entity_type, entity_id,

filename, mime_type, size_bytes, storage_url, uploaded_by - AuditLog: id, org_id, actor_user_id, action,

entity_type,   entity_id,   before_json,   after_json,   ip,   user_agent,   created_at   -  Token:   id,   user_id,   type

(refresh|password_reset|email_verify), token_hash, expires_at, created_at, revoked_at

Multi‑tenancy: Every row with tenant data must carry  org_id . Backend must enforce
tenant isolation at query level. Do not trust  org_id  from client.

4) RBAC & Permissions

Define fine‑grained permissions and map roles: -  Permissions (examples)  - Leads:   lead.create , 
lead.view ,   lead.update ,   lead.delete ,   lead.assign   - Projects/Tasks:   project.create , 
project.view ,   task.create ,   task.update ,   task.delete   -   Users/Roles:   user.invite , 
user.view ,   role.manage ,   permission.view   -   Files/Notes:   note.create ,   file.upload   -
Admin:  org.manage ,  audit.view  - Role Matrix (default) - SuperAdmin (per org): all permissions.

1

-  Admin:  all except   org.manage . -  Manager:  view/update leads & tasks for team, create projects,

assign   tasks/leads.   -  Agent:  CRUD   only   for   records   they   own/are   assigned,   view   team   projects.   -

Auditor: read‑only on org data + audit logs.

5) API Specification (Backend Contract)

Auth

• 

• 

• 

• 

• 

• 

POST /api/auth/register  — Create first org + SuperAdmin user.
POST /api/auth/login  — Issue access/refresh tokens.
POST /api/auth/refresh  — Rotate refresh token, return new access.
POST /api/auth/logout  — Revoke refresh token.
POST /api/auth/password/forgot  — Send reset link (simulate via log/email file).
POST /api/auth/password/reset  — Reset with token.

Organizations & Users

• 

• 

• 

• 

• 

• 

GET /api/org  — Get current org profile.
PATCH /api/org  — Update org (SuperAdmin/Admin).
POST /api/users/invite  — Invite user (creates pending user, sends magic link simulated).
GET /api/users  — List users (filter by role, status; pagination, search).
PATCH /api/users/:id  — Update user profile/roles (role.manage permission).
POST /api/roles  — Create role;  GET /api/roles ;  PATCH /api/roles/:id ;  GET /
api/permissions .

Leads

• 

• 

POST /api/leads  — Create lead.
GET /api/leads  — List with filters: status[], owner, source, date range, text search; sort & 

pagination.
GET /api/leads/:id  — Details (with notes, attachments summary).
PATCH /api/leads/:id  — Update (partial). Ownership rules apply.
POST /api/leads/:id/assign  — Assign owner (permission:  lead.assign ).
DELETE /api/leads/:id  — Soft delete.

• 

• 

• 

• 

Projects & Tasks

• 

• 

• 

• 

• 

• 

• 

• 

• 

POST /api/projects  — Create project.
GET /api/projects  — List; filters by status, name, updated range.
GET /api/projects/:id  — Project with task summary.
PATCH /api/projects/:id  — Update.
POST /api/tasks  — Create task.
GET /api/tasks  — List; filters by status, assignee, project_id, due range; sort & paginate.
GET /api/tasks/:id  — Task details.
PATCH /api/tasks/:id  — Update.
DELETE /api/tasks/:id  — Soft delete.

Notes & Attachments

• 

• 

POST /api/notes  — Add note to any entity.
GET /api/notes?entity_type=&entity_id=  — List notes.

2

• 

POST /api/files/upload  — Upload file (local disk ok). Return  storage_url .

Audit

• 

GET /api/audit  — View logs (Auditor+). Filters: actor, entity_type, date range.

All endpoints must check: (1) auth, (2) tenant, (3) permissions, (4) ownership rules where
applicable. Log each write to  AuditLog  with  before_json  &  after_json .

6) Backend Architecture Expectations

• 

Layered:  api -> service -> repository -> db  (or NestJS modules).

• 

Validation: Request schema validation (Zod/Yup/Joi). Reject unknown fields.

• 

Security:

• 

Hash passwords (bcrypt/argon2), enforce minimum password policy.

• 

Store refresh tokens hashed; support revocation & rotation.

• 

Rate‑limit auth endpoints; CORS configured.

• 

• 

Input sanitization & output filtering to avoid over‑posting.
Multi‑tenant Enforcement: Derive  org_id  from authenticated user; never accept from client

for writes.
Pagination: ?page=1&page_size=25 ; return  {data, page, page_size, total} .

• 

• 

• 

• 

Filtering: Allow multiple values, ranges: 
status=new,qualified&created_from=...&created_to=... .
Sorting: ?sort=created_at:desc,priority:asc .
Soft Deletes: deleted_at  columns; exclude by default.

• 

Migrations/Seeds: Create default roles/permissions and seed sample data.

7) Frontend (Brief)

• 

Public: Register, Login, Forgot/Reset Password.

• 

App Shell: Tenant‑aware topbar with org switch (if user belongs to multiple). Sidebar nav

(Dashboard, Leads, Projects, Tasks, Users, Audit).
RBAC UI: Hide/disable actions user lacks permissions for; don’t rely on UI only (backend

• 

authoritative).

• 

Pages:

• 

Leads list with filters, search, bulk status update (if permitted).

• 

Lead detail with notes & attachments panel.

• 

Projects list & detail; Task board (kanban) per project; inline task update.

• 

Users & Roles management screens.

• 

Audit Log table with filters.

8) Non‑Functional Requirements

• 

Performance: N+1 guarded; indexed columns; response times under realistic local load.

• 

Reliability: Transactional writes where needed (e.g., assignment + audit log).

• 

Observability: Request logging (correlation id), structured logs; minimal metrics (req/sec, error

rate).

• 

12‑factor: Config via env; no secrets in repo.

3

9) Deliverables

1. 

Repo with  frontend/  and  backend/  (or monorepo). Clear README.

2. 

OpenAPI/Swagger JSON or Postman collection for APIs.

3. 

ERD diagram (image/markdown) and brief architecture doc.

4. 

Seed script to create demo org, roles, users, and sample data.

5. 

Docker Compose for API + DB (and frontend if desired).

6. 

Tests: Minimum coverage for auth, RBAC guard, lead CRUD, task CRUD, and audit logging.

10) Sample Permission Matrix

Permission

SuperAdmin

Admin Manager

Agent

Auditor

lead.create

lead.view

lead.update

lead.delete

lead.assign

project.create

task.create

task.update

audit.view

role.manage

✓

✓

✓

✓

✓

✓

✓

✓

✓

✓

✓

✓

✓

✓

✓

✓

✓

✓

✓

✓

✓

✓

✓

✓

✓

✓

✓

✓

✓ (own)

✓

✓ (assigned)

✓

✓

(Implement the matrix server‑side; UI can mirror it.)

11) Example JSON Schemas (abridged)

// POST /api/leads

{

}

"title": "string (3..120)",

"company": "string",

"contact_name": "string",

"email": "email?",

"phone": "string?",

"source": "referral|website|ads|event|other",

"status": "new|qualified|won|lost"

// PATCH /api/tasks/:id

{

"title?": "string",

4

"status?": "todo|in_progress|done",

"priority?": "low|medium|high|urgent",

"assignee_user_id?": "uuid"

}

12) Auditing Examples

• 

• 

• 

• 

• 

On  PATCH /api/leads/:id , record:
action :  lead.update
before_json : prior lead row
after_json : updated row
actor_user_id ,  ip ,  user_agent

13) Ownership & Scoping Rules

• 

• 

• 

Agent may update only leads where  owner_user_id = current_user.id .
Manager/Admin/SuperAdmin may reassign ownership within same  org_id .
All list queries automatically filter  org_id = current_user.org_id .

14) Quality Checklist (Review Rubric)

• 

Correct tenant isolation and RBAC checks in services/guards.

• 

Defensive input validation; clear error codes/messages.

• 

• 

Secure token handling: rotation, revocation, blacklist on logout.
Indexes on  org_id ,  owner_user_id ,  status ,  created_at .

• 

Tests cover happy paths + failure paths (e.g., forbidden, tenant leakage).

• 

Seeded demo users per role; sample data visible on first run.

• 

Clean commit history and documentation.

15) Stretch Goals (Optional, bonus points)

• 

Real‑time task updates via WebSocket (e.g., Socket.IO) for board view.

• 

Background jobs (BullMQ/queue) for sending emails, cleanup of expired tokens.

• 

Advanced search with text index on leads (title/company/contact).

• 

CSV import/export for leads with server‑side validation.

• 

Org‑level settings: custom lead statuses, required fields.

• 

File storage using S3‑compatible API (local MinIO ok) with signed URLs.

16) Getting Started (Suggested Scripts)

• 

• 

• 

• 

docker compose up -d  (db + api + frontend)
npm run db:migrate && npm run db:seed

npm run dev  (both services)
npm test

17) Demo Seed (Example)

• 

Org: Acme Corp

• 

Users:

5

• 

• 

• 

• 

• 

superadmin@acme.test /  Passw0rd!  (SuperAdmin)
admin@acme.test /  Passw0rd!  (Admin)
manager@acme.test /  Passw0rd!  (Manager)
agent@acme.test /  Passw0rd!  (Agent)
auditor@acme.test /  Passw0rd!  (Auditor)

• 

50 leads, 5 projects, 40 tasks distributed by role.

Submission:   Share   repo   link   +   README   with   setup   steps,   .env   sample,   ERD,   API   docs   link,   and

screenshots/GIFs of key flows (login, list filters, role guard in action, audit log).

6

