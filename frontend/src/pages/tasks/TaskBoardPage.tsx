import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  ViewList as ViewListIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { SelectChangeEvent } from '@mui/material';
import { tasksApi } from '../../api/tasks';
import { usersApi } from '../../api/users';
import { projectsApi } from '../../api/projects';
import KanbanBoard from '../../components/tasks/KanbanBoard';
import TaskForm from '../../components/tasks/TaskForm';
import type { Task, TaskFormData, TaskFilters, TaskStatus } from '../../types';
import { TaskPriority } from '../../types';

const TaskBoardPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<TaskFilters>({
    page: 1,
    pageSize: 1000, // Get all tasks for board view
  });
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
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

  const handleTaskMove = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateMutation.mutateAsync({
        id: taskId,
        data: { status: newStatus },
      });
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  };

  const handleFilterChange = (field: keyof TaskFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleViewModeChange = (_: React.SyntheticEvent, newValue: 'all' | 'my') => {
    setViewMode(newValue);
  };

  const users = Array.isArray(usersData?.data) ? usersData.data : [];
  const projects = Array.isArray(projectsData?.data?.items) ? projectsData.data.items : [];
  const tasks = Array.isArray(tasksData?.data?.items) ? tasksData.data.items : [];

  if (tasksLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Task Board</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<ViewListIcon />}
            onClick={() => navigate('/tasks')}
          >
            List View
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

      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Project</InputLabel>
              <Select
                value={filters.projectId || ''}
                label="Project"
                onChange={(e: SelectChangeEvent) => handleFilterChange('projectId', e.target.value || undefined)}
              >
                <MenuItem value="">All Projects</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Assignee</InputLabel>
              <Select
                value={filters.assigneeUserId || ''}
                label="Assignee"
                onChange={(e: SelectChangeEvent) => handleFilterChange('assigneeUserId', e.target.value || undefined)}
              >
                <MenuItem value="">All Assignees</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={filters.priority && filters.priority[0] || ''}
                label="Priority"
                onChange={(e: SelectChangeEvent) => handleFilterChange('priority', e.target.value ? [e.target.value as TaskPriority] : undefined)}
              >
                <MenuItem value="">All Priorities</MenuItem>
                <MenuItem value={TaskPriority.LOW}>Low</MenuItem>
                <MenuItem value={TaskPriority.MEDIUM}>Medium</MenuItem>
                <MenuItem value={TaskPriority.HIGH}>High</MenuItem>
                <MenuItem value={TaskPriority.URGENT}>Urgent</MenuItem>
              </Select>
            </FormControl>

            {(filters.projectId || filters.assigneeUserId || (filters.priority && filters.priority.length > 0)) && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => setFilters({ page: 1, pageSize: 1000 })}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        </Paper>
      )}

      <KanbanBoard
        tasks={tasks}
        onTaskMove={handleTaskMove}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
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

export default TaskBoardPage;