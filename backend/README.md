# Mini-CRM/PMS Backend API

Production-grade RBAC (Role-Based Access Control) backend for Mini-CRM/PMS system built with Node.js, Express, TypeScript, and MongoDB.

## Features

- 🔐 **Authentication & Authorization**
  - JWT-based authentication (access + refresh tokens)
  - Role-based access control (RBAC)
  - Multi-tenant architecture
  - Password reset functionality

- 👥 **User Management**
  - Multiple roles: SuperAdmin, Admin, Manager, Agent, Auditor
  - Fine-grained permissions
  - User invitation system

- 📊 **CRM Features**
  - Lead management
  - Project management
  - Task management
  - Notes and attachments

- 📝 **Audit Logging**
  - Complete audit trail
  - Track all changes with before/after snapshots

- 🔒 **Security**
  - Password hashing with bcrypt
  - Rate limiting
  - CORS protection
  - Helmet security headers
  - Input validation with Zod

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Validation**: Zod
- **Testing**: Jest + Supertest

## Prerequisites

- Node.js 20 or higher
- MongoDB 7.0 or higher
- npm or yarn

## Installation

1. **Clone the repository**
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
   ```
   
   Edit `.env` and update the values:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_ACCESS_SECRET`: Strong secret for access tokens (min 32 chars)
   - `JWT_REFRESH_SECRET`: Strong secret for refresh tokens (min 32 chars)

4. **Start MongoDB** (if running locally)
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7.0
   
   # Or use Docker Compose from root
   docker-compose up -d mongodb
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Using Docker Compose (Recommended)
```bash
# From project root
docker-compose up -d
```

## API Documentation

### 📚 Complete API Documentation

For comprehensive API documentation covering all 54 endpoints, see:
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete endpoint reference with examples

### 📮 Postman Collection

Import the complete Postman collection for easy API testing:
- **[Mini-CRM-Complete-API.postman_collection.json](../Mini-CRM-Complete-API.postman_collection.json)**
- Includes all 54 endpoints across 10 modules
- Auto-authentication with token management
- Pre-configured examples and variables

### Quick Start

1. **Import Postman Collection**
   - Open Postman
   - Import `Mini-CRM-Complete-API.postman_collection.json`
   - Set `baseUrl` variable to `http://localhost:5000/api`

2. **Register or Login**
   - Run "Auth > Register Organization" to create a new org
   - Or run "Auth > Login" with existing credentials
   - Access token will be automatically saved

3. **Start Testing**
   - All endpoints are ready to use with saved token
   - Explore 10 organized folders covering all API features

### Base URL
```
http://localhost:5000/api
```

### Quick Reference - Authentication

#### Register Organization & SuperAdmin
```http
POST /api/auth/register
Content-Type: application/json

{
  "organizationName": "Acme Corp",
  "organizationDomain": "acme",
  "name": "John Doe",
  "email": "admin@acme.com",
  "password": "SecurePass123!"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@acme.com",
  "password": "SecurePass123!"
}
```

**For complete endpoint documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.ts
│   │   └── env.ts
│   ├── constants/        # Constants and enums
│   │   ├── enums.ts
│   │   ├── permissions.ts
│   │   └── roles.ts
│   ├── controllers/      # Request handlers
│   │   └── auth.controller.ts
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts
│   │   ├── rbac.ts
│   │   ├── validation.ts
│   │   ├── errorHandler.ts
│   │   └── rateLimit.ts
│   ├── models/           # Mongoose models
│   │   ├── Organization.ts
│   │   ├── User.ts
│   │   ├── Role.ts
│   │   ├── Lead.ts
│   │   ├── Project.ts
│   │   ├── Task.ts
│   │   ├── Note.ts
│   │   ├── Attachment.ts
│   │   ├── AuditLog.ts
│   │   └── Token.ts
│   ├── routes/           # API routes
│   │   └── auth.routes.ts
│   ├── services/         # Business logic
│   │   └── auth.service.ts
│   ├── validators/       # Zod schemas
│   │   └── auth.validator.ts
│   ├── utils/            # Utility functions
│   │   ├── errors.ts
│   │   ├── logger.ts
│   │   ├── response.ts
│   │   └── asyncHandler.ts
│   ├── types/            # TypeScript types
│   │   └── express.d.ts
│   ├── app.ts            # Express app setup
│   └── index.ts          # Entry point
├── .env                  # Environment variables
├── .env.example          # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## Roles & Permissions

### Roles

1. **SuperAdmin**: Full access to all organization resources and settings
2. **Admin**: Full access except organization management
3. **Manager**: Manage team leads, projects, and tasks
4. **Agent**: Access to own assigned leads and tasks
5. **Auditor**: Read-only access to organization data and audit logs

### Permission Matrix

| Permission | SuperAdmin | Admin | Manager | Agent | Auditor |
|------------|------------|-------|---------|-------|---------|
| lead.create | ✓ | ✓ | ✓ | ✓ | ✗ |
| lead.view | ✓ | ✓ | ✓ | ✓ (own) | ✓ |
| lead.update | ✓ | ✓ | ✓ | ✓ (own) | ✗ |
| lead.delete | ✓ | ✓ | ✗ | ✗ | ✗ |
| lead.assign | ✓ | ✓ | ✓ | ✗ | ✗ |
| project.* | ✓ | ✓ | ✓ | View only | ✓ (view) |
| task.* | ✓ | ✓ | ✓ | ✓ (assigned) | ✓ (view) |
| user.* | ✓ | ✓ | View only | ✗ | ✓ (view) |
| role.manage | ✓ | ✓ | ✗ | ✗ | ✗ |
| org.manage | ✓ | ✗ | ✗ | ✗ | ✗ |
| audit.view | ✓ | ✓ | ✗ | ✗ | ✓ |

## Testing

### Test Coverage Status ✅

**All backend tests passing with excellent coverage!**

- ✅ **50/50 service tests passing** (100%)
- ✅ **98.33% statement coverage**
- ✅ **100% function coverage**
- ✅ **82.85% branch coverage**
- ✅ **98.3% line coverage**

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- org.service.test.ts
```

### Test Documentation

For detailed test coverage reports and fixes:
- [TEST_FIXES_SUMMARY.md](./TEST_FIXES_SUMMARY.md) - Summary of all test fixes
- [TEST_COVERAGE_IMPROVEMENTS.md](./TEST_COVERAGE_IMPROVEMENTS.md) - Coverage improvements
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing best practices

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment (development/production/test) | development |
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/mini-crm |
| JWT_ACCESS_SECRET | Secret for access tokens (min 32 chars) | - |
| JWT_REFRESH_SECRET | Secret for refresh tokens (min 32 chars) | - |
| JWT_ACCESS_EXPIRY | Access token expiry | 15m |
| JWT_REFRESH_EXPIRY | Refresh token expiry | 7d |
| CORS_ORIGIN | Allowed CORS origins | http://localhost:5173 |

## Security Best Practices

1. **Never commit `.env` file** - Use `.env.example` as template
2. **Use strong JWT secrets** - Minimum 32 characters, random
3. **Enable rate limiting** - Configured for auth endpoints
4. **Password requirements**:
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character

## Multi-Tenant Architecture

- Every request is scoped to an organization (`orgId`)
- Organization ID is derived from authenticated user
- Never accept `orgId` from client for write operations
- All queries automatically filter by `orgId`

## Audit Logging

All write operations are logged with:
- Actor (user who performed the action)
- Action type (create/update/delete/assign)
- Entity type and ID
- Before and after JSON snapshots
- IP address and user agent
- Timestamp

## License

MIT