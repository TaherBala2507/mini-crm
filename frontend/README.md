# Mini CRM - Frontend

A modern, production-ready React frontend for the Mini CRM/PMS system built with TypeScript, Material-UI, and React Query.

## 🚀 Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v6
- **State Management**: 
  - React Query (TanStack Query) for server state
  - React Context API for client state
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Validation**: Zod

## 📁 Project Structure

```
src/
├── api/                    # API client and service modules
│   ├── client.ts          # Axios instance with interceptors
│   ├── auth.ts            # Authentication endpoints
│   ├── leads.ts           # Lead management endpoints
│   ├── projects.ts        # Project management endpoints
│   ├── tasks.ts           # Task management endpoints
│   ├── users.ts           # User management endpoints
│   ├── roles.ts           # Role & permission endpoints
│   ├── notes.ts           # Notes endpoints
│   ├── attachments.ts     # File upload/download endpoints
│   ├── analytics.ts       # Analytics & reporting endpoints
│   ├── organization.ts    # Organization settings endpoints
│   └── auditLogs.ts       # Audit log endpoints
│
├── components/            # Reusable components
│   ├── layout/           # Layout components (Sidebar, Topbar, AppLayout)
│   ├── common/           # Common UI components
│   ├── auth/             # Authentication components
│   ├── leads/            # Lead-specific components
│   ├── projects/         # Project-specific components
│   ├── tasks/            # Task-specific components
│   ├── users/            # User management components
│   ├── roles/            # Role management components
│   ├── notes/            # Notes components
│   └── attachments/      # Attachment components
│
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context & provider
│
├── hooks/                # Custom React hooks
│   └── usePermissions.ts # Permission checking hook
│
├── pages/                # Page components
│   ├── auth/            # Auth pages (Login, Register, etc.)
│   ├── leads/           # Lead pages
│   ├── projects/        # Project pages
│   ├── tasks/           # Task pages
│   ├── users/           # User management pages
│   ├── roles/           # Role management pages
│   ├── DashboardPage.tsx
│   ├── SettingsPage.tsx
│   ├── UnauthorizedPage.tsx
│   └── NotFoundPage.tsx
│
├── routes/               # Routing configuration
│   ├── index.tsx        # Main routes
│   └── ProtectedRoute.tsx # Route protection wrapper
│
├── types/                # TypeScript type definitions
│   └── index.ts         # All type definitions
│
├── utils/                # Utility functions
│   └── queryClient.ts   # React Query configuration
│
├── theme/                # MUI theme configuration
│   └── theme.ts         # Custom theme
│
├── App.tsx              # Root component
└── main.tsx             # Application entry point
```

## 🔧 Setup & Installation

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:5000`

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your backend API URL if different
# VITE_API_BASE_URL=http://localhost:5000/api
```

### Development

```bash
# Start development server (runs on http://localhost:3000)
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

## 🔐 Authentication Flow

### Token Management

The application uses JWT-based authentication with automatic token refresh:

1. **Login/Register**: User credentials are sent to the backend
2. **Token Storage**: Access and refresh tokens are stored in localStorage
3. **Auto-Attach**: Axios interceptor automatically attaches access token to all requests
4. **Auto-Refresh**: When access token expires (401 error), the interceptor:
   - Attempts to refresh using the refresh token
   - Retries the failed request with the new token
   - Redirects to login if refresh fails

### Protected Routes

Routes are protected using the `ProtectedRoute` component:

```tsx
<ProtectedRoute requiredPermissions={['leads:read']}>
  <LeadsPage />
</ProtectedRoute>
```

## 🎨 UI Components

### Material-UI Theme

Custom theme configuration in `src/theme/theme.ts`:
- Primary color: Blue (#1976d2)
- Secondary color: Purple (#9c27b0)
- Custom component styles
- Responsive breakpoints

### Layout Structure

- **AppLayout**: Main layout with sidebar and topbar
- **Sidebar**: Navigation menu with permission-based visibility
- **Topbar**: User menu and app title
- **Responsive**: Mobile-friendly with drawer toggle

## 📡 API Integration

### API Client (`src/api/client.ts`)

Centralized Axios instance with:
- Base URL configuration from environment variables
- Request interceptor for authentication
- Response interceptor for token refresh
- Error handling

### API Services

Each module has its own service file with typed functions:

```typescript
// Example: src/api/leads.ts
export const leadsApi = {
  getLeads: async (filters?: LeadFilters) => { ... },
  getLead: async (id: string) => { ... },
  createLead: async (data: LeadFormData) => { ... },
  updateLead: async (id: string, data: Partial<LeadFormData>) => { ... },
  deleteLead: async (id: string) => { ... },
  assignLead: async (id: string, userId: string) => { ... },
};
```

## 🔒 Permission System

### usePermissions Hook

Custom hook for checking user permissions:

```typescript
const { hasPermission, hasAnyPermission, hasAllPermissions, isSuperAdmin, isAdmin } = usePermissions();

// Check single permission
if (hasPermission('leads:create')) {
  // Show create button
}

// Check multiple permissions (any)
if (hasAnyPermission(['leads:update', 'leads:delete'])) {
  // Show actions menu
}

// Check multiple permissions (all)
if (hasAllPermissions(['projects:read', 'tasks:read'])) {
  // Show project details
}
```

### Permission-Based UI

Components can conditionally render based on permissions:

```tsx
{hasPermission('leads:create') && (
  <Button onClick={handleCreate}>Create Lead</Button>
)}
```

## 📊 State Management

### Server State (React Query)

React Query handles all server-side data:
- Automatic caching
- Background refetching
- Optimistic updates
- Error handling

Configuration in `src/utils/queryClient.ts`:
- Stale time: 5 minutes
- Cache time: 10 minutes
- Retry: 1 attempt
- No refetch on window focus

### Client State (Context API)

React Context handles client-side state:
- **AuthContext**: User session, login/logout, token management

## 🎯 Features Implemented

### ✅ Core Features

- [x] Authentication (Login, Register, Forgot/Reset Password)
- [x] Protected routes with RBAC
- [x] Automatic token refresh
- [x] Responsive layout with sidebar navigation
- [x] Permission-based UI rendering
- [x] Type-safe API client
- [x] Error handling and loading states

### 🚧 In Progress

- [ ] Dashboard with analytics widgets
- [ ] Lead management (CRUD, filters, assignment)
- [ ] Project management (CRUD, member management)
- [ ] Task management (CRUD, Kanban board)
- [ ] User management (invite, list, update, delete)
- [ ] Role management (CRUD, permission assignment)
- [ ] Notes and attachments
- [ ] Audit log viewer
- [ ] Settings page

## 🔄 API Response Format

All API responses follow this format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

## 🌐 Environment Variables

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=Mini CRM
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Environment-Specific Builds

Create environment-specific `.env` files:
- `.env.development` - Development environment
- `.env.staging` - Staging environment
- `.env.production` - Production environment

### Deployment Platforms

The built application can be deployed to:
- **Vercel**: `vercel deploy`
- **Netlify**: Drag & drop `dist/` folder
- **AWS S3 + CloudFront**: Upload `dist/` to S3 bucket
- **Docker**: Use provided Dockerfile (if available)

## 📝 Code Style

### TypeScript

- Strict mode enabled
- All components are typed
- No `any` types (use `unknown` if needed)
- Interfaces for all data structures

### Component Structure

```tsx
import React from 'react';
import { ComponentProps } from './types';

const MyComponent: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Component logic
  
  return (
    // JSX
  );
};

export default MyComponent;
```

### File Naming

- Components: PascalCase (e.g., `LeadsPage.tsx`)
- Utilities: camelCase (e.g., `queryClient.ts`)
- Types: PascalCase (e.g., `User`, `Lead`)

## 🐛 Troubleshooting

### Common Issues

**Issue**: "Cannot connect to backend"
- **Solution**: Ensure backend is running on `http://localhost:5000`
- Check `VITE_API_BASE_URL` in `.env`

**Issue**: "Unauthorized" errors
- **Solution**: Clear localStorage and login again
- Check if access token is expired

**Issue**: "Module not found" errors
- **Solution**: Run `npm install` to install dependencies
- Delete `node_modules` and reinstall if needed

**Issue**: TypeScript errors
- **Solution**: Run `npm run type-check` to see all errors
- Ensure all types are properly imported

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [React Router Documentation](https://reactrouter.com/)
- [Vite Documentation](https://vitejs.dev/)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Ensure TypeScript compiles without errors
4. Test your changes
5. Submit a pull request

## 📄 License

This project is part of the Mini CRM system.
