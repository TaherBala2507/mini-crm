import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Badge,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import type { Task, TaskStatus } from '../../types';
import { TaskPriority } from '../../types';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

interface KanbanColumn {
  id: TaskStatus;
  title: string;
  color: string;
}

const columns: KanbanColumn[] = [
  { id: 'todo' as TaskStatus, title: 'To Do', color: '#e3f2fd' },
  { id: 'in_progress' as TaskStatus, title: 'In Progress', color: '#fff3e0' },
  { id: 'done' as TaskStatus, title: 'Done', color: '#e8f5e9' },
];

const priorityColors: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'default',
  [TaskPriority.MEDIUM]: 'info',
  [TaskPriority.HIGH]: 'warning',
  [TaskPriority.URGENT]: 'error',
};

const priorityIcons: Record<TaskPriority, React.ReactElement> = {
  [TaskPriority.LOW]: <FlagIcon sx={{ fontSize: 16 }} />,
  [TaskPriority.MEDIUM]: <FlagIcon sx={{ fontSize: 16 }} />,
  [TaskPriority.HIGH]: <FlagIcon sx={{ fontSize: 16 }} />,
  [TaskPriority.URGENT]: <FlagIcon sx={{ fontSize: 16 }} />,
};

interface SortableTaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

const SortableTaskCard: React.FC<SortableTaskCardProps> = ({ task, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    onEdit?.(task);
  };

  const handleDelete = () => {
    handleMenuClose();
    onDelete?.(task);
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        mb: 1.5,
        cursor: 'grab',
        '&:active': {
          cursor: 'grabbing',
        },
        '&:hover': {
          boxShadow: 3,
        },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1, pr: 1 }}>
            {task.title}
          </Typography>
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{ mt: -0.5, mr: -0.5 }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleEdit}>Edit</MenuItem>
            <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
              Delete
            </MenuItem>
          </Menu>
        </Box>

        {task.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {task.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
          <Chip
            icon={priorityIcons[task.priority]}
            label={task.priority}
            size="small"
            color={priorityColors[task.priority] as any}
            sx={{ height: 24 }}
          />
          {task.dueDate && (
            <Chip
              label={format(new Date(task.dueDate), 'MMM dd')}
              size="small"
              color={isOverdue ? 'error' : 'default'}
              variant={isOverdue ? 'filled' : 'outlined'}
              sx={{ height: 24 }}
            />
          )}
        </Box>

        {task.assignee && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
              alt={task.assignee.name}
            >
              {task.assignee.name.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              {task.assignee.name}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onTaskMove, onEdit, onDelete }) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) {
      onTaskMove(taskId, newStatus);
    }

    setActiveTask(null);
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 2,
          minHeight: 600,
        }}
      >
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          const taskIds = columnTasks.map((task) => task.id);

          return (
            <Paper
              key={column.id}
              sx={{
                p: 2,
                backgroundColor: column.color,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 500,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {column.title}
                </Typography>
                <Badge badgeContent={columnTasks.length} color="primary" />
              </Box>

              <SortableContext items={taskIds} strategy={verticalListSortingStrategy} id={column.id}>
                <Box sx={{ flex: 1, overflowY: 'auto' }}>
                  {columnTasks.map((task) => (
                    <SortableTaskCard
                      key={task.id}
                      task={task}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                  {columnTasks.length === 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 100,
                        border: '2px dashed',
                        borderColor: 'divider',
                        borderRadius: 1,
                        color: 'text.secondary',
                      }}
                    >
                      <Typography variant="body2">Drop tasks here</Typography>
                    </Box>
                  )}
                </Box>
              </SortableContext>
            </Paper>
          );
        })}
      </Box>

      <DragOverlay>
        {activeTask ? (
          <Card sx={{ width: 300, opacity: 0.9 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                {activeTask.title}
              </Typography>
              {activeTask.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {activeTask.description}
                </Typography>
              )}
              <Chip
                icon={priorityIcons[activeTask.priority]}
                label={activeTask.priority}
                size="small"
                color={priorityColors[activeTask.priority] as any}
              />
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;