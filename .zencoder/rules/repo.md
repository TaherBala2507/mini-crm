---
description: Repository Information Overview
alwaysApply: true
---

# Mini-CRM/PMS Information

## Summary
A production-grade, role-based access control (RBAC) Mini-CRM/PMS system for managing leads, projects, and tasks in a multi-tenant B2B environment. The application provides comprehensive functionality for tracking leads, managing projects and tasks, with fine-grained permission controls and complete audit logging.

## Structure
- **backend/**: Node.js Express API with TypeScript
- **docker-compose.yml**: Docker orchestration for the application
- **Documentation files**: Various markdown files with project documentation

## Language & Runtime
**Language**: TypeScript
**Version**: ES2020 target
**Runtime**: Node.js 20+
**Build System**: TypeScript compiler (tsc)
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- express: ^4.18.2 - Web framework
- mongoose: ^8.0.3 - MongoDB ODM
- bcryptjs: ^2.4.3 - Password hashing
- jsonwebtoken: ^9.0.2 - JWT authentication
- zod: ^3.22.4 - Schema validation
- multer: ^1.4.5-lts.1 - File uploads
- helmet: ^7.1.0 - Security headers
- cors: ^2.8.5 - CORS protection
- express-rate-limit: ^7.1.5 - Rate limiting

**Development Dependencies**:
- typescript: ^5.3.3
- ts-node: ^10.9.2
- nodemon: ^3.0.2
- jest: ^29.7.0
- ts-jest: ^29.1.1
- supertest: ^6.3.3
- eslint: ^8.56.0
- prettier: ^3.1.1

## Build & Installation
```bash
# Development
npm install
npm run dev

# Production
npm install
npm run build
npm start

# Testing
npm test
npm run test:watch

# Database seeding
npm run db:seed
```

## Docker
**Dockerfile**: backend/Dockerfile
**Image**: Node 20 Alpine
**Configuration**: Multi-stage build with separate build and production stages
**Docker Compose**: Includes MongoDB 7.0 and backend services

## Testing
**Framework**: Jest with ts-jest
**Test Location**: src/**/*.test.ts
**Configuration**: jest.config.js
**Run Command**:
```bash
npm test
npm run test:watch
```

## Project Structure
**Main Directories**:
- **src/config/**: Application configuration
- **src/constants/**: Enums and constants
- **src/controllers/**: Request handlers
- **src/middleware/**: Express middleware
- **src/models/**: Mongoose models
- **src/routes/**: API routes
- **src/services/**: Business logic
- **src/validators/**: Zod schemas
- **src/utils/**: Utility functions
- **src/types/**: TypeScript type definitions

**Main Entry Points**:
- **src/index.ts**: Server startup
- **src/app.ts**: Express application setup

**API Modules**:
- Authentication & Authorization
- Lead Management
- Project Management
- Task Management
- Notes/Activity
- Dashboard & Analytics
- User Management
- Organization Settings
- Role Management
- File Upload/Attachment