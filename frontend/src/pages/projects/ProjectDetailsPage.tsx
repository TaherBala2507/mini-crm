import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Card,
  CardContent,
  Avatar,
  AvatarGroup,
  Tooltip,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { projectsApi } from '../../api/projects';
import { usersApi } from '../../api/users';
import ProjectForm from '../../components/projects/ProjectForm';
import ProjectTasks from '../../components/projects/ProjectTasks';
import ProjectNotes from '../../components/projects/ProjectNotes';
import ProjectActivity from '../../components/projects/ProjectActivity';
import ProjectMembers from '../../components/projects/ProjectMembers';
import type { Project, ProjectFormData, ProjectStatus } from '../../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const statusLabels: Record<ProjectStatus, string> = {
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
};

const getStatusColor = (status: ProjectStatus): 'default' | 'primary' | 'warning' | 'success' | 'error' => {
  switch (status) {
    case 'active':
      return 'primary';
    case 'on_hold':
      return 'warning';
    case 'completed':
      return 'success';
    default:
      return 'default';
  }
};

const formatCurrency = (amount?: number): string => {
  if (amount === undefined || amount === null) return 'Not set';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch project details
  const { data: projectData, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getProject(id!),
    enabled: !!id,
  });

  // Fetch users for team member selection
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getUsers(),
  });

  // Update project mutation
  const updateMutation = useMutation({
    mutationFn: (data: ProjectFormData) => projectsApi.updateProject(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setEditDialogOpen(false);
    },
  });

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: () => projectsApi.deleteProject(id!),
    onSuccess: () => {
      navigate('/projects');
    },
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditClick = () => {
    setEditDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate();
  };

  const handleFormSubmit = async (data: ProjectFormData) => {
    await updateMutation.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !projectData?.data) {
    return (
      <Box>
        <Alert severity="error">
          Failed to load project details. The project may not exist or you don't have permission to view it.
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/projects')}
          sx={{ mt: 2 }}
        >
          Back to Projects
        </Button>
      </Box>
    );
  }

  const project: Project = projectData.data;
  const users = usersData?.data || [];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/projects')}
          sx={{ mb: 2 }}
        >
          Back to Projects
        </Button>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {project.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip
                label={statusLabels[project.status]}
                color={getStatusColor(project.status)}
                size="small"
              />
              {project.client && (
                <Chip
                  icon={<BusinessIcon />}
                  label={project.client}
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEditClick}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Project Overview Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Start Date
              </Typography>
            </Box>
            <Typography variant="h6">{formatDate(project.startDate)}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                End Date
              </Typography>
            </Box>
            <Typography variant="h6">{formatDate(project.endDate)}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <MoneyIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Budget
              </Typography>
            </Box>
            <Typography variant="h6">{formatCurrency(project.budget)}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <GroupIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Team Members
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">{project.members?.length || 0}</Typography>
              {project.members && project.members.length > 0 && (
                <AvatarGroup max={3} sx={{ justifyContent: 'flex-end' }}>
                  {project.members.slice(0, 3).map((member) => (
                    <Tooltip key={member.id} title={member.name}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                        {member.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </Tooltip>
                  ))}
                </AvatarGroup>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Description */}
      {project.description && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
            {project.description}
          </Typography>
        </Paper>
      )}

      {/* Tabs */}
      <Paper>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Tasks" />
          <Tab label="Team Members" />
          <Tab label="Notes" />
          <Tab label="Activity" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <ProjectTasks projectId={id!} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <ProjectMembers projectId={id!} project={project} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <ProjectNotes projectId={id!} />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <ProjectActivity projectId={id!} />
        </TabPanel>
      </Paper>

      {/* Edit Dialog */}
      <ProjectForm
        open={editDialogOpen}
        project={project}
        users={users}
        onClose={() => setEditDialogOpen(false)}
        onSubmit={handleFormSubmit}
        loading={updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the project "{project.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectDetailsPage;