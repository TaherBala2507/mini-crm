import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Grid,
  Chip,
  OutlinedInput,
  Typography,
  type SelectChangeEvent,
} from '@mui/material';

import type { User, UserInviteFormData, Role } from '../../types';

interface UserFormProps {
  open: boolean;
  user?: User | null;
  roles: Role[];
  onClose: () => void;
  onSubmit: (data: UserInviteFormData) => Promise<void>;
  loading?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  open,
  user,
  roles,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<UserInviteFormData>({
    name: '',
    email: '',
    roleNames: [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UserInviteFormData, string>>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        roleNames: user.roles?.map((role) => role.name) || [],
      });
    } else {
      setFormData({
        name: '',
        email: '',
        roleNames: [],
      });
    }
    setErrors({});
  }, [user, open]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof UserInviteFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.roleNames.length === 0) {
      newErrors.roleNames = 'At least one role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    await onSubmit(formData);
  };

  const handleChange = (field: keyof UserInviteFormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRoleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    handleChange('roleNames', typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {user ? 'Edit User' : 'Invite New User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Name"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name}
                  disabled={loading}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email || (user ? '' : 'An invitation email will be sent to this address')}
                  disabled={loading || !!user}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth required error={!!errors.roleNames}>
                  <InputLabel>Roles</InputLabel>
                  <Select
                    multiple
                    value={formData.roleNames}
                    onChange={handleRoleChange}
                    input={<OutlinedInput label="Roles" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                    disabled={loading}
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.name}>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {role.name}
                          </Typography>
                          {role.description && (
                            <Typography variant="caption" color="text.secondary">
                              {role.description}
                            </Typography>
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.roleNames && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                      {errors.roleNames}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {user ? 'Update' : 'Invite'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserForm;