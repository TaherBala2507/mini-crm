# Mini CRM - Quick Start Guide

Get the Mini CRM system up and running in 5 minutes!

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Git

## 🚀 Quick Setup

### 1. Clone & Install

```bash
# Navigate to project directory
cd "c:\Users\fatem\Desktop\Client Projects\mini-crm"

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend** (`backend/.env`):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mini-crm
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Mini CRM
```

### 3. Start the Application

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```
✅ Backend running on **http://localhost:5000**

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```
✅ Frontend running on **http://localhost:3000**

### 4. Create Your First Account

1. Open browser: **http://localhost:3000**
2. Click **"Sign up"**
3. Fill in the registration form:
   - **Organization Name**: Your Company Name
   - **Organization Domain**: yourcompany (unique identifier)
   - **Full Name**: Your Name
   - **Email**: your@email.com
   - **Password**: SecurePass123! (min 8 characters)
4. Click **"Create Account"**
5. 🎉 You're in! You'll be redirected to the dashboard

## 🎯 What You Can Do Now

### ✅ Currently Working

1. **Authentication**
   - ✅ Register new organization
   - ✅ Login/Logout
   - ✅ Forgot/Reset password
   - ✅ Automatic token refresh

2. **Navigation**
   - ✅ Dashboard
   - ✅ Leads (placeholder)
   - ✅ Projects (placeholder)
   - ✅ Tasks (placeholder)
   - ✅ Users (placeholder)
   - ✅ Roles (placeholder)
   - ✅ Settings (placeholder)

3. **Security**
   - ✅ Role-based access control
   - ✅ Permission-based UI
   - ✅ Protected routes

### 🚧 Coming Soon

- Lead management (CRUD, filters, assignment)
- Project management (CRUD, members)
- Task management (CRUD, Kanban board)
- User management (invite, roles)
- Role management (custom roles, permissions)
- Dashboard analytics
- Notes and attachments

## 🧪 Testing with Postman

### Import Collection

1. Open Postman
2. Click **Import**
3. Select: `Mini-CRM-Complete-API.postman_collection.json`
4. Click **Import**

### Test the API

1. **Register Organization**:
   - Navigate to: **Auth > Register Organization**
   - Click **Send**
   - ✅ Tokens are auto-saved

2. **Create a Lead**:
   - Navigate to: **Leads > Create Lead**
   - Click **Send**
   - ✅ Lead ID is auto-saved

3. **Get All Leads**:
   - Navigate to: **Leads > Get All Leads**
   - Click **Send**
   - ✅ See your created lead

See `POSTMAN_GUIDE.md` for detailed testing instructions.

## 📚 Documentation

- **Backend API**: `backend/API_DOCUMENTATION.md` - Complete API reference
- **Backend README**: `backend/README.md` - Backend setup and architecture
- **Frontend README**: `frontend/README.md` - Frontend setup and architecture
- **Postman Guide**: `POSTMAN_GUIDE.md` - API testing guide
- **Test Coverage**: `backend/TEST_FIXES_SUMMARY.md` - Testing documentation

## 🔧 Common Commands

### Backend

```bash
# Development
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build

# Start production server
npm start
```

### Frontend

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🐛 Troubleshooting

### Backend won't start

**Issue**: MongoDB connection error
```
Solution:
1. Ensure MongoDB is running
2. Check MONGODB_URI in backend/.env
3. For local MongoDB: mongodb://localhost:27017/mini-crm
4. For MongoDB Atlas: Use your connection string
```

**Issue**: Port 5000 already in use
```
Solution:
1. Change PORT in backend/.env to 5001
2. Update VITE_API_BASE_URL in frontend/.env to http://localhost:5001/api
3. Restart both servers
```

### Frontend won't start

**Issue**: Cannot connect to backend
```
Solution:
1. Ensure backend is running on http://localhost:5000
2. Check VITE_API_BASE_URL in frontend/.env
3. Check browser console for errors
```

**Issue**: Module not found errors
```
Solution:
1. Delete node_modules folder
2. Run: npm install
3. Restart dev server
```

### Authentication issues

**Issue**: "Unauthorized" errors
```
Solution:
1. Clear browser localStorage
2. Login again
3. Check if JWT_SECRET is set in backend/.env
```

**Issue**: Token refresh not working
```
Solution:
1. Check JWT_REFRESH_SECRET in backend/.env
2. Clear localStorage and login again
3. Check browser console for errors
```

## 📊 Project Status

### Backend ✅ COMPLETE

- ✅ 50/50 tests passing
- ✅ 98.33% code coverage
- ✅ 54 API endpoints
- ✅ Complete RBAC system
- ✅ Comprehensive documentation

### Frontend ✅ INITIALIZED

- ✅ Project setup complete
- ✅ Authentication working
- ✅ Routing configured
- ✅ API client ready
- ✅ UI framework integrated
- 🚧 CRUD pages in progress

## 🎯 Next Steps

1. **Implement Lead Management**
   - Create lead form
   - Leads list with filters
   - Lead details page
   - Assign leads to users

2. **Implement Project Management**
   - Create project form
   - Projects list
   - Project details with tasks
   - Member management

3. **Implement Task Management**
   - Create task form
   - Tasks list
   - Kanban board
   - Task assignment

4. **Implement User Management**
   - Invite users
   - User list
   - Update user roles
   - Deactivate users

5. **Implement Dashboard**
   - Analytics widgets
   - Charts and graphs
   - Recent activity
   - Quick actions

## 🌟 Features Highlights

### Backend

- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Multi-tenancy**: Organization-based data isolation
- **Audit Logging**: Track all changes
- **File Uploads**: Support for attachments
- **Analytics**: Comprehensive reporting
- **Testing**: 98.33% code coverage

### Frontend

- **Modern Stack**: React 18 + TypeScript + Vite
- **UI Library**: Material-UI (MUI)
- **State Management**: React Query + Context API
- **Routing**: React Router with protected routes
- **Type Safety**: Full TypeScript support
- **Responsive**: Mobile-friendly design
- **Auto Token Refresh**: Seamless authentication

## 📞 Support

For issues or questions:
- Check the documentation files
- Review error messages in console
- Verify environment variables
- Ensure all services are running

## 🎉 You're All Set!

Your Mini CRM system is now running. Start by:
1. Creating your organization account
2. Exploring the dashboard
3. Testing the API with Postman
4. Implementing the CRUD pages

Happy coding! 🚀
