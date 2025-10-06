import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  FolderOpen as FolderOpenIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { analyticsApi } from '../api/analytics';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Fetch overview analytics (includes recent activity)
  const { data: overviewData, isLoading, error } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => analyticsApi.getOverview(),
    refetchInterval: 60000, // Refetch every minute
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">
          Failed to load dashboard data. Please try refreshing the page.
        </Alert>
      </Box>
    );
  }

  const overview = overviewData?.data;
  const recentActivity = overview?.recentActivity || [];

  // Stats cards configuration
  const stats = [
    {
      title: 'Total Leads',
      value: overview?.summary?.totalLeads?.toString() || '0',
      icon: <PeopleIcon />,
      color: '#1976d2',
      onClick: () => navigate('/leads'),
    },
    {
      title: 'Active Projects',
      value: overview?.summary?.activeProjects?.toString() || '0',
      icon: <BusinessIcon />,
      color: '#2e7d32',
      onClick: () => navigate('/projects'),
    },
    {
      title: 'Open Tasks',
      value: overview?.summary?.openTasks?.toString() || '0',
      icon: <AssignmentIcon />,
      color: '#ed6c02',
      onClick: () => navigate('/tasks'),
    },
    {
      title: 'Conversion Rate',
      value: `${overview?.summary?.conversionRate?.toFixed(1) || '0'}%`,
      icon: <TrendingUpIcon />,
      color: '#9c27b0',
    },
  ];

  // Quick actions configuration
  const quickActions = [
    {
      label: 'New Lead',
      icon: <PersonAddIcon />,
      color: 'primary',
      onClick: () => navigate('/leads'),
    },
    {
      label: 'New Project',
      icon: <FolderOpenIcon />,
      color: 'success',
      onClick: () => navigate('/projects'),
    },
    {
      label: 'New Task',
      icon: <AddIcon />,
      color: 'warning',
      onClick: () => navigate('/tasks'),
    },
  ];

  // Format activity action
  const formatAction = (action: string): string => {
    return action.charAt(0) + action.slice(1).toLowerCase();
  };

  // Get action icon (currently unused, but kept for future use)
  // const getActionIcon = (action: string) => {
  //   switch (action.toUpperCase()) {
  //     case 'CREATE':
  //       return <AddIcon />;
  //     case 'UPDATE':
  //       return <CheckCircleIcon />;
  //     case 'DELETE':
  //       return <ScheduleIcon />;
  //     default:
  //       return <AssignmentIcon />;
  //   }
  // };

  // Get action color
  const getActionColor = (action: string): 'default' | 'primary' | 'success' | 'error' => {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return 'success';
      case 'UPDATE':
        return 'primary';
      case 'DELETE':
        return 'error';
      default:
        return 'default';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card
              sx={{
                cursor: stat.onClick ? 'pointer' : 'default',
                transition: 'all 0.2s',
                '&:hover': stat.onClick ? {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                } : {},
              }}
              onClick={stat.onClick}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      bgcolor: stat.color,
                      color: 'white',
                      p: 1,
                      borderRadius: 1,
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Additional Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Completed Tasks
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {overview?.summary?.completedTasks || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {overview?.summary?.taskCompletionRate?.toFixed(1) || 0}% completion rate
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Overdue Tasks
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'error.main' }}>
              {overview?.summary?.overdueTasks || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Require attention
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Projects
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {overview?.summary?.totalProjects || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {overview?.summary?.completedProjects || 0} completed
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Tasks
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {overview?.summary?.totalTasks || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Across all projects
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activity and Quick Actions */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, height: 500 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {recentActivity.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="text.secondary">
                  No recent activity to display
                </Typography>
              </Box>
            ) : (
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {recentActivity.map((activity: any, index: number) => (
                  <React.Fragment key={activity.id || index}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: getActionColor(activity.action) }}>
                          {activity.user?.name?.charAt(0).toUpperCase() || '?'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>
                              {activity.user?.name || 'Unknown User'}
                            </Typography>
                            <Chip
                              label={formatAction(activity.action)}
                              size="small"
                              color={getActionColor(activity.action)}
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                            <Typography variant="body2" component="span" color="text.secondary">
                              {activity.entityType}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {formatTimestamp(activity.timestamp)}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < recentActivity.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: 500 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  color={action.color as any}
                  startIcon={action.icon}
                  onClick={action.onClick}
                  fullWidth
                  sx={{ py: 1.5, justifyContent: 'flex-start' }}
                >
                  {action.label}
                </Button>
              ))}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Leads by Status
            </Typography>
            <Box sx={{ mt: 2 }}>
              {overview?.breakdowns?.leadsByStatus?.map((item: any) => (
                <Box
                  key={item.status}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {item.status}
                  </Typography>
                  <Chip label={item.count} size="small" />
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Tasks by Priority
            </Typography>
            <Box sx={{ mt: 2 }}>
              {overview?.breakdowns?.tasksByPriority?.map((item: any) => (
                <Box
                  key={item.priority}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {item.priority}
                  </Typography>
                  <Chip label={item.count} size="small" />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;