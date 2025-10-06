import React from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  OutlinedInput,
  Button,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { FilterList as FilterIcon, Clear as ClearIcon } from '@mui/icons-material';
import type { LeadFilters as LeadFiltersType, User } from '../../types';
import { LeadStatus, LeadSource } from '../../types';

interface LeadFiltersProps {
  filters: LeadFiltersType;
  users: User[];
  onFilterChange: (filters: LeadFiltersType) => void;
}

const LeadFilters: React.FC<LeadFiltersProps> = ({
  filters,
  users,
  onFilterChange,
}) => {
  const handleStatusChange = (event: SelectChangeEvent<LeadStatus[]>) => {
    const value = event.target.value;
    onFilterChange({
      ...filters,
      status: typeof value === 'string' ? [value as LeadStatus] : value as LeadStatus[],
    });
  };

  const handleSourceChange = (event: SelectChangeEvent<LeadSource[]>) => {
    const value = event.target.value;
    onFilterChange({
      ...filters,
      source: typeof value === 'string' ? [value as LeadSource] : value as LeadSource[],
    });
  };

  const handleOwnerChange = (event: SelectChangeEvent<string>) => {
    onFilterChange({
      ...filters,
      ownerId: event.target.value || undefined,
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      search: event.target.value || undefined,
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      page: 1,
      pageSize: filters.pageSize || 10,
    });
  };

  const hasActiveFilters = !!(
    filters.status?.length ||
    filters.source?.length ||
    filters.ownerId ||
    filters.search
  );

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon />
          <Typography variant="h6">Filters</Typography>
        </Box>
        {hasActiveFilters && (
          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={handleClearFilters}
          >
            Clear All
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          label="Search"
          placeholder="Search by title, email, company..."
          value={filters.search || ''}
          onChange={handleSearchChange}
          size="small"
        />

        <FormControl fullWidth size="small">
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
            {Object.values(LeadStatus).map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Source</InputLabel>
          <Select
            multiple
            value={filters.source || []}
            onChange={handleSourceChange}
            input={<OutlinedInput label="Source" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
          >
            <MenuItem value={LeadSource.WEBSITE}>Website</MenuItem>
            <MenuItem value={LeadSource.REFERRAL}>Referral</MenuItem>
            <MenuItem value={LeadSource.ADS}>Ads</MenuItem>
            <MenuItem value={LeadSource.EVENT}>Event</MenuItem>
            <MenuItem value={LeadSource.OTHER}>Other</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Owner</InputLabel>
          <Select
            value={filters.ownerId || ''}
            onChange={handleOwnerChange}
            label="Owner"
          >
            <MenuItem value="">
              <em>All Owners</em>
            </MenuItem>
            {Array.isArray(users) && users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
};

export default LeadFilters;