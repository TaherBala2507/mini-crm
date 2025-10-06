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
  Chip,
  OutlinedInput,
  Grid,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';

import type { Project, ProjectFormData, User } from '../../types';
import { ProjectStatus } from '../../types';

interface ProjectFormProps {
  open: boolean;
  project?: Project | null;
  users: User[];
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  loading?: boolean;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  open,
  project,
  users,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    status: ProjectStatus.ACTIVE,
    startDate: '',
    endDate: '',
    budget: undefined,
    client: '',
    memberIds: [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({});

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        status: project.status,
        startDate: project.startDate ? project.startDate.split('T')[0] : '',
        endDate: project.endDate ? project.endDate.split('T')[0] : '',
        budget: project.budget,
        client: project.client || '',
        memberIds: project.memberIds || [],
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: ProjectStatus.ACTIVE,
        startDate: '',
        endDate: '',
        budget: undefined,
        client: '',
        memberIds: [],
      });
    }
    setErrors({});
  }, [project, open]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProjectFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (formData.budget !== undefined && formData.budget < 0) {
      newErrors.budget = 'Budget must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    // Clean up empty strings and prepare data
    const submitData: ProjectFormData = {
      name: formData.name,
      description: formData.description || undefined,
      status: formData.status,
      // Convert date strings to ISO datetime format
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      budget: formData.budget,
      client: formData.client || undefined,
      memberIds: formData.memberIds,
    };

    await onSubmit(submitData);
  };

  const handleChange = (field: keyof ProjectFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleMembersChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    handleChange('memberIds', typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {project ? 'Edit Project' : 'Create New Project'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Project Name"
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
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  disabled={loading}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Client Name"
                  value={formData.client}
                  onChange={(e) => handleChange('client', e.target.value)}
                  disabled={loading}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => handleChange('status', e.target.value as ProjectStatus)}
                    disabled={loading}
                  >
                    <MenuItem value={ProjectStatus.ACTIVE}>Active</MenuItem>
                    <MenuItem value={ProjectStatus.ON_HOLD}>On Hold</MenuItem>
                    <MenuItem value={ProjectStatus.COMPLETED}>Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  disabled={loading}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  error={!!errors.endDate}
                  helperText={errors.endDate}
                  disabled={loading}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Budget"
                  type="number"
                  value={formData.budget || ''}
                  onChange={(e) => handleChange('budget', e.target.value ? parseFloat(e.target.value) : undefined)}
                  error={!!errors.budget}
                  helperText={errors.budget}
                  disabled={loading}
                  InputProps={{
                    startAdornment: <span style={{ marginRight: 8 }}>$</span>,
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Team Members</InputLabel>
                  <Select
                    multiple
                    value={formData.memberIds || []}
                    onChange={handleMembersChange}
                    input={<OutlinedInput label="Team Members" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((memberId) => {
                          const user = users.find((u) => u.id === memberId);
                          return (
                            <Chip
                              key={memberId}
                              label={user?.name || memberId}
                              size="small"
                            />
                          );
                        })}
                      </Box>
                    )}
                    disabled={loading}
                  >
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
            {project ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProjectForm;