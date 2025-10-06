import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

// Main Pages
import DashboardPage from '../pages/DashboardPage';
import LeadsPage from '../pages/leads/LeadsPage';
import LeadDetailsPage from '../pages/leads/LeadDetailsPage';
import ProjectsPage from '../pages/projects/ProjectsPage';
import ProjectDetailsPage from '../pages/projects/ProjectDetailsPage';
import TasksPage from '../pages/tasks/TasksPage';
import TaskBoardPage from '../pages/tasks/TaskBoardPage';
import TaskDetailsPage from '../pages/tasks/TaskDetailsPage';
import UsersPage from '../pages/users/UsersPage';
import RolesPage from '../pages/roles/RolesPage';
import SettingsPage from '../pages/SettingsPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import NotFoundPage from '../pages/NotFoundPage';

// Layout
import AppLayout from '../components/layout/AppLayout';

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />

        {/* Leads */}
        <Route
          path="leads"
          element={
            <ProtectedRoute requiredPermissions={['lead.view.all', 'lead.view.own']}>
              <LeadsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="leads/:id"
          element={
            <ProtectedRoute requiredPermissions={['lead.view.all', 'lead.view.own']}>
              <LeadDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Projects */}
        <Route
          path="projects"
          element={
            <ProtectedRoute requiredPermissions={['project.view']}>
              <ProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="projects/:id"
          element={
            <ProtectedRoute requiredPermissions={['project.view']}>
              <ProjectDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Tasks */}
        <Route
          path="tasks"
          element={
            <ProtectedRoute requiredPermissions={['task.view']}>
              <TasksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="tasks/board"
          element={
            <ProtectedRoute requiredPermissions={['task.view']}>
              <TaskBoardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="tasks/:id"
          element={
            <ProtectedRoute requiredPermissions={['task.view']}>
              <TaskDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Users */}
        <Route
          path="users"
          element={
            <ProtectedRoute requiredPermissions={['user.view']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        {/* Roles */}
        <Route
          path="roles"
          element={
            <ProtectedRoute requiredPermissions={['role.manage']}>
              <RolesPage />
            </ProtectedRoute>
          }
        />

        {/* Settings */}
        <Route path="settings" element={<SettingsPage />} />

        {/* Error Pages */}
        <Route path="unauthorized" element={<UnauthorizedPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;