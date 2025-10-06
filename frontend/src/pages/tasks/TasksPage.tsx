import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import { Add as AddIcon, ViewKanban as ViewKanbanIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { tasksApi } from '../../api/tasks';
import { usersApi } from '../../api/users';
import { projectsApi } from '../../api/projects';
import TaskFilters from '../../components/tasks/TaskFilters';
import TaskForm from '../../components/tasks/TaskForm';
import TasksList from '../../components/tasks/TasksList';
import type { Task, TaskFormData, TaskFilters as TaskFiltersType } from '../../types';

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<TaskFiltersType>({
    page: 1,
    pageSize: 12,
  });
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'my'>('all');

  // Fetch tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', filters, viewMode],
    queryFn: () => viewMode === 'my' ? tasksApi.getMyTasks(filters) : tasksApi.getTasks(filters),
  });

  // Fetch users for filters
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getUsers({ page: 1, pageSize: 100 }),
  });

  // Fetch projects for filters
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getProjects({ page: 1, pageSize: 100 }),
  });

  // Create task mutation
  const createMutation = useMutation({
    mutationFn: (data: TaskFormData) => tasksApi.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setFormOpen(false);
      setSelectedTask(null);
      setError(null);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to create task');
    },
  });

  // Update task mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TaskFormData> }) =>
      tasksApi.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setFormOpen(false);
      setSelectedTask(null);
      setError(null);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to update task');
    },
  });

  // Delete task mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setDeleteDialogOpen(false);
      setSelectedTask(null);
      setError(null);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to delete task');
    },
  });

  const handleCreateClick = () => {
    setSelectedTask(null);
    setFormOpen(true);
  };

  const handleEditClick = (task: Task) => {
    setSelectedTask(task);
    setFormOpen(true);
  };

  const handleDeleteClick = (task: Task) => {
    setSelectedTask(task);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: TaskFormData) => {
    if (selectedTask) {
      await updateMutation.mutateAsync({ id: selectedTask.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedTask) {
      deleteMutation.mutate(selectedTask.id);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleViewModeChange = (_: React.SyntheticEvent, newValue: 'all' | 'my') => {
    setViewMode(newValue);
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const users = Array.isArray(usersData?.data) ? usersData.data : [];
  const projects = Array.isArray(projectsData?.data?.items) ? projectsData.data.items : [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Tasks</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ViewKanbanIcon />}
            onClick={() => navigate('/tasks/board')}
          >
            Board View
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateClick}
          >
            New Task
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={viewMode} onChange={handleViewModeChange}>
          <Tab label="All Tasks" value="all" />
          <Tab label="My Tasks" value="my" />
        </Tabs>
      </Box>

      <TaskFilters
        filters={filters}
        onFilterChange={setFilters}
        users={users}
        projects={projects}
      />

      <TasksList
        tasks={tasksData?.data}
        loading={tasksLoading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onPageChange={handlePageChange}
        showProject={true}
      />

      <TaskForm
        open={formOpen}
        task={selectedTask}
        users={users}
        projects={projects}
        onClose={() => {
          setFormOpen(false);
          setSelectedTask(null);
          setError(null);
        }}
        onSubmit={handleFormSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the task "{selectedTask?.title}"? This action cannot be undone.
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
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TasksPage;