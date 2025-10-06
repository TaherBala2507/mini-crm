import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  CircularProgress,
  Grid,
} from '@mui/material';

import type { Lead, LeadFormData, User } from '../../types';
import { LeadStatus, LeadSource } from '../../types';

interface LeadFormProps {
  open: boolean;
  lead?: Lead | null;
  users: User[];
  onClose: () => void;
  onSubmit: (data: LeadFormData) => Promise<void>;
  loading?: boolean;
}

const LeadForm: React.FC<LeadFormProps> = ({
  open,
  lead,
  users,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<LeadFormData>({
    title: '',
    company: '',
    contactName: '',
    email: '',
    phone: '',
    source: LeadSource.WEBSITE,
    status: LeadStatus.NEW,
    ownerUserId: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormData, string>>>({});

  useEffect(() => {
    if (lead) {
      setFormData({
        title: lead.title,
        company: lead.company,
        contactName: lead.contactName,
        email: lead.email || '',
        phone: lead.phone || '',
        source: lead.source,
        status: lead.status,
        ownerUserId: lead.ownerUserId || '',
      });
    } else {
      setFormData({
        title: '',
        company: '',
        contactName: '',
        email: '',
        phone: '',
        source: LeadSource.WEBSITE,
        status: LeadStatus.NEW,
        ownerUserId: '',
      });
    }
    setErrors({});
  }, [lead, open]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof LeadFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact name is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    // Clean up empty strings
    const submitData: LeadFormData = {
      ...formData,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      ownerUserId: formData.ownerUserId || undefined,
    };

    await onSubmit(submitData);
  };

  const handleChange = (field: keyof LeadFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {lead ? 'Edit Lead' : 'Create New Lead'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Title"
                  required
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  error={!!errors.title}
                  helperText={errors.title}
                  disabled={loading}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Company"
                  required
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  error={!!errors.company}
                  helperText={errors.company}
                  disabled={loading}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Contact Name"
                  required
                  value={formData.contactName}
                  onChange={(e) => handleChange('contactName', e.target.value)}
                  error={!!errors.contactName}
                  helperText={errors.contactName}
                  disabled={loading}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  disabled={loading}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  disabled={loading}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => handleChange('status', e.target.value as LeadStatus)}
                    disabled={loading}
                  >
                    <MenuItem value={LeadStatus.NEW}>New</MenuItem>
                    <MenuItem value={LeadStatus.QUALIFIED}>Qualified</MenuItem>
                    <MenuItem value={LeadStatus.WON}>Won</MenuItem>
                    <MenuItem value={LeadStatus.LOST}>Lost</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Source</InputLabel>
                  <Select
                    value={formData.source}
                    label="Source"
                    onChange={(e) => handleChange('source', e.target.value as LeadSource)}
                    disabled={loading}
                  >
                    <MenuItem value={LeadSource.WEBSITE}>Website</MenuItem>
                    <MenuItem value={LeadSource.REFERRAL}>Referral</MenuItem>
                    <MenuItem value={LeadSource.ADS}>Ads</MenuItem>
                    <MenuItem value={LeadSource.EVENT}>Event</MenuItem>
                    <MenuItem value={LeadSource.OTHER}>Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Owner</InputLabel>
                  <Select
                    value={formData.ownerUserId}
                    label="Owner"
                    onChange={(e) => handleChange('ownerUserId', e.target.value)}
                    disabled={loading}
                  >
                    <MenuItem value="">
                      <em>Unassigned</em>
                    </MenuItem>
                    {Array.isArray(users) && users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </MenuItem>
                    ))}
                  </Select>
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
            {lead ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default LeadForm;