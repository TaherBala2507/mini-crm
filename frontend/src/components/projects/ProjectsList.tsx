import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Box,
  Typography,
  Tooltip,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import type { Project, ProjectFilters } from '../../types';
import { ProjectStatus } from '../../types';

interface ProjectsListProps {
  projects: Project[];
  total: number;
  filters: ProjectFilters;
  onFiltersChange: (filters: ProjectFilters) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  loading?: boolean;
}

const statusLabels: Record<ProjectStatus, string> = {
  [ProjectStatus.ACTIVE]: 'Active',
  [ProjectStatus.ON_HOLD]: 'On Hold',
  [ProjectStatus.COMPLETED]: 'Completed',
};

const getStatusColor = (status: ProjectStatus): 'default' | 'primary' | 'warning' | 'success' | 'error' => {
  switch (status) {
    case ProjectStatus.ACTIVE:
      return 'primary';
    case ProjectStatus.ON_HOLD:
      return 'warning';
    case ProjectStatus.COMPLETED:
      return 'success';
    default:
      return 'default';
  }
};

const formatCurrency = (amount?: number): string => {
  if (amount === undefined || amount === null) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const ProjectsList: React.FC<ProjectsListProps> = ({
  projects,
  total,
  filters,
  onFiltersChange,
  onEdit,
  onDelete,
  loading = false,
}) => {
  const navigate = useNavigate();

  const handleChangePage = (_event: unknown, newPage: number) => {
    onFiltersChange({ ...filters, page: newPage + 1 });
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      page: 1,
      pageSize: parseInt(event.target.value, 10),
    });
  };

  const handleView = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  if (projects.length === 0 && !loading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No projects found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {filters.search || filters.status?.length
            ? 'Try adjusting your filters'
            : 'Create your first project to get started'}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project Name</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Team</TableCell>
              <TableCell>Budget</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {project.name}
                    </Typography>
                    {project.description && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {project.description}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>{project.client || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={statusLabels[project.status]}
                    color={getStatusColor(project.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {project.members && project.members.length > 0 ? (
                    <AvatarGroup max={3} sx={{ justifyContent: 'flex-start' }}>
                      {project.members.map((member) => (
                        <Tooltip key={member.id} title={member.name}>
                          <Avatar
                            sx={{ width: 32, height: 32, fontSize: '0.875rem' }}
                          >
                            {member.name.charAt(0).toUpperCase()}
                          </Avatar>
                        </Tooltip>
                      ))}
                    </AvatarGroup>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No members
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{formatCurrency(project.budget)}</TableCell>
                <TableCell>{formatDate(project.startDate)}</TableCell>
                <TableCell>{formatDate(project.endDate)}</TableCell>
                <TableCell align="right">
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => handleView(project)}
                      color="primary"
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(project)}
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => onDelete(project)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={(filters.page || 1) - 1}
        onPageChange={handleChangePage}
        rowsPerPage={filters.pageSize || 10}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Paper>
  );
};

export default ProjectsList;