import React, { useState } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { tasksApi } from '../../api/tasks';
import { usersApi } from '../../api/users';
import type { Task, TaskFormData } from '../../types';
import { TaskStatus, TaskPriority } from '../../types';

interface ProjectTasksProps {
  projectId: string;
}

const getStatusColor = (status: TaskStatus): 'default' | 'primary' | 'warning' | 'success' | 'error' => {
  switch (status) {
    case TaskStatus.TODO:
      return 'default';
    case TaskStatus.IN_PROGRESS:
      return 'primary';
    case TaskStatus.IN_REVIEW:
      return 'warning';
    case TaskStatus.DONE:
      return 'success';
    case TaskStatus.CANCELLED:
      return 'error';
    default:
      return 'default';
  }
};

const getPriorityColor = (priority: TaskPriority): 'default' | 'info' | 'warning' | 'error' => {
  switch (priority) {
    case TaskPriority.LOW:
      return 'info';
    case TaskPriority.MEDIUM:
      return 'default';
    case TaskPriority.HIGH:
      return 'warning';
    case TaskPriority.URGENT:
      return 'error';
    default:
      return 'default';
  }
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const ProjectTasks: React.FC<ProjectTasksProps> = ({ projectId }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const [formData, setFormData] = useState<TaskFormData>({
    projectId,
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    assigneeUserId: '',
    dueDate: '',
  });

  // Fetch tasks for this project
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', 'project', projectId],
    queryFn: () => tasksApi.getTasksByProject(projectId),
  });

  // Fetch users for assignee selection
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getUsers(),
  });

  // Create task mutation
  const createMutation = useMutation({
    mutationFn: (data: TaskFormData) => tasksApi.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'project', projectId] });
      setFormOpen(false);
      resetForm();
    },
  });

  // Update task mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TaskFormData> }) =>
      tasksApi.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'project', projectId] });
      setFormOpen(false);
      setSelectedTask(null);
      resetForm();
    },
  });

  // Delete task mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'project', projectId] });
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    },
  });

  const resetForm = () => {
    setFormData({
      projectId,
      title: '',
      description: '',
      status: 'todo' as TaskStatus,
      priority: 'medium' as TaskPriority,
      assigneeUserId: '',
      dueDate: '',
    });
  };

  const handleCreateClick = () => {
    setSelectedTask(null);
    resetForm();
    setFormOpen(true);
  };

  const handleEditClick = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      projectId: task.projectId,
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assigneeUserId: task.assigneeUserId || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    });
    setFormOpen(true);
  };

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = () => {
    if (selectedTask) {
      updateMutation.mutate({ id: selectedTask.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      deleteMutation.mutate(taskToDelete.id);
    }
  };

  const tasks = tasksData?.data?.items || [];
  const users = Array.isArray(usersData?.data) ? usersData.data : [];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Tasks ({tasks.length})</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateClick}>
          Add Task
        </Button>
      </Box>

      {tasks.length === 0 ? (
        <Alert severity="info">No tasks yet. Create your first task to get started.</Alert>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Assignee</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {task.title}
                    </Typography>
                    {task.description && (
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
                        {task.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip label={task.status} color={getStatusColor(task.status)} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip label={task.priority} color={getPriorityColor(task.priority)} size="small" />
                  </TableCell>
                  <TableCell>
                    {task.assignee ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                          {task.assignee.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2">{task.assignee.name}</Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Unassigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(task.dueDate)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => navigate(`/tasks/${task.id}`)}>
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleEditClick(task)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDeleteClick(task)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Task Form Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedTask ? 'Edit Task' : 'Create Task'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
              >
                <MenuItem value="todo">To Do</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                label="Priority"
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Assignee</InputLabel>
              <Select
                value={formData.assigneeUserId}
                label="Assignee"
                onChange={(e) => setFormData({ ...formData, assigneeUserId: e.target.value })}
              >
                <MenuItem value="">
                  <em>Unassigned</em>
                </MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button
            onClick={handleFormSubmit}
            variant="contained"
            disabled={!formData.title || createMutation.isPending || updateMutation.isPending}
          >
            {selectedTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the task "{taskToDelete?.title}"? This action cannot be undone.
          </Typography>
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

export default ProjectTasks;