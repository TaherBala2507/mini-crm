import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { usersApi } from '../../api/users';
import { rolesApi } from '../../api/roles';
import type { User, UserInviteFormData, Role, UserFilters } from '../../types';
import { UserStatus } from '../../types';
import UsersList from '../../components/users/UsersList';
import UserForm from '../../components/users/UserForm';
import { usePermissions } from '../../hooks/usePermissions';

const UsersPage: React.FC = () => {
  const { hasPermission } = usePermissions();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    pageSize: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');

  const canCreate = hasPermission('user.create');
  const canUpdate = hasPermission('user.edit');
  const canDelete = hasPermission('user.delete');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await usersApi.getUsers(filters);
      setUsers(response.data);
      // Handle pagination if backend returns it
      if ((response as any).meta) {
        setTotal((response as any).meta.total || 0);
      } else {
        setTotal(Array.isArray(response.data) ? response.data.length : 0);
      }
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await rolesApi.getRoles(1, 100);
      setRoles(response.data.items || []);
    } catch (error: any) {
      console.error('Failed to fetch roles:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCreateClick = () => {
    if (!canCreate) {
      showSnackbar('You do not have permission to invite users', 'error');
      return;
    }
    setSelectedUser(null);
    setFormOpen(true);
  };

  const handleEditClick = (user: User) => {
    if (!canUpdate) {
      showSnackbar('You do not have permission to edit users', 'error');
      return;
    }
    setSelectedUser(user);
    setFormOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    if (!canDelete) {
      showSnackbar('You do not have permission to delete users', 'error');
      return;
    }
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleToggleStatus = async (user: User) => {
    if (!canUpdate) {
      showSnackbar('You do not have permission to update user status', 'error');
      return;
    }

    try {
      const newStatus = user.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;
      await usersApi.updateUser(user.id, { status: newStatus });
      showSnackbar(
        `User ${newStatus === UserStatus.ACTIVE ? 'activated' : 'deactivated'} successfully`,
        'success'
      );
      fetchUsers();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to update user status', 'error');
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedUser(null);
  };

  const handleFormSubmit = async (data: UserInviteFormData) => {
    try {
      if (selectedUser) {
        await usersApi.updateUser(selectedUser.id, data);
        showSnackbar('User updated successfully', 'success');
      } else {
        await usersApi.inviteUser(data);
        showSnackbar('User invitation sent successfully', 'success');
      }
      handleFormClose();
      fetchUsers();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to save user', 'error');
      throw error;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await usersApi.deleteUser(userToDelete.id);
      showSnackbar('User deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to delete user', 'error');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page: page + 1 });
  };

  const handlePageSizeChange = (pageSize: number) => {
    setFilters({ ...filters, page: 1, pageSize });
  };

  const handleSort = (field: string) => {
    const isAsc = filters.sortBy === field && filters.sortOrder === 'asc';
    setFilters({
      ...filters,
      sortBy: field,
      sortOrder: isAsc ? 'desc' : 'asc',
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    setFilters({ ...filters, page: 1, search: value || undefined });
  };

  const handleStatusFilterChange = (status: UserStatus | '') => {
    setStatusFilter(status);
    setFilters({ ...filters, page: 1, status: status ? [status] : undefined });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Users</Typography>
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={handleCreateClick}
          >
            Invite User
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              fullWidth
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => handleStatusFilterChange(e.target.value as UserStatus | '')}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value={UserStatus.ACTIVE}>Active</MenuItem>
                <MenuItem value={UserStatus.INACTIVE}>Inactive</MenuItem>
                <MenuItem value={UserStatus.PENDING}>Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <UsersList
        users={users}
        total={total}
        page={(filters.page || 1) - 1}
        pageSize={filters.pageSize || 10}
        sortBy={filters.sortBy || 'createdAt'}
        sortOrder={filters.sortOrder || 'desc'}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSort={handleSort}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onToggleStatus={handleToggleStatus}
        loading={loading}
      />

      <UserForm
        open={formOpen}
        user={selectedUser}
        roles={roles}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the user "{userToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersPage;