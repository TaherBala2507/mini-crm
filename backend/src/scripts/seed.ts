import { connectDatabase, disconnectDatabase } from '../config/database';
import { Organization } from '../models/Organization';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { Lead } from '../models/Lead';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { Note } from '../models/Note';
import { RoleName, ROLE_PERMISSIONS, ROLE_DESCRIPTIONS } from '../constants/roles';
import { UserStatus, LeadStatus, LeadSource, ProjectStatus, TaskStatus, TaskPriority, EntityType } from '../constants/enums';
import { logger } from '../utils/logger';

const DEMO_PASSWORD = 'Passw0rd!';

async function seed() {
  try {
    await connectDatabase();

    logger.info('🌱 Starting database seed...');

    // Clear existing data
    logger.info('Clearing existing data...');
    await Promise.all([
      Organization.deleteMany({}),
      User.deleteMany({}),
      Role.deleteMany({}),
      Lead.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      Note.deleteMany({}),
    ]);

    // Create demo organization
    logger.info('Creating demo organization...');
    const org = await Organization.create({
      name: 'Acme Corp',
      domain: 'acme',
      status: 'active',
    });

    // Create roles
    logger.info('Creating roles...');
    const roles = await Promise.all(
      Object.values(RoleName).map((roleName) =>
        Role.create({
          orgId: org._id,
          name: roleName,
          description: ROLE_DESCRIPTIONS[roleName],
          permissions: ROLE_PERMISSIONS[roleName],
          isSystem: true,
        })
      )
    );

    const roleMap = new Map(roles.map((role) => [role.name, role]));

    // Create demo users
    logger.info('Creating demo users...');
    const users = await Promise.all([
      User.create({
        orgId: org._id,
        name: 'Super Admin',
        email: 'superadmin@acme.test',
        passwordHash: DEMO_PASSWORD,
        status: UserStatus.ACTIVE,
        roleIds: [roleMap.get(RoleName.SUPER_ADMIN)!._id],
      }),
      User.create({
        orgId: org._id,
        name: 'Admin User',
        email: 'admin@acme.test',
        passwordHash: DEMO_PASSWORD,
        status: UserStatus.ACTIVE,
        roleIds: [roleMap.get(RoleName.ADMIN)!._id],
      }),
      User.create({
        orgId: org._id,
        name: 'Manager User',
        email: 'manager@acme.test',
        passwordHash: DEMO_PASSWORD,
        status: UserStatus.ACTIVE,
        roleIds: [roleMap.get(RoleName.MANAGER)!._id],
      }),
      User.create({
        orgId: org._id,
        name: 'Agent User',
        email: 'agent@acme.test',
        passwordHash: DEMO_PASSWORD,
        status: UserStatus.ACTIVE,
        roleIds: [roleMap.get(RoleName.AGENT)!._id],
      }),
      User.create({
        orgId: org._id,
        name: 'Auditor User',
        email: 'auditor@acme.test',
        passwordHash: DEMO_PASSWORD,
        status: UserStatus.ACTIVE,
        roleIds: [roleMap.get(RoleName.AUDITOR)!._id],
      }),
    ]);

    const [_superAdmin, admin, manager, agent, _auditor] = users;

    // Create demo leads
    logger.info('Creating demo leads...');
    const leadData = [
      {
        title: 'Enterprise Software Solution',
        company: 'TechCorp Inc',
        contactName: 'John Smith',
        email: 'john@techcorp.com',
        phone: '+1-555-0101',
        source: LeadSource.WEBSITE,
        status: LeadStatus.NEW,
        ownerUserId: agent._id,
      },
      {
        title: 'Cloud Migration Project',
        company: 'DataSystems Ltd',
        contactName: 'Sarah Johnson',
        email: 'sarah@datasystems.com',
        phone: '+1-555-0102',
        source: LeadSource.REFERRAL,
        status: LeadStatus.QUALIFIED,
        ownerUserId: manager._id,
      },
      {
        title: 'Mobile App Development',
        company: 'StartupXYZ',
        contactName: 'Mike Brown',
        email: 'mike@startupxyz.com',
        source: LeadSource.ADS,
        status: LeadStatus.NEW,
        ownerUserId: agent._id,
      },
      {
        title: 'CRM Implementation',
        company: 'SalesPro Inc',
        contactName: 'Emily Davis',
        email: 'emily@salespro.com',
        phone: '+1-555-0104',
        source: LeadSource.EVENT,
        status: LeadStatus.WON,
        ownerUserId: admin._id,
      },
      {
        title: 'Data Analytics Platform',
        company: 'Analytics Co',
        contactName: 'David Wilson',
        email: 'david@analytics.co',
        source: LeadSource.WEBSITE,
        status: LeadStatus.QUALIFIED,
        ownerUserId: manager._id,
      },
    ];

    const leads = await Lead.create(
      leadData.map((lead) => ({ ...lead, orgId: org._id }))
    );

    // Create demo projects
    logger.info('Creating demo projects...');
    const projectData = [
      {
        name: 'Website Redesign',
        description: 'Complete redesign of corporate website with modern UI/UX',
        client: 'TechCorp Inc',
        status: ProjectStatus.ACTIVE,
        leadId: leads[0]._id,
        budget: 50000,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-04-15'),
        managerUserId: manager._id,
        members: [
          { userId: manager._id, role: 'Project Manager', addedAt: new Date() },
          { userId: agent._id, role: 'Developer', addedAt: new Date() },
        ],
      },
      {
        name: 'Mobile App v2.0',
        description: 'Second version of mobile application with enhanced features',
        client: 'StartupXYZ',
        status: ProjectStatus.ACTIVE,
        leadId: leads[2]._id,
        budget: 75000,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-05-31'),
        managerUserId: manager._id,
        members: [
          { userId: manager._id, role: 'Project Manager', addedAt: new Date() },
          { userId: agent._id, role: 'Mobile Developer', addedAt: new Date() },
        ],
      },
      {
        name: 'CRM Integration',
        description: 'Integration of CRM system with existing infrastructure',
        client: 'SalesPro Inc',
        status: ProjectStatus.COMPLETED,
        leadId: leads[3]._id,
        budget: 30000,
        startDate: new Date('2023-11-01'),
        endDate: new Date('2024-01-31'),
        managerUserId: admin._id,
        members: [
          { userId: admin._id, role: 'Technical Lead', addedAt: new Date() },
          { userId: agent._id, role: 'Integration Specialist', addedAt: new Date() },
        ],
      },
      {
        name: 'Cloud Infrastructure',
        description: 'Migration to cloud infrastructure and setup',
        client: 'DataSystems Ltd',
        status: ProjectStatus.ON_HOLD,
        leadId: leads[1]._id,
        budget: 100000,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        managerUserId: manager._id,
        members: [
          { userId: manager._id, role: 'Project Manager', addedAt: new Date() },
        ],
      },
      {
        name: 'Analytics Dashboard',
        description: 'Custom analytics dashboard with real-time data visualization',
        client: 'Analytics Co',
        status: ProjectStatus.ACTIVE,
        leadId: leads[4]._id,
        budget: 45000,
        startDate: new Date('2024-02-10'),
        endDate: new Date('2024-04-30'),
        managerUserId: manager._id,
        members: [
          { userId: manager._id, role: 'Project Manager', addedAt: new Date() },
          { userId: agent._id, role: 'Frontend Developer', addedAt: new Date() },
        ],
      },
    ];

    const projects = await Project.create(
      projectData.map((project) => ({ ...project, orgId: org._id }))
    );

    // Create demo tasks
    logger.info('Creating demo tasks...');
    const taskData = [
      {
        projectId: projects[0]._id,
        title: 'Design homepage mockup',
        description: 'Create initial design mockups for the new homepage',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        assigneeUserId: agent._id,
        dueDate: new Date('2024-02-15'),
      },
      {
        projectId: projects[0]._id,
        title: 'Implement responsive navigation',
        description: 'Build mobile-responsive navigation component',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        assigneeUserId: agent._id,
        dueDate: new Date('2024-02-20'),
      },
      {
        projectId: projects[0]._id,
        title: 'Setup CI/CD pipeline',
        description: 'Configure automated deployment pipeline',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        assigneeUserId: manager._id,
        dueDate: new Date('2024-02-25'),
      },
      {
        projectId: projects[1]._id,
        title: 'User authentication flow',
        description: 'Implement login and registration',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.URGENT,
        assigneeUserId: agent._id,
        dueDate: new Date('2024-02-18'),
      },
      {
        projectId: projects[1]._id,
        title: 'Push notifications',
        description: 'Setup push notification service',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        assigneeUserId: agent._id,
        dueDate: new Date('2024-03-01'),
      },
      {
        projectId: projects[2]._id,
        title: 'Data migration',
        description: 'Migrate existing customer data',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        assigneeUserId: admin._id,
        dueDate: new Date('2024-01-30'),
      },
      {
        projectId: projects[4]._id,
        title: 'Chart components',
        description: 'Build reusable chart components',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        assigneeUserId: agent._id,
        dueDate: new Date('2024-02-22'),
      },
      {
        projectId: projects[4]._id,
        title: 'API integration',
        description: 'Connect to analytics API',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        assigneeUserId: manager._id,
        dueDate: new Date('2024-02-28'),
      },
    ];

    const tasks = await Task.create(
      taskData.map((task) => ({ ...task, orgId: org._id }))
    );

    // Create demo notes
    logger.info('Creating demo notes...');
    const noteData = [
      // Lead notes
      {
        entityType: EntityType.LEAD,
        entityId: leads[0]._id,
        authorUserId: agent._id,
        body: 'Initial contact made via phone. Client is interested in our enterprise solution.',
      },
      {
        entityType: EntityType.LEAD,
        entityId: leads[0]._id,
        authorUserId: manager._id,
        body: 'Scheduled demo for next week. Prepare presentation materials.',
      },
      {
        entityType: EntityType.LEAD,
        entityId: leads[1]._id,
        authorUserId: admin._id,
        body: 'Client has budget approved. Moving forward with proposal.',
      },
      {
        entityType: EntityType.LEAD,
        entityId: leads[2]._id,
        authorUserId: agent._id,
        body: 'Follow-up email sent with pricing details.',
      },
      // Project notes
      {
        entityType: EntityType.PROJECT,
        entityId: projects[0]._id,
        authorUserId: admin._id,
        body: 'Project kickoff meeting completed. All stakeholders aligned on timeline.',
      },
      {
        entityType: EntityType.PROJECT,
        entityId: projects[0]._id,
        authorUserId: agent._id,
        body: 'Design mockups approved by client. Moving to development phase.',
      },
      {
        entityType: EntityType.PROJECT,
        entityId: projects[1]._id,
        authorUserId: manager._id,
        body: 'Backend API development in progress. Expected completion by end of month.',
      },
      {
        entityType: EntityType.PROJECT,
        entityId: projects[4]._id,
        authorUserId: agent._id,
        body: 'Client requested additional chart types. Updating requirements.',
      },
      // Task notes
      {
        entityType: EntityType.TASK,
        entityId: tasks[0]._id,
        authorUserId: agent._id,
        body: 'Mockups completed and shared with team for review.',
      },
      {
        entityType: EntityType.TASK,
        entityId: tasks[1]._id,
        authorUserId: agent._id,
        body: 'Navigation component 80% complete. Testing on mobile devices.',
      },
      {
        entityType: EntityType.TASK,
        entityId: tasks[3]._id,
        authorUserId: agent._id,
        body: 'Implementing OAuth2 authentication. JWT tokens configured.',
      },
      {
        entityType: EntityType.TASK,
        entityId: tasks[7]._id,
        authorUserId: agent._id,
        body: 'Chart library integrated. Working on data binding.',
      },
    ];

    await Note.create(
      noteData.map((note) => ({ ...note, orgId: org._id }))
    );

    logger.info('✅ Database seeded successfully!');
    logger.info('\n📋 Demo Credentials:');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('Organization: Acme Corp (domain: acme)');
    logger.info('Password for all users: Passw0rd!');
    logger.info('');
    logger.info('SuperAdmin: superadmin@acme.test');
    logger.info('Admin:      admin@acme.test');
    logger.info('Manager:    manager@acme.test');
    logger.info('Agent:      agent@acme.test');
    logger.info('Auditor:    auditor@acme.test');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info(`\n📊 Created:`);
    logger.info(`  - 1 Organization`);
    logger.info(`  - 5 Roles`);
    logger.info(`  - 5 Users`);
    logger.info(`  - ${leads.length} Leads`);
    logger.info(`  - ${projects.length} Projects`);
    logger.info(`  - ${taskData.length} Tasks`);
    logger.info(`  - ${noteData.length} Notes`);

    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database:', error);
    await disconnectDatabase();
    process.exit(1);
  }
}

seed();