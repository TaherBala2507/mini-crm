import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Avatar,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Flag as FlagIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../../api/tasks';
import { usersApi } from '../../api/users';
import { projectsApi } from '../../api/projects';
import { notesApi } from '../../api/notes';
import { auditLogsApi } from '../../api/auditLogs';
import TaskForm from '../../components/tasks/TaskForm';
import type { TaskFormData } from '../../types';
import { TaskStatus, TaskPriority } from '../../types';

const TaskDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch task details
  const { data: taskData, isLoading: taskLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksApi.getTask(id!),
    enabled: !!id,
  });

  // Fetch users
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getUsers({ page: 1, pageSize: 100 }),
  });

  // Fetch projects
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getProjects({ page: 1, pageSize: 100 }),
  });

  // Fetch notes
  const { data: notesData } = useQuery({
    queryKey: ['notes', 'task', id],
    queryFn: () => notesApi.getNotes('Task', id!, 1, 100),
    enabled: !!id,
  });

  // Fetch audit logs
  const { data: auditLogsData } = useQuery({
    queryKey: ['auditLogs', 'task', id],
    queryFn: () => auditLogsApi.getAuditLogs({ entityType: 'task', entityId: id!, page: 1, pageSize: 100 }),
    enabled: !!id,
  });

  // Update task mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TaskFormData> }) =>
      tasksApi.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setFormOpen(false);
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
      navigate('/tasks');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to delete task');
    },
  });

  const handleFormSubmit = async (data: TaskFormData) => {
    if (id) {
      await updateMutation.mutateAsync({ id, data });
    }
  };

  const handleDeleteConfirm = () => {
    if (id) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'default';
      case TaskStatus.IN_PROGRESS:
        return 'primary';
      case TaskStatus.IN_REVIEW:
        return 'warning';
      case TaskStatus.DONE:
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW:
        return '#4caf50';
      case TaskPriority.MEDIUM:
        return '#ff9800';
      case TaskPriority.HIGH:
        return '#f44336';
      case TaskPriority.URGENT:
        return '#d32f2f';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'To Do';
      case TaskStatus.IN_PROGRESS:
        return 'In Progress';
      case TaskStatus.IN_REVIEW:
        return 'In Review';
      case TaskStatus.DONE:
        return 'Done';
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW:
        return 'Low';
      case TaskPriority.MEDIUM:
        return 'Medium';
      case TaskPriority.HIGH:
        return 'High';
      case TaskPriority.URGENT:
        return 'Urgent';
      default:
        return priority;
    }
  };

  if (taskLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!taskData?.data) {
    return (
      <Box>
        <Alert severity="error">Task not found</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/tasks')} sx={{ mt: 2 }}>
          Back to Tasks
        </Button>
      </Box>
    );
  }

  const task = taskData.data;
  const users = Array.isArray(usersData?.data) ? usersData.data : [];
  const projects = Array.isArray(projectsData?.data?.items) ? projectsData.data.items : [];
  const notes = Array.isArray(notesData?.data?.items) ? notesData.data.items : [];
  const auditLogs = Array.isArray(auditLogsData?.data?.items) ? auditLogsData.data.items : [];
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/tasks')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">Task Details</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setFormOpen(true)}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              {task.title}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Chip
                label={getStatusLabel(task.status)}
                color={getStatusColor(task.status)}
                size="small"
              />
              <Chip
                icon={<FlagIcon sx={{ fontSize: 16 }} />}
                label={getPriorityLabel(task.priority)}
                size="small"
                sx={{
                  backgroundColor: getPriorityColor(task.priority),
                  color: 'white',
                  '& .MuiChip-icon': { color: 'white' },
                }}
              />
              {isOverdue && (
                <Chip label="Overdue" color="error" size="small" />
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {task.description || 'No description provided'}
            </Typography>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {notes.length} note{notes.length !== 1 ? 's' : ''}
            </Typography>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {auditLogs.length} activity log{auditLogs.length !== 1 ? 's' : ''}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Details
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <BusinessIcon fontSize="small" color="action" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Project
                  </Typography>
                </Box>
                {task.project ? (
                  <Button
                    variant="text"
                    onClick={() => navigate(`/projects/${task.projectId}`)}
                    sx={{ textTransform: 'none', p: 0, justifyContent: 'flex-start' }}
                  >
                    {task.project.name}
                  </Button>
                ) : (
                  <Typography>No project</Typography>
                )}
              </Box>

              <Divider />

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Assignee
                  </Typography>
                </Box>
                {task.assignee ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {task.assignee.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">{task.assignee.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {task.assignee.email}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Typography>Unassigned</Typography>
                )}
              </Box>

              <Divider />

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CalendarIcon fontSize="small" color="action" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Due Date
                  </Typography>
                </Box>
                {task.dueDate ? (
                  <Typography color={isOverdue ? 'error' : 'text.primary'}>
                    {new Date(task.dueDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Typography>
                ) : (
                  <Typography>No due date</Typography>
                )}
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Created
                </Typography>
                <Typography variant="body2">
                  {new Date(task.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Last Updated
                </Typography>
                <Typography variant="body2">
                  {new Date(task.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <TaskForm
        open={formOpen}
        task={task}
        users={users}
        projects={projects}
        onClose={() => {
          setFormOpen(false);
          setError(null);
        }}
        onSubmit={handleFormSubmit}
        loading={updateMutation.isPending}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the task "{task.title}"? This action cannot be undone.
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

export default TaskDetailsPage;