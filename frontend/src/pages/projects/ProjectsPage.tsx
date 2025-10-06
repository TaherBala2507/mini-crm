import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import ProjectForm from '../../components/projects/ProjectForm';
import ProjectsList from '../../components/projects/ProjectsList';
import ProjectFilters from '../../components/projects/ProjectFilters';
import { projectsApi } from '../../api/projects';
import { usersApi } from '../../api/users';
import type { Project, ProjectFormData, ProjectFilters as ProjectFiltersType } from '../../types';

const ProjectsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ProjectFiltersType>({
    page: 1,
    pageSize: 10,
  });
  const [formOpen, setFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch projects
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectsApi.getProjects(filters),
  });

  // Fetch users for team member selection
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getUsers(),
  });

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: (data: ProjectFormData) => projectsApi.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setFormOpen(false);
      setSelectedProject(null);
      setSnackbar({
        open: true,
        message: 'Project created successfully',
        severity: 'success',
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to create project',
        severity: 'error',
      });
    },
  });

  // Update project mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectFormData }) =>
      projectsApi.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setFormOpen(false);
      setSelectedProject(null);
      setSnackbar({
        open: true,
        message: 'Project updated successfully',
        severity: 'success',
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update project',
        severity: 'error',
      });
    },
  });

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsApi.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
      setSnackbar({
        open: true,
        message: 'Project deleted successfully',
        severity: 'success',
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to delete project',
        severity: 'error',
      });
    },
  });

  const handleCreateClick = () => {
    setSelectedProject(null);
    setFormOpen(true);
  };

  const handleEditClick = (project: Project) => {
    setSelectedProject(project);
    setFormOpen(true);
  };

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: ProjectFormData) => {
    if (selectedProject) {
      await updateMutation.mutateAsync({ id: selectedProject.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleDeleteConfirm = () => {
    if (projectToDelete) {
      deleteMutation.mutate(projectToDelete.id);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const projects = projectsData?.data?.items || [];
  const total = projectsData?.data?.total || 0;
  const users = usersData?.data || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Projects</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
        >
          New Project
        </Button>
      </Box>

      <ProjectFilters filters={filters} onFiltersChange={setFilters} />

      <ProjectsList
        projects={projects}
        total={total}
        filters={filters}
        onFiltersChange={setFilters}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        loading={projectsLoading}
      />

      <ProjectForm
        open={formOpen}
        project={selectedProject}
        users={users}
        onClose={() => {
          setFormOpen(false);
          setSelectedProject(null);
        }}
        onSubmit={handleFormSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the project "{projectToDelete?.name}"?
            This action cannot be undone.
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectsPage;