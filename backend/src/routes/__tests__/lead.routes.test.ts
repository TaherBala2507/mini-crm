import '../../tests/setup';
import request from 'supertest';
import { createApp } from '../../app';
import { Organization } from '../../models/Organization';
import { User } from '../../models/User';
import { Lead } from '../../models/Lead';
import { Role } from '../../models/Role';
import { RoleName } from '../../constants/roles';
import { UserStatus } from '../../constants/enums';
import { generateTestToken } from '../../tests/helpers/testData';
import { Permission } from '../../constants/permissions';
import mongoose from 'mongoose';

const app = createApp();

describe('Lead Routes', () => {
  let testOrgId: mongoose.Types.ObjectId;
  let testUserId: mongoose.Types.ObjectId;
  let testRoleId: mongoose.Types.ObjectId;
  let authToken: string;

  beforeEach(async () => {
    testOrgId = new mongoose.Types.ObjectId();
    testUserId = new mongoose.Types.ObjectId();
    testRoleId = new mongoose.Types.ObjectId();

    await Organization.create({
      _id: testOrgId,
      name: 'Test Org',
      domain: 'test-org',
    });

    await Role.create({
      _id: testRoleId,
      orgId: testOrgId,
      name: RoleName.ADMIN,
      permissions: [
        Permission.LEAD_CREATE,
        Permission.LEAD_VIEW_ALL,
        Permission.LEAD_VIEW_OWN,
        Permission.LEAD_EDIT_ALL,
        Permission.LEAD_EDIT_OWN,
        Permission.LEAD_DELETE_ALL,
        Permission.LEAD_DELETE_OWN,
        Permission.LEAD_ASSIGN,
      ],
      isSystem: true,
    });

    await User.create({
      _id: testUserId,
      orgId: testOrgId,
      name: 'Test User',
      email: 'user@test.com',
      passwordHash: 'Password123!', // Will be hashed by pre-save hook
      status: UserStatus.ACTIVE,
      roleIds: [testRoleId],
    });

    authToken = generateTestToken(testUserId, testOrgId);
  });

  describe('POST /api/leads', () => {
    it('should create a new lead', async () => {
      const response = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Lead Opportunity',
          contactName: 'Test Lead',
          email: 'lead@test.com',
          phone: '+1234567890',
          company: 'Test Company',
          status: 'new',
          source: 'website',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.contactName).toBe('Test Lead');
      expect(response.body.data.email).toBe('lead@test.com');
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .post('/api/leads')
        .send({
          title: 'Test Lead',
          contactName: 'Test Lead',
          company: 'Test Company',
          email: 'lead@test.com',
          source: 'website',
        })
        .expect(401);
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Lead',
          contactName: 'Test Lead',
          company: 'Test Company',
          email: 'invalid-email',
          source: 'website',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it.skip('should return 409 for duplicate email (not implemented - email is not unique)', async () => {
      await Lead.create({
        orgId: testOrgId,
        title: 'Existing Lead Opportunity',
        contactName: 'Existing Lead',
        company: 'Existing Company',
        email: 'duplicate@test.com',
        phone: '+1234567890',
        status: 'new',
        source: 'website',
      });

      const response = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'New Lead Opportunity',
          contactName: 'New Lead',
          company: 'New Company',
          email: 'duplicate@test.com',
          phone: '+9999999999',
          status: 'new',
          source: 'website',
        })
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/leads', () => {
    beforeEach(async () => {
      await Lead.create([
        {
          orgId: testOrgId,
          title: 'Lead 1 Opportunity',
          contactName: 'Lead 1',
          company: 'Company 1',
          email: 'lead1@test.com',
          phone: '+1111111111',
          status: 'new',
          source: 'website',
        },
        {
          orgId: testOrgId,
          title: 'Lead 2 Opportunity',
          contactName: 'Lead 2',
          company: 'Company 2',
          email: 'lead2@test.com',
          phone: '+2222222222',
          status: 'qualified',
          source: 'referral',
        },
        {
          orgId: testOrgId,
          title: 'Lead 3 Opportunity',
          contactName: 'Lead 3',
          company: 'Company 3',
          email: 'lead3@test.com',
          phone: '+3333333333',
          status: 'qualified',
          source: 'website',
        },
      ]);
    });

    it('should get all leads', async () => {
      const response = await request(app)
        .get('/api/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.meta.total).toBe(3);
    });

    it('should filter leads by status', async () => {
      const response = await request(app)
        .get('/api/leads?status=new')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('new');
    });

    it('should filter leads by source', async () => {
      const response = await request(app)
        .get('/api/leads?source=referral')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].source).toBe('referral');
    });

    it('should search leads', async () => {
      const response = await request(app)
        .get('/api/leads?search=Lead 2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].contactName).toBe('Lead 2');
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/leads?page=1&pageSize=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.totalPages).toBe(2);
    });

    it('should return 401 without authentication', async () => {
      await request(app).get('/api/leads').expect(401);
    });
  });

  describe('GET /api/leads/:id', () => {
    it('should get lead by id', async () => {
      const lead = await Lead.create({
        orgId: testOrgId,
        title: 'Test Lead Opportunity',
        contactName: 'Test Lead',
        company: 'Test Company',
        email: 'lead@test.com',
        phone: '+1234567890',
        status: 'new',
        source: 'website',
      });

      const response = await request(app)
        .get(`/api/leads/${lead._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.contactName).toBe('Test Lead');
    });

    it('should return 404 for non-existent lead', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/leads/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app).get(`/api/leads/${fakeId}`).expect(401);
    });
  });

  describe('PATCH /api/leads/:id', () => {
    it('should update lead', async () => {
      const lead = await Lead.create({
        orgId: testOrgId,
        title: 'Test Lead Opportunity',
        contactName: 'Test Lead',
        company: 'Test Company',
        email: 'lead@test.com',
        phone: '+1234567890',
        status: 'new',
        source: 'website',
      });

      const response = await request(app)
        .patch(`/api/leads/${lead._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          contactName: 'Updated Lead',
          status: 'qualified',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.contactName).toBe('Updated Lead');
      expect(response.body.data.status).toBe('qualified');
    });

    it('should return 404 for non-existent lead', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .patch(`/api/leads/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated' })
        .expect(404);
    });

    it('should return 401 without authentication', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .patch(`/api/leads/${fakeId}`)
        .send({ contactName: 'Updated' })
        .expect(401);
    });
  });

  describe('DELETE /api/leads/:id', () => {
    it('should delete lead', async () => {
      const lead = await Lead.create({
        orgId: testOrgId,
        title: 'Test Lead Opportunity',
        contactName: 'Test Lead',
        company: 'Test Company',
        email: 'lead@test.com',
        phone: '+1234567890',
        status: 'new',
        source: 'website',
      });

      const response = await request(app)
        .delete(`/api/leads/${lead._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Soft delete - lead should still exist but have deletedAt set
      const deletedLead = await Lead.findById(lead._id);
      expect(deletedLead).not.toBeNull();
      expect(deletedLead?.deletedAt).toBeDefined();
    });

    it('should return 404 for non-existent lead', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .delete(`/api/leads/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app).delete(`/api/leads/${fakeId}`).expect(401);
    });
  });

  describe('POST /api/leads/:id/assign', () => {
    it('should assign lead to user', async () => {
      const lead = await Lead.create({
        orgId: testOrgId,
        title: 'Test Lead Opportunity',
        contactName: 'Test Lead',
        company: 'Test Company',
        email: 'lead@test.com',
        phone: '+1234567890',
        status: 'new',
        source: 'website',
      });

      const agentRoleId = new mongoose.Types.ObjectId();
      await Role.create({
        _id: agentRoleId,
        orgId: testOrgId,
        name: RoleName.AGENT,
        permissions: [],
        isSystem: true,
      });

      const newUserId = new mongoose.Types.ObjectId();
      await User.create({
        _id: newUserId,
        orgId: testOrgId,
        name: 'Agent User',
        email: 'agent@test.com',
        passwordHash: 'Password123!', // Will be hashed by pre-save hook
        status: UserStatus.ACTIVE,
        roleIds: [agentRoleId],
      });

      const response = await request(app)
        .post(`/api/leads/${lead._id}/assign`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ownerUserId: newUserId.toString() })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.ownerUserId.toString()).toBe(newUserId.toString());
    });

    it('should return 404 for non-existent user', async () => {
      const lead = await Lead.create({
        orgId: testOrgId,
        title: 'Test Lead Opportunity',
        contactName: 'Test Lead',
        company: 'Test Company',
        email: 'lead@test.com',
        phone: '+1234567890',
        status: 'new',
        source: 'website',
      });

      const fakeUserId = new mongoose.Types.ObjectId();

      await request(app)
        .post(`/api/leads/${lead._id}/assign`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ownerUserId: fakeUserId.toString() })
        .expect(404);
    });
  });
});