import mongoose from 'mongoose';
import { Organization } from '../models/Organization';
import { AuditLog } from '../models/AuditLog';
import { NotFoundError, ConflictError } from '../utils/errors';
import { AuditAction } from '../constants/enums';
import { UpdateOrgInput } from '../validators/org.validator';

export class OrgService {
  /**
   * Get organization by ID
   */
  async getOrganization(orgId: mongoose.Types.ObjectId) {
    const org = await Organization.findById(orgId);

    if (!org) {
      throw new NotFoundError('Organization not found');
    }

    return org;
  }

  /**
   * Update organization settings
   */
  async updateOrganization(
    orgId: mongoose.Types.ObjectId,
    data: UpdateOrgInput,
    actorUserId: mongoose.Types.ObjectId,
    ip?: string,
    userAgent?: string
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get current organization
      const org = await Organization.findById(orgId).session(session);

      if (!org) {
        throw new NotFoundError('Organization not found');
      }

      // Store before state for audit
      const beforeState = org.toObject();

      // Check domain uniqueness if domain is being updated
      if (data.domain && data.domain !== org.domain) {
        const existingOrg = await Organization.findOne({ 
          domain: data.domain,
          _id: { $ne: orgId }
        }).session(session);

        if (existingOrg) {
          throw new ConflictError('Domain already in use by another organization');
        }
      }

      // Update basic fields
      if (data.name) org.name = data.name;
      if (data.domain) org.domain = data.domain;

      // Update settings (merge with existing settings)
      if (data.settings) {
        // Initialize settings if not exists
        if (!(org as any).settings) {
          (org as any).settings = {};
        }

        // Merge top-level settings (excluding nested objects that need deep merge)
        const { requiredFields, features, ...topLevelSettings } = data.settings;
        (org as any).settings = {
          ...(org as any).settings,
          ...topLevelSettings,
        };

        // Deep merge for nested objects
        if (data.settings.requiredFields) {
          (org as any).settings.requiredFields = {
            ...((org as any).settings.requiredFields || {}),
            ...data.settings.requiredFields,
          };

          if (data.settings.requiredFields.lead) {
            (org as any).settings.requiredFields.lead = {
              ...((org as any).settings.requiredFields?.lead || {}),
              ...data.settings.requiredFields.lead,
            };
          }

          if (data.settings.requiredFields.project) {
            (org as any).settings.requiredFields.project = {
              ...((org as any).settings.requiredFields?.project || {}),
              ...data.settings.requiredFields.project,
            };
          }
        }

        if (data.settings.features) {
          (org as any).settings.features = {
            ...((org as any).settings.features || {}),
            ...data.settings.features,
          };
        }
      }

      // Save organization
      await org.save({ session });

      // Create audit log
      await AuditLog.create([{
        orgId,
        userId: actorUserId,
        action: AuditAction.UPDATE,
        entityType: 'organization',
        entityId: orgId,
        before: beforeState,
        after: org.toObject(),
        ip,
        userAgent,
      }], { session });

      await session.commitTransaction();

      return org;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get organization statistics
   */
  async getOrganizationStats(orgId: mongoose.Types.ObjectId) {
    const [userCount, leadCount, projectCount, taskCount] = await Promise.all([
      mongoose.model('User').countDocuments({ orgId }),
      mongoose.model('Lead').countDocuments({ orgId }),
      mongoose.model('Project').countDocuments({ orgId }),
      mongoose.model('Task').countDocuments({ 
        orgId,
        deletedAt: null 
      }),
    ]);

    return {
      users: userCount,
      leads: leadCount,
      projects: projectCount,
      tasks: taskCount,
    };
  }
}