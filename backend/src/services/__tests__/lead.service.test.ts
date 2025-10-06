import '../../tests/setup';
import { LeadService } from '../lead.service';
import { Organization } from '../../models/Organization';
import { User } from '../../models/User';
import { Lead } from '../../models/Lead';
import { LeadStatus, LeadSource, UserStatus } from '../../constants/enums';
import { AppError } from '../../utils/errors';
import { Permission } from '../../constants/permissions';
import mongoose from 'mongoose';

describe('LeadService', () => {
  let leadService: LeadService;
  let testOrgId: mongoose.Types.ObjectId;
  let testUserId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    leadService = new LeadService();
    testOrgId = new mongoose.Types.ObjectId();
    testUserId = new mongoose.Types.ObjectId();

    await Organization.create({
      _id: testOrgId,
      name: 'Test Org',
      domain: 'test-org',
    });

    await User.create({
      _id: testUserId,
      orgId: testOrgId,
      name: 'Test User',
      email: 'test@test.com',
      passwordHash: 'Password123!', // Will be hashed by pre-save hook
      status: UserStatus.ACTIVE,
      roleIds: [],
      isEmailVerified: true,
    });
  });

  describe('createLead', () => {
    it('should create a new lead', async () => {
      const leadData = {
        title: 'Test Lead',
        company: 'Test Company',
        contactName: 'John Doe',
        email: 'john@test.com',
        phone: '+1234567890',
        source: LeadSource.WEBSITE,
        status: LeadStatus.NEW,
      };

      const result = await leadService.createLead(
        leadData,
        testOrgId.toString(),
        testUserId.toString(),
        [Permission.LEAD_CREATE]
      );

      expect(result.title).toBe(leadData.title);
      expect(result.company).toBe(leadData.company);
      expect(result.orgId.toString()).toBe(testOrgId.toString());
    });
  });

  describe('listLeads', () => {
    beforeEach(async () => {
      await Lead.create([
        {
          orgId: testOrgId,
          title: 'Lead 1',
          company: 'Company 1',
          contactName: 'Contact 1',
          source: LeadSource.WEBSITE,
          status: LeadStatus.NEW,
        },
        {
          orgId: testOrgId,
          title: 'Lead 2',
          company: 'Company 2',
          contactName: 'Contact 2',
          source: LeadSource.REFERRAL,
          status: LeadStatus.QUALIFIED,
        },
        {
          orgId: testOrgId,
          title: 'Lead 3',
          company: 'Company 3',
          contactName: 'Contact 3',
          source: LeadSource.WEBSITE,
          status: LeadStatus.NEW,
        },
      ]);
    });

    it('should list all leads', async () => {
      const result = await leadService.listLeads(
        {
          page: 1,
          pageSize: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        },
        testOrgId.toString(),
        testUserId.toString(),
        [Permission.LEAD_VIEW_ALL]
      );

      expect(result.leads).toHaveLength(3);
      expect(result.total).toBe(3);
    });

    it('should filter leads by status', async () => {
      const result = await leadService.listLeads(
        {
          page: 1,
          pageSize: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc',
          status: LeadStatus.NEW,
        },
        testOrgId.toString(),
        testUserId.toString(),
        [Permission.LEAD_VIEW_ALL]
      );

      expect(result.leads).toHaveLength(2);
      expect(result.leads.every(lead => lead.status === LeadStatus.NEW)).toBe(true);
    });

    it('should filter leads by source', async () => {
      const result = await leadService.listLeads(
        {
          page: 1,
          pageSize: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc',
          source: LeadSource.REFERRAL,
        },
        testOrgId.toString(),
        testUserId.toString(),
        [Permission.LEAD_VIEW_ALL]
      );

      expect(result.leads).toHaveLength(1);
      expect(result.leads[0].source).toBe(LeadSource.REFERRAL);
    });

    it('should paginate results', async () => {
      const result = await leadService.listLeads(
        {
          page: 1,
          pageSize: 2,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        },
        testOrgId.toString(),
        testUserId.toString(),
        [Permission.LEAD_VIEW_ALL]
      );

      expect(result.leads).toHaveLength(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(2);
      expect(result.total).toBe(3);
    });
  });

  describe('getLeadById', () => {
    it('should get lead by id', async () => {
      const lead = await Lead.create({
        orgId: testOrgId,
        title: 'Test Lead',
        company: 'Test Company',
        contactName: 'John Doe',
        source: LeadSource.WEBSITE,
        status: LeadStatus.NEW,
      });

      const result = await leadService.getLeadById(
        lead._id.toString(),
        testOrgId.toString(),
        testUserId.toString(),
        [Permission.LEAD_VIEW_ALL]
      );

      expect(result._id.toString()).toBe(lead._id.toString());
      expect(result.title).toBe('Test Lead');
    });

    it('should throw error if lead not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await expect(
        leadService.getLeadById(
          fakeId.toString(),
          testOrgId.toString(),
          testUserId.toString(),
          [Permission.LEAD_VIEW_ALL]
        )
      ).rejects.toThrow(AppError);
    });
  });

  describe('updateLead', () => {
    it('should update lead', async () => {
      const lead = await Lead.create({
        orgId: testOrgId,
        title: 'Test Lead',
        company: 'Test Company',
        contactName: 'John Doe',
        source: LeadSource.WEBSITE,
        status: LeadStatus.NEW,
      });

      const updateData = {
        title: 'Updated Lead',
        status: LeadStatus.QUALIFIED,
      };

      const result = await leadService.updateLead(
        lead._id.toString(),
        updateData,
        testOrgId.toString(),
        testUserId.toString(),
        [Permission.LEAD_EDIT_ALL]
      );

      expect(result.title).toBe('Updated Lead');
      expect(result.status).toBe(LeadStatus.QUALIFIED);
    });

    it('should throw error if lead not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await expect(
        leadService.updateLead(
          fakeId.toString(),
          { title: 'Updated' },
          testOrgId.toString(),
          testUserId.toString(),
          [Permission.LEAD_EDIT_ALL]
        )
      ).rejects.toThrow(AppError);
    });
  });

  describe('deleteLead', () => {
    it('should soft delete lead', async () => {
      const lead = await Lead.create({
        orgId: testOrgId,
        title: 'Test Lead',
        company: 'Test Company',
        contactName: 'John Doe',
        source: LeadSource.WEBSITE,
        status: LeadStatus.NEW,
      });

      await leadService.deleteLead(
        lead._id.toString(),
        testOrgId.toString(),
        testUserId.toString(),
        [Permission.LEAD_DELETE_ALL]
      );

      const deletedLead = await Lead.findById(lead._id);
      expect(deletedLead?.deletedAt).toBeDefined();
    });

    it('should throw error if lead not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await expect(
        leadService.deleteLead(
          fakeId.toString(),
          testOrgId.toString(),
          testUserId.toString(),
          [Permission.LEAD_DELETE_ALL]
        )
      ).rejects.toThrow(AppError);
    });
  });

  describe('assignLead', () => {
    it('should assign lead to user', async () => {
      const newUserId = new mongoose.Types.ObjectId();
      
      await User.create({
        _id: newUserId,
        orgId: testOrgId,
        name: 'New User',
        email: 'newuser@test.com',
        passwordHash: 'Password123!', // Will be hashed by pre-save hook
        status: UserStatus.ACTIVE,
        roleIds: [],
        isEmailVerified: true,
      });

      const lead = await Lead.create({
        orgId: testOrgId,
        title: 'Test Lead',
        company: 'Test Company',
        contactName: 'John Doe',
        source: LeadSource.WEBSITE,
        status: LeadStatus.NEW,
      });

      const result = await leadService.assignLead(
        lead._id.toString(),
        newUserId.toString(),
        testOrgId.toString(),
        testUserId.toString()
      );

      expect(result.ownerUserId?.toString()).toBe(newUserId.toString());
    });

    it('should throw error if user not found', async () => {
      const lead = await Lead.create({
        orgId: testOrgId,
        title: 'Test Lead',
        company: 'Test Company',
        contactName: 'John Doe',
        source: LeadSource.WEBSITE,
        status: LeadStatus.NEW,
      });

      const fakeUserId = new mongoose.Types.ObjectId();

      await expect(
        leadService.assignLead(
          lead._id.toString(),
          fakeUserId.toString(),
          testOrgId.toString(),
          testUserId.toString()
        )
      ).rejects.toThrow(AppError);
    });
  });
});