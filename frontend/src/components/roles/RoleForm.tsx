import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Alert,
  CircularProgress,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { rolesApi } from '../../api/roles';
import type { Role, RoleFormData } from '../../types';

interface RoleFormProps {
  open: boolean;
  onClose: () => void;
  role?: Role | null;
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

const RoleForm: React.FC<RoleFormProps> = ({ open, onClose, role }) => {
  const queryClient = useQueryClient();
  const isEditMode = !!role;

  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    permissions: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch available permissions
  const { data: permissionsData, isLoading: loadingPermissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => rolesApi.getPermissions(),
    enabled: open,
  });

  const availablePermissions = permissionsData?.data || [];

  // Initialize form data when role changes
  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || '',
        permissions: role.permissions,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        permissions: [],
      });
    }
    setErrors({});
  }, [role, open]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: RoleFormData) => rolesApi.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      onClose();
    },
    onError: (error: any) => {
      setErrors({ submit: error.response?.data?.message || 'Failed to create role' });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: RoleFormData) => rolesApi.updateRole(role!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      onClose();
    },
    onError: (error: any) => {
      setErrors({ submit: error.response?.data?.message || 'Failed to update role' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = 'At least one permission must be selected';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isEditMode) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handlePermissionToggle = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
    setErrors((prev) => ({ ...prev, permissions: '' }));
  };

  const handleCategoryToggle = (categoryPermissions: string[]) => {
    const allSelected = categoryPermissions.every((p) =>
      formData.permissions.includes(p)
    );

    setFormData((prev) => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter((p) => !categoryPermissions.includes(p))
        : [...new Set([...prev.permissions, ...categoryPermissions])],
    }));
    setErrors((prev) => ({ ...prev, permissions: '' }));
  };

  const isCategoryFullySelected = (categoryPermissions: string[]) => {
    return categoryPermissions.every((p) => formData.permissions.includes(p));
  };

  const isCategoryPartiallySelected = (categoryPermissions: string[]) => {
    return (
      categoryPermissions.some((p) => formData.permissions.includes(p)) &&
      !isCategoryFullySelected(categoryPermissions)
    );
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {isEditMode ? 'Edit Role' : 'Create New Role'}
        </DialogTitle>
        <DialogContent>
          {errors.submit && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.submit}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Role Name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setErrors({ ...errors, name: '' });
              }}
              error={!!errors.name}
              helperText={errors.name}
              required
              fullWidth
              disabled={role?.isSystem}
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              multiline
              rows={2}
              fullWidth
            />

            <Divider />

            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight={500}>
                  Permissions
                </Typography>
                <Chip
                  label={`${formData.permissions.length} selected`}
                  size="small"
                  color="primary"
                />
              </Box>

              {errors.permissions && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.permissions}
                </Alert>
              )}

              {loadingPermissions ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box>
                  {Object.entries(PERMISSION_CATEGORIES).map(([category, categoryPermissions]) => {
                    // Filter to only show permissions that exist in the backend
                    const existingPermissions = categoryPermissions.filter((p) =>
                      availablePermissions.includes(p)
                    );

                    if (existingPermissions.length === 0) return null;

                    const fullySelected = isCategoryFullySelected(existingPermissions);
                    const partiallySelected = isCategoryPartiallySelected(existingPermissions);

                    return (
                      <Accordion key={category} defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={fullySelected}
                                indeterminate={partiallySelected}
                                onChange={() =>
                                  handleCategoryToggle(existingPermissions)
                                }
                                onClick={(e) => e.stopPropagation()}
                              />
                            }
                            label={
                              <Typography fontWeight={500}>
                                {category} ({existingPermissions.length})
                              </Typography>
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </AccordionSummary>
                        <AccordionDetails>
                          <FormGroup>
                            {existingPermissions.map((permission) => (
                              <FormControlLabel
                                key={permission}
                                control={
                                  <Checkbox
                                    checked={formData.permissions.includes(permission)}
                                    onChange={() => handlePermissionToggle(permission)}
                                  />
                                }
                                label={
                                  <Typography variant="body2">
                                    {permission.split(':')[1].replace(/_/g, ' ')}
                                  </Typography>
                                }
                              />
                            ))}
                          </FormGroup>
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending || loadingPermissions}
          >
            {isPending ? 'Saving...' : isEditMode ? 'Update Role' : 'Create Role'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RoleForm;