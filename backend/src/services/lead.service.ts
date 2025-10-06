import mongoose from 'mongoose';
import { Lead, ILead } from '../models/Lead';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors';
import { LeadStatus, LeadSource, AuditAction, EntityType } from '../constants/enums';
import { PERMISSIONS } from '../constants/permissions';

interface CreateLeadInput {
  title: string;
  company: string;
  contactName: string;
  email?: string;
  phone?: string;
  source: LeadSource;
  status?: LeadStatus;
  ownerUserId?: string;
}

interface UpdateLeadInput {
  title?: string;
  company?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  source?: LeadSource;
  status?: LeadStatus;
  ownerUserId?: string | null;
}

interface ListLeadsQuery {
  page: number;
  pageSize: number;
  status?: LeadStatus;
  source?: LeadSource;
  ownerUserId?: string;
  search?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export class LeadService {
  /**
   * Create a new lead
   */
  async createLead(
    data: CreateLeadInput,
    orgId: string,
    userId: string,
    _userPermissions: string[]
  ): Promise<ILead> {
    // Validate owner if provided
    if (data.ownerUserId) {
      const owner = await User.findOne({
        _id: data.ownerUserId,
        orgId,
        deletedAt: null,
      });

      if (!owner) {
        throw new ValidationError('Invalid owner user ID');
      }
    }

    // Create lead
    const lead = await Lead.create({
      ...data,
      orgId,
      ownerUserId: data.ownerUserId || userId, // Default to creator if no owner specified
    });

    // Create audit log
    await AuditLog.create({
      orgId,
      userId,
      action: AuditAction.CREATE,
      entityType: EntityType.LEAD,
      entityId: lead._id,
      after: lead.toObject(),
    });

    return lead;
  }

  /**
   * Get lead by ID
   */
  async getLeadById(
    leadId: string,
    orgId: string,
    userId: string,
    userPermissions: string[]
  ): Promise<ILead> {
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      throw new ValidationError('Invalid lead ID');
    }

    const lead = await Lead.findOne({
      _id: leadId,
      orgId,
      deletedAt: null,
    }).populate('ownerUserId', 'firstName lastName email');

    if (!lead) {
      throw new NotFoundError('Lead not found');
    }

    // Check ownership for Agents
    if (
      userPermissions.includes(PERMISSIONS.LEAD_VIEW_OWN) &&
      !userPermissions.includes(PERMISSIONS.LEAD_VIEW_ALL)
    ) {
      if (lead.ownerUserId?.toString() !== userId) {
        throw new ForbiddenError('You can only view your own leads');
      }
    }

    return lead;
  }

  /**
   * List leads with filters and pagination
   */
  async listLeads(
    query: ListLeadsQuery,
    orgId: string,
    userId: string,
    userPermissions: string[]
  ): Promise<{ leads: ILead[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const { page, pageSize, status, source, ownerUserId, search, sortBy, sortOrder } = query;

    // Build filter
    const filter: any = {
      orgId,
      deletedAt: null,
    };

    // Apply status filter
    if (status) {
      filter.status = status;
    }

    // Apply source filter
    if (source) {
      filter.source = source;
    }

    // Apply owner filter
    if (ownerUserId) {
      filter.ownerUserId = ownerUserId;
    }

    // Apply search (regex search for better test compatibility)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { contactName: { $regex: search, $options: 'i' } },
      ];
    }

    // Restrict to own leads for Agents
    if (
      userPermissions.includes(PERMISSIONS.LEAD_VIEW_OWN) &&
      !userPermissions.includes(PERMISSIONS.LEAD_VIEW_ALL)
    ) {
      filter.ownerUserId = userId;
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * pageSize;
    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .populate('ownerUserId', 'firstName lastName email')
        .sort(sort)
        .skip(skip)
        .limit(pageSize),
      Lead.countDocuments(filter),
    ]);

    return {
      leads: leads as ILead[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Update lead
   */
  async updateLead(
    leadId: string,
    data: UpdateLeadInput,
    orgId: string,
    userId: string,
    userPermissions: string[]
  ): Promise<ILead> {
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      throw new ValidationError('Invalid lead ID');
    }

    // Get existing lead
    const lead = await Lead.findOne({
      _id: leadId,
      orgId,
      deletedAt: null,
    });

    if (!lead) {
      throw new NotFoundError('Lead not found');
    }

    // Check ownership for Agents
    if (
      userPermissions.includes(PERMISSIONS.LEAD_EDIT_OWN) &&
      !userPermissions.includes(PERMISSIONS.LEAD_EDIT_ALL)
    ) {
      if (lead.ownerUserId?.toString() !== userId) {
        throw new ForbiddenError('You can only edit your own leads');
      }
    }

    // Validate new owner if provided
    if (data.ownerUserId !== undefined) {
      if (data.ownerUserId === null) {
        // Allow removing owner
        data.ownerUserId = undefined;
      } else {
        const owner = await User.findOne({
          _id: data.ownerUserId,
          orgId,
          deletedAt: null,
        });

        if (!owner) {
          throw new ValidationError('Invalid owner user ID');
        }
      }
    }

    // Store before state
    const before = lead.toObject();

    // Update lead
    Object.assign(lead, data);
    await lead.save();

    // Create audit log
    await AuditLog.create({
      orgId,
      userId,
      action: AuditAction.UPDATE,
      entityType: EntityType.LEAD,
      entityId: lead._id,
      before,
      after: lead.toObject(),
    });

    return lead;
  }

  /**
   * Delete lead (soft delete)
   */
  async deleteLead(
    leadId: string,
    orgId: string,
    userId: string,
    userPermissions: string[]
  ): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      throw new ValidationError('Invalid lead ID');
    }

    // Get existing lead
    const lead = await Lead.findOne({
      _id: leadId,
      orgId,
      deletedAt: null,
    });

    if (!lead) {
      throw new NotFoundError('Lead not found');
    }

    // Check ownership for Agents
    if (
      userPermissions.includes(PERMISSIONS.LEAD_DELETE_OWN) &&
      !userPermissions.includes(PERMISSIONS.LEAD_DELETE_ALL)
    ) {
      if (lead.ownerUserId?.toString() !== userId) {
        throw new ForbiddenError('You can only delete your own leads');
      }
    }

    // Store before state
    const before = lead.toObject();

    // Soft delete
    lead.deletedAt = new Date();
    await lead.save();

    // Create audit log
    await AuditLog.create({
      orgId,
      userId,
      action: AuditAction.DELETE,
      entityType: EntityType.LEAD,
      entityId: lead._id,
      before,
    });
  }

  /**
   * Assign lead to a user
   */
  async assignLead(
    leadId: string,
    ownerUserId: string,
    orgId: string,
    userId: string
  ): Promise<ILead> {
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      throw new ValidationError('Invalid lead ID');
    }

    // Get existing lead
    const lead = await Lead.findOne({
      _id: leadId,
      orgId,
      deletedAt: null,
    });

    if (!lead) {
      throw new NotFoundError('Lead not found');
    }

    // Validate new owner
    const owner = await User.findOne({
      _id: ownerUserId,
      orgId,
      deletedAt: null,
    });

    if (!owner) {
      throw new NotFoundError('User not found');
    }

    // Store before state
    const before = lead.toObject();

    // Update owner
    lead.ownerUserId = new mongoose.Types.ObjectId(ownerUserId);
    await lead.save();

    // Create audit log
    await AuditLog.create({
      orgId,
      userId,
      action: AuditAction.UPDATE,
      entityType: EntityType.LEAD,
      entityId: lead._id,
      before,
      after: lead.toObject(),
      metadata: {
        action: 'assign',
        newOwner: ownerUserId,
      },
    });

    return lead;
  }
}