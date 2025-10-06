# Role Management - User Guide

## 📖 Quick Start Guide

This guide will help you understand and use the Role Management module effectively.

---

## 🎯 What is Role Management?

Role Management allows you to:
- Create custom roles for your organization
- Assign specific permissions to each role
- Control what users can see and do in the CRM
- Maintain security through granular access control

---

## 🔐 Permission Categories

### 1. **Leads** (5 permissions)
- `leads:read` - View leads
- `leads:create` - Create new leads
- `leads:update` - Edit existing leads
- `leads:delete` - Delete leads
- `leads:assign` - Assign leads to users

### 2. **Projects** (5 permissions)
- `projects:read` - View projects
- `projects:create` - Create new projects
- `projects:update` - Edit existing projects
- `projects:delete` - Delete projects
- `projects:manage_members` - Add/remove project members

### 3. **Tasks** (5 permissions)
- `tasks:read` - View tasks
- `tasks:create` - Create new tasks
- `tasks:update` - Edit existing tasks
- `tasks:delete` - Delete tasks
- `tasks:assign` - Assign tasks to users

### 4. **Users** (4 permissions)
- `users:read` - View user list
- `users:invite` - Invite new users
- `users:update` - Edit user information
- `users:delete` - Delete/deactivate users

### 5. **Roles** (4 permissions)
- `roles:read` - View roles
- `roles:create` - Create new roles
- `roles:update` - Edit existing roles
- `roles:delete` - Delete custom roles

### 6. **Organization** (2 permissions)
- `organization:read` - View organization settings
- `organization:update` - Edit organization settings

### 7. **Analytics** (1 permission)
- `analytics:read` - View analytics and reports

### 8. **Audit Logs** (1 permission)
- `audit_logs:read` - View audit logs

---

## 🏷️ System Roles (Pre-defined)

### SuperAdmin
- **Description**: Full system access
- **Permissions**: ALL permissions
- **Use Case**: Organization owner, IT administrators
- **Protected**: Cannot be edited or deleted

### Admin
- **Description**: Administrative access
- **Permissions**: Most permissions except system-critical ones
- **Use Case**: Department heads, senior managers
- **Protected**: Cannot be edited or deleted

### Manager
- **Description**: Team management access
- **Permissions**: Read/write for leads, projects, tasks
- **Use Case**: Team leaders, project managers
- **Protected**: Cannot be edited or deleted

### Member
- **Description**: Basic user access
- **Permissions**: Read access to most resources
- **Use Case**: Regular employees, team members
- **Protected**: Cannot be edited or deleted

---

## 📋 Common Use Cases

### Use Case 1: Sales Representative Role

**Scenario**: You want sales reps to manage leads but not access projects or users.

**Steps**:
1. Click "Create Role"
2. Name: "Sales Representative"
3. Description: "Manages leads and converts them to projects"
4. Select permissions:
   - ✅ Leads: read, create, update, assign
   - ✅ Analytics: read
5. Click "Create Role"

**Result**: Sales reps can work with leads but cannot access other modules.

---

### Use Case 2: Project Coordinator Role

**Scenario**: You need someone to manage projects and tasks but not leads or users.

**Steps**:
1. Click "Create Role"
2. Name: "Project Coordinator"
3. Description: "Coordinates projects and assigns tasks"
4. Select permissions:
   - ✅ Projects: read, create, update, manage_members
   - ✅ Tasks: read, create, update, assign
   - ✅ Analytics: read
5. Click "Create Role"

**Result**: Coordinators can manage projects and tasks independently.

---

### Use Case 3: Read-Only Auditor Role

**Scenario**: External auditor needs to view everything but not make changes.

**Steps**:
1. Click "Create Role"
2. Name: "Auditor"
3. Description: "Read-only access for auditing purposes"
4. Select permissions:
   - ✅ Leads: read
   - ✅ Projects: read
   - ✅ Tasks: read
   - ✅ Users: read
   - ✅ Analytics: read
   - ✅ Audit Logs: read
5. Click "Create Role"

**Result**: Auditor can view all data but cannot modify anything.

---

### Use Case 4: HR Manager Role

**Scenario**: HR needs to manage users but not access business operations.

**Steps**:
1. Click "Create Role"
2. Name: "HR Manager"
3. Description: "Manages user accounts and roles"
4. Select permissions:
   - ✅ Users: read, invite, update, delete
   - ✅ Roles: read, create, update, delete
   - ✅ Organization: read, update
   - ✅ Audit Logs: read
5. Click "Create Role"

**Result**: HR can manage users and roles without accessing business data.

---

## 🎨 UI Components Explained

### 1. Roles List Table

```
┌─────────────────────────────────────────────────────────────────┐
│ Role Name    │ Description │ Permissions │ Type   │ Actions    │
├─────────────────────────────────────────────────────────────────┤
│ 🔒 SuperAdmin│ Full access │ 27 perms    │ System │ 👁️         │
│ Sales Rep    │ Manages...  │ 5 perms     │ Custom │ 👁️ ✏️ 🗑️   │
└─────────────────────────────────────────────────────────────────┘
```

**Icons**:
- 🔒 = System role (protected)
- 👁️ = View details
- ✏️ = Edit role
- 🗑️ = Delete role

---

### 2. Create/Edit Role Form

```
┌─────────────────────────────────────────┐
│ Create New Role                         │
├─────────────────────────────────────────┤
│ Role Name: [________________]           │
│ Description: [________________]         │
│                                         │
│ Permissions (5 selected)                │
│                                         │
│ ▼ Leads (5)                            │
│   ☑️ read                               │
│   ☑️ create                             │
│   ☑️ update                             │
│   ☐ delete                              │
│   ☐ assign                              │
│                                         │
│ ▶ Projects (5)                         │
│ ▶ Tasks (5)                            │
│                                         │
│ [Cancel] [Create Role]                  │
└─────────────────────────────────────────┘
```

**Features**:
- Click category header to expand/collapse
- Click category checkbox to select all
- Individual checkboxes for granular control
- Counter shows selected permissions

---

### 3. Role Details Dialog

```
┌─────────────────────────────────────────┐
│ 🔒 SuperAdmin [System Role]            │
├─────────────────────────────────────────┤
│ Description: Full system access         │
│                                         │
│ Created: 2024-01-15 10:30 AM           │
│ Updated: 2024-01-15 10:30 AM           │
│ Total Permissions: 27                   │
│                                         │
│ Permissions:                            │
│                                         │
│ ✅ Leads (5/5)                         │
│ [read] [create] [update] [delete]...   │
│                                         │
│ ✅ Projects (5/5)                      │
│ [read] [create] [update] [delete]...   │
│                                         │
│ [Close]                                 │
└─────────────────────────────────────────┘
```

---

## ⚠️ Important Notes

### System Role Protection
- System roles (SuperAdmin, Admin, Manager, Member) **cannot be edited**
- System roles **cannot be deleted**
- This ensures system stability and prevents accidental lockouts

### Permission Requirements
- You need `roles:read` to view roles
- You need `roles:create` to create new roles
- You need `roles:update` to edit roles
- You need `roles:delete` to delete roles

### Best Practices
1. **Start with least privilege**: Give users minimum permissions needed
2. **Use descriptive names**: Make role names clear and self-explanatory
3. **Add descriptions**: Explain what each role is for
4. **Review regularly**: Audit roles and permissions periodically
5. **Test before assigning**: Create and test roles before assigning to users
6. **Document changes**: Keep track of why roles were created/modified

---

## 🐛 Troubleshooting

### Problem: "Create Role" button not visible
**Solution**: You need `roles:create` permission. Contact your administrator.

### Problem: Cannot edit a role
**Solution**: 
- Check if it's a system role (has lock icon) - these cannot be edited
- Verify you have `roles:update` permission

### Problem: Cannot delete a role
**Solution**:
- System roles cannot be deleted
- Check if you have `roles:delete` permission
- Ensure no users are currently assigned to this role

### Problem: Permission not showing in list
**Solution**: The permission might not exist in the backend. Contact your system administrator.

### Problem: Changes not saving
**Solution**:
- Check your internet connection
- Verify you have the required permissions
- Check browser console for errors
- Try refreshing the page

---

## 📞 Support

If you encounter issues not covered in this guide:
1. Check the browser console for error messages
2. Verify your permissions with your administrator
3. Contact your system administrator or IT support
4. Refer to the technical documentation

---

## 🎓 Training Checklist

Use this checklist to ensure you understand role management:

- [ ] I understand what roles and permissions are
- [ ] I can view the list of roles
- [ ] I can create a new custom role
- [ ] I can assign permissions to a role
- [ ] I can edit an existing custom role
- [ ] I can delete a custom role
- [ ] I understand why system roles are protected
- [ ] I know how to view role details
- [ ] I understand permission categories
- [ ] I can create roles for common use cases

---

## 🚀 Quick Reference

| Action | Steps |
|--------|-------|
| **Create Role** | Click "Create Role" → Fill form → Select permissions → Submit |
| **Edit Role** | Click ✏️ icon → Modify fields → Submit |
| **Delete Role** | Click 🗑️ icon → Confirm deletion |
| **View Details** | Click 👁️ icon → Review information → Close |
| **Select All in Category** | Click category checkbox |
| **Select Individual Permission** | Click permission checkbox |

---

## 📊 Permission Matrix Example

| Role | Leads | Projects | Tasks | Users | Roles | Analytics |
|------|-------|----------|-------|-------|-------|-----------|
| SuperAdmin | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All |
| Sales Rep | ✅ CRUD | ❌ None | ❌ None | ❌ None | ❌ None | ✅ Read |
| Project Coordinator | ❌ None | ✅ CRUD | ✅ CRUD | ❌ None | ❌ None | ✅ Read |
| HR Manager | ❌ None | ❌ None | ❌ None | ✅ CRUD | ✅ CRUD | ❌ None |
| Auditor | ✅ Read | ✅ Read | ✅ Read | ✅ Read | ✅ Read | ✅ Read |

---

**Last Updated**: January 2024  
**Version**: 1.0  
**Module**: Role Management