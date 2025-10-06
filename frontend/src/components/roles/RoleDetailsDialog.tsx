import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  Paper,
} from '@mui/material';
import {
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import type { Role } from '../../types';

interface RoleDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  role: Role | null;
}

// Permission categories for better organization
const PERMISSION_CATEGORIES = {
  'Leads': ['leads:read', 'leads:create', 'leads:update', 'leads:delete', 'leads:assign'],
  'Projects': ['projects:read', 'projects:create', 'projects:update', 'projects:delete', 'projects:manage_members'],
  'Tasks': ['tasks:read', 'tasks:create', 'tasks:update', 'tasks:delete', 'tasks:assign'],
  'Users': ['users:read', 'users:invite', 'users:update', 'users:delete'],
  'Roles': ['roles:read', 'roles:create', 'roles:update', 'roles:delete'],
  'Organization': ['organization:read', 'organization:update'],
  'Analytics': ['analytics:read'],
  'Audit Logs': ['audit_logs:read'],
};

const RoleDetailsDialog: React.FC<RoleDetailsDialogProps> = ({ open, onClose, role }) => {
  if (!role) return null;

  const formatPermissionName = (permission: string) => {
    const parts = permission.split(':');
    return parts[1]?.replace(/_/g, ' ') || permission;
  };

  const getCategoryPermissions = (categoryPermissions: string[]) => {
    return categoryPermissions.filter((p) => role.permissions.includes(p));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          {role.isSystem && <LockIcon color="action" />}
          <Typography variant="h6">{role.name}</Typography>
          <Chip
            label={role.isSystem ? 'System Role' : 'Custom Role'}
            size="small"
            color={role.isSystem ? 'default' : 'success'}
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Basic Information */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1">
              {role.description || 'No description provided'}
            </Typography>
          </Box>

          <Divider />

          {/* Metadata */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Created At
              </Typography>
              <Typography variant="body2">
                {new Date(role.createdAt).toLocaleString()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Last Updated
              </Typography>
              <Typography variant="body2">
                {new Date(role.updatedAt).toLocaleString()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Permissions
              </Typography>
              <Typography variant="body2">
                {role.permissions.length} permissions
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Role ID
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                {role.id}
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Permissions by Category */}
          <Box>
            <Typography variant="subtitle1" fontWeight={500} gutterBottom>
              Permissions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              {Object.entries(PERMISSION_CATEGORIES).map(([category, categoryPermissions]) => {
                const grantedPermissions = getCategoryPermissions(categoryPermissions);

                if (grantedPermissions.length === 0) return null;

                return (
                  <Paper key={category} variant="outlined" sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                      <CheckCircleIcon color="success" fontSize="small" />
                      <Typography variant="subtitle2" fontWeight={500}>
                        {category}
                      </Typography>
                      <Chip
                        label={`${grantedPermissions.length}/${categoryPermissions.length}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {grantedPermissions.map((permission) => (
                        <Chip
                          key={permission}
                          label={formatPermissionName(permission)}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Paper>
                );
              })}
            </Box>

            {/* Show if no permissions */}
            {role.permissions.length === 0 && (
              <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No permissions assigned to this role
                </Typography>
              </Paper>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleDetailsDialog;