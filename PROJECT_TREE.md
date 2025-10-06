# Project File Structure

Complete file tree of the Mini-CRM/PMS project.

## 📁 Root Directory

```
mini-crm/
│
├── 📄 README.md                              ← Start here! Project overview
├── 📄 GET_STARTED.md                         ← Quick start guide (3 steps)
├── 📄 QUICKSTART.md                          ← 5-minute setup
├── 📄 SETUP.md                               ← Detailed installation guide
├── 📄 ARCHITECTURE.md                        ← System architecture & diagrams
├── 📄 PROJECT_STATUS.md                      ← What's done, what's next
├── 📄 PROJECT_TREE.md                        ← This file
│
├── 📄 Full-stack-Assignment-RBAC-Mini-CRM-PMS.md  ← Original requirements
├── 📄 Mini-CRM-API.postman_collection.json   ← Postman API collection
├── 📄 docker-compose.yml                     ← Docker orchestration
│
├── 📁 backend/                               ← Backend API (Node.js + Express)
│   │
│   ├── 📄 package.json                       ← Dependencies & scripts
│   ├── 📄 package-lock.json                  ← Locked dependencies
│   ├── 📄 tsconfig.json                      ← TypeScript configuration
│   ├── 📄 jest.config.js                     ← Jest testing config
│   ├── 📄 .eslintrc.json                     ← ESLint rules
│   ├── 📄 .prettierrc                        ← Prettier formatting
│   ├── 📄 .gitignore                         ← Git ignore rules
│   ├── 📄 .env                               ← Environment variables (DO NOT COMMIT)
│   ├── 📄 .env.example                       ← Environment template
│   ├── 📄 Dockerfile                         ← Docker build instructions
│   ├── 📄 README.md                          ← Backend documentation
│   │
│   ├── 📁 src/                               ← Source code
│   │   │
│   │   ├── 📄 index.ts                       ← Entry point (starts server)
│   │   ├── 📄 app.ts                         ← Express app setup
│   │   │
│   │   ├── 📁 config/                        ← Configuration
│   │   │   ├── 📄 env.ts                     ← Environment validation
│   │   │   └── 📄 database.ts                ← MongoDB connection
│   │   │
│   │   ├── 📁 constants/                     ← Constants & enums
│   │   │   ├── 📄 enums.ts                   ← Status enums, entity types
│   │   │   ├── 📄 permissions.ts             ← Permission definitions
│   │   │   └── 📄 roles.ts                   ← Role definitions & mappings
│   │   │
│   │   ├── 📁 models/                        ← Mongoose models (Database)
│   │   │   ├── 📄 Organization.ts            ← Organization model
│   │   │   ├── 📄 User.ts                    ← User model (with password hashing)
│   │   │   ├── 📄 Role.ts                    ← Role model
│   │   │   ├── 📄 Token.ts                   ← Token model (refresh, reset)
│   │   │   ├── 📄 Lead.ts                    ← Lead model (CRM)
│   │   │   ├── 📄 Project.ts                 ← Project model (PMS)
│   │   │   ├── 📄 Task.ts                    ← Task model (PMS)
│   │   │   ├── 📄 Note.ts                    ← Note model
│   │   │   ├── 📄 Attachment.ts              ← Attachment model
│   │   │   └── 📄 AuditLog.ts                ← Audit log model
│   │   │
│   │   ├── 📁 controllers/                   ← Request handlers
│   │   │   └── 📄 auth.controller.ts         ← Auth endpoints handler
│   │   │   └── [TODO: lead.controller.ts]
│   │   │   └── [TODO: project.controller.ts]
│   │   │   └── [TODO: task.controller.ts]
│   │   │   └── [TODO: user.controller.ts]
│   │   │
│   │   ├── 📁 services/                      ← Business logic
│   │   │   └── 📄 auth.service.ts            ← Auth business logic
│   │   │   └── [TODO: lead.service.ts]
│   │   │   └── [TODO: project.service.ts]
│   │   │   └── [TODO: task.service.ts]
│   │   │   └── [TODO: user.service.ts]
│   │   │
│   │   ├── 📁 routes/                        ← API routes
│   │   │   └── 📄 auth.routes.ts             ← Auth endpoints
│   │   │   └── [TODO: lead.routes.ts]
│   │   │   └── [TODO: project.routes.ts]
│   │   │   └── [TODO: task.routes.ts]
│   │   │   └── [TODO: user.routes.ts]
│   │   │
│   │   ├── 📁 middleware/                    ← Express middleware
│   │   │   ├── 📄 auth.ts                    ← JWT authentication
│   │   │   ├── 📄 rbac.ts                    ← Permission checking
│   │   │   ├── 📄 validation.ts              ← Request validation
│   │   │   ├── 📄 errorHandler.ts            ← Error handling
│   │   │   ├── 📄 rateLimit.ts               ← Rate limiting
│   │   │   └── 📄 correlationId.ts           ← Request tracking
│   │   │
│   │   ├── 📁 validators/                    ← Zod schemas
│   │   │   └── 📄 auth.validator.ts          ← Auth validation schemas
│   │   │   └── [TODO: lead.validator.ts]
│   │   │   └── [TODO: project.validator.ts]
│   │   │   └── [TODO: task.validator.ts]
│   │   │
│   │   ├── 📁 utils/                         ← Utility functions
│   │   │   ├── 📄 errors.ts                  ← Custom error classes
│   │   │   ├── 📄 logger.ts                  ← Logging utility
│   │   │   ├── 📄 response.ts                ← API response formatter
│   │   │   └── 📄 asyncHandler.ts            ← Async error wrapper
│   │   │
│   │   ├── 📁 types/                         ← TypeScript types
│   │   │   └── 📄 express.d.ts               ← Express type extensions
│   │   │
│   │   └── 📁 scripts/                       ← Utility scripts
│   │       └── 📄 seed.ts                    ← Database seeding script
│   │
│   ├── 📁 dist/                              ← Compiled JavaScript (generated)
│   ├── 📁 node_modules/                      ← Dependencies (generated)
│   ├── 📁 uploads/                           ← File uploads (generated)
│   └── 📁 coverage/                          ← Test coverage (generated)
│
└── 📁 frontend/                              ← Frontend (Coming soon)
    └── [TODO: React + Vite setup]
```

## 📊 File Count Summary

### Completed Files

**Documentation (9 files)**
- README.md
- GET_STARTED.md
- QUICKSTART.md
- SETUP.md
- ARCHITECTURE.md
- PROJECT_STATUS.md
- PROJECT_TREE.md
- backend/README.md
- Full-stack-Assignment-RBAC-Mini-CRM-PMS.md

**Configuration (8 files)**
- package.json
- tsconfig.json
- jest.config.js
- .eslintrc.json
- .prettierrc
- .gitignore
- .env.example
- docker-compose.yml

**Source Code (35 files)**
- Config: 2 files
- Constants: 3 files
- Models: 10 files
- Controllers: 1 file
- Services: 1 file
- Routes: 1 file
- Middleware: 6 files
- Validators: 1 file
- Utils: 4 files
- Types: 1 file
- Scripts: 1 file
- Entry: 2 files (index.ts, app.ts)

**Other (3 files)**
- Dockerfile
- Postman collection
- .env (local)

**Total: ~55 files created** ✅

### TODO Files (Coming Soon)

**Controllers (5 files)**
- lead.controller.ts
- project.controller.ts
- task.controller.ts
- user.controller.ts
- audit.controller.ts

**Services (5 files)**
- lead.service.ts
- project.service.ts
- task.service.ts
- user.service.ts
- audit.service.ts

**Routes (5 files)**
- lead.routes.ts
- project.routes.ts
- task.routes.ts
- user.routes.ts
- audit.routes.ts

**Validators (4 files)**
- lead.validator.ts
- project.validator.ts
- task.validator.ts
- user.validator.ts

**Tests (10+ files)**
- auth.test.ts
- rbac.test.ts
- lead.test.ts
- project.test.ts
- task.test.ts
- etc.

**Frontend (50+ files)**
- Complete React application

## 🎯 Key Files to Understand

### Start Here (In Order)

1. **README.md** - Project overview
2. **GET_STARTED.md** - Quick setup (3 steps)
3. **backend/src/index.ts** - Entry point
4. **backend/src/app.ts** - Express setup
5. **backend/src/routes/auth.routes.ts** - API routes
6. **backend/src/controllers/auth.controller.ts** - Request handlers
7. **backend/src/services/auth.service.ts** - Business logic
8. **backend/src/models/User.ts** - Database model

### Important Configuration

1. **backend/.env** - Environment variables (create from .env.example)
2. **backend/tsconfig.json** - TypeScript settings
3. **backend/package.json** - Dependencies & scripts
4. **docker-compose.yml** - Docker setup

### Core Business Logic

1. **backend/src/constants/roles.ts** - Role & permission definitions
2. **backend/src/middleware/auth.ts** - Authentication
3. **backend/src/middleware/rbac.ts** - Authorization
4. **backend/src/services/auth.service.ts** - Auth logic

### Database Models

1. **backend/src/models/Organization.ts** - Multi-tenant container
2. **backend/src/models/User.ts** - User with password hashing
3. **backend/src/models/Role.ts** - Roles with permissions
4. **backend/src/models/Lead.ts** - CRM leads
5. **backend/src/models/Project.ts** - Projects
6. **backend/src/models/Task.ts** - Tasks
7. **backend/src/models/AuditLog.ts** - Audit trail

## 📝 File Naming Conventions

### TypeScript Files
- **Models**: PascalCase (e.g., `User.ts`, `Lead.ts`)
- **Services**: camelCase.service.ts (e.g., `auth.service.ts`)
- **Controllers**: camelCase.controller.ts (e.g., `auth.controller.ts`)
- **Routes**: camelCase.routes.ts (e.g., `auth.routes.ts`)
- **Validators**: camelCase.validator.ts (e.g., `auth.validator.ts`)
- **Middleware**: camelCase.ts (e.g., `auth.ts`, `rbac.ts`)
- **Utils**: camelCase.ts (e.g., `logger.ts`, `errors.ts`)

### Configuration Files
- **TypeScript**: tsconfig.json
- **ESLint**: .eslintrc.json
- **Prettier**: .prettierrc
- **Jest**: jest.config.js
- **Docker**: Dockerfile, docker-compose.yml

### Documentation
- **Markdown**: UPPERCASE.md (e.g., `README.md`, `SETUP.md`)

## 🔍 Finding Files

### By Feature

**Authentication**
```
backend/src/
├── routes/auth.routes.ts
├── controllers/auth.controller.ts
├── services/auth.service.ts
├── validators/auth.validator.ts
├── middleware/auth.ts
└── models/User.ts, Token.ts
```

**Authorization (RBAC)**
```
backend/src/
├── middleware/rbac.ts
├── constants/roles.ts
├── constants/permissions.ts
└── models/Role.ts
```

**Database**
```
backend/src/
├── config/database.ts
└── models/*.ts (10 models)
```

**API Endpoints**
```
backend/src/
├── routes/*.routes.ts
├── controllers/*.controller.ts
└── validators/*.validator.ts
```

**Business Logic**
```
backend/src/
└── services/*.service.ts
```

## 📦 Generated Directories

These are created automatically:

```
backend/
├── node_modules/     ← npm install
├── dist/             ← npm run build
├── coverage/         ← npm test
└── uploads/          ← File uploads
```

**Note**: These are in `.gitignore` and should not be committed.

## 🎨 Code Organization Pattern

```
Feature (e.g., Auth)
│
├── Route (auth.routes.ts)
│   └── Defines endpoints
│       └── Applies middleware
│           └── Calls controller
│
├── Controller (auth.controller.ts)
│   └── Handles HTTP request/response
│       └── Validates input
│           └── Calls service
│
├── Service (auth.service.ts)
│   └── Business logic
│       └── Database operations
│           └── Returns data
│
├── Validator (auth.validator.ts)
│   └── Zod schemas
│       └── Request validation
│
└── Model (User.ts, Token.ts)
    └── Database schema
        └── Mongoose model
```

## 🚀 Next Steps

1. **Explore the code**: Start with `backend/src/index.ts`
2. **Read documentation**: Check README files
3. **Run the project**: Follow GET_STARTED.md
4. **Test APIs**: Use Postman collection
5. **Build features**: See PROJECT_STATUS.md for TODOs

---

**Last Updated**: January 2024  
**Total Files**: ~55 created, ~30 TODO  
**Status**: Backend core complete, API endpoints in progress