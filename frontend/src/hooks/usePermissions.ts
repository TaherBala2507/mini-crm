import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();

  // TEMPORARY: Grant all permissions for development
  // TODO: Implement proper permission checking by fetching role details from API
  const permissions = useMemo(() => {
    return new Set<string>();
  }, [user]);

  const hasPermission = (_permission: string): boolean => {
    // TEMPORARY: Grant all permissions if user is authenticated
    return !!user;
  };

  const hasAnyPermission = (_requiredPermissions: string[]): boolean => {
    // TEMPORARY: Grant all permissions if user is authenticated
    return !!user;
  };

  const hasAllPermissions = (_requiredPermissions: string[]): boolean => {
    // TEMPORARY: Grant all permissions if user is authenticated
    return !!user;
  };

  const isSuperAdmin = (): boolean => {
    // TEMPORARY: Grant admin access if user is authenticated
    return !!user;
  };

  const isAdmin = (): boolean => {
    // TEMPORARY: Grant admin access if user is authenticated
    return !!user;
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin,
    isAdmin,
  };
};