# Mini-CRM/PMS - Full-Stack RBAC Application

A production-grade, role-based access control (RBAC) Mini-CRM/PMS system for managing leads, projects, and tasks in a multi-tenant B2B environment.

## 🎯 Project Overview

This application provides a comprehensive solution for B2B companies to:
- Track and manage **Leads** (CRM functionality)
- Manage **Projects and Tasks** (PMS functionality)
- Control access through **Role-Based Permissions**
- Maintain **Multi-tenant** isolation
- Keep complete **Audit Logs** of all activities

## 🏗️ Architecture

```
mini-crm/
├── backend/              # Node.js + Express + MongoDB API
├── frontend/             # React + Vite (Coming soon)
├── docker-compose.yml    # Docker orchestration
└── README.md            # This file
```

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB 7.0 with Mongoose ODM
- **Authentication**: JWT (Access + Refresh tokens)
- **Validation**: Zod
- **Testing**: Jest + Supertest
- **Documentation**: Swagger/OpenAPI

### Frontend (Coming Soon)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: TBD
- **UI Library**: TBD
- **HTTP Client**: Axios

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Database**: MongoDB (containerized)

## 📋 Features

### ✅ Implemented (Backend)

#### Authentication & Authorization
- [x] User registration with organization creation
- [x] Login with JWT tokens (access + refresh)
- [x] Token refresh mechanism
- [x] Logout with token revocation
- [x] Password reset flow
- [x] Role-based access control (RBAC)
- [x] Multi-tenant architecture

#### User Management
- [x] User model with organization scoping
- [x] Multiple roles per user
- [x] 5 predefined roles: SuperAdmin, Admin, Manager, Agent, Auditor
- [x] Fine-grained permissions system

#### Data Models
- [x] Organization
- [x] User
- [x] Role
- [x] Lead
- [x] Project
- [x] Task
- [x] Note
- [x] Attachment
- [x] AuditLog
- [x] Token

#### Security
- [x] Password hashing with bcrypt
- [x] JWT token management
- [x] Rate limiting
- [x] CORS protection
- [x] Helmet security headers
- [x] Input validation
- [x] SQL injection prevention
- [x] XSS protection

### 🚧 In Progress

#### API Endpoints
- [ ] Organization management
- [ ] User invitation and management
- [ ] Lead CRUD operations
- [ ] Project CRUD operations
- [ ] Task CRUD operations
- [ ] Notes and attachments
- [ ] Audit log viewing
- [ ] File upload

#### Frontend
- [ ] Project setup
- [ ] Authentication pages
- [ ] Dashboard
- [ ] Lead management
- [ ] Project management
- [ ] Task board (Kanban)
- [ ] User management
- [ ] Audit log viewer

## 🎭 Roles & Permissions

### Role Hierarchy

1. **SuperAdmin** 👑
   - Full access to all organization resources
   - Can manage organization settings
   - Can manage all users and roles
   - Access to all data and audit logs

2. **Admin** 🛡️
   - Full access except organization management
   - Can manage users and roles
   - Can manage all leads, projects, and tasks
   - Access to audit logs

3. **Manager** 📊
   - Can view and update leads for the team
   - Can create and manage projects
   - Can assign tasks and leads
   - Can view team members

4. **Agent** 👤
   - Can CRUD only their own leads
   - Can view team projects
   - Can manage assigned tasks
   - Limited to own data

5. **Auditor** 🔍
   - Read-only access to all organization data
   - Full access to audit logs
   - Cannot modify any data

### Permission Matrix

| Resource | SuperAdmin | Admin | Manager | Agent | Auditor |
|----------|------------|-------|---------|-------|---------|
| **Leads** |
| Create | ✓ | ✓ | ✓ | ✓ | ✗ |
| View All | ✓ | ✓ | ✓ | Own only | ✓ |
| Update | ✓ | ✓ | ✓ | Own only | ✗ |
| Delete | ✓ | ✓ | ✗ | ✗ | ✗ |
| Assign | ✓ | ✓ | ✓ | ✗ | ✗ |
| **Projects** |
| Create | ✓ | ✓ | ✓ | ✗ | ✗ |
| View | ✓ | ✓ | ✓ | ✓ | ✓ |
| Update | ✓ | ✓ | ✓ | ✗ | ✗ |
| Delete | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Tasks** |
| Create | ✓ | ✓ | ✓ | ✓ | ✗ |
| View | ✓ | ✓ | ✓ | Assigned | ✓ |
| Update | ✓ | ✓ | ✓ | Assigned | ✗ |
| Delete | ✓ | ✓ | ✓ | ✗ | ✗ |
| **Users** |
| Invite | ✓ | ✓ | ✗ | ✗ | ✗ |
| View | ✓ | ✓ | ✓ | ✗ | ✓ |
| Update | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Organization** |
| Manage | ✓ | ✗ | ✗ | ✗ | ✗ |
| View | ✓ | ✓ | ✓ | ✗ | ✓ |
| **Audit Logs** |
| View | ✓ | ✓ | ✗ | ✗ | ✓ |

## 🚀 Quick Start

### Prerequisites

- Node.js 20 or higher
- MongoDB 7.0 or higher
- Docker & Docker Compose (optional but recommended)

### Option 1: Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   cd mini-crm
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Check logs**
   ```bash
   docker-compose logs -f backend
   ```

4. **Access the API**
   - Backend API: http://localhost:5000/api
   - Health check: http://localhost:5000/health

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7.0
   ```

5. **Start the backend**
   ```bash
   npm run dev
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-access-token>
```

### Quick Test

1. **Register a new organization and SuperAdmin**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "organizationName": "Acme Corp",
       "organizationDomain": "acme",
       "name": "John Doe",
       "email": "admin@acme.com",
       "password": "SecurePass123!"
     }'
   ```

2. **Login**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@acme.com",
       "password": "SecurePass123!"
     }'
   ```

3. **Get current user**
   ```bash
   curl -X GET http://localhost:5000/api/auth/me \
     -H "Authorization: Bearer <your-access-token>"
   ```

For detailed API documentation, see [Backend README](./backend/README.md)

## 🗄️ Database Schema

### Core Entities

- **Organization**: Multi-tenant container
- **User**: Users belonging to an organization
- **Role**: Roles with permissions
- **Lead**: CRM leads
- **Project**: Projects
- **Task**: Tasks within projects
- **Note**: Notes attached to entities
- **Attachment**: File attachments
- **AuditLog**: Complete audit trail
- **Token**: Refresh and reset tokens

### Key Relationships

```
Organization (1) ──→ (N) User
Organization (1) ──→ (N) Role
User (N) ──→ (N) Role
Organization (1) ──→ (N) Lead
Lead (1) ──→ (1) User (owner)
Organization (1) ──→ (N) Project
Project (1) ──→ (N) Task
Task (1) ──→ (1) User (assignee)
```

## 🔒 Security Features

- **Password Security**: Bcrypt hashing with salt rounds
- **JWT Tokens**: Separate access and refresh tokens
- **Token Rotation**: Refresh tokens are rotated on use
- **Token Revocation**: Logout revokes refresh tokens
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Zod schema validation
- **CORS**: Configurable origin whitelist
- **Helmet**: Security headers
- **Multi-tenant Isolation**: Automatic org scoping

## 📊 Audit Logging

Every write operation is logged with:
- **Actor**: User who performed the action
- **Action**: Type of operation (create/update/delete/assign)
- **Entity**: Type and ID of affected resource
- **Before/After**: JSON snapshots of changes
- **Metadata**: IP address, user agent, timestamp

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

## 📁 Project Structure

```
mini-crm/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration
│   │   ├── constants/       # Enums and constants
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── validators/      # Zod schemas
│   │   ├── utils/           # Utilities
│   │   ├── types/           # TypeScript types
│   │   ├── app.ts           # Express app
│   │   └── index.ts         # Entry point
│   ├── .env                 # Environment variables
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── frontend/                # Coming soon
├── docker-compose.yml       # Docker orchestration
└── README.md               # This file
```

## 🛠️ Development

### Backend Development

```bash
cd backend
npm run dev          # Start with hot reload
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests
npm run lint         # Lint code
npm run format       # Format code
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mini-crm
JWT_ACCESS_SECRET=<generate-strong-secret>
JWT_REFRESH_SECRET=<generate-strong-secret>
CORS_ORIGIN=http://localhost:5173
```

⚠️ **Important**: Use strong, random secrets for JWT tokens (minimum 32 characters)

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild services
docker-compose up -d --build

# Stop and remove volumes
docker-compose down -v
```

## 📈 Roadmap

### Phase 1: Backend Core ✅
- [x] Authentication system
- [x] RBAC implementation
- [x] Database models
- [x] Multi-tenant architecture

### Phase 2: Backend API (In Progress)
- [ ] Lead management endpoints
- [ ] Project management endpoints
- [ ] Task management endpoints
- [ ] User management endpoints
- [ ] File upload
- [ ] Audit log API

### Phase 3: Frontend
- [ ] Project setup
- [ ] Authentication UI
- [ ] Dashboard
- [ ] Lead management UI
- [ ] Project/Task board
- [ ] User management UI

### Phase 4: Advanced Features
- [ ] Real-time updates (WebSocket)
- [ ] Background jobs
- [ ] Advanced search
- [ ] CSV import/export
- [ ] Custom fields
- [ ] S3 file storage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 👥 Authors

- Your Name

## 🙏 Acknowledgments

- Assignment requirements from Full-Stack RBAC Mini-CRM/PMS specification
- Built with modern best practices and production-grade patterns

---

**Status**: 🚧 Backend Core Complete | API Endpoints In Progress | Frontend Coming Soon

For detailed backend documentation, see [Backend README](./backend/README.md)