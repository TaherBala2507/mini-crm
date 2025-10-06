import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationApi } from '../../api/organization';

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

const DATE_FORMATS = [
  'MM/DD/YYYY',
  'DD/MM/YYYY',
  'YYYY-MM-DD',
  'DD-MM-YYYY',
];

const CURRENCIES = [
  { code: 'USD', label: 'US Dollar ($)' },
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'GBP', label: 'British Pound (£)' },
  { code: 'JPY', label: 'Japanese Yen (¥)' },
  { code: 'CAD', label: 'Canadian Dollar (C$)' },
  { code: 'AUD', label: 'Australian Dollar (A$)' },
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'ja', label: 'Japanese' },
  { code: 'zh', label: 'Chinese' },
];

const OrganizationSettings: React.FC = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    language: 'en',
  });

  // Fetch organization
  const { data, isLoading, error } = useQuery({
    queryKey: ['organization'],
    queryFn: organizationApi.getOrganization,
  });

  const organization = data?.data;

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => organizationApi.updateOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
    },
  });

  // Initialize form data
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        domain: organization.domain || '',
        timezone: organization.settings?.timezone || 'UTC',
        dateFormat: organization.settings?.dateFormat || 'MM/DD/YYYY',
        currency: organization.settings?.currency || 'USD',
        language: organization.settings?.language || 'en',
      });
    }
  }, [organization]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      name: formData.name,
      domain: formData.domain,
      settings: {
        timezone: formData.timezone,
        dateFormat: formData.dateFormat,
        currency: formData.currency,
        language: formData.language,
      },
    });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load organization settings. Please try again.
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Organization Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Manage your organization's basic information and preferences.
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Basic Information */}
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Basic Information
          </Typography>

          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
            <TextField
              fullWidth
              label="Organization Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />

            <TextField
              fullWidth
              label="Domain"
              value={formData.domain}
              onChange={(e) => handleChange('domain', e.target.value)}
              required
              helperText="Used for unique identification"
            />
          </Box>

          {/* Regional Settings */}
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Regional Settings
          </Typography>

          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
            <TextField
              fullWidth
              select
              label="Timezone"
              value={formData.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
            >
              {TIMEZONES.map((tz) => (
                <MenuItem key={tz} value={tz}>
                  {tz}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              select
              label="Date Format"
              value={formData.dateFormat}
              onChange={(e) => handleChange('dateFormat', e.target.value)}
            >
              {DATE_FORMATS.map((format) => (
                <MenuItem key={format} value={format}>
                  {format}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              select
              label="Currency"
              value={formData.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
            >
              {CURRENCIES.map((currency) => (
                <MenuItem key={currency.code} value={currency.code}>
                  {currency.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              select
              label="Language"
              value={formData.language}
              onChange={(e) => handleChange('language', e.target.value)}
            >
              {LANGUAGES.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>
                  {lang.label}
                </MenuItem>
              ))}
            </TextField>
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
              Organization settings updated successfully!
            </Alert>
          )}

          {updateMutation.isError && (
            <Alert severity="error">
              Failed to update settings. Please try again.
            </Alert>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default OrganizationSettings;