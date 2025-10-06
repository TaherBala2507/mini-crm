import React from 'react';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Pagination,
  Paper,
} from '@mui/material';
import { Assignment as AssignmentIcon } from '@mui/icons-material';
import TaskCard from './TaskCard';
import type { Task, PaginatedResponse } from '../../types';

interface TasksListProps {
  tasks: PaginatedResponse<Task> | undefined;
  loading: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onPageChange: (page: number) => void;
  showProject?: boolean;
}

const TasksList: React.FC<TasksListProps> = ({
  tasks,
  loading,
  onEdit,
  onDelete,
  onPageChange,
  showProject = true,
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!tasks || !tasks.items || tasks.items.length === 0) {
    return (
      <Paper sx={{ p: 8, textAlign: 'center' }}>
        <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No tasks found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {showProject 
            ? 'Create your first task to get started'
            : 'No tasks in this project yet'}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Grid container spacing={2}>
        {tasks.items.map((task) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={task.id}>
            <TaskCard
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              showProject={showProject}
            />
          </Grid>
        ))}
      </Grid>

      {tasks.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={tasks.totalPages}
            page={tasks.page}
            onChange={(_, page: number) => onPageChange(page)}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Box>
  );
};

export default TasksList;