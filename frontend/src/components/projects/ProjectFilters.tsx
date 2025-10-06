import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Paper,
  Button,
  Grid,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

import type { ProjectFilters } from '../../types';
import { ProjectStatus } from '../../types';

interface ProjectFiltersProps {
  filters: ProjectFilters;
  onFiltersChange: (filters: ProjectFilters) => void;
}

const ProjectFiltersComponent: React.FC<ProjectFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value, page: 1 });
  };

  const handleStatusChange = (event: SelectChangeEvent<ProjectStatus[]>) => {
    const value = event.target.value;
    onFiltersChange({
      ...filters,
      status: typeof value === 'string' ? (value.split(',') as ProjectStatus[]) : value,
      page: 1,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      page: 1,
      pageSize: filters.pageSize,
    });
  };

  const hasActiveFilters = filters.search || (filters.status && filters.status.length > 0);

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            placeholder="Search projects..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              multiple
              value={filters.status || []}
              onChange={handleStatusChange}
              input={<OutlinedInput label="Status" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              <MenuItem value={ProjectStatus.ACTIVE}>Active</MenuItem>
              <MenuItem value={ProjectStatus.ON_HOLD}>On Hold</MenuItem>
              <MenuItem value={ProjectStatus.COMPLETED}>Completed</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {hasActiveFilters && (
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default ProjectFiltersComponent;