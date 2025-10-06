import { Organization } from '../../models/Organization';
import { User } from '../../models/User';
import { Lead } from '../../models/Lead';
import { Project } from '../../models/Project';
import { Task } from '../../models/Task';
import { Note } from '../../models/Note';
import { Attachment } from '../../models/Attachment';
import { AuditLog } from '../../models/AuditLog';

/**
 * Database helper functions for tests
 */

export const seedTestOrganization = async (data: any) => {
  return await Organization.create(data);
};

export const seedTestUser = async (data: any) => {
  return await User.create(data);
};

export const seedTestLead = async (data: any) => {
  return await Lead.create(data);
};

export const seedTestProject = async (data: any) => {
  return await Project.create(data);
};

export const seedTestTask = async (data: any) => {
  return await Task.create(data);
};

export const seedTestNote = async (data: any) => {
  return await Note.create(data);
};

export const seedTestAttachment = async (data: any) => {
  return await Attachment.create(data);
};

/**
 * Clear all collections
 */
export const clearDatabase = async () => {
  await Organization.deleteMany({});
  await User.deleteMany({});
  await Lead.deleteMany({});
  await Project.deleteMany({});
  await Task.deleteMany({});
  await Note.deleteMany({});
  await Attachment.deleteMany({});
  await AuditLog.deleteMany({});
};

/**
 * Seed complete test environment
 */
export const seedCompleteTestEnvironment = async (orgData: any, userData: any) => {
  const org = await seedTestOrganization(orgData);
  const user = await seedTestUser({ ...userData, orgId: org._id });
  return { org, user };
};