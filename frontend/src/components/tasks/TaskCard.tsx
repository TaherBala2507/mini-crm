import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  CalendarToday as CalendarIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import type { Task } from '../../types';
import { TaskStatus, TaskPriority } from '../../types';
import { useNavigate } from 'react-router-dom';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  showProject?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  showProject = true,
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleMenuClose();
    onEdit?.(task);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleMenuClose();
    onDelete?.(task);
  };

  const handleCardClick = () => {
    navigate(`/tasks/${task.id}`);
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'default';
      case TaskStatus.IN_PROGRESS:
        return 'primary';
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

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE;

  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
        },
      }}
      onClick={handleCardClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 0.5 }}>
              {task.title}
            </Typography>
            {task.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  mb: 1,
                }}
              >
                {task.description}
              </Typography>
            )}
          </Box>
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {onEdit && <MenuItem onClick={handleEdit}>Edit</MenuItem>}
            {onDelete && <MenuItem onClick={handleDelete}>Delete</MenuItem>}
          </Menu>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
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
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {task.assignee ? (
              <Tooltip title={task.assignee.name}>
                <Avatar
                  sx={{ width: 28, height: 28, fontSize: '0.875rem' }}
                >
                  {task.assignee.name.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
            ) : (
              <Chip label="Unassigned" size="small" variant="outlined" />
            )}
          </Box>

          {task.dueDate && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarIcon sx={{ fontSize: 16, color: isOverdue ? 'error.main' : 'text.secondary' }} />
              <Typography
                variant="caption"
                color={isOverdue ? 'error' : 'text.secondary'}
                sx={{ fontWeight: isOverdue ? 600 : 400 }}
              >
                {new Date(task.dueDate).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Box>

        {showProject && task.project && (
          <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              Project: {task.project.name}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskCard;