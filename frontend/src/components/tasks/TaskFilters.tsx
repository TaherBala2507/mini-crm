import React from 'react';
import {
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Grid,
  Paper,
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material';
import type { TaskFilters as TaskFiltersType, User, Project } from '../../types';
import { TaskStatus, TaskPriority } from '../../types';

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onFilterChange: (filters: TaskFiltersType) => void;
  users?: User[];
  projects?: Project[];
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  onFilterChange,
  users = [],
  projects = [],
}) => {
  const handleChange = (field: keyof TaskFiltersType, value: any) => {
    onFilterChange({ ...filters, [field]: value, page: 1 });
  };

  const handleClear = () => {
    onFilterChange({
      page: 1,
      pageSize: 10,
    });
  };

  const hasActiveFilters = 
    filters.search || 
    (filters.status && filters.status.length > 0) || 
    (filters.priority && filters.priority.length > 0) || 
    filters.assigneeUserId || 
    filters.projectId;

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search tasks..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={(filters.status && filters.status[0]) || ''}
              label="Status"
              onChange={(e: SelectChangeEvent) => handleChange('status', e.target.value ? [e.target.value as TaskStatus] : undefined)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value={TaskStatus.TODO}>To Do</MenuItem>
              <MenuItem value={TaskStatus.IN_PROGRESS}>In Progress</MenuItem>
              <MenuItem value={TaskStatus.DONE}>Done</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Priority</InputLabel>
            <Select
              value={(filters.priority && filters.priority[0]) || ''}
              label="Priority"
              onChange={(e: SelectChangeEvent) => handleChange('priority', e.target.value ? [e.target.value as TaskPriority] : undefined)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value={TaskPriority.LOW}>Low</MenuItem>
              <MenuItem value={TaskPriority.MEDIUM}>Medium</MenuItem>
              <MenuItem value={TaskPriority.HIGH}>High</MenuItem>
              <MenuItem value={TaskPriority.URGENT}>Urgent</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Assignee</InputLabel>
            <Select
              value={filters.assigneeUserId || ''}
              label="Assignee"
              onChange={(e: SelectChangeEvent) => handleChange('assigneeUserId', e.target.value || undefined)}
            >
              <MenuItem value="">All</MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Project</InputLabel>
            <Select
              value={filters.projectId || ''}
              label="Project"
              onChange={(e: SelectChangeEvent) => handleChange('projectId', e.target.value || undefined)}
            >
              <MenuItem value="">All</MenuItem>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {hasActiveFilters && (
          <Grid size={{ xs: 12, md: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              startIcon={<ClearIcon />}
              onClick={handleClear}
            >
              Clear
            </Button>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default TaskFilters;