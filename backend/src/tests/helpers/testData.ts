import mongoose from 'mongoose';
import { UserStatus } from '../../constants/enums';

/**
 * Test data factory for creating consistent test data
 */

export const testOrgId = new mongoose.Types.ObjectId();
export const testUserId = new mongoose.Types.ObjectId();
export const testLeadId = new mongoose.Types.ObjectId();
export const testProjectId = new mongoose.Types.ObjectId();
export const testTaskId = new mongoose.Types.ObjectId();

export const createTestOrganization = () => ({
  _id: testOrgId,
  name: 'Test Organization',
  domain: 'test-org',
  settings: {
    business: {
      timezone: 'UTC',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
    },
    lead: {
      statuses: ['new', 'contacted', 'qualified', 'converted', 'lost'],
      sources: ['website', 'referral', 'social', 'email', 'other'],
      requiredFields: ['name', 'email', 'phone'],
    },
    features: {
      emailIntegration: true,
      taskReminders: true,
      auditLog: true,
    },
  },
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const createTestUser = (overrides: any = {}) => ({
  _id: testUserId,
  orgId: testOrgId,
  email: 'test@example.com',
  passwordHash: 'Password123!', // Will be hashed by User model pre-save hook
  name: 'Test User',
  roleIds: [],
  status: UserStatus.ACTIVE,
  isEmailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createTestLead = (overrides: any = {}) => ({
  _id: testLeadId,
  orgId: testOrgId,
  name: 'Test Lead',
  email: 'lead@example.com',
  phone: '+1234567890',
  company: 'Test Company',
  status: 'new',
  source: 'website',
  value: 10000,
  assignedTo: testUserId,
  createdBy: testUserId,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createTestProject = (overrides: any = {}) => ({
  _id: testProjectId,
  orgId: testOrgId,
  name: 'Test Project',
  description: 'Test project description',
  status: 'planning',
  priority: 'medium',
  startDate: new Date(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  budget: 50000,
  leadId: testLeadId,
  teamMembers: [
    {
      userId: testUserId,
      role: 'manager',
      addedAt: new Date(),
    },
  ],
  createdBy: testUserId,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createTestTask = (overrides: any = {}) => ({
  _id: testTaskId,
  orgId: testOrgId,
  title: 'Test Task',
  description: 'Test task description',
  status: 'todo',
  priority: 'medium',
  projectId: testProjectId,
  assignedTo: testUserId,
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  createdBy: testUserId,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createTestNote = (overrides: any = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  orgId: testOrgId,
  content: 'Test note content',
  entityType: 'lead',
  entityId: testLeadId,
  createdBy: testUserId,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createTestAttachment = (overrides: any = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  orgId: testOrgId,
  filename: 'test-file.pdf',
  originalName: 'test-file.pdf',
  mimeType: 'application/pdf',
  size: 1024,
  path: '/uploads/test-file.pdf',
  entityType: 'lead',
  entityId: testLeadId,
  uploadedBy: testUserId,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Generate JWT token for testing
 */
export const generateTestToken = (userId: mongoose.Types.ObjectId, orgId: mongoose.Types.ObjectId) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { userId: userId.toString(), orgId: orgId.toString() },
    process.env.JWT_ACCESS_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

/**
 * Create authenticated request headers
 */
export const createAuthHeaders = (token?: string) => {
  const authToken = token || generateTestToken(testUserId, testOrgId);
  return {
    Authorization: `Bearer ${authToken}`,
    'Content-Type': 'application/json',
  };
};