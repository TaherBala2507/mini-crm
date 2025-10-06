import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';
import RolesList from '../../components/roles/RolesList';
import RoleForm from '../../components/roles/RoleForm';
import RoleDetailsDialog from '../../components/roles/RoleDetailsDialog';
import { usePermissions } from '../../hooks/usePermissions';
import type { Role } from '../../types';

const RolesPage: React.FC = () => {
  const { hasPermission } = usePermissions();
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const canCreate = hasPermission('roles:create');
  const canUpdate = hasPermission('roles:update');

  const handleCreateClick = () => {
    setSelectedRole(null);
    setFormOpen(true);
  };

  const handleEditClick = (role: Role) => {
    setSelectedRole(role);
    setFormOpen(true);
  };

  const handleViewClick = (role: Role) => {
    setSelectedRole(role);
    setDetailsOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedRole(null);
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
    setSelectedRole(null);
  };

  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            Roles & Permissions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage roles and assign permissions to control user access
          </Typography>
        </Box>
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateClick}
          >
            Create Role
          </Button>
        )}
      </Box>

      {/* Permission Warning */}
      {!canCreate && !canUpdate && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You have read-only access to roles. Contact your administrator to create or modify roles.
        </Alert>
      )}

      {/* Roles List */}
      <RolesList
        onEdit={handleEditClick}
        onView={handleViewClick}
      />

      {/* Role Form Dialog */}
      <RoleForm
        open={formOpen}
        onClose={handleFormClose}
        role={selectedRole}
      />

      {/* Role Details Dialog */}
      <RoleDetailsDialog
        open={detailsOpen}
        onClose={handleDetailsClose}
        role={selectedRole}
      />
    </Box>
  );
};

export default RolesPage;