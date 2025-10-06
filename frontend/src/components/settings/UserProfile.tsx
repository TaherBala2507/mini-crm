import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Avatar,
  Chip,
} from '@mui/material';
import { Save as SaveIcon, Person as PersonIcon } from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api/users';
import { useAuth } from '../../contexts/AuthContext';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: { name: string; email: string }) =>
      usersApi.updateUser(user?.id || '', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  // Initialize form data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        User Profile
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Manage your personal information and account details.
      </Typography>

      {/* User Info Card */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          mb: 3,
          bgcolor: 'background.default',
          borderRadius: 1,
        }}
      >
        <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
          <PersonIcon sx={{ fontSize: 40 }} />
        </Avatar>
        <Box>
          <Typography variant="h6">{user.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
          <Box display="flex" gap={1} mt={1}>
            {user.roles?.map((role) => (
              <Chip key={role} label={role} size="small" color="primary" />
            ))}
          </Box>
        </Box>
      </Box>

      <Box component="form" onSubmit={handleSubmit}>
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Account Information */}
          <Typography variant="subtitle2" gutterBottom>
            Account Information
          </Typography>

          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />

            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </Box>

          {/* Account Details (Read-only) */}
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Account Details
          </Typography>

          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
            <TextField
              fullWidth
              label="User ID"
              value={user.id}
              disabled
              helperText="Your unique user identifier"
            />

            <TextField
              fullWidth
              label="Organization ID"
              value={user.orgId}
              disabled
              helperText="Your organization identifier"
            />
          </Box>

          {/* Submit Button */}
          <Box display="flex" gap={2} mt={2}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>

          {/* Success/Error Messages */}
          {updateMutation.isSuccess && (
            <Alert severity="success">
              Profile updated successfully!
            </Alert>
          )}

          {updateMutation.isError && (
            <Alert severity="error">
              Failed to update profile. Please try again.
            </Alert>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default UserProfile;