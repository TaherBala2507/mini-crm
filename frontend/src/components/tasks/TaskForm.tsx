import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  CircularProgress,
  Grid,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import type { Task, TaskFormData, User, Project } from '../../types';
import { TaskStatus, TaskPriority } from '../../types';

interface TaskFormProps {
  open: boolean;
  task?: Task | null;
  projectId?: string;
  users: User[];
  projects: Project[];
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  loading?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  open,
  task,
  projectId,
  users,
  projects,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<TaskFormData>({
    projectId: projectId || '',
    title: '',
    description: '',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    assigneeUserId: undefined,
    dueDate: undefined,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({});

  useEffect(() => {
    if (task) {
      setFormData({
        projectId: task.projectId,
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        assigneeUserId: task.assigneeUserId,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : undefined,
      });
    } else {
      setFormData({
        projectId: projectId || '',
        title: '',
        description: '',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        assigneeUserId: undefined,
        dueDate: undefined,
      });
    }
    setErrors({});
  }, [task, projectId, open]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TaskFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    const submitData: TaskFormData = {
      projectId: formData.projectId,
      title: formData.title,
      description: formData.description || undefined,
      status: formData.status,
      priority: formData.priority,
      assigneeUserId: formData.assigneeUserId || undefined,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
    };

    await onSubmit(submitData);
  };

  const handleChange = (field: keyof TaskFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {task ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Task Title"
                  required
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  error={!!errors.title}
                  helperText={errors.title}
                  disabled={loading}
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  disabled={loading}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required error={!!errors.projectId}>
                  <InputLabel>Project</InputLabel>
                  <Select
                    value={formData.projectId}
                    label="Project"
                    onChange={(e: SelectChangeEvent) => handleChange('projectId', e.target.value)}
                    disabled={loading || !!projectId}
                  >
                    {projects.map((project) => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Assignee</InputLabel>
                  <Select
                    value={formData.assigneeUserId || ''}
                    label="Assignee"
                    onChange={(e: SelectChangeEvent) => handleChange('assigneeUserId', e.target.value || undefined)}
                    disabled={loading}
                  >
                    <MenuItem value="">Unassigned</MenuItem>
                    {users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e: SelectChangeEvent) => handleChange('status', e.target.value as TaskStatus)}
                    disabled={loading}
                  >
                    <MenuItem value={TaskStatus.TODO}>To Do</MenuItem>
                    <MenuItem value={TaskStatus.IN_PROGRESS}>In Progress</MenuItem>
                    <MenuItem value={TaskStatus.DONE}>Done</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth required>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    label="Priority"
                    onChange={(e: SelectChangeEvent) => handleChange('priority', e.target.value as TaskPriority)}
                    disabled={loading}
                  >
                    <MenuItem value={TaskPriority.LOW}>Low</MenuItem>
                    <MenuItem value={TaskPriority.MEDIUM}>Medium</MenuItem>
                    <MenuItem value={TaskPriority.HIGH}>High</MenuItem>
                    <MenuItem value={TaskPriority.URGENT}>Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Due Date"
                  type="date"
                  value={formData.dueDate || ''}
                  onChange={(e) => handleChange('dueDate', e.target.value || undefined)}
                  disabled={loading}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {task ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskForm;