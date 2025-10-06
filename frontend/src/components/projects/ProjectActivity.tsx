import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  Create as CreateIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';

import { auditLogsApi } from '../../api/auditLogs';
import type { AuditLog, AuditAction } from '../../types';

interface ProjectActivityProps {
  projectId: string;
}

const getActionIcon = (action: AuditAction) => {
  switch (action) {
    case 'CREATE':
      return <CreateIcon />;
    case 'UPDATE':
      return <EditIcon />;
    case 'DELETE':
      return <DeleteIcon />;
    default:
      return <AssignmentIcon />;
  }
};

const getActionColor = (action: AuditAction): 'primary' | 'success' | 'warning' | 'error' | 'info' => {
  switch (action) {
    case 'CREATE':
      return 'success';
    case 'UPDATE':
      return 'primary';
    case 'DELETE':
      return 'error';
    default:
      return 'info';
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getActivityDescription = (log: AuditLog): string => {
  const actorName = log.actor?.name || 'Someone';
  const action = log.action.toLowerCase();
  const entityType = log.entityType?.toLowerCase() || 'item';

  switch (log.action) {
    case 'CREATE':
      return `${actorName} created a ${entityType}`;
    case 'UPDATE':
      return `${actorName} updated the ${entityType}`;
    case 'DELETE':
      return `${actorName} deleted a ${entityType}`;
    default:
      return `${actorName} performed ${action} on ${entityType}`;
  }
};

const getChangeSummary = (log: AuditLog): string[] => {
  const changes: string[] = [];

  if (log.beforeJson && log.afterJson) {
    const before = log.beforeJson;
    const after = log.afterJson;

    Object.keys(after).forEach((key) => {
      if (before[key] !== after[key] && key !== 'updatedAt' && key !== '__v') {
        const beforeValue = before[key] || 'empty';
        const afterValue = after[key] || 'empty';
        changes.push(`${key}: ${beforeValue} → ${afterValue}`);
      }
    });
  }

  return changes;
};

const ProjectActivity: React.FC<ProjectActivityProps> = ({ projectId }) => {
  // Fetch audit logs for this project
  const { data: logsData, isLoading } = useQuery({
    queryKey: ['auditLogs', 'Project', projectId],
    queryFn: () =>
      auditLogsApi.getAuditLogs({
        entityType: 'Project',
        entityId: projectId,
        page: 1,
        pageSize: 50,
      }),
  });

  const logs = logsData?.data?.items || [];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (logs.length === 0) {
    return (
      <Alert severity="info">
        No activity recorded yet. Actions on this project will appear here.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Activity Timeline ({logs.length})
      </Typography>

      <Timeline position="right">
        {logs.map((log, index) => {
          const changes = getChangeSummary(log);
          const isLast = index === logs.length - 1;

          return (
            <TimelineItem key={log.id}>
              <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.2 }}>
                <Typography variant="caption">{formatDate(log.createdAt)}</Typography>
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color={getActionColor(log.action)}>
                  {getActionIcon(log.action)}
                </TimelineDot>
                {!isLast && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body1" fontWeight="medium">
                      {getActivityDescription(log)}
                    </Typography>
                    <Chip label={log.action} size="small" color={getActionColor(log.action)} />
                  </Box>

                  {log.entityType && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Entity: {log.entityType}
                    </Typography>
                  )}

                  {changes.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="medium">
                        Changes:
                      </Typography>
                      <Box sx={{ ml: 2, mt: 0.5 }}>
                        {changes.map((change, idx) => (
                          <Typography key={idx} variant="caption" display="block" color="text.secondary">
                            • {change}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {log.ip && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      IP: {log.ip}
                    </Typography>
                  )}
                </Paper>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </Box>
  );
};

export default ProjectActivity;