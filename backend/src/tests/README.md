# Testing Guide

## Overview

This directory contains the test suite for the Mini-CRM/PMS backend application. The tests are organized into unit tests (services) and integration tests (routes/API endpoints).

## Test Structure

```
src/
├── tests/
│   ├── setup.ts                    # Global test setup and teardown
│   ├── helpers/
│   │   ├── testData.ts            # Test data factories
│   │   └── dbHelpers.ts           # Database helper functions
│   └── README.md                  # This file
├── services/
│   └── __tests__/                 # Unit tests for services
│       ├── auth.service.test.ts
│       ├── lead.service.test.ts
│       ├── project.service.test.ts
│       └── task.service.test.ts
└── routes/
    └── __tests__/                 # Integration tests for API routes
        ├── auth.routes.test.ts
        └── lead.routes.test.ts
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Only Unit Tests
```bash
npm run test:unit
```

### Run Only Integration Tests
```bash
npm run test:integration
```

### Run Tests with Verbose Output
```bash
npm run test:verbose
```

## Test Coverage

The test suite aims for comprehensive coverage of:

- ✅ **Authentication & Authorization** - Registration, login, token refresh, email verification
- ✅ **Lead Management** - CRUD operations, assignment, conversion
- ✅ **Project Management** - CRUD operations, team member management
- ✅ **Task Management** - CRUD operations, assignment, status tracking
- 🚧 **User Management** - User invitation, profile updates, role assignment
- 🚧 **Organization Settings** - Settings management, customization
- 🚧 **Role Management** - Custom role creation, permission assignment
- 🚧 **File Attachments** - File upload, download, deletion
- 🚧 **Notes/Activity** - Note creation, entity linking
- 🚧 **Analytics** - Dashboard metrics, statistics

## Test Database

Tests use **MongoDB Memory Server** for isolated, in-memory database testing:

- ✅ No external database required
- ✅ Fast test execution
- ✅ Automatic cleanup between tests
- ✅ Complete isolation from production data

## Writing Tests

### Unit Test Example (Service)

```typescript
import '../../tests/setup';
import { LeadService } from '../lead.service';
import { seedTestOrganization, seedTestUser } from '../../tests/helpers/dbHelpers';
import { createTestOrganization, createTestUser } from '../../tests/helpers/testData';

describe('LeadService', () => {
  let leadService: LeadService;
  let testOrgId: string;
  let testUserId: string;

  beforeEach(async () => {
    leadService = new LeadService();
    
    const org = await seedTestOrganization(createTestOrganization());
    const user = await seedTestUser(createTestUser({ orgId: org._id }));
    
    testOrgId = org._id.toString();
    testUserId = user._id.toString();
  });

  it('should create a new lead', async () => {
    const leadData = {
      name: 'Test Lead',
      email: 'lead@test.com',
      phone: '+1234567890',
      status: 'new',
      source: 'website',
    };

    const result = await leadService.createLead(leadData, testUserId, testOrgId);

    expect(result).toHaveProperty('_id');
    expect(result.name).toBe(leadData.name);
  });
});
```

### Integration Test Example (API Route)

```typescript
import '../../tests/setup';
import request from 'supertest';
import { createApp } from '../../app';
import { generateTestToken } from '../../tests/helpers/testData';

const app = createApp();

describe('Lead Routes', () => {
  let authToken: string;

  beforeEach(async () => {
    // Setup test data
    authToken = generateTestToken(testUserId, testOrgId);
  });

  it('should create a new lead', async () => {
    const response = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Lead',
        email: 'lead@test.com',
        phone: '+1234567890',
        status: 'new',
        source: 'website',
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Test Lead');
  });
});
```

## Test Helpers

### Test Data Factories (`testData.ts`)

Pre-configured test data generators:
- `createTestOrganization()` - Generate test organization
- `createTestUser()` - Generate test user
- `createTestLead()` - Generate test lead
- `createTestProject()` - Generate test project
- `createTestTask()` - Generate test task
- `generateTestToken()` - Generate JWT token for testing
- `createAuthHeaders()` - Create authenticated request headers

### Database Helpers (`dbHelpers.ts`)

Database seeding and cleanup functions:
- `seedTestOrganization()` - Seed organization
- `seedTestUser()` - Seed user
- `seedTestLead()` - Seed lead
- `seedTestProject()` - Seed project
- `seedTestTask()` - Seed task
- `clearDatabase()` - Clear all collections
- `seedCompleteTestEnvironment()` - Seed complete test environment

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Use `beforeEach` to set up fresh test data
- Database is automatically cleared after each test

### 2. Descriptive Test Names
```typescript
// ✅ Good
it('should throw error if email already exists', async () => { ... });

// ❌ Bad
it('test email validation', async () => { ... });
```

### 3. Test Both Success and Failure Cases
```typescript
describe('createLead', () => {
  it('should create a new lead', async () => { ... });
  it('should throw error if email already exists', async () => { ... });
  it('should throw error if required fields are missing', async () => { ... });
});
```

### 4. Use Proper Assertions
```typescript
// ✅ Good - Specific assertions
expect(result).toHaveProperty('_id');
expect(result.name).toBe('Test Lead');
expect(result.email).toBe('lead@test.com');

// ❌ Bad - Generic assertions
expect(result).toBeTruthy();
```

### 5. Test Error Handling
```typescript
it('should throw AppError with 404 status', async () => {
  await expect(
    leadService.getLeadById('invalid-id', testOrgId)
  ).rejects.toThrow(AppError);
});
```

## Coverage Goals

- **Overall Coverage**: > 80%
- **Services**: > 90%
- **Controllers**: > 85%
- **Routes**: > 80%
- **Utilities**: > 90%

## Continuous Integration

Tests are automatically run on:
- Every commit (pre-commit hook)
- Pull requests
- Before deployment

## Troubleshooting

### Tests Timing Out
- Increase timeout in `jest.config.js`
- Check for unresolved promises
- Ensure database connections are properly closed

### Memory Issues
- MongoDB Memory Server may require additional memory
- Run tests with `--runInBand` flag to prevent parallel execution

### Port Conflicts
- Tests use in-memory database (no port conflicts)
- If testing with real database, ensure unique test database

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain coverage above 80%
4. Update this README if adding new test patterns

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [Testing Best Practices](https://testingjavascript.com/)